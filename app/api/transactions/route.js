import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import clientPromise from '@/lib/mongodb';

export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || 'month';

    const client = await clientPromise;
    const db = client.db("expense-tracker");
    const transactions = db.collection("transactions");

    let startDate = new Date();
    switch (timeRange) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const userTransactions = await transactions
      .find({
        userId: session.user.id,
        date: { $gte: startDate }
      })
      .sort({ date: -1 })
      .toArray();

    // Map _id to id as string for frontend compatibility
    const mappedTransactions = userTransactions.map(t => ({
      ...t,
      id: t._id.toString(),
    }));

    return NextResponse.json(mappedTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Error fetching transactions' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, type, category, description } = await req.json();

    if (!amount || !type || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("expense-tracker");
    const transactions = db.collection("transactions");

    const transaction = await transactions.insertOne({
      amount: parseFloat(amount),
      type,
      category,
      description,
      date: new Date(),
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json(
      { message: 'Transaction created successfully', transaction },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Error creating transaction' },
      { status: 500 }
    );
  }
} 