import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getUserStores, deleteStore, StoreDocument } from '@/services/firestore';
import { exportStoreToPDF, exportStoreAsImage } from '@/services/exportService';
import { useSession, signOut } from 'next-auth/react';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stores, setStores] = useState<StoreDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin?callbackUrl=/dashboard');
      return;
    }
  }, [session, status, router]);

  // Fetch user's stores
  useEffect(() => {
    const fetchStores = async () => {
      if (!session?.user?.email) return;
      
      try {
        // Get stores for the current user
        const userStores = await getUserStores(session.user.email);
        setStores(userStores);
      } catch (error) {
        console.error('Error fetching stores:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email) {
      fetchStores();
    }
  }, [session]);

  // Show loading while checking authentication
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleDeleteStore = async (storeId: string) => {
    if (confirm('Are you sure you want to delete this store?')) {
      try {
        await deleteStore(storeId);
        setStores(stores.filter(store => store.id !== storeId));
        alert('Store deleted successfully!');
      } catch (error) {
        console.error('Error deleting store:', error);
        alert('Failed to delete store. Please try again.');
      }
    }
  };

  const viewStore = (store: StoreDocument) => {
    // Store the data and navigate to preview
    localStorage.setItem('generatedStore', JSON.stringify(store));
    localStorage.setItem('currentStoreId', store.id || '');
    router.push('/store-preview');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header with user info */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {session.user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-600">Manage your businesses and track performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <img
                className="h-10 w-10 rounded-full"
                src={session.user?.image || ''}
                alt={session.user?.name || ''}
              />
              <button
                onClick={() => signOut()}
                className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition duration-300"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Actions */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => router.push('/create-store')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            ➕ Create New Store
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            🏠 Home
          </button>
        </div>

        {/* Stores Grid */}
        {stores.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No stores yet</h2>
            <p className="text-gray-600 mb-6">Create your first store to get started!</p>
            <button
              onClick={() => router.push('/create-store')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              Create Your First Store
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div key={store.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Store Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <h3 className="text-xl font-bold mb-1">{store.businessName}</h3>
                  <p className="text-blue-100">{store.businessType}</p>
                  <p className="text-blue-100 text-sm">{store.location}</p>
                </div>

                {/* Store Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm mb-2">{store.tagline}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className="mr-4">👁️ {store.views || 0} views</span>
                      <span>
                        📅{' '}
                        {store.createdAt &&
                          (
                            store.createdAt instanceof Date
                              ? store.createdAt
                              : new Date(
                                  // @ts-ignore: Firestore Timestamp compatibility
                                  store.createdAt.seconds * 1000
                                )
                          ).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Store URL */}
                    <div className="bg-gray-50 rounded p-2 mb-3">
                      <p className="text-xs text-gray-500 mb-1">Public Store URL:</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-blue-600 flex-1 truncate">
                          {window.location.origin}/store/{store.storeSlug}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/store/${store.storeSlug}`);
                            alert('URL copied to clipboard!');
                          }}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-600 text-xs px-2 py-1 rounded transition duration-300"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
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

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => viewStore(store)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-2 rounded transition duration-300"
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => window.open(`/store/${store.storeSlug}`, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-2 rounded transition duration-300"
                    >
                      🌐 Public
                    </button>
                    <button
                      onClick={() => exportStoreToPDF(store)}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-2 px-2 rounded transition duration-300"
                    >
                      📄 PDF
                    </button>
                    <button
                      onClick={() => handleDeleteStore(store.id!)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-2 px-2 rounded transition duration-300"
                    >
                      🗑️ Del
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {stores.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stores.length}</div>
                <div className="text-sm text-gray-600">Total Stores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stores.reduce((sum, store) => sum + (store.views || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stores.filter(store => store.isPublished !== false).length}
                </div>
                <div className="text-sm text-gray-600">Published</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(stores.reduce((sum, store) => sum + (store.views || 0), 0) / stores.length) || 0}
                </div>
                <div className="text-sm text-gray-600">Avg Views</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}