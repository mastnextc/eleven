const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    size: String,
    color: String
  }],
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  shippingAddress: {
    name: String,
    phone: String,
    addressLine: String,
    city: String,
    state: String,
    zipCode: String
  },
  paymentMethod: { type: String, enum: ['COD', 'Paytm'], default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
  paymentDetails: {
    transactionId: String,
    bankName: String,
    paymentMode: String,
    txDate: String
  },
  orderStatus: {
    type: String,
    enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  couponApplied: String,
  trackingNumber: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
