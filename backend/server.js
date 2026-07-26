const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Key mapping middleware to ensure backward compatibility with frontend code expecting '_id' instead of 'id'
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    const mapKeys = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) {
        return obj.map(mapKeys);
      }
      const newObj = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          newObj[key] = mapKeys(obj[key]);
        }
      }
      // If a database record has 'id' but no '_id', copy it over
      if (newObj.hasOwnProperty('id') && !newObj.hasOwnProperty('_id')) {
        newObj._id = newObj.id;
      }
      return newObj;
    };
    const mappedBody = mapKeys(body);
    return originalJson.call(this, mappedBody);
  };
  next();
});

// Print Supabase loading notice
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mock.supabase.co';
console.log(`Supabase connection client initialized for url: ${SUPABASE_URL}`);

// Routes configuration
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/admin', require('./routes/admin'));

// Base route
app.get('/', (req, res) => {
  res.send("Women's Fashion E-commerce Supabase API running successfully");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
