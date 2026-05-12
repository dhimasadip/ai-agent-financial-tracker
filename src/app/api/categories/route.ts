import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq, isNull, or } from 'drizzle-orm';

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
        categories: {
          income: [],
          expense: [],
          all: [],
        },
      });
    }

    // Use authenticated user's ID
    const userId = session.user.id;

    // Get system categories (user_id = NULL) and user's custom categories
    const allCategories = await db.query.categories.findMany({
      where: or(
        isNull(categories.userId),
        eq(categories.userId, userId)
      ),
      orderBy: [categories.type, categories.name],
    });

    // Separate income and expense categories
    const incomeCategories = allCategories.filter(c => c.type === 'income');
    const expenseCategories = allCategories.filter(c => c.type === 'expense');

    return NextResponse.json({
      categories: {
        income: incomeCategories,
        expense: expenseCategories,
        all: allCategories,
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { name, type, color, icon } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type' },
        { status: 400 }
      );
    }

    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid category type' },
        { status: 400 }
      );
    }

    // Use authenticated user's ID
    const userId = session.user.id;

    const newCategory = await db.insert(categories).values({
      userId,
      name,
      type,
      color: color || '#71717a',
      icon: icon || 'circle',
    }).returning() as any;

    return NextResponse.json({
      message: 'Category created',
      category: newCategory[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}