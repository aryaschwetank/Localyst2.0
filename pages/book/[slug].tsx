import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getStoreBySlug, StoreDocument, createBooking } from '@/services/firestore';

export default function BookingPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [store, setStore] = useState<StoreDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    selectedService: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
  });

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

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
        // Pre-select first service
        if (storeData.services.length > 0) {
          setFormData(prev => ({ ...prev, selectedService: storeData.services[0] }));
        }
      }
    } catch (error) {
      console.error('Error loading store:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!store || !formData.customerName || !formData.customerPhone || !formData.selectedService) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    
    try {
      const bookingData = {
        storeId: store.id!,
        storeName: store.businessName,
        storePhone: store.phone,
        ...formData,
        bookingDate: new Date(),
        status: 'pending' as 'pending'
      };

      await createBooking(bookingData);
      
      // Show success message
      alert(`🎉 Booking request sent successfully!\n\n${store.businessName} will contact you at ${formData.customerPhone} to confirm your appointment.`);
      
      // Redirect to store page
      router.push(`/store/${store.storeSlug}`);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('❌ Failed to submit booking. Please try again or call directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking page...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <button
            onClick={() => router.push('/explore')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            🔍 Browse Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.back()}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg mr-4 transition duration-300"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-3xl font-bold">📅 Book Service</h1>
              <p className="text-green-100">with {store.businessName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Store Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{store.businessName}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <span className="mr-2">🏢</span>
                  <span className="text-gray-600">{store.businessType}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="mr-2">📍</span>
                  <span className="text-gray-600">{store.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="mr-2">📞</span>
                  <span className="text-gray-600">{store.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="mr-2">🕒</span>
                  <span className="text-gray-600">{store.hours}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Available Services:</h4>
                <div className="space-y-1">
                  {store.services.map((service, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • {service}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Call Button */}
              <button
                onClick={() => window.open(`tel:${store.phone}`, '_self')}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
              >
                📞 Call Now
              </button>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📝 Booking Details</h2>
              
              <form onSubmit={handleSubmitBooking} className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">👤 Your Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Service Selection */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">🛠️ Service Selection</h3>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Service *
                  </label>
                  <select
                    name="selectedService"
                    value={formData.selectedService}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a service...</option>
                    {store.services.map((service, index) => (
                      <option key={index} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">📅 Preferred Schedule</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Time
                      </label>
                      <select
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select time...</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any specific requirements or details about your service needs..."
                  />
                </div>

                {/* Pricing Info */}
                {store.pricingSuggestions && store.pricingSuggestions.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">💰 Pricing Information</h4>
                    <div className="space-y-1">
                      {store.pricingSuggestions.slice(0, 3).map((price, index) => (
                        <div key={index} className="text-sm text-green-700">
                          • {price}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      *Final pricing will be confirmed by the business
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300"
                  >
                    ← Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      '📅 Send Booking Request'
                    )}
                  </button>
                </div>
              </form>

              {/* Info Note */}
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">ℹ️</span>
                  <div>
                    <h4 className="text-blue-900 font-medium mb-1">How it works:</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Your booking request will be sent to {store.businessName}</li>
                      <li>• They will contact you within 24 hours to confirm</li>
                      <li>• You can also call them directly at {store.phone}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}