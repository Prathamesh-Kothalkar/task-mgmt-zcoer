// models/Staff.ts
import mongoose, { Document, Model, Schema } from 'mongoose'
import { boolean } from 'zod'

export interface IStaff extends Document {
  name: string
  empId: string
  email: string
  phone?: string
  staffType: ["TEACHING", "NON-TEACHING"]
  department: mongoose.Types.ObjectId
  role: 'STAFF'
  passwordHash: string
  requiredChangePassword:boolean
  isActive: boolean
  lastLogin: Date | null
  failedLoginAttempts: number
  lockUntil: Date | null
  passwordChangedAt: Date | null
  passwordResetAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const StaffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true },

    empId: { type: String, required: true, unique: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    phone: {
      type: String,
      required: false,
      unique: false,
      lowercase: true
    },

    staffType: {
      type: [String],
      enum: ['TEACHING', 'NON-TEACHING'],
      default: ['TEACHING']
    },

    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },

    role: {
      type: String,
      enum: ['STAFF'],
      default: 'STAFF'
    },

    passwordHash: { type: String, required: true },

    isActive: { type: Boolean, default: true },

    lastLogin: { type: Date, default: null },

    failedLoginAttempts: { type: Number, default: 0 },

    lockUntil: { type: Date, default: null },

    requiredChangePassword:{type:Boolean, default:true},

    passwordChangedAt: { type: Date, default: null },

    passwordResetAt: { type: Date, default: null }
  },
  { timestamps: true }
)

export const Staff: Model<IStaff> =
  mongoose.models.Staff || mongoose.model<IStaff>('Staff', StaffSchema)
