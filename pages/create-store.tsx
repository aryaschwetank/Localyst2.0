import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { generateStoreContent } from '@/services/gemini';
import { createStore } from '@/services/firestore';
import { useSession } from 'next-auth/react';

const BUSINESS_CATEGORIES = [
  // Food & Restaurants
  { value: 'restaurant', label: '🍽️ Restaurant', category: 'Food & Dining' },
  { value: 'cafe', label: '☕ Cafe/Coffee Shop', category: 'Food & Dining' },
  { value: 'bakery', label: '🥖 Bakery', category: 'Food & Dining' },
  { value: 'fast-food', label: '🍔 Fast Food', category: 'Food & Dining' },
  { value: 'catering', label: '🍱 Catering Service', category: 'Food & Dining' },
  
  // Health & Beauty
  { value: 'salon', label: '💇 Hair Salon', category: 'Health & Beauty' },
  { value: 'spa', label: '🧴 Spa & Wellness', category: 'Health & Beauty' },
  { value: 'gym', label: '💪 Gym/Fitness Center', category: 'Health & Beauty' },
  { value: 'clinic', label: '🏥 Medical Clinic', category: 'Health & Beauty' },
  { value: 'dental', label: '🦷 Dental Clinic', category: 'Health & Beauty' },
  
  // Automotive
  { value: 'mechanic', label: '🔧 Auto Repair Shop', category: 'Automotive' },
  { value: 'car-wash', label: '🚗 Car Wash', category: 'Automotive' },
  { value: 'tire-shop', label: '🛞 Tire Shop', category: 'Automotive' },
  
  // Home Services
  { value: 'plumber', label: '🔧 Plumbing Service', category: 'Home Services' },
  { value: 'electrician', label: '⚡ Electrical Service', category: 'Home Services' },
  { value: 'cleaning', label: '🧹 Cleaning Service', category: 'Home Services' },
  { value: 'painter', label: '🎨 Painting Service', category: 'Home Services' },
  { value: 'carpenter', label: '🪚 Carpentry Service', category: 'Home Services' },
  
  // Technology
  { value: 'phone-repair', label: '📱 Phone Repair', category: 'Technology' },
  { value: 'computer-repair', label: '💻 Computer Repair', category: 'Technology' },
  { value: 'tech-support', label: '🛠️ Tech Support', category: 'Technology' },
  
  // Education & Services
  { value: 'tutoring', label: '📚 Tutoring Service', category: 'Education' },
  { value: 'photography', label: '📸 Photography', category: 'Creative Services' },
  { value: 'travel', label: '✈️ Travel Agency', category: 'Travel & Tourism' },
  { value: 'tailoring', label: '👔 Tailoring Service', category: 'Fashion' },
  
  // Other
  { value: 'other', label: '📋 Other Business', category: 'Other' }
];

export default function CreateStore() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    customBusinessType: '',
    location: '',
    phone: '',
    hours: '',
    description: '',
    services: [''],
    servicePrices: [''],
    targetAudience: '',
    logo: null as File | null,
    businessImages: [] as File[]
  });

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/auth/signin?callbackUrl=/create-store');
      return;
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (index: number, value: string) => {
    const newServices = [...formData.services];
    newServices[index] = value;
    setFormData(prev => ({ ...prev, services: newServices }));
  };

  const handlePriceChange = (index: number, value: string) => {
    const newPrices = [...formData.servicePrices];
    newPrices[index] = value;
    setFormData(prev => ({ ...prev, servicePrices: newPrices }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, ''],
      servicePrices: [...prev.servicePrices, '']
    }));
  };

  const removeService = (index: number) => {
    if (formData.services.length > 1) {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter((_, i) => i !== index),
        servicePrices: prev.servicePrices.filter((_, i) => i !== index)
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'gallery') => {
    const files = e.target.files;
    if (!files) return;

    if (type === 'logo') {
      setFormData(prev => ({ ...prev, logo: files[0] }));
    } else {
      const imageArray = Array.from(files);
      setFormData(prev => ({ ...prev, businessImages: [...prev.businessImages, ...imageArray] }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Get final business type
      const finalBusinessType = formData.businessType === 'other' 
        ? formData.customBusinessType 
        : BUSINESS_CATEGORIES.find(cat => cat.value === formData.businessType)?.label || formData.businessType;

      // Create services with prices
      const servicesWithPrices = formData.services
        .filter(service => service.trim())
        .map((service, index) => ({
          name: service.trim(),
          price: formData.servicePrices[index]?.trim() || 'Contact for pricing'
        }));

      // Generate AI content with specific business context
      console.log('🤖 Generating AI content for:', finalBusinessType);
      const aiContent = await generateStoreContent({
        businessName: formData.businessName,
        businessType: finalBusinessType,
        location: formData.location,
        services: servicesWithPrices.map(s => s.name),
        targetAudience: formData.targetAudience,
        existingDescription: formData.description
      });

      // Generate store slug
      const slug = formData.businessName.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim() + '-' + Math.random().toString(36).substring(2, 8);

      // Create store data with all properties
      const storeData = {
        businessName: formData.businessName,
        businessType: finalBusinessType,
        location: formData.location,
        phone: formData.phone,
        hours: formData.hours,
        description: formData.description || aiContent.description,
        services: servicesWithPrices.map(s => s.name),
        servicePrices: servicesWithPrices,
        tagline: aiContent.tagline,
        pricingSuggestions: servicesWithPrices.map(s => `${s.name}: ${s.price}`),
        policies: aiContent.policies,
        businessPolicies: aiContent.policies, // Same as policies for backward compatibility
        marketingContent: aiContent.marketingContent,
        aiGeneratedPromo: aiContent.marketingContent, // Use marketing content as promo
        socialMediaPost: `🎉 Check out ${formData.businessName} in ${formData.location}! ${aiContent.tagline} 📞 ${formData.phone}`, // Generate social media post
        storeSlug: slug,
        userId: session.user?.email || 'anonymous', // Use actual user ID
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: true,
        views: 0
      };

      console.log('💾 Creating store with data:', storeData);
      const storeId = await createStore(storeData);
      
      console.log('✅ Store created successfully with ID:', storeId);
      
      // Show success message
      alert('🎉 Store created successfully! Redirecting to your store...');
      
      // Redirect to the store page
      router.push(`/store/${slug}`);
        
    } catch (error) {
      console.error('❌ Error creating store:', error);
      alert(`Failed to create store: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const groupedCategories = BUSINESS_CATEGORIES.reduce((acc, business) => {
    const category = business.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(business);
    return acc;
  }, {} as Record<string, typeof BUSINESS_CATEGORIES>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentStep === 1 && '🏪 Business Information'}
              {currentStep === 2 && '🛠️ Services & Pricing'}
              {currentStep === 3 && '🖼️ Images & Branding'}
              {currentStep === 4 && '✨ AI Enhancement'}
            </h1>
            <p className="text-gray-600">Step {currentStep} of 4</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us about your business</h2>
              
              {/* Business Name */}
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

              {/* Business Type */}
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
                  {Object.entries(groupedCategories).map(([category, businesses]) => (
                    <optgroup key={category} label={category}>
                      {businesses.map((business) => (
                        <option key={business.value} value={business.value}>
                          {business.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Custom Business Type */}
              {formData.businessType === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specify Your Business Type *
                  </label>
                  <input
                    type="text"
                    name="customBusinessType"
                    value={formData.customBusinessType}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Pet Grooming, Jewelry Repair, etc."
                    required
                  />
                </div>
              )}

              {/* Location */}
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
                  placeholder="e.g., Delhi, Mumbai, Bangalore"
                  required
                />
              </div>

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Hours *
                  </label>
                  <input
                    type="text"
                    name="hours"
                    value={formData.hours}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mon-Sat: 9:00 AM - 8:00 PM"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell customers about your business (AI will enhance this if left blank)"
                />
              </div>
            </div>
          )}

          {/* Step 2: Services & Pricing */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What services do you offer?</h2>
              
              {formData.services.map((service, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Name *
                      </label>
                      <input
                        type="text"
                        value={service}
                        onChange={(e) => handleServiceChange(index, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Hair Cut, Oil Change, Website Design"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Range
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={formData.servicePrices[index] || ''}
                          onChange={(e) => handlePriceChange(index, e.target.value)}
                          className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., ₹500-800, ₹2000, Starting at ₹1500"
                        />
                        {formData.services.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeService(index)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 rounded-r-lg transition duration-300"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addService}
                className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-3 px-4 rounded-lg transition duration-300 border-2 border-dashed border-blue-300"
              >
                ➕ Add Another Service
              </button>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who are your main customers? (Optional)
                </label>
                <input
                  type="text"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Local families, Young professionals, Car owners"
                />
              </div>
            </div>
          )}

          {/* Step 3: Images & Branding */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add images to showcase your business</h2>
              
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Logo (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition duration-300">
                  <input
                    type="file"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    accept="image/*"
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    {formData.logo ? (
                      <div>
                        <img
                          src={URL.createObjectURL(formData.logo)}
                          alt="Logo preview"
                          className="w-24 h-24 object-cover mx-auto mb-2 rounded-lg"
                        />
                        <p className="text-sm text-gray-600">Click to change logo</p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-2">🖼️</div>
                        <p className="text-gray-600">Click to upload your business logo</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Business Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Photos (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition duration-300">
                  <input
                    type="file"
                    onChange={(e) => handleImageUpload(e, 'gallery')}
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="gallery-upload"
                  />
                  <label htmlFor="gallery-upload" className="cursor-pointer">
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-gray-600">Upload photos of your business, services, or products</p>
                    <p className="text-xs text-gray-500 mt-1">Multiple images allowed • PNG, JPG up to 5MB each</p>
                  </label>
                </div>
                
                {formData.businessImages.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {formData.businessImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Business photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              businessImages: prev.businessImages.filter((_, i) => i !== index)
                            }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review your business details</h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">📋 Business Summary</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p><strong>Business:</strong> {formData.businessName}</p>
                    <p><strong>Type:</strong> {formData.businessType === 'other' ? formData.customBusinessType : BUSINESS_CATEGORIES.find(cat => cat.value === formData.businessType)?.label}</p>
                    <p><strong>Location:</strong> {formData.location}</p>
                    <p><strong>Phone:</strong> {formData.phone}</p>
                    <p><strong>Hours:</strong> {formData.hours}</p>
                  </div>
                  <div>
                    <p><strong>Services:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      {formData.services.filter(s => s.trim()).map((service, index) => (
                        <li key={index} className="text-sm">
                          {service} - {formData.servicePrices[index] || 'Contact for pricing'}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">🤖 AI Enhancement</h3>
                <p className="text-gray-600">
                  Our AI will create professional content including:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Compelling business description tailored to your industry</li>
                  <li>Professional tagline that attracts customers</li>
                  <li>Business policies relevant to your service type</li>
                  <li>Marketing content optimized for your target audience</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-8 border-t">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              ← Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                disabled={
                  (currentStep === 1 && (!formData.businessName || !formData.businessType || !formData.location || !formData.phone || !formData.hours)) ||
                  (currentStep === 2 && !formData.services.some(s => s.trim()))
                }
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-8 rounded-lg transition duration-300 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Store...
                  </>
                ) : (
                  '🚀 Create My Store'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}