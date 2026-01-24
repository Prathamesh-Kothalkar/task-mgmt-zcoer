import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongoose'
import { Task } from '@/model/Task'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'HOD' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const now = new Date()

    const filter = {
      dueDate: { $lt: now },
      status: { $in: ['PENDING', 'IN_PROGRESS'] },
    }

    const update = { $set: { status: 'OVERDUE', updatedAt: now } }

    const result = await Task.updateMany(filter, update)

    return NextResponse.json({ message: 'Overdue check complete', modifiedCount: result.modifiedCount ?? result.nModified ?? 0 }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
