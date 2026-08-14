import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { validateRuntimeEvidence, type RuntimeCertificationEvidence } from './runtime-evidence'

const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const screen = () => ({ screenId: 'home', archetype: 'dashboard', screenshotData: `data:image/png;base64,${png.toString('base64')}`, screenshotSha256: createHash('sha256').update(png).digest('hex'), screenshotBytes: png.byteLength, rendererVersion: 'phone-screen-v4', viewport: { width: 390, height: 844 }, bounds: [{ nodeId: 'hero', x: 10, y: 20, width: 370, height: 200 }] })
const evidence = (): RuntimeCertificationEvidence => ({ candidateHash: 'cafebabe', evaluationVersion: 'v2', screens: [screen()] })

describe('trusted runtime evidence integrity', () => {
  it('accepts content-bound canonical PNG evidence', async () => { expect(await validateRuntimeEvidence(evidence(), ['home'], 'cafebabe')).toEqual([]) })
  it('rejects forged digest and byte length', async () => { const value = evidence(); value.screens[0]!.screenshotSha256 = 'a'.repeat(64); value.screens[0]!.screenshotBytes += 1; expect(await validateRuntimeEvidence(value, ['home'], 'cafebabe')).toContain('INVALID_SCREENSHOT:home') })
  it('rejects non-PNG data, renderer drift and non-canonical viewport', async () => { const value = evidence(); value.screens[0]!.screenshotData = 'data:image/jpeg;base64,AAAA'; value.screens[0]!.rendererVersion = 'phone-screen-v5'; value.screens[0]!.viewport.width = 391; expect(await validateRuntimeEvidence(value, ['home'], 'cafebabe')).toEqual(expect.arrayContaining(['INVALID_SCREENSHOT:home', 'INVALID_RENDER_METADATA:home'])) })
  it('rejects non-finite and out-of-viewport bounds', async () => { const value = evidence(); value.screens[0]!.bounds[0]!.x = Number.NaN; expect(await validateRuntimeEvidence(value, ['home'], 'cafebabe')).toContain('INVALID_RENDER_METADATA:home') })
})
