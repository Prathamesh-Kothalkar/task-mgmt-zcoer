
import bcrypt from 'bcryptjs'
import 'dotenv/config'
import dbConnect from '../lib/mongoose'

import { Hod } from '@/model/Hod'
import { Department } from '@/model/Department'

// dotenv.config()

async function seedHod() {
  try {
  
    await dbConnect()

    console.log('Connected to MongoDB')

    // 2️⃣ Find existing department (or create one)
    let department = await Department.findOne({ code: 'IT' })

    if (!department) {
      department = await Department.create({
        name: 'Information Technology',
        code: 'IT',
        isActive: true,
      })
      console.log('🆕 Department created')
    }

    // 3️⃣ Check if HOD already exists
    const empid = 'HOD001'

    const existing = await Hod.findOne({ empid })

    if (existing) {
      console.log('HOD already exists skipping seed')
      process.exit(0)
    }

    // 4️⃣ Hash password
    const plainPassword = 'Hod@12345'
    const passwordHash = await bcrypt.hash(plainPassword, 10)

    // 5️⃣ Create HOD
    const hod = await Hod.create({
      name: 'Demo HOD',
      empid,
      email: 'hod.it@college.edu',
      departmentId: department._id,
      passwordHash,
      role: 'HOD',
      isActive: true,
      lastLogin: null,
      failedLoginAttempts: 0,
      lockUntil: null,
      passwordChangedAt: null,
      passwordResetAt: null,
    })

    console.log('HOD seeded successfully')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`EmpID    : ${hod.empid}`)
    console.log(`Email    : ${hod.email}`)
    console.log(`Password : ${plainPassword}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━')

    process.exit(0)
  } catch (err) {
    console.error('Seed failed', err)
    process.exit(1)
  }
}

seedHod()
