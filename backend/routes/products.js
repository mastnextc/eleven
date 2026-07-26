const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { auth, admin } = require('../middleware/auth');

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, subCategory, minPrice, maxPrice, size, color, search, tag } = req.query;
    let dbQuery = supabase.from('products').select('*');

    if (category) dbQuery = dbQuery.eq('category', category);
    if (subCategory) dbQuery = dbQuery.eq('sub_category', subCategory);
    
    if (minPrice) dbQuery = dbQuery.gte('price', Number(minPrice));
    if (maxPrice) dbQuery = dbQuery.lte('price', Number(maxPrice));
    
    if (search) {
      dbQuery = dbQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (size) {
      dbQuery = dbQuery.contains('sizes', [size]);
    }
    
    if (color) {
      dbQuery = dbQuery.contains('colors', [color]);
    }

    if (tag) {
      if (tag === 'newArrival') dbQuery = dbQuery.eq('is_new_arrival', true);
      if (tag === 'bestSeller') dbQuery = dbQuery.eq('is_best_seller', true);
      if (tag === 'sale') dbQuery = dbQuery.eq('is_sale', true);
    }

    const { data: products, error } = await dbQuery.order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ message: 'Error fetching products', error: error.message });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single product details
router.get('/:id', async (req, res) => {
  try {
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (prodErr || !product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Fetch related reviews
    const { data: reviews, error: revErr } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false });

    res.json({ product, reviews: reviews || [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create product (Admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        discount_price: req.body.discountPrice || null,
        category: req.body.category,
        sub_category: req.body.subCategory || null,
        brand: req.body.brand || null,
        images: req.body.images || [],
        sizes: req.body.sizes || [],
        colors: req.body.colors || [],
        stock: req.body.stock || 0,
        is_new_arrival: req.body.isNewArrival || false,
        is_best_seller: req.body.isBestSeller || false,
        is_sale: req.body.isSale || false
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: 'Failed to create product', error: error.message });
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product (Admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .update({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        discount_price: req.body.discountPrice,
        category: req.body.category,
        sub_category: req.body.subCategory,
        brand: req.body.brand,
        images: req.body.images,
        sizes: req.body.sizes,
        colors: req.body.colors,
        stock: req.body.stock,
        is_new_arrival: req.body.isNewArrival,
        is_best_seller: req.body.isBestSeller,
        is_sale: req.body.isSale
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !product) {
      return res.status(404).json({ message: 'Product not found', error: error?.message });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product (Admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error || !product) {
      return res.status(404).json({ message: 'Product not found', error: error?.message });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add review to a product
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Insert review
    const { data: review, error: revErr } = await supabase
      .from('reviews')
      .insert({
        product_id: req.params.id,
        user_id: req.user.id,
        user_name: req.user.name,
        rating: Number(rating),
        comment
      })
      .select()
      .single();

    if (revErr) {
      return res.status(400).json({ message: 'Failed to create review', error: revErr.message });
    }

    // Fetch all reviews to recalculate stats
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', req.params.id);

    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    // Update Product statistics
    const { data: updatedProduct } = await supabase
      .from('products')
      .update({
        ratings: parseFloat(avgRating.toFixed(1)),
        reviews_count: reviews.length
      })
      .eq('id', req.params.id)
      .select()
      .single();

    res.status(201).json({ review, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
