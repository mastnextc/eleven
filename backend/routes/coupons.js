const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { auth, admin } = require('../middleware/auth');

// Get active coupons
router.get('/', async (req, res) => {
  try {
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .gt('expiry_date', new Date().toISOString());

    if (error) {
      return res.status(400).json({ message: 'Error fetching coupons', error: error.message });
    }

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Validate coupon
router.post('/validate', async (req, res) => {
  try {
    const { code, amount } = req.body;
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !coupon) {
      return res.status(404).json({ message: 'Coupon not found or inactive' });
    }

    if (new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (amount < coupon.min_purchase_amount) {
      return res.status(400).json({ message: `Minimum purchase of ₹${coupon.min_purchase_amount} required` });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin create coupon
router.post('/admin', auth, admin, async (req, res) => {
  try {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert({
        code: req.body.code.toUpperCase(),
        discount_type: req.body.discountType,
        discount_value: Number(req.body.discountValue),
        min_purchase_amount: Number(req.body.minPurchaseAmount || 0),
        expiry_date: req.body.expiryDate,
        is_active: req.body.isActive !== undefined ? req.body.isActive : true
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: 'Failed to create coupon', error: error.message });
    }

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin delete coupon
router.delete('/admin/:id', auth, admin, async (req, res) => {
  try {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error || !coupon) {
      return res.status(404).json({ message: 'Coupon not found', error: error?.message });
    }

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
