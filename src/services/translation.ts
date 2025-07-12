import googleTranslate from 'google-translate-api'; // Import Google Translate API
import { Translation } from '../types'; // Import the Translation type

// Function to handle translation requests
export const translateText = async (text: string, targetLanguage: string): Promise<Translation> => {
    try {
        const response = await googleTranslate(text, { to: targetLanguage });
        return {
            originalText: text,
            translatedText: response.text,
            language: response.from.language.iso,
        };
    } catch (error) {
        throw new Error(`Translation failed: ${(error as Error).message}`);
    }
};

// Function to handle batch translation requests
export const translateTexts = async (texts: string[], targetLanguage: string): Promise<Translation[]> => {
    const translationPromises = texts.map(text => translateText(text, targetLanguage));
    return Promise.all(translationPromises);
};