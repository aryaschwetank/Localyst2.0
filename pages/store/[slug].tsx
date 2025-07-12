import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getStoreBySlug, incrementStoreViews, StoreDocument } from '@/services/firestore';
import { generateQRCode } from '@/services/gemini';

export default function PublicStore() {
  const router = useRouter();
  const { slug } = router.query;
  const [store, setStore] = useState<StoreDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      loadStore(slug);
    }
  }, [slug]);

  const loadStore = async (storeSlug: string) => {
    try {
      const storeData = await getStoreBySlug(storeSlug);
      if (storeData) {
        setStore(storeData);
        // Increment view count
        if (storeData.id) {
          await incrementStoreViews(storeData.id);
        }
        // Generate QR code for this store
        const currentUrl = window.location.href;
        setQrCode(generateQRCode(currentUrl));
      } else {
        // Store not found
        setStore(null);
      }
    } catch (error) {
      console.error('Error loading store:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (store?.phone) {
      window.open(`tel:${store.phone}`, '_self');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: store?.businessName,
      text: `Check out ${store?.businessName} - ${store?.tagline}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Store link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏪❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-600 mb-6">The store you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            🏠 Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{store.businessName}</h1>
              <p className="text-blue-100 text-lg mb-1">{store.businessType}</p>
              <p className="text-blue-100 flex items-center">
                📍 {store.location}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-2">
                <div className="text-sm text-blue-100">Views</div>
                <div className="text-2xl font-bold">{store.views || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push(`/book/${store.storeSlug}`)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 text-lg"
          >
            📅 Book Service Now
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.open(`tel:${store.phone}`, '_self')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              📞 Call Now
            </button>
            <button
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({
                    title: store.businessName,
                    text: store.tagline || store.description,
                    url: url,
                  });
                } else {
                  navigator.clipboard.writeText(url);
                  alert('Store link copied to clipboard!');
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              📤 Share
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Store Information */}
          <div className="space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About Us</h2>
              <p className="text-gray-600">{store.description}</p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">💬 {store.tagline}</p>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Our Services</h2>
              <div className="grid grid-cols-2 gap-2">
                {store.services.map((service, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg p-3 text-center">
                    <span className="text-gray-800 font-medium">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📞</span>
                  <span className="text-gray-800">{store.phone}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🕒</span>
                  <span className="text-gray-800">{store.hours}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📍</span>
                  <span className="text-gray-800">{store.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Policies */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">💰 Pricing</h2>
              <div className="space-y-2">
                {(store.pricingSuggestions || []).map((price, index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-3">
                    <span className="text-green-800">{price}</span>
                  </div>
                ))}
                {(!store.pricingSuggestions || store.pricingSuggestions.length === 0) && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-600">Contact for pricing information</span>
                  </div>
                )}
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">📋 Our Policies</h2>
              <div className="space-y-2">
                {(store.businessPolicies || store.policies || []).map((policy, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">✓</span>
                    <span className="text-gray-800">{policy}</span>
                  </div>
                ))}
                {(!store.businessPolicies && !store.policies) && (
                  <div className="text-gray-600">
                    <div className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">✓</span>
                      <span>Customer satisfaction guaranteed</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code */}
            {qrCode && (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-3">📱 Share QR Code</h2>
                <img src={qrCode} alt="Store QR Code" className="mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Scan to share this store</p>
              </div>
            )}
          </div>
        </div>

        {/* Promotional Content */}
        {store.aiGeneratedPromo && (
          <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6">
            <h2 className="text-xl font-bold mb-3">🎉 Special Offer</h2>
            <p className="text-lg">{store.aiGeneratedPromo}</p>
          </div>
        )}

        {/* Social Media Post */}
        {store.socialMediaPost && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">📱 Share on Social Media</h2>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-gray-800">{store.socialMediaPost}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent((store.socialMediaPost || '') + ' ' + window.location.href)}`, '_blank')}
                className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded transition duration-300"
              >
                Twitter
              </button>
              <button 
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300"
              >
                Facebook
              </button>
              <button 
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent((store.socialMediaPost || store.tagline || store.businessName) + ' ' + window.location.href)}`, '_blank')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-300"
              >
                WhatsApp
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            🏠 Create Your Own Store
          </button>
        </div>
      </div>
    </div>
  );
}