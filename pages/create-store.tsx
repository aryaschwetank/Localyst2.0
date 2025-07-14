import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';

const BUSINESS_CATEGORIES = [
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'cafe', label: '☕ Cafe/Coffee Shop' },
  { value: 'salon', label: '💇 Hair Salon' },
  { value: 'mechanic', label: '🔧 Auto Repair Shop' },
  { value: 'other', label: '📋 Other Business' }
];

export default function CreateStore() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    location: '',
    phone: '',
    description: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/');
      return;
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.businessName.trim()) {
      alert('Please enter a business name');
      return;
    }
    
    if (!formData.businessType) {
      alert('Please select a business type');
      return;
    }
    
    if (!formData.location.trim()) {
      alert('Please enter a location');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Creating store:', formData);
      
      // Simulate API delay with progress
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('🎉 Store created successfully! Redirecting to dashboard...');
      router.push('/dashboard');
        
    } catch (error) {
      console.error('❌ Error creating store:', error);
      alert('Failed to create store. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Your Store</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your business name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select your business type...</option>
                {BUSINESS_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Delhi, Mumbai"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of your business"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.businessName || !formData.businessType || !formData.location}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition duration-300 transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Your Store...
                </div>
              ) : (
                '🚀 Create My Store'
              )}
            </button>

            {/* Add helper text */}
            <p className="text-center text-sm text-gray-500 mt-2">
              All fields marked with * are required
            </p>
          </form>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Creating Your Store</h3>
            <p className="text-gray-600">Please wait while we set up your business...</p>
          </div>
        </div>
      )}
    </div>
  );
}