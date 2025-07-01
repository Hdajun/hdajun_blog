import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { NoteVisibility } from '@/types/note';

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    
    const notes = await db
      .collection('notes')
      .find({})
      .sort({isTop: -1, updatedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      message: 'success',
      data: notes
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const { title = '', content = '' } = await request.json();

    const now = new Date();
    const result = await db.collection('notes').insertOne({
      title,
      content,
      visibility: 'private' as NoteVisibility,
      createdAt: now,
      updatedAt: now,
    });

    const newNote = await db
      .collection('notes')
      .findOne({ _id: result.insertedId });

    return NextResponse.json({
      success: true,
      message: 'success',
      data: newNote
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create note',
        data: null
      },
      { status: 500 }
    );
  }
}