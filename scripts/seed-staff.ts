import 'dotenv/config'
import bcrypt from 'bcryptjs'
import dbConnect from '../lib/mongoose'
import { Staff } from '../model/Staff'
import { Department } from '../model/Department'

/**
 * Seed demo staff members.
 * - Idempotent (upserts by `empId`)
 * - Ensures department exists (skips if not found)
 * - Uses `DEFAULT_STAFF_PASSWORD` if set, otherwise generates a temporary password
 *
 * Example passwords are commented next to entries for developer reference only.
 */

type StaffSeed = {
  name: string
  empId: string
  email: string
  phone?: string
  deptCode: string
  // password?: string // example passwords are commented below
}

const staffList: StaffSeed[] = [
  // password: 'Staff-CSE-1!'
  { name: 'Prathamesh', empId: 'STAFF-CSE-07', email: 'prathameshkothalkar9021@gmail.com', phone: '9000000001', deptCode: 'CSE' },
  // password: 'Staff-IT-1!'
//   { name: 'Niks', empId: 'STAFF-CSE-03', email: 'jane.smith@college.edu', phone: '9000000002', deptCode: 'CSE' },
//   // password: 'Staff-ECE-1!'
//   { name: 'Mayu', empId: 'STAFF-CSE-04', email: 'mark.patel@college.edu', phone: '9000000003', deptCode: 'CSE' },
//   // password: 'Staff-EEE-1!'
//   { name: 'Demo1', empId: 'STAFF-CSE-05', email: 'priya.kumar@college.edu', phone: '9000000004', deptCode: 'CSE' },
//   // password: 'Staff-MECH-1!'
//   { name: 'Ravi', empId: 'STAFF-CSE-06', email: 'ravi.singh@college.edu', phone: '9000000005', deptCode: 'CSE' },
//   // password: 'Staff-CIVIL-1!'
//   { name: 'Anita', empId: 'STAFF-CSE-0', email: 'anita.desai@college.edu', phone: '9000000006', deptCode: 'CSE' },
]

function generatePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-='
  let out = ''
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

async function seed() {
  try {
    await dbConnect()
    console.log('Connected to DB')

    const defaultPassword = process.env.DEFAULT_STAFF_PASSWORD

    for (const s of staffList) {
      const dept = await Department.findOne({ code: s.deptCode.toUpperCase() })
      if (!dept) {
        console.warn(`Skipping ${s.empId}: department ${s.deptCode} not found`)
        continue
      }

      const plainPassword = defaultPassword || generatePassword()
      const passwordHash = await bcrypt.hash(plainPassword, 10)

      const filter = { empId: s.empId }
      const update: any = {
        $set: {
          name: s.name,
          email: s.email,
          phone: s.phone || null,
          department: dept._id,
          role: 'STAFF',
          passwordHash,
          requiredChangePassword: true,
          isActive: true,
        },
      }

      const res = await Staff.updateOne(filter, update, { upsert: true })

      if (res.upsertedCount && res.upsertedCount > 0) {
        console.log(`Inserted staff ${s.empId} (${s.name})`)
      } else if (res.matchedCount && res.matchedCount > 0) {
        console.log(`Updated staff ${s.empId} (${s.name})`)
      } else {
        console.log(`No-op for staff ${s.empId}`)
      }

      if (!defaultPassword) {
        console.log(`Note: no DEFAULT_STAFF_PASSWORD set — a temporary password was generated for ${s.empId}.`)
        console.log('For security the password is not printed here. To use a known password, set DEFAULT_STAFF_PASSWORD in your .env before running this script.')
      }
    }

    console.log('Seeding finished')
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed', err)
    process.exit(1)
  }
}

if (require.main === module) seed()

export default seed
