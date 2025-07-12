export const API_KEYS = {
    GOOGLE_IDX: 'YOUR_GOOGLE_IDX_API_KEY',
    FIREBASE: 'YOUR_FIREBASE_API_KEY',
    GEMINI: 'YOUR_GEMINI_API_KEY',
};

export const FIREBASE_CONFIG = {
    apiKey: API_KEYS.FIREBASE,
    authDomain: 'your-project-id.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project-id.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
};

export const LANGUAGES = {
    EN: 'en',
    ES: 'es',
    FR: 'fr',
    DE: 'de',
    // Add more languages as needed
};

export const DEFAULT_LANGUAGE = LANGUAGES.EN;

export const STORE_TEMPLATE = {
    name: '',
    description: '',
    services: [],
    location: '',
    contact: {
        phone: '',
        email: '',
    },
};