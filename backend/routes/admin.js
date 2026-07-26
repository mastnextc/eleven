const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { auth, admin } = require('../middleware/auth');

router.get('/dashboard', auth, admin, async (req, res) => {
  try {
    // 1. Get total count of orders
    const { count: totalOrders, error: orderCountErr } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // 2. Get total count of customers
    const { count: totalCustomers, error: userCountErr } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    // 3. Get total count of products
    const { count: totalProducts, error: prodCountErr } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // 4. Calculate total revenue sales
    const { data: completedOrders, error: salesErr } = await supabase
      .from('orders')
      .select('final_amount')
      .eq('payment_status', 'Completed');

    const totalSales = (completedOrders || []).reduce((acc, order) => acc + Number(order.final_amount), 0);

    // 5. Fetch latest orders with user info
    const { data: latestOrders, error: latestErr } = await supabase
      .from('orders')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false })
      .limit(5);

    // 6. Get category distribution
    const { data: categoryProducts, error: catErr } = await supabase
      .from('products')
      .select('category');

    const distributionMap = {};
    (categoryProducts || []).forEach(p => {
      distributionMap[p.category] = (distributionMap[p.category] || 0) + 1;
    });
    
    const categoryDistribution = Object.keys(distributionMap).map(key => ({
      _id: key,
      count: distributionMap[key]
    }));

    res.json({
      metrics: {
        totalOrders: totalOrders || 0,
        totalCustomers: totalCustomers || 0,
        totalProducts: totalProducts || 0,
        totalSales: totalSales || 0
      },
      latestOrders: latestOrders || [],
      categoryDistribution
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
