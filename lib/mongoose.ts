// lib/mongoose.ts
import mongoose from 'mongoose'


const MONGODB_URI = process.env.MONGODB_URI as string


if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable')
}


/**
* Global is used to maintain a cached connection across hot reloads in development
*/
let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (global as any).mongoose || { conn: null, promise: null }


if (!cached.promise) {
    const opts = {
        bufferCommands: false,
    }
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose: any) => mongoose)
}


export default async function dbConnect() {
    if (cached.conn){
        console.log("Using existing mongoose connection");
        return cached.conn
    }
    cached.conn = await cached.promise
    console.log("Established new mongoose connection");
    return cached.conn
}