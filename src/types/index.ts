// This file exports TypeScript interfaces and types used throughout the application for type safety.

export interface Store {
    id: string;
    name: string;
    description: string;
    services: Service[];
    location: string;
    contact: ContactInfo;
}

export interface Service {
    id: string;
    name: string;
    price: number;
    duration: number; // in minutes
}

export interface ContactInfo {
    phone: string;
    email: string;
    website?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'businessOwner' | 'customer';
}

export interface Translation {
    originalText: string;
    translatedText: string;
    language: string;
}