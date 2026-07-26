-- Supabase PostgreSQL Schema for ELEVEN Women's Fashion

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Hashed passwords
  role TEXT NOT NULL DEFAULT 'customer',
  addresses JSONB DEFAULT '[]'::jsonb,
  wishlist JSONB DEFAULT '[]'::jsonb,
  cart JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  discount_price NUMERIC,
  category TEXT NOT NULL,
  sub_category TEXT,
  brand TEXT,
  images TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  is_new_arrival BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  is_sale BOOLEAN DEFAULT false,
  ratings NUMERIC DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC NOT NULL,
  min_purchase_amount NUMERIC DEFAULT 0,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  items JSONB NOT NULL, -- Array of items: [{product_id, quantity, price, size, color}]
  total_amount NUMERIC NOT NULL,
  discount_amount NUMERIC DEFAULT 0,
  final_amount NUMERIC NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('COD', 'Paytm')),
  payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
  payment_details JSONB DEFAULT '{}'::jsonb,
  order_status TEXT NOT NULL DEFAULT 'Placed' CHECK (order_status IN ('Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  coupon_applied TEXT,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Insert initial seed products
INSERT INTO products (name, description, price, discount_price, category, sub_category, brand, images, sizes, colors, stock, is_new_arrival, is_best_seller, is_sale, ratings, reviews_count)
VALUES 
('Floral Print A-Line Midi Dress', 'Elegant floral print a-line midi dress with ruffle details. Features a V-neckline and puff sleeves. Perfect for summer outings and casual meetups.', 1899, 1299, 'Dresses', 'Midi', 'Zara', ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=60', 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&auto=format&fit=crop&q=60'], ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Pink', 'Blue', 'White'], 25, true, false, true, 4.5, 12),
('Classic Silk Anarkali Kurti Suit Set', 'Stunning ethnic silk Anarkali kurti paired with matching dupatta and pants. Exquisite gold embroidery around the neckline, perfect for festive occasions and weddings.', 4999, 3499, 'Ethnic Wear', 'Kurti Sets', 'Biba', ARRAY['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=60', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=60'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Maroon', 'Emerald Green', 'Mustard'], 15, false, true, true, 4.8, 35),
('Embellished Georgette Party Gown', 'Premium designer georgette gown featuring sequins and delicate beadwork. Elegant floor-length drape with back zip closure and soft inner lining.', 5999, 4299, 'Dresses', 'Gowns', 'W', ARRAY['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=60', 'https://images.unsplash.com/photo-1518049368264-ee3cbd155f30?w=800&auto=format&fit=crop&q=60'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Midnight Blue', 'Rose Gold', 'Emerald'], 10, true, true, false, 4.9, 8),
('Slim Fit Cotton Casual Top', 'Breathable and comfortable pure cotton casual top with elegant sleeve details. Fits nicely and matches perfectly with denim jeans or trousers.', 1199, 699, 'Western Wear', 'Tops', 'Zara', ARRAY['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=60', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=60'], ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Sky Blue', 'Yellow', 'Olive Green'], 40, true, false, true, 4.2, 22),
('Cotton Block Print Kurti', 'Jaipur hand-block printed cotton kurti. High collar, straight cut, button details, 3/4th sleeves. Ideal for daily office wear and casual outings.', 1599, 999, 'Ethnic Wear', 'Kurtis', 'Fabindia', ARRAY['https://images.unsplash.com/photo-1608748010899-18f300247112?w=800&auto=format&fit=crop&q=60'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Indigo Blue', 'Turmeric', 'Rust Red'], 30, false, true, true, 4.6, 48);

-- 7. Insert initial seed coupons
INSERT INTO coupons (code, discount_type, discount_value, min_purchase_amount, expiry_date, is_active)
VALUES 
('FASHION20', 'percentage', 20, 999, '2027-12-31 23:59:59+00', true),
('FLAT500', 'flat', 500, 2499, '2027-12-31 23:59:59+00', true);
