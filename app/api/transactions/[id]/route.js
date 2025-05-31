import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(req, context) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
    const client = await clientPromise;
    const db = client.db('expense-tracker');
    const transactions = db.collection('transactions');

    const result = await transactions.deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Transaction deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Error deleting transaction' }, { status: 500 });
  }
}

export async function PUT(req, context) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
    const { amount, type, category, description } = await req.json();

    const client = await clientPromise;
    const db = client.db('expense-tracker');
    const transactions = db.collection('transactions');

    const result = await transactions.updateOne(
      { _id: new ObjectId(id), userId: session.user.id },
      {
        $set: {
          amount: parseFloat(amount),
          type,
          category,
          description,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 1) {
      return NextResponse.json({ message: 'Transaction updated successfully' });
    } else {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Error updating transaction' }, { status: 500 });
  }
} 