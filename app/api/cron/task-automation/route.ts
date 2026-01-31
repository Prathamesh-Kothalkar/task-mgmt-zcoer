import { NextResponse } from 'next/server'
import dayjs from "dayjs";

import dbConnect from '@/lib/mongoose'
import { Task } from '@/model/Task'
import sendMail from '@/lib/serviceMail';

export async function GET(req: Request) {
 
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await dbConnect()

    const now = dayjs()
    const tomorrowStart = now.add(1, "day").startOf("day")
    const tomorrowEnd = tomorrowStart.endOf("day")

    
    await Task.updateMany(
      {
        dueDate: { $lt: now.toDate() },
        status: { $nin: ['COMPLETED', 'OVERDUE', 'REJECTED'] }
      },
      { $set: { status: 'OVERDUE' } }
    )

   
    const tasks = await Task.find({
      dueDate: {
        $gte: tomorrowStart.toDate(),
        $lte: tomorrowEnd.toDate()
      },
      reminderSent: false,
      status: { $nin: ["COMPLETED", "REJECTED"] }
    }).populate("assignedTo")

    for (const task of tasks) {
      const staff = task.assignedTo as any
      if (!staff?.email) continue

      await sendMail({
        to: staff.email,
        subject: "Task Due Tomorrow",
        html: `
          <p>Dear ${staff.name},</p>
          <p>This is a reminder that the following task is due tomorrow:</p>
          <p><b>${task.title}</b></p>
          <p>Priority: ${task.priority}</p>
          <br/>
          <p>Please ensure timely completion.</p>
        `
      })

      task.reminderSent = true
      await task.save()
    }

    return NextResponse.json({
      success: true,
      remindersSent: tasks.length
    })

  } catch (error) {
    console.error("CRON ERROR:", error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
