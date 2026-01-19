// models/Task.ts
import mongoose, { Document, Model, Schema } from 'mongoose'

export interface ITask extends Document {
  title: string
  description: string
  department: mongoose.Types.ObjectId
  assignedTo: mongoose.Types.ObjectId
  assignedBy: mongoose.Types.ObjectId
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'REJECTED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: Date
  createdAt: Date
  updatedAt: Date
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },

    description: { type: String, required: true },

    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: true
    },

    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Hod',
      required: true
    },

    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'REJECTED'],
      default: 'PENDING'
    },

    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },

    dueDate: { type: Date, required: true }
  },
  { timestamps: true }
)

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema)
