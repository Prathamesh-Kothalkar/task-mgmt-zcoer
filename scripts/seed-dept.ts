import 'dotenv/config'
import dbConnect from '../lib/mongoose'
import { Department } from '../model/Department'

type Dept = { name: string; code: string; description?: string }

const departments: Dept[] = [
  { name: 'Computer Science & Engineering', code: 'CSE', description: 'Computer Science and Engineering' },
  { name: 'Information Technology', code: 'IT', description: 'Information Technology' },
  { name: 'Electronics & Communication', code: 'ECE', description: 'Electronics and Communication Engineering' },
  { name: 'Electrical & Electronics', code: 'EEE', description: 'Electrical and Electronics Engineering' },
  { name: 'Mechanical Engineering', code: 'MECH', description: 'Mechanical Engineering' },
  { name: 'Civil Engineering', code: 'CIVIL', description: 'Civil Engineering' },
]

async function seed() {
  try {
    const conn = await dbConnect()
    console.log('Connected to DB')

    for (const dept of departments) {
      const filter = { code: dept.code }
      const update = {
        $set: {
          name: dept.name,
          description: dept.description || '',
          isActive: true,
        },
      }
      const result = await Department.updateOne(filter, update, { upsert: true })
      if (result.upsertedCount && result.upsertedCount > 0) {
        console.log(`Inserted department ${dept.code}`)
      } else if (result.matchedCount && result.matchedCount > 0) {
        console.log(`Updated department ${dept.code}`)
      } else {
        console.log(`No-op for department ${dept.code}`)
      }
    }

    // close connection
    if (conn && typeof (conn as any).disconnect === 'function') {
      await (conn as any).disconnect()
      console.log('Disconnected from DB')
    }

    console.log('Seeding finished')
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed', err)
    process.exit(1)
  }
}

if (require.main === module) {
  seed()
}

export default seed
