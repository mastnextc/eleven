import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cart, updateCartQty, removeFromCart, getCartTotal, API_URL } = useContext(ShopContext);
  const [couponCode, setCouponCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null);
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setDiscountInfo(null);

    if (!couponCode) return;

    try {
      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, amount: getCartTotal() })
      });

      const data = await res.json();
      if (res.ok) {
        setDiscountInfo(data);
      } else {
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch (err) {
      console.error(err);
      setCouponError('Server error validating coupon');
    }
  };

  const totalCartPrice = getCartTotal();
  let discountAmount = 0;
  if (discountInfo) {
    if (discountInfo.discountType === 'percentage') {
      discountAmount = (totalCartPrice * discountInfo.discountValue) / 100;
    } else {
      discountAmount = discountInfo.discountValue;
    }
  }

  const finalAmount = Math.max(0, totalCartPrice - discountAmount);

  const handleCheckoutSubmit = () => {
    navigate('/checkout', {
      state: {
        couponCode: discountInfo ? discountInfo.code : null,
        discountAmount,
        finalAmount
      }
    });
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="bg-stone-50 border p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-stone-300">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-stone-900">Your bag is empty</h2>
        <p className="text-xs text-stone-400">Add beautiful kurtis, designer midi dresses and trendy accessories to get started.</p>
        <div className="pt-2">
          <Link
            to="/shop"
            className="bg-stone-900 text-white font-medium text-xs px-6 py-2.5 rounded-full inline-block"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold font-serif text-stone-900 border-b border-stone-100 pb-4">
        Shopping Bag
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Cart Item list */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item, index) => {
            const productPrice = item.product.discountPrice || item.product.price;
            return (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-stone-100 rounded-xl p-4 bg-white shadow-sm gap-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 aspect-[4/5] rounded-lg overflow-hidden shrink-0 bg-stone-50">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 text-sm line-clamp-1">{item.product.name}</h3>
                    <div className="flex flex-wrap gap-2 text-[10px] text-stone-400 mt-1">
                      {item.size && (
                        <span className="bg-stone-50 border px-1.5 py-0.5 rounded font-bold">Size: {item.size}</span>
                      )}
                      {item.color && (
                        <span className="bg-stone-50 border px-1.5 py-0.5 rounded font-bold">Color: {item.color}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price and Quantities */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-0 pt-3 sm:pt-0">
                  <div className="flex items-center border border-stone-200 rounded-md">
                    <button
                      onClick={() => updateCartQty(item.product._id, item.size, item.color, item.quantity - 1)}
                      className="px-2.5 py-1 text-stone-500 font-bold"
                    >
                      -
                    </button>
                    <span className="px-2.5 py-1 text-xs font-bold text-stone-900">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQty(item.product._id, item.size, item.color, item.quantity + 1)}
                      className="px-2.5 py-1 text-stone-500 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-bold text-stone-900 text-sm w-16 text-right">
                    ₹{productPrice * item.quantity}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.product._id, item.size, item.color)}
                    className="text-stone-400 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Summary */}
        <div className="lg:col-span-4 bg-stone-50 border border-stone-100 p-6 rounded-2xl h-fit space-y-6 shadow-sm">
          <h2 className="font-bold text-stone-900 text-sm uppercase tracking-wide border-b pb-2">Order Summary</h2>

          {/* Coupon apply */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Apply Coupon</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="PROMOCODE"
                className="flex-1 bg-white border border-stone-200 rounded-lg py-1.5 px-3 text-xs uppercase tracking-wider focus:outline-none"
              />
              <button
                type="submit"
                className="bg-stone-900 text-white font-semibold text-xs py-1.5 px-4 rounded-lg hover:bg-stone-850"
              >
                Apply
              </button>
            </div>
            {couponError && <p className="text-[10px] text-rose-600 font-bold">{couponError}</p>}
            {discountInfo && (
              <p className="text-[10px] text-emerald-700 font-bold">
                Coupon "{discountInfo.code}" applied! Saved {discountInfo.discountType === 'percentage' ? `${discountInfo.discountValue}%` : `₹${discountInfo.discountValue}`}
              </p>
            )}
          </form>

          {/* Checkout prices breakdown */}
          <div className="space-y-3 text-xs text-stone-600 border-t border-stone-100 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-stone-900">₹{totalCartPrice}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Discount</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Charges</span>
              <span className="text-emerald-750 font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-stone-100 pt-3">
              <span>Grand Total</span>
              <span className="text-amber-700 font-extrabold">₹{finalAmount}</span>
            </div>
          </div>

          <button
            onClick={handleCheckoutSubmit}
            className="w-full bg-stone-900 text-white font-semibold text-xs py-3 rounded-xl hover:bg-stone-850 transition-colors shadow-sm flex items-center justify-center space-x-1.5"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
