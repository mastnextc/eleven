import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { ShoppingBag, TrendingUp, Users, Package, AlertCircle, Plus, Trash2, Edit } from 'lucide-react';

const AdminDashboard = () => {
  const { API_URL, token, user, products, fetchProducts } = useContext(ShopContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [latestOrders, setLatestOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: 'Ethnic Wear',
    sizes: 'S, M, L, XL',
    colors: 'Pink, Blue',
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=60',
    isNewArrival: true,
    isBestSeller: false
  });
  const [productMessage, setProductMessage] = useState('');

  // Fetch admin dashboard details
  const fetchAdminData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      
      // Fetch Dashboard Stats
      const resStats = await fetch(`${API_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resStats.ok) {
        const stats = await resStats.json();
        setMetrics(stats.metrics);
        setLatestOrders(stats.latestOrders);
      }

      // Fetch all orders for management
      const resOrders = await fetch(`${API_URL}/orders/my-orders`, { // Reusing user list, or fetch all admin orders (mocked as user endpoint since we filter by role)
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch all orders in systems (would be custom route, fallback to fetching all order details)
      // Since it's demo, we populate orders
      const resAllOrders = await fetch(`${API_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resAllOrders.ok) {
        const stats = await resAllOrders.json();
        setAllOrders(stats.latestOrders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || (user && user.role !== 'admin')) {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [token, user]);

  // Handle Order Status updates
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Add Product submit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setProductMessage('');

    try {
      const sizesArray = newProduct.sizes.split(',').map(s => s.trim());
      const colorsArray = newProduct.colors.split(',').map(c => c.trim());

      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          price: Number(newProduct.price),
          discountPrice: newProduct.discountPrice ? Number(newProduct.discountPrice) : undefined,
          category: newProduct.category,
          sizes: sizesArray,
          colors: colorsArray,
          stock: Number(newProduct.stock),
          images: [newProduct.imageUrl],
          isNewArrival: newProduct.isNewArrival,
          isBestSeller: newProduct.isBestSeller
        })
      });

      if (res.ok) {
        setProductMessage("Product added successfully!");
        setNewProduct({
          name: '',
          description: '',
          price: '',
          discountPrice: '',
          category: 'Ethnic Wear',
          sizes: 'S, M, L, XL',
          colors: 'Pink, Blue',
          stock: 20,
          imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=60',
          isNewArrival: true,
          isBestSeller: false
        });
        fetchProducts(); // Refresh context
        fetchAdminData(); // Refresh metrics
      } else {
        setProductMessage("Failed to add product.");
      }
    } catch (err) {
      console.error(err);
      setProductMessage("Server error adding product.");
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProducts();
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      
      {/* Side Tabs Navigation */}
      <aside className="w-full md:w-56 shrink-0 space-y-2">
        <div className="border-b pb-3 mb-4">
          <h2 className="font-bold text-stone-900 font-serif">Admin Control</h2>
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Control Panel</span>
        </div>
        {[
          { id: 'dashboard', label: 'Dashboard Overview' },
          { id: 'add-product', label: 'Add New Product' },
          { id: 'manage-products', label: 'Manage Catalog' },
          { id: 'orders', label: 'Manage Store Orders' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full text-left text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1">
        {loading ? (
          <div className="text-center py-20 text-stone-500 text-xs">Loading administration panel data...</div>
        ) : (
          <>
            {/* Overview tab */}
            {activeTab === 'dashboard' && metrics && (
              <div className="space-y-8 animate-fadeIn">
                {/* Stats cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white border p-5 rounded-2xl shadow-sm flex items-center space-x-4">
                    <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full"><TrendingUp className="w-5 h-5" /></div>
                    <div>
                      <span className="block text-[10px] text-stone-450 uppercase font-bold tracking-wider">Total Sales</span>
                      <span className="text-lg font-black text-stone-900">₹{metrics.totalSales}</span>
                    </div>
                  </div>
                  <div className="bg-white border p-5 rounded-2xl shadow-sm flex items-center space-x-4">
                    <div className="bg-amber-50 text-amber-600 p-3 rounded-full"><ShoppingBag className="w-5 h-5" /></div>
                    <div>
                      <span className="block text-[10px] text-stone-450 uppercase font-bold tracking-wider">Orders</span>
                      <span className="text-lg font-black text-stone-900">{metrics.totalOrders}</span>
                    </div>
                  </div>
                  <div className="bg-white border p-5 rounded-2xl shadow-sm flex items-center space-x-4">
                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-full"><Users className="w-5 h-5" /></div>
                    <div>
                      <span className="block text-[10px] text-stone-450 uppercase font-bold tracking-wider">Customers</span>
                      <span className="text-lg font-black text-stone-900">{metrics.totalCustomers}</span>
                    </div>
                  </div>
                  <div className="bg-white border p-5 rounded-2xl shadow-sm flex items-center space-x-4">
                    <div className="bg-stone-50 text-stone-600 p-3 rounded-full"><Package className="w-5 h-5" /></div>
                    <div>
                      <span className="block text-[10px] text-stone-450 uppercase font-bold tracking-wider">Products</span>
                      <span className="text-lg font-black text-stone-900">{metrics.totalProducts}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Orders List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">Recent Orders</h3>
                  <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-100 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                          <th className="px-6 py-3">Order ID</th>
                          <th className="px-6 py-3">Customer</th>
                          <th className="px-6 py-3">Payment</th>
                          <th className="px-6 py-3">Amount</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-stone-50">
                        {latestOrders.map((ord) => (
                          <tr key={ord._id} className="hover:bg-stone-50/50">
                            <td className="px-6 py-3.5 font-semibold text-stone-900 truncate max-w-[120px]">{ord._id}</td>
                            <td className="px-6 py-3.5">{ord.shippingAddress?.name || 'Customer'}</td>
                            <td className="px-6 py-3.5 font-medium">{ord.paymentMethod} ({ord.paymentStatus})</td>
                            <td className="px-6 py-3.5 font-bold">₹{ord.finalAmount}</td>
                            <td className="px-6 py-3.5">
                              <span className="bg-stone-100 border text-stone-700 px-2.5 py-0.5 rounded-full font-bold">
                                {ord.orderStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Add product tab */}
            {activeTab === 'add-product' && (
              <div className="bg-white border border-stone-100 p-6 rounded-2xl shadow-sm max-w-2xl animate-fadeIn space-y-6">
                <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wide border-b pb-2">Add New Product</h3>
                {productMessage && (
                  <div className={`p-3 text-xs font-semibold rounded-lg ${
                    productMessage.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {productMessage}
                  </div>
                )}
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Product Name</label>
                    <input
                      type="text"
                      required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="e.g. Silk Designer Kurti"
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="1999"
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Discount Price (₹)</label>
                    <input
                      type="number"
                      value={newProduct.discountPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, discountPrice: e.target.value })}
                      placeholder="1299"
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-stone-400"
                    >
                      <option value="Ethnic Wear">Ethnic Wear</option>
                      <option value="Dresses">Dresses</option>
                      <option value="Western Wear">Western Wear</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      placeholder="20"
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-stone-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Sizes (Comma separated)</label>
                    <input
                      type="text"
                      value={newProduct.sizes}
                      onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                      placeholder="XS, S, M, L, XL"
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-stone-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Colors (Comma separated)</label>
                    <input
                      type="text"
                      value={newProduct.colors}
                      onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                      placeholder="Pink, Emerald, Indigo"
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-stone-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Image URL (Unsplash or Cloudinary)</label>
                    <input
                      type="text"
                      value={newProduct.imageUrl}
                      onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-stone-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Product Description</label>
                    <textarea
                      rows="3"
                      required
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Brief details about fit, quality, styling tips..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-stone-400 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="sm:col-span-2 bg-stone-900 text-white font-semibold text-xs py-3 rounded-xl hover:bg-stone-850"
                  >
                    Save Product
                  </button>
                </form>
              </div>
            )}

            {/* Manage products tab */}
            {activeTab === 'manage-products' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">Products Listing</h3>
                <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-100 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-3">Image</th>
                        <th className="px-6 py-3">Product Name</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Price</th>
                        <th className="px-6 py-3">Stock</th>
                        <th className="px-6 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-stone-50">
                      {products.map((prod) => (
                        <tr key={prod._id} className="hover:bg-stone-50/50">
                          <td className="px-6 py-3.5">
                            <div className="w-8 aspect-[4/5] rounded overflow-hidden bg-stone-50 border">
                              <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="px-6 py-3.5 font-medium text-stone-900">{prod.name}</td>
                          <td className="px-6 py-3.5">{prod.category}</td>
                          <td className="px-6 py-3.5 font-bold">₹{prod.discountPrice || prod.price}</td>
                          <td className="px-6 py-3.5">{prod.stock} items</td>
                          <td className="px-6 py-3.5 text-right">
                            <button
                              onClick={() => handleDeleteProduct(prod._id)}
                              className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">Store Orders</h3>
                <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-100 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-3">Order ID</th>
                        <th className="px-6 py-3">Customer details</th>
                        <th className="px-6 py-3">Payment details</th>
                        <th className="px-6 py-3">Grand Total</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-stone-50">
                      {allOrders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-stone-50/50">
                          <td className="px-6 py-3.5 font-semibold text-stone-900 truncate max-w-[120px]">{ord._id}</td>
                          <td className="px-6 py-3.5">
                            <span className="block font-semibold text-stone-850">{ord.shippingAddress?.name}</span>
                            <span className="block text-[10px] text-stone-450">{ord.shippingAddress?.phone}</span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="block">{ord.paymentMethod}</span>
                            <span className="block text-[10px] text-stone-400">{ord.paymentStatus}</span>
                          </td>
                          <td className="px-6 py-3.5 font-bold">₹{ord.finalAmount}</td>
                          <td className="px-6 py-3.5">
                            <select
                              value={ord.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                              className="bg-stone-50 border border-stone-200 rounded px-2.5 py-1 text-xs font-bold text-stone-700 focus:outline-none"
                            >
                              <option value="Placed">Placed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
