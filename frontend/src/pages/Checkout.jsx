import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { ShieldCheck, CreditCard, ChevronLeft } from 'lucide-react';

const Checkout = () => {
  const { cart, getCartTotal, API_URL, token, clearCart } = useContext(ShopContext);
  const location = useLocation();
  const navigate = useNavigate();

  const checkoutState = location.state || {
    couponCode: null,
    discountAmount: 0,
    finalAmount: getCartTotal()
  };

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Paytm Sandbox/Mock State
  const [mockPaytmOrder, setMockPaytmOrder] = useState(null);

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMessage("Please login to complete your order.");
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const items = cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.discountPrice || item.product.price,
        size: item.size,
        color: item.color
      }));

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items,
          shippingAddress,
          paymentMethod,
          couponCode: checkoutState.couponCode
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (paymentMethod === 'Paytm') {
          if (data.paymentMode === 'Mock') {
            // Initiate mock sandbox view
            setMockPaytmOrder(data);
          } else if (data.txnUrl) {
            // Actual Paytm redirect (would be used in live gateway)
            window.location.href = `${data.txnUrl}&checksum=${data.checksum}`;
          }
        } else {
          // COD Order success
          clearCart();
          navigate('/orders', { state: { orderPlaced: true } });
        }
      } else {
        setErrorMessage(data.message || "Failed to place order.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Server error placing order.");
    } finally {
      setLoading(false);
    }
  };

  // Simulate Paytm Checkout Action
  const handleSimulatePayment = async (status) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/orders/mock-paytm-callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: mockPaytmOrder.orderId,
          status: status
        })
      });

      if (res.ok) {
        clearCart();
        if (status === 'TXN_SUCCESS') {
          navigate('/orders', { state: { orderPlaced: true } });
        } else {
          setErrorMessage("Paytm transaction was cancelled or failed.");
          setMockPaytmOrder(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {mockPaytmOrder ? (
        // Paytm Sandbox Simulation Overlay
        <div className="max-w-md mx-auto bg-white border border-stone-200 rounded-3xl p-8 space-y-6 shadow-lg text-center my-12">
          <div className="bg-sky-50 border text-sky-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <CreditCard className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900">Paytm Payment Gateway</h2>
            <p className="text-xs text-stone-400 mt-1">Order Ref: {mockPaytmOrder.orderId}</p>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl text-stone-700 text-sm font-semibold">
            Transaction Amount: ₹{mockPaytmOrder.finalAmount}
          </div>

          <div className="space-y-3 pt-4">
            <button
              onClick={() => handleSimulatePayment('TXN_SUCCESS')}
              className="w-full bg-emerald-600 text-white font-semibold text-xs py-2.5 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Simulate Success Payment (OTP Verified)
            </button>
            <button
              onClick={() => handleSimulatePayment('TXN_FAIL')}
              className="w-full bg-rose-600 text-white font-semibold text-xs py-2.5 rounded-lg hover:bg-rose-700 transition-colors"
            >
              Simulate Cancel / Failure
            </button>
          </div>
        </div>
      ) : (
        // Standard Checkout Flow
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center space-x-1">
              <ChevronLeft className="w-4 h-4 text-stone-500" />
              <button onClick={() => navigate('/cart')} className="text-xs text-stone-500 hover:text-stone-700">Back to bag</button>
            </div>

            <h1 className="text-2xl font-bold font-serif text-stone-900 border-b border-stone-100 pb-3">Checkout Details</h1>

            {errorMessage && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Form */}
              <div className="space-y-4">
                <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wide">Shipping Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Receiver's Name</label>
                    <input
                      type="text"
                      name="name"
                      value={shippingAddress.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Receiver's name"
                      className="w-full bg-white border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="10-digit number"
                      className="w-full bg-white border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Street Address</label>
                    <input
                      type="text"
                      name="addressLine"
                      value={shippingAddress.addressLine}
                      onChange={handleInputChange}
                      required
                      placeholder="Apartment, building, street, colony..."
                      className="w-full bg-white border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      required
                      placeholder="City"
                      className="w-full bg-white border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      required
                      placeholder="State"
                      className="w-full bg-white border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Pincode (Zip)</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={handleInputChange}
                      required
                      placeholder="6-digit pincode"
                      className="w-full bg-white border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wide">Payment Method</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* COD */}
                  <label className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer ${
                    paymentMethod === 'COD' ? 'border-stone-900 bg-stone-50/50' : 'border-stone-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="accent-stone-900"
                      />
                      <div>
                        <span className="block text-xs font-bold text-stone-950">Cash on Delivery (COD)</span>
                        <span className="text-[10px] text-stone-400">Pay cash/UPI at delivery</span>
                      </div>
                    </div>
                  </label>

                  {/* Paytm */}
                  <label className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer ${
                    paymentMethod === 'Paytm' ? 'border-stone-900 bg-stone-50/50' : 'border-stone-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Paytm"
                        checked={paymentMethod === 'Paytm'}
                        onChange={() => setPaymentMethod('Paytm')}
                        className="accent-stone-900"
                      />
                      <div>
                        <span className="block text-xs font-bold text-stone-950">Paytm Checkout</span>
                        <span className="text-[10px] text-stone-400">Pay via Wallet, Cards, UPI</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 text-white font-semibold text-xs py-3 rounded-xl hover:bg-stone-850 transition-colors shadow-md"
              >
                {loading ? 'Processing...' : paymentMethod === 'Paytm' ? 'Proceed to Paytm' : 'Place Order (COD)'}
              </button>
            </form>
          </div>

          {/* Cart Pricing Sidebar */}
          <div className="lg:col-span-4 bg-stone-50 border border-stone-100 p-6 rounded-2xl h-fit space-y-6 shadow-sm">
            <h2 className="font-bold text-stone-900 text-sm uppercase tracking-wide border-b pb-2">Your Order</h2>
            
            {/* Items display */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-stone-500">x{item.quantity}</span>
                    <span className="text-stone-700 line-clamp-1">{item.product.name}</span>
                  </div>
                  <span className="font-semibold text-stone-900">₹{(item.product.discountPrice || item.product.price) * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Total pricing */}
            <div className="space-y-3 text-xs text-stone-600 border-t border-stone-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{getCartTotal()}</span>
              </div>
              {checkoutState.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Discount ({checkoutState.couponCode})</span>
                  <span>-₹{checkoutState.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-emerald-700 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-stone-100 pt-3">
                <span>Grand Total</span>
                <span className="text-amber-700 font-extrabold">₹{checkoutState.finalAmount}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl flex items-start space-x-2 text-[10px] text-amber-800 leading-normal">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Your personal data will be used to support your experience throughout this website, to manage access to your account.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
