import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAllStores, StoreDocument } from '@/services/firestore';

export default function ExplorePage() {
  const router = useRouter();
  const [stores, setStores] = useState<StoreDocument[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const categories = ['all', 'repair', 'restaurant', 'salon', 'mechanic', 'other'];

  useEffect(() => {
    loadAllStores();
  }, []);

  useEffect(() => {
    filterStores();
  }, [stores, searchTerm, selectedCategory, selectedLocation]);

  const loadAllStores = async () => {
    try {
      console.log('🔍 Loading all public stores...');
      const allStores = await getAllStores();
      console.log('📦 Found stores:', allStores.length);
      setStores(allStores);
    } catch (error) {
      console.error('❌ Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStores = () => {
    let filtered = stores;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(store =>
        store.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.services.some(service => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(store =>
        store.businessType.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(store =>
        store.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredStores(filtered);
  };

  const getUniqueLocations = () => {
    const locations = stores.map(store => store.location);
    return ['all', ...Array.from(new Set(locations))];
  };

  const handleBookService = (store: StoreDocument) => {
    // Navigate to booking page (we'll create this next)
    router.push(`/book/${store.storeSlug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding amazing local services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              🔍 Discover Local Services
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Find and book amazing services in your area
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex bg-white rounded-full p-2 shadow-xl">
                <input
                  type="text"
                  placeholder="Search for services, businesses, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-6 py-3 text-gray-900 bg-transparent border-none focus:outline-none"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition duration-300">
                  🔍 Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {getUniqueLocations().map(location => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="bg-blue-50 rounded-lg p-3 w-full">
                <div className="text-blue-600 font-bold text-lg">
                  {filteredStores.length} Services Found
                </div>
                <div className="text-blue-500 text-sm">
                  in {selectedLocation === 'all' ? 'all areas' : selectedLocation}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Grid */}
        {filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Services Found</h2>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLocation('all');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              🔄 Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <div key={store.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
                {/* Store Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4">
                  <h3 className="text-xl font-bold mb-1">{store.businessName}</h3>
                  <p className="text-blue-100">{store.businessType}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm">📍 {store.location}</span>
                    <span className="ml-auto text-sm">👁️ {store.views || 0}</span>
                  </div>
                </div>

                {/* Store Content */}
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{store.description}</p>
                  
                  {/* Services Preview */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Services:</h4>
                    <div className="flex flex-wrap gap-1">
                      {store.services.slice(0, 3).map((service, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {service}
                        </span>
                      ))}
                      {store.services.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          +{store.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing Preview */}
                  {store.pricingSuggestions && store.pricingSuggestions.length > 0 && (
                    <div className="mb-4">
                      <div className="bg-green-50 rounded-lg p-2">
                        <span className="text-green-700 text-sm font-medium">
                          💰 {store.pricingSuggestions[0]}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="text-sm text-gray-600 mb-4">
                    <div className="flex items-center mb-1">
                      <span className="mr-2">📞</span>
                      <span>{store.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">🕒</span>
                      <span>{store.hours}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => router.push(`/store/${store.storeSlug}`)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-300 text-sm"
                    >
                      👁️ View Details
                    </button>
                    <button
                      onClick={() => handleBookService(store)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 text-sm"
                    >
                      📅 Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action for Business Owners */}
        <div className="mt-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Own a Local Business?</h2>
          <p className="text-lg mb-6">Join thousands of businesses attracting more customers with AI-powered store pages!</p>
          <button
            onClick={() => router.push('/')}
            className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition duration-300"
          >
            🚀 Create Your Store
          </button>
        </div>
      </div>
    </div>
  );
}