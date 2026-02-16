import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      deptName: string
      deptCode: string
      id: string
      name: string
      empid: string
      email: string
      role: string
      department: string
    }
  }

  interface User {
    empid: string
    role: string
    department: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    empid: string
    role: string
    department: string
  }
}
