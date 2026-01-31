import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongoose'
import { Staff } from '@/model/Staff'
import { Task } from '@/model/Task'

export async function GET(req: NextRequest, { params }: { params: { empid: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'HOD' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const empid = params.empid
    const staff = await Staff.findOne({ empId: empid, department: session.user.department }).select('-passwordHash -__v')
    if (!staff) {
      return NextResponse.json({ message: 'Staff not found' }, { status: 404 })
    }

    // compute task stats
    const total = await Task.countDocuments({ assignedTo: staff._id })
    const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'REJECTED']
    const byStatus: Record<string, number> = {}
    for (const s of statuses) {
      byStatus[s] = await Task.countDocuments({ assignedTo: staff._id, status: s })
    }

    return NextResponse.json({ staff, stats: { total, byStatus } }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
