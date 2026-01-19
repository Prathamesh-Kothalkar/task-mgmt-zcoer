// models/Notification.ts
import mongoose, { Document, Model, Schema } from 'mongoose'

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  userRole: 'HOD' | 'STAFF' | 'PRINCIPAL'
  title: string
  message: string
  type: 'TASK_ASSIGNED' | 'STATUS_UPDATE' | 'OVERDUE' | 'GENERAL' | 'REJECTED'
  isRead: boolean
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },

    userRole: {
      type: String,
      enum: ['HOD', 'STAFF', 'PRINCIPAL'],
      required: true
    },

    title: { type: String, required: true },

    message: { type: String, required: true },

    type: {
      type: String,
      enum: ['TASK_ASSIGNED', 'STATUS_UPDATE', 'OVERDUE', 'GENERAL', 'REJECTED'],
      required: true
    },

    isRead: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema)
