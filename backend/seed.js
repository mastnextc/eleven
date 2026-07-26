const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const User = require('./models/User');

dotenv.config();

const sampleProducts = [
  {
    name: "Floral Print A-Line Midi Dress",
    description: "Elegant floral print a-line midi dress with ruffle details. Features a V-neckline and puff sleeves. Perfect for summer outings and casual meetups.",
    price: 1899,
    discountPrice: 1299,
    category: "Dresses",
    subCategory: "Midi",
    brand: "Zara",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&auto=format&fit=crop&q=60"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Pink", "Blue", "White"],
    stock: 25,
    isNewArrival: true,
    isBestSeller: false,
    isSale: true,
    ratings: 4.5,
    reviewsCount: 12
  },
  {
    name: "Classic Silk Anarkali Kurti Suit Set",
    description: "Stunning ethnic silk Anarkali kurti paired with matching dupatta and pants. Exquisite gold embroidery around the neckline, perfect for festive occasions and weddings.",
    price: 4999,
    discountPrice: 3499,
    category: "Ethnic Wear",
    subCategory: "Kurti Sets",
    brand: "Biba",
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=60"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Maroon", "Emerald Green", "Mustard"],
    stock: 15,
    isNewArrival: false,
    isBestSeller: true,
    isSale: true,
    ratings: 4.8,
    reviewsCount: 35
  },
  {
    name: "Embellished Georgette Party Gown",
    description: "Premium designer georgette gown featuring sequins and delicate beadwork. Elegant floor-length drape with back zip closure and soft inner lining.",
    price: 5999,
    discountPrice: 4299,
    category: "Dresses",
    subCategory: "Gowns",
    brand: "W",
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1518049368264-ee3cbd155f30?w=800&auto=format&fit=crop&q=60"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Midnight Blue", "Rose Gold", "Emerald"],
    stock: 10,
    isNewArrival: true,
    isBestSeller: true,
    isSale: false,
    ratings: 4.9,
    reviewsCount: 8
  },
  {
    name: "Slim Fit Cotton Casual Top",
    description: "Breathable and comfortable pure cotton casual top with elegant sleeve details. Fits nicely and matches perfectly with denim jeans or trousers.",
    price: 1199,
    discountPrice: 699,
    category: "Western Wear",
    subCategory: "Tops",
    brand: "Zara",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=60"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Sky Blue", "Yellow", "Olive Green"],
    stock: 40,
    isNewArrival: true,
    isBestSeller: false,
    isSale: true,
    ratings: 4.2,
    reviewsCount: 22
  },
  {
    name: "Cotton Block Print Kurti",
    description: "Jaipur hand-block printed cotton kurti. High collar, straight cut, button details, 3/4th sleeves. Ideal for daily office wear and casual outings.",
    price: 1599,
    discountPrice: 999,
    category: "Ethnic Wear",
    subCategory: "Kurtis",
    brand: "Fabindia",
    images: [
      "https://images.unsplash.com/photo-1608748010899-18f300247112?w=800&auto=format&fit=crop&q=60"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Indigo Blue", "Turmeric", "Rust Red"],
    stock: 30,
    isNewArrival: false,
    isBestSeller: true,
    isSale: true,
    ratings: 4.6,
    reviewsCount: 48
  }
];

const sampleCoupons = [
  {
    code: "FASHION20",
    discountType: "percentage",
    discountValue: 20,
    minPurchaseAmount: 999,
    expiryDate: new Date('2027-12-31'),
    isActive: true
  },
  {
    code: "FLAT500",
    discountType: "flat",
    discountValue: 500,
    minPurchaseAmount: 2499,
    expiryDate: new Date('2027-12-31'),
    isActive: true
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/womens-fashion');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await User.deleteMany({ email: { $in: ['admin@fashion.com', 'customer@fashion.com'] } });

    // Seed Products
    await Product.insertMany(sampleProducts);
    console.log('Sample products seeded successfully!');

    // Seed Coupons
    await Coupon.insertMany(sampleCoupons);
    console.log('Sample coupons seeded successfully!');

    // Seed Admin and Customer accounts
    const adminUser = new User({
      name: "Admin User",
      email: "admin@fashion.com",
      password: "adminpassword", // Will be hashed automatically by UserSchema post hooks
      role: "admin"
    });
    await adminUser.save();

    const customerUser = new User({
      name: "Radhika Patel",
      email: "customer@fashion.com",
      password: "customerpassword", // Will be hashed automatically
      role: "customer"
    });
    await customerUser.save();

    console.log('Admin user (admin@fashion.com / adminpassword) and Customer user (customer@fashion.com / customerpassword) seeded successfully!');
    
    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
