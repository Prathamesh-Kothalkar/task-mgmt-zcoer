// app/api/staff/reset-password/route.ts
//----------------
// Author: Prathamesh Kothalkar
//----------------


import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongoose'
import { Staff } from '@/model/Staff'

// GET: Validate reset token
export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url)
		const token = url.searchParams.get('ref');

		if (!token) {
			return NextResponse.json({ valid: false, message: 'Reset token is required' }, { status: 400 })
		}

        console.log('Validating reset token', token)

		await dbConnect()

		const staff = await Staff.findOne({ passwordResetToken: token, passwordResetValid: true }).select(
			'-passwordHash'
		)

		if (!staff) {
			return NextResponse.json({ valid: false, message: 'Invalid or expired reset token' }, { status: 404 })
		}

		return NextResponse.json({ valid: true, empid: staff.empId, name: staff.name }, { status: 200 })
	} catch (err) {
		console.error('Reset token validation failed', err)
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
	}
}

// POST: Reset password using token
export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const token = body?.token || body?.ref
		const password = body?.password

		if (!token) return NextResponse.json({ message: 'Reset token is required' }, { status: 400 })

		if (!password || typeof password !== 'string' || password.length < 8) {
			return NextResponse.json({ message: 'Password is required (min 8 characters)' }, { status: 400 })
		}

		await dbConnect()

		const staff = await Staff.findOne({ passwordResetToken: token, passwordResetValid: true })

		if (!staff) {
			return NextResponse.json({ message: 'Invalid or expired reset token' }, { status: 404 })
		}

		const hashed = await bcrypt.hash(password, 10)

		staff.passwordHash = hashed
		staff.requiredChangePassword = false
		staff.passwordChangedAt = new Date()
		staff.passwordResetAt = new Date()
		staff.passwordResetValid = false
		staff.passwordResetToken = null
        staff.requiredChangePassword=false

		await staff.save()

		return NextResponse.json({ message: 'Password reset successful' }, { status: 200 })
	} catch (err) {
		console.error('Password reset failed', err)
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
	}
}
