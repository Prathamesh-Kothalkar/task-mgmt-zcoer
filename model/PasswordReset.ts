// models/PasswordReset.ts
import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IPasswordReset extends Document {
  userId: mongoose.Types.ObjectId
  userRole: 'HOD' | 'STAFF'
  resetTokenHash: string
  expiresAt: Date
  usedAt: Date | null
  createdAt: Date
}

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },

    userRole: {
      type: String,
      enum: ['HOD', 'STAFF'],
      required: true
    },

    resetTokenHash: { type: String, required: true },

    expiresAt: { type: Date, required: true },

    usedAt: { type: Date, default: null }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

// TTL index (auto-delete expired tokens)
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const PasswordReset: Model<IPasswordReset> =
  mongoose.models.PasswordReset ||
  mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema)
