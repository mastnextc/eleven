const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../supabaseClient');
const { auth } = require('../middleware/auth');

// Register customer
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into Supabase
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: email.toLowerCase().endsWith('@fashion.com') ? 'admin' : 'customer',
        addresses: [],
        wishlist: [],
        cart: []
      })
      .select()
      .single();

    if (error || !newUser) {
      return res.status(400).json({ message: 'Failed to create user', error: error?.message });
    }

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET || 'ecommerce_secret_token_123456789', {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Retrieve user details from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'ecommerce_secret_token_123456789', {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, addresses, wishlist, cart')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add address
router.post('/address', auth, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('addresses')
      .eq('id', req.user.id)
      .single();

    const newAddress = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      ...req.body
    };

    const updatedAddresses = [...(user.addresses || []), newAddress];

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ addresses: updatedAddresses })
      .eq('id', req.user.id)
      .select('addresses')
      .single();

    if (error) {
      return res.status(400).json({ message: 'Failed to update addresses', error: error.message });
    }

    res.json(updatedUser.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete address
router.delete('/address/:id', auth, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('addresses')
      .eq('id', req.user.id)
      .single();

    const updatedAddresses = (user.addresses || []).filter(addr => addr.id !== req.params.id);

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ addresses: updatedAddresses })
      .eq('id', req.user.id)
      .select('addresses')
      .single();

    if (error) {
      return res.status(400).json({ message: 'Failed to update addresses', error: error.message });
    }

    res.json(updatedUser.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
