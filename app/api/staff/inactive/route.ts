import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import { Staff } from "@/model/Staff";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req:NextRequest) {
  try{
    const session = await getServerSession(authOptions)
    // Auth check
    if (!session || (session.user.role !== 'HOD')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()

    await dbConnect()
    // Update staff info
    const staff=await Staff.findOne({ empId: body.empid, department: session.user.department });
    if(!staff){
      return NextResponse.json({ message: 'Staff not found' }, { status: 404 })
    }
    staff.isActive=false
    await staff.save();
    return NextResponse.json({ message: 'Staff Inactived' }, { status: 200 })  
  }catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}