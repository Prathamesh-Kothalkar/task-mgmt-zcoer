// models/Department.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDepartment extends Document {
  name: string
  code: string            // e.g. CSE, IT, MECH
  description?: string
  hod?: mongoose.Types.ObjectId
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
    },

    // Reference to HOD
    hod: {
      type: Schema.Types.ObjectId,
      ref: 'Hod',
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // auto createdAt & updatedAt
  }
)

export const Department: Model<IDepartment> =
  mongoose.models.Department ||
  mongoose.model<IDepartment>('Department', DepartmentSchema)
