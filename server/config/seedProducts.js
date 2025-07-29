import { db } from './database.js';
import { Product } from '../models/Product.js';
import '../models/index.js';

const products = [
  // Hot Drinks - Using local images from public folder
  { id: 1, name: "Mocha", price: 3, category: "Hot", img: '/images/mocha.png' },
  { id: 2, name: "Americano", price: 2.5, category: "Hot", img: '/images/americano.png' },
  { id: 3, name: "Latte", price: 2.5, category: "Hot", img: '/images/latte.png' },
  { id: 4, name: "Cappuccino", price: 2.5, category: "Hot", img: '/images/cappuccino.png' },
  { id: 5, name: "Espresso", price: 3.5, category: "Hot", img: '/images/espresso.png' },
  { id: 6, name: "Hot Chocolate", price: 2.5, category: "Hot", img: '/images/hot-chocolate.png' },

  // Ice Drinks
  { id: 7, name: "Iced Cappuccino", price: 2.5, category: "Ice", img: '/images/iced-cappuccino.png' },
  { id: 8, name: "Iced Chocolate", price: 2.5, category: "Ice", img: '/images/iced-chocolate.png' },
  { id: 9, name: "Iced Latte", price: 2.5, category: "Ice", img: '/images/iced-latte.png' },
  { id: 10, name: "Iced Americano", price: 2.5, category: "Ice", img: '/images/iced-americano.png' },
  { id: 11, name: "Iced Matcha", price: 3, category: "Ice", img: '/images/iced-matcha.png' },
  { id: 12, name: "Passion Soda", price: 3, category: "Ice", img: '/images/passion-soda.png' },
  { id: 13, name: "Strawberry Soda", price: 4, category: "Ice", img: '/images/strawberry-soda.png' },

  // Frappe
  { id: 14, name: "Matcha Frappe", price: 3.5, category: "Frappe", img: '/images/matcha-frappe.png' },
  { id: 15, name: "Chocolate Frappe", price: 5, category: "Frappe", img: '/images/chocolate-frappe.webp' },
  { id: 16, name: "Strawberry Frappe", price: 4, category: "Frappe", img: '/images/strawberry-frappe.png' },
  { id: 17, name: "Coffee Frappe", price: 2.5, category: "Frappe", img: '/images/coffee-frappe.png' },

  // Bakery
  { id: 18, name: "Carrot Cake", price: 4, category: "Bakery", img: '/images/carrot-cake.png' },
  { id: 19, name: "Croissant", price: 3.5, category: "Bakery", img: '/images/croissant.png' },
  { id: 20, name: "Pretzel", price: 3.5, category: "Bakery", img: '/images/pretzel.png' },
  { id: 21, name: "Tiramisu", price: 4.5, category: "Bakery", img: '/images/tiramisu.png' }
];

export async function seedProducts() {
  try {
    await db.sync({ alter: true });
    console.log('Database tables created successfully');
   
    await Product.bulkCreate(products);
    console.log('Products seeded successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedProducts().then(() => process.exit(0));
}