import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { user, categories, transactions, chatHistory } from './schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

async function seed() {
  console.log('Starting seed...');

  try {
    // Create demo user
    console.log('Creating demo user...');
    await db.insert(user).values({
      id: DEMO_USER_ID,
      email: 'demo@finn.app',
      name: 'Demo User',
    }).onConflictDoNothing();

    // Create system categories
    console.log('Creating categories...');
    const systemCategories = [
      { name: 'Salary', type: 'income' as const, color: '#22c55e', icon: 'wallet' },
      { name: 'Freelance', type: 'income' as const, color: '#10b981', icon: 'briefcase' },
      { name: 'Investment', type: 'income' as const, color: '#06b6d4', icon: 'trending-up' },
      { name: 'Gift', type: 'income' as const, color: '#f472b6', icon: 'gift' },
      { name: 'Food & Dining', type: 'expense' as const, color: '#f59e0b', icon: 'utensils' },
      { name: 'Transport', type: 'expense' as const, color: '#3b82f6', icon: 'car' },
      { name: 'Health', type: 'expense' as const, color: '#ec4899', icon: 'heart' },
      { name: 'Entertainment', type: 'expense' as const, color: '#8b5cf6', icon: 'film' },
      { name: 'Utilities', type: 'expense' as const, color: '#6366f1', icon: 'zap' },
      { name: 'Shopping', type: 'expense' as const, color: '#f43f5e', icon: 'shopping-bag' },
      { name: 'Education', type: 'expense' as const, color: '#14b8a6', icon: 'book' },
      { name: 'Other', type: 'expense' as const, color: '#71717a', icon: 'circle' },
    ];

    for (const cat of systemCategories) {
      await db.insert(categories).values({
        userId: null, // System category
        ...cat,
      }).onConflictDoNothing();
    }

    // Create demo transactions
    console.log('Creating demo transactions...');
    const now = new Date();
    const demoTransactions: Array<{
      type: 'income' | 'expense';
      description: string;
      amount: string;
      category: string;
      daysAgo: number;
    }> = [
      { type: 'income', description: 'Gaji Bulanan', amount: '15000000', category: 'Salary', daysAgo: 10 },
      { type: 'income', description: 'Proyek Freelance', amount: '3000000', category: 'Freelance', daysAgo: 7 },
      { type: 'expense', description: 'Belanja Groceries', amount: '500000', category: 'Food & Dining', daysAgo: 9 },
      { type: 'expense', description: 'Bensin Motor', amount: '200000', category: 'Transport', daysAgo: 8 },
      { type: 'expense', description: 'Langganan Netflix', amount: '259000', category: 'Entertainment', daysAgo: 6 },
      { type: 'expense', description: 'Tagihan Listrik', amount: '500000', category: 'Utilities', daysAgo: 5 },
      { type: 'expense', description: 'Membership Gym', amount: '300000', category: 'Health', daysAgo: 4 },
      { type: 'expense', description: 'Makan di Restoran', amount: '150000', category: 'Food & Dining', daysAgo: 3 },
      { type: 'expense', description: 'Belanja Online', amount: '500000', category: 'Shopping', daysAgo: 2 },
      { type: 'expense', description: 'Grab ke Kantor', amount: '85000', category: 'Transport', daysAgo: 1 },
      { type: 'expense', description: 'Makan Siang', amount: '75000', category: 'Food & Dining', daysAgo: 1 },
      { type: 'income', description: 'Dividen Saham', amount: '500000', category: 'Investment', daysAgo: 3 },
    ];

    for (const tx of demoTransactions) {
      const txDate = new Date(now);
      txDate.setDate(txDate.getDate() - tx.daysAgo);

      await db.insert(transactions).values({
        userId: DEMO_USER_ID,
        type: tx.type,
        description: tx.description,
        amount: tx.amount,
        category: tx.category,
        txDate: txDate.toISOString().split('T')[0],
      });
    }

    // Create welcome chat message
    console.log('Creating welcome message...');
    await db.insert(chatHistory).values({
      userId: DEMO_USER_ID,
      role: 'finn',
      content: 'Halo! Aku Finn, asisten keuanganmu. Aku bisa bantu kamu melacak pengeluaran, menganalisis pola spending, dan memberikan tips keuangan yang dipersonalisasi. Ada yang bisa aku bantu?',
    });

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  }
}

seed();