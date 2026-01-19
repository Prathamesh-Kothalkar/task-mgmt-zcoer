// --------------------
// File path: app/api/staff/route.ts
// author: Prathamesh Kothalkar
// --------------------


import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import sendMail from '@/lib/serviceMail'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongoose'
import { Staff } from '@/model/Staff'

// --------------------
// Password Generator
// --------------------
function generatePassword(length = 12): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  return password
}



// --------------------
// Validation
// --------------------
function validate(body: any): string[] {
  const errors: string[] = []

  if (!body.empid) errors.push('Employee ID is required')
  if (!body.firstName) errors.push('First name is required')
  if (!body.lastName) errors.push('Last name is required')
  if (!body.email) errors.push('Email is required')
  if (!body.phone || !/^\d{10}$/.test(body.phone)) {
    errors.push('Valid phone number required')
  }

  return errors
}


// --------------------
// POST Handler for creating users
// --------------------
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Auth check
    if (!session || session.user.role !== 'HOD') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const errors = validate(body)

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    await dbConnect()

    //Prevent duplicates
    const existingStaff = await Staff.findOne({
      $or: [{ empid: body.empid }, { email: body.email }],
    })

    if (existingStaff) {
      return NextResponse.json(
        { message: 'Staff with same EmpID or Email already exists' },
        { status: 409 }
      )
    }

    //Ensure same department
    if (body.department !== session.user.department) {
      return NextResponse.json(
        { message: 'You can only create staff in your department' },
        { status: 403 }
      )
    }

    const plainPassword = generatePassword()
    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    //Create Staff
    const staff = await Staff.create({
      empId: body.empid,
      name: `${body.firstName} ${body.lastName}`,
      email: body.email,
      phone: body.phone,
      department: session.user.department,
      role: 'STAFF',
      passwordHash: hashedPassword,
      requiredChangePassword: true,
      isActive: true,
    })

    // Send Email (best-effort)
    try {
      await sendMail({
        from: `College Task System <${process.env.SMTP_USER}>`,
        to: staff.email,
        subject: 'Your Staff Account Credentials',
        html: `
          <h3>Welcome ${staff.name}</h3>
          <p>Your staff account has been created.</p>
          <p><strong>Employee ID:</strong> ${staff.empId}</p>
          <p><strong>Password:</strong> ${plainPassword}</p>
          <p style="color:red"><b>Please change your password after first login.</b></p>
        `,
      })
    } catch (emailErr) {
      console.error('Failed to send credentials email', emailErr)
    }

    return NextResponse.json(
      {
        message: 'Staff created successfully',
        staff: {
          empid: staff.empId,
          name: staff.name,
          email: staff.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}


// --------------------
// GET Handler for listing users
// --------------------

export async function GET(req: NextRequest) {
  try{
    const session = await getServerSession(authOptions)

    // Auth check
    if (!session || (session.user.role !== 'HOD' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Fetch staff in same department
    let users=await Staff.find({ department: session.user.department }).select('-passwordHash -__v');
    return NextResponse.json({ staff: users }, { status: 200 })

    
  }catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
