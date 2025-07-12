import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { generateQRCode } from '@/services/gemini';

// Define the GeneratedStore type here if not exported from gemini
interface GeneratedStore {
  businessName: string;
  businessType: string;
  location: string;
  services: string[];
  description: string;
  hours: string;
  phone: string;
  aiGeneratedPromo: string;
  socialMediaPost: string;
  tagline: string;
  pricingSuggestions: string[];
  businessPolicies: string[];
}

export default function StorePreview() {
  const router = useRouter();
  const [storeData, setStoreData] = useState<GeneratedStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    // Get the generated store data from localStorage
    const savedStore = localStorage.getItem('generatedStore');
    if (savedStore) {
      const store = JSON.parse(savedStore);
      setStoreData(store);
      
      // Generate QR code
      const storeUrl = `https://localyst.app/store/${store.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const qrUrl = generateQRCode(storeUrl);
      setQrCodeUrl(qrUrl);
    } else {
      // Fallback data
      setStoreData({
        businessName: "Demo Business",
        businessType: "Service Provider",
        location: "Your Location",
        services: ["Service 1", "Service 2"],
        description: "Welcome to our business - providing quality services in your area.",
        hours: "Mon-Sat: 9:00 AM - 8:00 PM",
        phone: "+91 98765 43210",
        aiGeneratedPromo: "✨ Visit us for quality service you can trust! ✨",
        socialMediaPost: "Check out our amazing services!",
        tagline: "Quality Service Always",
        pricingSuggestions: ["Affordable rates", "Premium services"],
        businessPolicies: ["Customer satisfaction guaranteed"]
      });
    }
    setLoading(false);
  }, []);

  const copyLink = () => {
    const link = `https://localyst.app/store/${storeData?.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    navigator.clipboard.writeText(link);
    alert('Store link copied to clipboard!');
  };

  const shareOnWhatsApp = () => {
    if (storeData) {
      const message = encodeURIComponent(storeData.socialMediaPost);
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
  };

  const downloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `${storeData?.businessName}-qr-code.png`;
      link.click();
    }
  };

  const printBusinessCard = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && storeData) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Business Card - ${storeData.businessName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .business-card { 
                width: 350px; 
                height: 200px; 
                border: 2px solid #333; 
                padding: 20px; 
                margin: 20px auto;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              }
              .business-name { font-size: 24px; font-weight: bold; color: #2563eb; }
              .tagline { font-style: italic; color: #6b7280; margin-bottom: 10px; }
              .contact { margin-top: 15px; }
              .qr-code { float: right; margin-top: -80px; }
            </style>
          </head>
          <body>
            <div class="business-card">
              <div class="business-name">${storeData.businessName}</div>
              <div class="tagline">${storeData.tagline}</div>
              <div class="contact">
                📍 ${storeData.location}<br>
                📞 ${storeData.phone}<br>
                🕒 ${storeData.hours}
              </div>
              <div class="qr-code">
                <img src="${qrCodeUrl}" width="60" height="60" alt="QR Code">
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your store...</p>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No store data found</p>
          <button
            onClick={() => router.push('/create-store')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Create a Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🎉</span>
            <div>
              <strong>Store Created Successfully!</strong>
              <p className="text-sm">Your AI-powered store is now live and ready for customers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Store Preview */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Store Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <h1 className="text-4xl font-bold mb-2">{storeData.businessName}</h1>
            <p className="text-blue-100 text-xl font-medium mb-2">{storeData.tagline}</p>
            <p className="text-blue-100 text-lg mb-4">{storeData.location}</p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-lg font-medium">{storeData.aiGeneratedPromo}</p>
            </div>
          </div>

          {/* Store Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* About Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About Us</h2>
                <p className="text-gray-600 leading-relaxed mb-6">{storeData.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">📍</span>
                    <span className="text-gray-700">{storeData.location}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">🕒</span>
                    <span className="text-gray-700">{storeData.hours}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">📞</span>
                    <span className="text-gray-700">{storeData.phone}</span>
                  </div>
                </div>

                {/* Business Policies */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Our Policies</h3>
                  <ul className="space-y-2">
                    {storeData.businessPolicies.map((policy, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-gray-600 text-sm">{policy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Services & Pricing Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Services</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {storeData.services.map((service, index) => (
                    <div key={index} className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg text-center font-medium">
                      {service}
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Pricing</h3>
                  <ul className="space-y-2">
                    {storeData.pricingSuggestions.map((price: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">💰</span>
                        <span className="text-gray-600 text-sm">{price}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Book Now Button */}
                <div>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition duration-300 mb-3">
                    📅 Book Appointment
                  </button>
                  <p className="text-sm text-gray-500 text-center">
                    Click to schedule your visit
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">QR Code & Business Card</h3>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="flex-1 text-center">
              <button
                onClick={() => setShowQR(!showQR)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 mb-3"
              >
                {showQR ? 'Hide QR Code' : 'Show QR Code'}
              </button>
              {showQR && qrCodeUrl && (
                <div className="mt-4">
                  <img src={qrCodeUrl} alt="Store QR Code" className="mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Scan to visit store</p>
                </div>
              )}
            </div>
            <div className="flex-1 text-center">
              <button
                onClick={downloadQR}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 mr-3"
              >
                📱 Download QR
              </button>
              <button
                onClick={printBusinessCard}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                🖨️ Print Card
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => router.push('/create-store')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            Create Another Store
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            Back to Home
          </button>
        </div>

        {/* Share Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Share Your Store</h3>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                readOnly
                value={`https://localyst.app/store/${storeData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <button 
              onClick={copyLink}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
            >
              Copy Link
            </button>
          </div>
          
          {/* Social Media Sharing */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={shareOnWhatsApp}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              📱 Share on WhatsApp
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-medium">AI-Generated Social Media Post:</p>
            <p className="text-gray-800 mt-1">{storeData.socialMediaPost}</p>
          </div>
        </div>
      </div>
    </div>
  );
}