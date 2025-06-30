import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { TemplateNoteId } from '@/constants';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    
    // 验证ID格式
    let noteId;
    try {
      noteId = new ObjectId(params.id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid note ID format' },
        { status: 400 }
      );
    }
    
    const note = await db
      .collection('notes')
      .findOne({ _id: noteId });

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // 从请求头中获取用户状态
    const authHeader = request.headers.get('authorization');
    const isAuthenticated = !!authHeader;

    // 检查访问权限
    if (!isAuthenticated && note.visibility !== 'public' && params.id !== TemplateNoteId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'success',
      data: note
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const updates = await request.json();

    // 验证ID格式
    let noteId;
    try {
      noteId = new ObjectId(params.id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid note ID format' },
        { status: 400 }
      );
    }

    // Remove any attempts to update _id
    delete updates._id;

    const now = new Date();
    const result = await db.collection('notes').findOneAndUpdate(
      { _id: noteId },
      {
        $set: {
          ...updates,
          updatedAt: now,
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'success',
      data: result
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();

    // 验证ID格式
    let noteId;
    try {
      noteId = new ObjectId(params.id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid note ID format' },
        { status: 400 }
      );
    }

    const result = await db
      .collection('notes')
      .deleteOne({ _id: noteId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}