import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { ShoppingBag, Calendar, CheckCircle2, Truck, Package, Clock } from 'lucide-react';

const MyOrders = () => {
  const { API_URL, token } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const [notification, setNotification] = useState('');

  const fetchOrders = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    if (location.state && location.state.orderPlaced) {
      setNotification("Your order has been placed successfully!");
      // Clean history state
      window.history.replaceState({}, document.title);
    }
  }, [token]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Placed': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'Processing': return <Package className="w-4 h-4 text-indigo-500" />;
      case 'Shipped': return <Truck className="w-4 h-4 text-blue-500" />;
      case 'Delivered': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <Clock className="w-4 h-4 text-stone-500" />;
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold font-serif text-stone-900">Please Log In</h2>
        <p className="text-xs text-stone-400">You must be logged in to view your orders and track deliveries.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold font-serif text-stone-900 border-b border-stone-100 pb-3">My Orders</h1>

      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-650" />
          <span>{notification}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-stone-500 text-xs">Loading your orders...</div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="border border-stone-100 rounded-2xl bg-white shadow-sm overflow-hidden">
              {/* Header status bar */}
              <div className="bg-stone-50/60 px-6 py-4 border-b border-stone-100 flex flex-wrap justify-between items-center gap-3">
                <div className="flex space-x-6 text-[11px] text-stone-500 font-semibold">
                  <div>
                    <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider">Order Date</span>
                    <span className="flex items-center mt-1"><Calendar className="w-3.5 h-3.5 mr-1" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total amount</span>
                    <span className="text-stone-900 mt-1 block">₹{order.finalAmount}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider">Payment method</span>
                    <span className="text-stone-900 mt-1 block font-bold">{order.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-white border border-stone-200 rounded-full px-3.5 py-1 text-xs font-semibold">
                  {getStatusIcon(order.orderStatus)}
                  <span className="text-stone-700">{order.orderStatus}</span>
                </div>
              </div>

              {/* Items in order */}
              <div className="px-6 py-4 divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-4 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 aspect-[4/5] rounded-lg overflow-hidden shrink-0 bg-stone-50 border">
                        <img src={item.product?.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-900 text-sm line-clamp-1">{item.product?.name || 'Deleted Product'}</h4>
                        <div className="flex space-x-3 text-[10px] text-stone-400 mt-0.5">
                          <span>Qty: {item.quantity}</span>
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-stone-900">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Footer delivery summary */}
              <div className="bg-stone-50/40 px-6 py-3 border-t border-stone-100 flex justify-between items-center text-xs">
                <span className="text-stone-400">Payment status: <strong className={`font-bold ${order.paymentStatus === 'Completed' ? 'text-emerald-700' : 'text-amber-700'}`}>{order.paymentStatus}</strong></span>
                {order.trackingNumber && (
                  <span className="text-stone-500 font-semibold">Tracking No: {order.trackingNumber}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-stone-50 border border-dashed rounded-3xl space-y-2">
          <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="font-semibold text-stone-700">No orders found</h3>
          <p className="text-xs text-stone-400">You haven't placed any orders yet.</p>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
