const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { auth, admin } = require('../middleware/auth');
const PaytmChecksum = require('paytmchecksum');

// Place order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Verify stock and fetch prices
    for (const item of items) {
      const { data: dbProduct, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.product)
        .maybeSingle();

      if (error || !dbProduct) {
        return res.status(445).json({ message: `Product ${item.product} not found` });
      }
      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${dbProduct.name}` });
      }

      const itemPrice = dbProduct.discount_price || dbProduct.price;
      totalAmount += itemPrice * item.quantity;
      
      orderItems.push({
        product_id: dbProduct.id,
        name: dbProduct.name,
        quantity: item.quantity,
        price: itemPrice,
        size: item.size,
        color: item.color
      });
    }

    // Process coupon code discount
    let discountAmount = 0;
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (coupon && new Date(coupon.expiry_date) > new Date() && totalAmount >= coupon.min_purchase_amount) {
        if (coupon.discount_type === 'percentage') {
          discountAmount = (totalAmount * coupon.discount_value) / 100;
        } else {
          discountAmount = coupon.discount_value;
        }
      }
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // Insert Order into Supabase
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        items: orderItems,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        payment_status: 'Pending',
        order_status: 'Placed',
        coupon_applied: couponCode || null
      })
      .select()
      .single();

    if (orderErr || !order) {
      return res.status(400).json({ message: 'Failed to create order', error: orderErr?.message });
    }

    // Deduct stock for products
    for (const item of orderItems) {
      const { data: prod } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();

      await supabase
        .from('products')
        .update({ stock: Math.max(0, prod.stock - item.quantity) })
        .eq('id', item.product_id);
    }

    // Paytm Integration logic
    if (paymentMethod === 'Paytm') {
      const mid = process.env.PAYTM_MID;
      const key = process.env.PAYTM_KEY;
      
      if (mid === 'MOCK_MID_12345' || !mid) {
        return res.status(201).json({
          message: 'Order initiated via Paytm (Mock Sandbox Mode)',
          paymentMode: 'Mock',
          orderId: order.id,
          finalAmount
        });
      }

      const paytmParams = {
        body: {
          requestType: 'Payment',
          mid: mid,
          websiteName: process.env.PAYTM_WEBSITE,
          orderId: order.id,
          callbackUrl: process.env.PAYTM_CALLBACK_URL,
          txnAmount: {
            value: finalAmount.toFixed(2),
            currency: 'INR'
          },
          userInfo: {
            custId: req.user.id,
            email: req.user.email,
            firstName: req.user.name
          }
        }
      };

      const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), key);
      return res.status(201).json({
        paytmParams: paytmParams.body,
        checksum,
        txnUrl: `https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction?mid=${mid}&orderId=${order.id}`
      });
    }

    res.status(201).json({ message: 'Order placed successfully (Cash on Delivery)', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mock Paytm Payment success/failure callback route
router.post('/mock-paytm-callback', auth, async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status === 'TXN_SUCCESS') {
      await supabase
        .from('orders')
        .update({
          payment_status: 'Completed',
          payment_details: {
            transactionId: 'TXN_MOCK_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            bankName: 'Mock Bank',
            paymentMode: 'UPI',
            txDate: new Date().toISOString()
          }
        })
        .eq('id', orderId);
    } else {
      await supabase
        .from('orders')
        .update({ payment_status: 'Failed' })
        .eq('id', orderId);

      // Restock items
      for (const item of order.items) {
        const { data: prod } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        await supabase
          .from('products')
          .update({ stock: prod.stock + item.quantity })
          .eq('id', item.product_id);
      }
    }

    const { data: updatedOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    res.json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get logged-in user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ message: 'Error fetching orders', error: error.message });
    }

    // Populate products mapping dynamically for orders list
    const populatedOrders = [];
    for (const order of orders) {
      const itemsPopulated = [];
      for (const item of order.items) {
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.product_id)
          .maybeSingle();

        itemsPopulated.push({
          ...item,
          product
        });
      }
      populatedOrders.push({
        ...order,
        items: itemsPopulated
      });
    }

    res.json(populatedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single order detail
router.get('/:id', auth, async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const itemsPopulated = [];
    for (const item of order.items) {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.product_id)
        .maybeSingle();

      itemsPopulated.push({
        ...item,
        product
      });
    }

    res.json({
      ...order,
      items: itemsPopulated
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (Admin only)
router.put('/:id/status', auth, admin, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    let updates = {};
    if (orderStatus) updates.order_status = orderStatus;
    if (paymentStatus) updates.payment_status = paymentStatus;

    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !order) {
      return res.status(404).json({ message: 'Order not found', error: error?.message });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
