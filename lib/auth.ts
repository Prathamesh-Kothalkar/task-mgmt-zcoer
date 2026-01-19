// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongoose'
import { Hod } from '@/model/Hod'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'HOD Login',
      credentials: {
        empid: { label: 'Employee ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.empid || !credentials?.password) {
          throw new Error('Employee ID and password are required')
        }

        await dbConnect()

        const hod = await Hod.findOne({ empid: credentials.empid })

        if (!hod) {
          throw new Error('Invalid Employee ID or password')
        }

        //  Account disabled
        if (!hod.isActive) {
          throw new Error('Account is disabled. Contact admin.')
        }

        // // Account Deleted
        // if(hod.isDeleted){
        //   throw new Error('Account is Deleted by Admin');
          
        // }

        //Account locked
        if (hod.lockUntil && hod.lockUntil > new Date()) {
          throw new Error('Account locked. Try again later.')
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          hod.passwordHash
        )

        // Wrong password
        if (!isValidPassword) {
          hod.failedLoginAttempts += 1

          // Lock after 5 attempts
          if (hod.failedLoginAttempts >= 5) {
            hod.lockUntil = new Date(Date.now() + 15 * 60 * 1000)
          }

          await hod.save()
          throw new Error('Invalid Employee ID or password')
        }

        //Success
        hod.failedLoginAttempts = 0
        hod.lockUntil = null
        hod.lastLogin = new Date()
        await hod.save()

        return {
          id: hod._id.toString(),
          name: hod.name,
          empid: hod.empid,
          email: hod.email,
          role: hod.role,
          department: hod.departmentId.toString(),
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.empid = (user as any).empid
        token.email = user.email
        token.role = (user as any).role
        token.department = (user as any).department
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.empid = token.empid as string
        session.user.email = token.email as string
        session.user.role = token.role as string
        session.user.department = token.department as string
      }
      return session
    },
  },
}
