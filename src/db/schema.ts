import { pgTable, uuid, text, numeric, date, timestamp, char, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// User table (singular for NextAuth DrizzleAdapter)
export const user = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { withTimezone: true, mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
});

// Sessions table
export const sessions = pgTable('session', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: text('sessionToken').notNull().unique(),
  userId: uuid('userId').notNull().references(() => user.id),
  expires: timestamp('expires', { withTimezone: true, mode: 'date' }).notNull(),
});

// Verification tokens table
export const verificationTokens = pgTable('verificationToken', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires', { withTimezone: true, mode: 'date' }).notNull(),
});

// Categories table
export const categories = pgTable('category', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').references(() => user.id), // NULL = system default
  name: text('name').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  color: char('color').notNull().default('#71717a'),
  icon: text('icon').default('circle'),
}, (table) => ({
  userTypeIdx: index('idxCategoryUserType').on(table.userId, table.type),
}));

// Transactions table
export const transactions = pgTable('transaction', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').notNull().references(() => user.id),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  category: text('category').notNull(),
  txDate: date('txDate').notNull(),
  note: text('note'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userDateIdx: index('idxTransactionUserDate').on(table.userId, table.txDate),
  userCategoryIdx: index('idxTransactionUserCategory').on(table.userId, table.category),
  userTypeIdx: index('idxTransactionUserType').on(table.userId, table.type),
}));

// Budgets table
export const budgets = pgTable('budget', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').notNull().references(() => user.id),
  category: text('category').notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  period: text('period', { enum: ['weekly', 'monthly', 'yearly'] }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userCategoryPeriodIdx: index('idxBudgetUserCategoryPeriod').on(table.userId, table.category, table.period),
}));

// Chat history table
export const chatHistory = pgTable('chatHistory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').notNull().references(() => user.id),
  role: text('role', { enum: ['user', 'finn'] }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userDateIdx: index('idxChatHistoryUserDate').on(table.userId, table.createdAt),
}));

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(sessions),
  transactions: many(transactions),
  categories: many(categories),
  budgets: many(budgets),
  chatHistory: many(chatHistory),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(user, {
    fields: [sessions.userId],
    references: [user.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(user, {
    fields: [transactions.userId],
    references: [user.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one }) => ({
  user: one(user, {
    fields: [categories.userId],
    references: [user.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(user, {
    fields: [budgets.userId],
    references: [user.id],
  }),
}));

export const chatHistoryRelations = relations(chatHistory, ({ one }) => ({
  user: one(user, {
    fields: [chatHistory.userId],
    references: [user.id],
  }),
}));
