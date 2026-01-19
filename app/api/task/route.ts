// --------------------
// File path: app/api/task/route.ts
// author: Prathamesh Kothalkar
// --------------------

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongoose'
import sendMail from '@/lib/serviceMail'
import { Task } from '@/model/Task'
import { Staff } from '@/model/Staff'

// --------------------
// Constants
// --------------------
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const
const STATUSES = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'OVERDUE',
  'REJECTED',
] as const

type Priority = (typeof PRIORITIES)[number]
type Status = (typeof STATUSES)[number]

// --------------------
// Types
// --------------------
type TaskPayload = {
  id?: string
  title: string
  description: string
  department: string
  assignedTo: string
  dueDate: string
  priority?: Priority
  status?: Status
}

// --------------------
// Validation
// --------------------
function validatePayload(body: any, isUpdate = false): string[] {
  const errors: string[] = []

  if (!body) return ['Missing request body']
  if (!isUpdate && !body.title) errors.push('title is required')
  if (!isUpdate && !body.description) errors.push('description is required')
  if (!body.department) errors.push('department is required')
  if (!body.assignedTo) errors.push('assignedTo is required')
  if (!body.dueDate || isNaN(Date.parse(body.dueDate)))
    errors.push('valid dueDate is required')

  if (body.priority && !PRIORITIES.includes(body.priority))
    errors.push('Invalid priority')

  if (body.status && !STATUSES.includes(body.status))
    errors.push('Invalid status')

  return errors
}

// =====================================================
// POST → Create Task (HOD only)
// =====================================================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'HOD') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body: TaskPayload = await req.json()
    const errors = validatePayload(body)
    if (errors.length) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    if (body.department !== session.user.department) {
      return NextResponse.json(
        { message: 'Cannot create task for other department' },
        { status: 403 }
      )
    }

    await dbConnect()

    const assignee = await Staff.findById(body.assignedTo)
    if (!assignee) {
      return NextResponse.json(
        { message: 'Assigned staff not found' },
        { status: 404 }
      )
    }

    if (assignee.department.toString() !== session.user.department) {
      return NextResponse.json(
        { message: 'Assignee is not in your department' },
        { status: 403 }
      )
    }

    const task = await Task.create({
      title: body.title,
      description: body.description,
      department: body.department,
      assignedTo: body.assignedTo,
      assignedBy: session.user.id,
      dueDate: new Date(body.dueDate),
      priority: body.priority ?? 'MEDIUM',
      status: 'PENDING',
    })

    // Email notification (non-blocking)
    try {
      await sendMail({
        from: `College Task System <${process.env.SMTP_USER}>`,
        to: assignee.email,
        subject: `New Task Assigned: ${task.title}`,
        html: `
          <h3>New Task Assigned</h3>
          <p><b>Title:</b> ${task.title}</p>
          <p><b>Due:</b> ${task.dueDate.toUTCString()}</p>
          <p><b>Priority:</b> ${task.priority}</p>
        `,
      })
    } catch (err) {
      console.error('Email failed', err)
    }

    return NextResponse.json(
      { message: 'Task created successfully', task },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST task error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// =====================================================
// PUT → Update Task (HOD only)
// =====================================================
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'HOD') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body: TaskPayload = await req.json()
    if (!body.id) {
      return NextResponse.json(
        { message: 'Task id is required' },
        { status: 400 }
      )
    }

    const errors = validatePayload(body, true)
    if (errors.length) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    await dbConnect()

    const task = await Task.findById(body.id)
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    if (task.department.toString() !== session.user.department) {
      return NextResponse.json(
        { message: 'Cannot update task from another department' },
        { status: 403 }
      )
    }

    // Ownership check
    if (task.assignedBy.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Only task creator can update it' },
        { status: 403 }
      )
    }

    task.title = body.title ?? task.title
    task.description = body.description ?? task.description
    task.assignedTo = body.assignedTo as any
    task.dueDate = new Date(body.dueDate)
    if (body.priority) task.priority = body.priority
    if (body.status) task.status = body.status

    await task.save()

    const assignee = await Staff.findById(task.assignedTo)

    if (assignee) {
      try {
        await sendMail({
          from: `College Task System <${process.env.SMTP_USER}>`,
          to: assignee.email,
          subject: `Task Updated: ${task.title}`,
          html: `
            <h3>Task Updated</h3>
            <p><b>Status:</b> ${task.status}</p>
            <p><b>Due:</b> ${task.dueDate.toUTCString()}</p>
          `,
        })
      } catch (err) {
        console.error('Email failed', err)
      }
    }

    return NextResponse.json(
      { message: 'Task updated successfully', task },
      { status: 200 }
    )
  } catch (error) {
    console.error('PUT task error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// =====================================================
// GET → Fetch Tasks (HOD / STAFF)
// =====================================================
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['HOD', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const query: any = {
      department: session.user.department,
    }

    if (session.user.role === 'STAFF') {
      query.assignedTo = session.user.id
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email empid')
      .populate('assignedBy', 'name email empid')
      .sort({ createdAt: -1 })

    return NextResponse.json({ tasks }, { status: 200 })
  } catch (error) {
    console.error('GET task error', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
