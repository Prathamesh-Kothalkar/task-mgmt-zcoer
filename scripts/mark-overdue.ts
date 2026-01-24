import dbConnect from '@/lib/mongoose'
import { Task } from '@/model/Task'

async function run() {
  try {
    await dbConnect()
    const now = new Date()

    // Mark tasks whose dueDate is in the past and still not completed/rejected/overdue
    const filter = {
      dueDate: { $lt: now },
      status: { $in: ['PENDING', 'IN_PROGRESS'] },
    }

    const update = {
      $set: { status: 'OVERDUE', updatedAt: now },
    }

    const res = await Task.updateMany(filter, update)
    console.log(`Marked ${res.modifiedCount ?? res.nModified ?? 0} tasks as OVERDUE`)
    process.exit(0)
  } catch (err) {
    console.error('Failed to mark overdue tasks', err)
    process.exit(1)
  }
}

run()
