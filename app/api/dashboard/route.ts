import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongoose'
import { Task } from '@/model/Task'
import { Staff } from '@/model/Staff'
import { Department } from '@/model/Department'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'HOD') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const deptId = session.user.department

    const [department, totalTasks, completedTask, pendingTask, inProgressTask, overdueTask, totalStaff, activeStaff, inactiveStaff] = await Promise.all([
      Department.findById(deptId).select('name code').lean(),
      Task.countDocuments({ department: deptId }),
      Task.countDocuments({ department: deptId, status: 'COMPLETED' }),
      Task.countDocuments({ department: deptId, status: 'PENDING' }),
      Task.countDocuments({ department: deptId, status: 'IN_PROGRESS' }),
      Task.countDocuments({ department: deptId, status: 'OVERDUE' }),
      Staff.countDocuments({ department: deptId }),
      Staff.countDocuments({ department: deptId, isActive: true }),
      Staff.countDocuments({ department: deptId, isActive: false }),
    ])

    // Task distribution per staff (top performers + counts)
    const distribution = await Task.aggregate([
      { $match: { department: new (require('mongoose').Types.ObjectId)(deptId) } },
      { $group: { _id: '$assignedTo', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } }, overdue: { $sum: { $cond: [{ $eq: ['$status', 'OVERDUE'] }, 1, 0] } } } },
      { $lookup: { from: 'staffs', localField: '_id', foreignField: '_id', as: 'staff' } },
      { $unwind: { path: '$staff', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, staffId: '$_id', name: '$staff.name', empId: '$staff.empId', total: 1, completed: 1, overdue: 1 } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ])

    // Department performance metrics
    const efficiency = totalTasks > 0 ? Math.round((completedTask / totalTasks) * 100) : 0
    const overdueRate = totalTasks > 0 ? Math.round((overdueTask / totalTasks) * 100) : 0

    return NextResponse.json(
      {
        department: department || null,
        tasks: {
          total: totalTasks,
          completed: completedTask,
          pending: pendingTask,
          inProgress: inProgressTask,
          overdue: overdueTask,
        },
        staff: {
          total: totalStaff,
          active: activeStaff,
          inactive: inactiveStaff,
        },
        distribution,
        performance: {
          efficiency, // completed / total (%)
          overdueRate,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
