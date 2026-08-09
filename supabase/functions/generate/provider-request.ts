export type ProviderRequestMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export function buildGoogleGenerateRequest(messages: ProviderRequestMessage[], maxOutputTokens: number, temperature: number, operation: string) {
  return {
    contents: messages.filter((message) => message.role !== 'system').map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    })),
    ...(messages.find((message) => message.role === 'system') ? { systemInstruction: { parts: [{ text: messages.find((message) => message.role === 'system')?.content ?? '' }] } } : {}),
    generationConfig: {
      maxOutputTokens,
      temperature,
      responseMimeType: 'application/json',
      ...(operation === 'planning' ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
    },
  }
}
