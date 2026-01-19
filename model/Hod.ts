// models/Hod.ts
import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IHod extends Document {
  name: string
  empid: string
  email: string
  departmentId: mongoose.Types.ObjectId
  role: 'HOD'
  passwordHash: string
  isActive: boolean
  lastLogin: Date | null
  failedLoginAttempts: number
  lockUntil: Date | null
  passwordChangedAt: Date | null
  passwordResetAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const HodSchema = new Schema<IHod>(
  {
    name: { type: String, required: true },

    empid: { type: String, required: true, unique: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },

    role: {
      type: String,
      enum: ['HOD'],
      default: 'HOD'
    },

    passwordHash: { type: String, required: true },

    isActive: { type: Boolean, default: true },

    lastLogin: { type: Date, default: null },

    failedLoginAttempts: { type: Number, default: 0 },

    lockUntil: { type: Date, default: null },

    passwordChangedAt: { type: Date, default: null },

    passwordResetAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
)

export const Hod: Model<IHod> =
  mongoose.models.Hod || mongoose.model<IHod>('Hod', HodSchema)
