import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

export async function POST(req: Request) {
  try {
    const { otp } = await req.json()
    const { db } = await connectToDatabase()

    if (!db) {
      return NextResponse.json({ message: 'Database connection failed' }, { status: 500 })
    }

    const user = await db.collection('users').findOne({ otp })

    if (!user) {
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 })
    }

    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { isVerified: true }, $unset: { otp: '' } }
    )

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in the environment variables')
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

    return NextResponse.json({ token })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}