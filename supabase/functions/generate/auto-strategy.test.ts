import { describe, expect, it } from 'vitest'
import { resolvePlanningIntent, fallbackPlanningIntent } from './planning-intent.ts'
import { resolveAutoStrategy } from './auto-strategy.ts'

describe('auto generation strategy', () => {
  it('does not default an astronomy product to Obsidian Precision', () => {
    const brief = 'Amatör astronomlar için teleskop paylaşımı, gökyüzü olayları ve gözlem günlüğü'
    const blueprint = resolvePlanningIntent(fallbackPlanningIntent(brief), brief)
    const strategy = resolveAutoStrategy(undefined, blueprint, brief)

    expect(strategy.mode).toBe('auto')
    expect(strategy.palette).not.toBe('obsidian')
    expect(strategy).not.toHaveProperty('stylePresetId')
  })

  it('preserves a valid model decision in auto mode', () => {
    const blueprint = resolvePlanningIntent(fallbackPlanningIntent('yemek tarifi uygulaması'), 'yemek tarifi uygulaması')
    const strategy = resolveAutoStrategy({
      palette: 'editorial',
      cardStyle: 'minimal',
      density: 'spacious',
      navigationStyle: 'minimal',
      visualDirection: 'Tarif fotoğraflarını ve tipografiyi öne çıkar',
      rationale: ['İçerik odaklı deneyim'],
    }, blueprint)

    expect(strategy).toMatchObject({ mode: 'auto', palette: 'editorial', cardStyle: 'minimal', density: 'spacious' })
  })

  it('may choose technical Obsidian only when product semantics justify it', () => {
    const brief = 'Finans operasyon raporları ve yoğun veri tabloları'
    const blueprint = resolvePlanningIntent(fallbackPlanningIntent(brief), brief)
    expect(resolveAutoStrategy(undefined, blueprint, brief).palette).toBe('obsidian')
  })
})
