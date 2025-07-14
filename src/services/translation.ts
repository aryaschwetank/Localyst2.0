// Temporarily disable translation service
// TODO: Implement proper translation service later

export const translateText = async (text: string, targetLanguage: string) => {
  // Placeholder implementation
  return {
    originalText: text,
    translatedText: text, // Return original text for now
    language: 'en',
  }
}

export const translateTexts = async (texts: string[], targetLanguage: string) => {
  return texts.map(text => ({
    originalText: text,
    translatedText: text,
    language: 'en',
  }))
}