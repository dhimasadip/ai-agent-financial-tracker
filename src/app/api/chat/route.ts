import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { auth } from '@/auth';
import { db } from '@/db';
import { transactions, chatHistory } from '@/db/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { anthropic as anthropicConfig } from '@/lib/env';

const anthropic = anthropicConfig.apiKey
  ? new Anthropic({
      apiKey: anthropicConfig.apiKey,
      baseURL: anthropicConfig.baseUrl,
    })
  : null;

interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', response: 'Silakan masuk terlebih dahulu.' },
        { status: 401 }
      );
    }

    // Check if services are configured
    if (!process.env.DATABASE_URL || !anthropic) {
      return NextResponse.json(
        { error: 'Service not configured', response: 'Maaf, layanan belum dikonfigurasi.' },
        { status: 503 }
      );
    }

    const body: ChatRequest = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Use authenticated user's ID
    const userId = session.user.id;

    // Get financial context from database
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get recent transactions for context
    const recentTransactions = await db.query.transactions.findMany({
      where: and(
        eq(transactions.userId, userId),
        gte(transactions.txDate, monthStart.toISOString().split('T')[0])
      ),
      orderBy: [desc(transactions.txDate)],
      limit: 20,
    });

    // Get metrics
    const metrics = await db
      .select({
        totalIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`,
        totalExpenses: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.txDate, monthStart.toISOString().split('T')[0])
        )
      );

    const income = parseFloat(metrics[0]?.totalIncome || '0');
    const expenses = parseFloat(metrics[0]?.totalExpenses || '0');
    const netSavings = income - expenses;

    // Build financial context
    const financialContext = `
DATA KEUANGAN BULAN INI (dalam Rupiah Indonesia):

Total Income: Rp${income.toLocaleString('id-ID')}
Total Pengeluaran: Rp${expenses.toLocaleString('id-ID')}
Tabungan: Rp${netSavings.toLocaleString('id-ID')}

TRANSAKSI TERAKHIR:
${recentTransactions.length > 0
        ? recentTransactions.map(t =>
          `- ${t.type === 'income' ? '💰' : '💸'} ${t.description}: Rp${parseFloat(t.amount).toLocaleString('id-ID')} (${t.category}) - ${t.txDate}`
        ).join('\n')
        : '- Belum ada transaksi bulan ini'
      }

REKOMENDASI UMUM:
1. Ikuti aturan 50/30/20: 50% kebutuhan, 30% keinginan, 20% tabungan
2. Catat setiap pengeluaran untuk awareness
3. Kurangi pengeluaran discretionary jika tabungan < 20%
4. Prioritaskan emergency fund 3-6 bulan pengeluaran
`;

    // Build system prompt
    const systemPrompt = `Kamu adalah Finn, asisten keuangan AI yang helpful dan friendly. Kamu berbicara dalam Bahasa Indonesia.

PERSONALITAS:
- Ramah, supportive, dan motivating
- Memberikan saran praktis yang bisa langsung dilakukan
- Menggunakan bahasa casual tapi tetap professional
- Sesekali pakai emoji untuk make it engaging

ATURAN:
1. Selalu beradaptasi dengan data keuangan user yang diberikan
2. Jika tidak ada data, sampaikan dengan friendly dan minta user untuk tambah transaksi
3. Berikan angka spesifik dari data mereka, jangan generik
4. Saran harus actionable dan realistic
5. Bahasa Indonesia dengan sedikit campuran English untuk istilah keuangan yang umum

FINANCIAL CONTEXT:
${financialContext}

Kamu sedang ngobrol dengan user. response kamu akan langsung ke point, max 2-3 kalimat, dan selalu kasih actionable insight berdasarkan data mereka.`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const finnResponse = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Maaf, ada masalah teknis. Coba lagi ya!';

    // Save chat to history
    await db.insert(chatHistory).values({
      userId,
      role: 'user',
      content: message,
    });

    await db.insert(chatHistory).values({
      userId,
      role: 'finn',
      content: finnResponse,
    });

    return NextResponse.json({
      response: finnResponse,
      context: {
        totalIncome: income,
        totalExpenses: expenses,
        netSavings,
        recentTransactions: recentTransactions.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

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

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ history: [] });
    }

    // Use authenticated user's ID
    const userId = session.user.id;

    // Get last 20 chat messages
    const history = await db.query.chatHistory.findMany({
      where: eq(chatHistory.userId, userId),
      orderBy: [desc(chatHistory.createdAt)],
      limit: 20,
    });

    // Reverse to get chronological order
    history.reverse();

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}