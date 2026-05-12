import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        period: 'month',
        metrics: { totalIncome: 0, totalExpenses: 0, netSavings: 0, savingsRate: 0, transactionCount: 0 },
        categoryBreakdown: [],
        incomeBreakdown: [],
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month';

    // Use authenticated user's ID
    const userId = session.user.id;

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Get metrics using aggregation
    const metrics = await db
      .select({
        totalIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`,
        totalExpenses: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`,
        transactionCount: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.txDate, startDate.toISOString().split('T')[0])
        )
      );

    const income = parseFloat(metrics[0]?.totalIncome || '0');
    const expenses = parseFloat(metrics[0]?.totalExpenses || '0');
    const netSavings = income - expenses;
    const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;

    // Get category breakdown for expenses
    const categoryBreakdown = await db
      .select({
        category: transactions.category,
        total: sql<string>`SUM(${transactions.amount}::numeric)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'expense'),
          gte(transactions.txDate, startDate.toISOString().split('T')[0])
        )
      )
      .groupBy(transactions.category)
      .orderBy(sql`SUM(${transactions.amount}::numeric) DESC`);

    // Get income by category
    const incomeBreakdown = await db
      .select({
        category: transactions.category,
        total: sql<string>`SUM(${transactions.amount}::numeric)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'income'),
          gte(transactions.txDate, startDate.toISOString().split('T')[0])
        )
      )
      .groupBy(transactions.category)
      .orderBy(sql`SUM(${transactions.amount}::numeric) DESC`);

    return NextResponse.json({
      period,
      metrics: {
        totalIncome: income,
        totalExpenses: expenses,
        netSavings,
        savingsRate: Math.round(savingsRate * 100) / 100,
        transactionCount: metrics[0]?.transactionCount || 0,
      },
      categoryBreakdown: categoryBreakdown.map(c => ({
        category: c.category,
        amount: parseFloat(c.total),
      })),
      incomeBreakdown: incomeBreakdown.map(c => ({
        category: c.category,
        amount: parseFloat(c.total),
      })),
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}