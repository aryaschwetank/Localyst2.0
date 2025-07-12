import React, { useState, FormEvent } from 'react';

const StorefrontBuilder = () => {
    const [businessName, setBusinessName] = useState('');
    const [businessDescription, setBusinessDescription] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [location, setLocation] = useState('');

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Logic to handle form submission, e.g., saving to Firebase
    };

    return (
        <div className="storefront-builder">
            <h2>Create Your Online Storefront</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="businessName">Business Name</label>
                    <input
                        type="text"
                        id="businessName"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="businessDescription">Business Description</label>
                    <textarea
                        id="businessDescription"
                        value={businessDescription}
                        onChange={(e) => setBusinessDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="contactInfo">Contact Information</label>
                    <input
                        type="text"
                        id="contactInfo"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="location">Location</label>
                    <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Create Storefront</button>
            </form>
        </div>
    );
};

export default StorefrontBuilder;