import React from 'react';

interface StorePreviewProps {
    storeName: string;
    storeDescription: string;
    storeImage: string;
    storeServices: string[];
}

const StorePreview: React.FC<StorePreviewProps> = ({ storeName, storeDescription, storeImage, storeServices }) => {
    return (
        <div className="store-preview">
            <h2>{storeName}</h2>
            <img src={storeImage} alt={`${storeName} preview`} />
            <p>{storeDescription}</p>
            <h3>Services Offered:</h3>
            <ul>
                {storeServices.map((service, index) => (
                    <li key={index}>{service}</li>
                ))}
            </ul>
        </div>
    );
};

export default StorePreview;