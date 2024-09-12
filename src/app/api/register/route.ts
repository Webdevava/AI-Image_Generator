import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    const { db } = await connectToDatabase()

    if (!db) {
      return NextResponse.json({ message: 'Database connection failed' }, { status: 500 })
    }

    const existingUser = await db.collection('users').findOne({ email })

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      otp,
      isVerified: false,
    })

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // Add your SMTP host
      port: Number(process.env.SMTP_PORT), // Add your SMTP port
      secure: false, // Set to true if using port 465
      auth: {
        user: process.env.SMTP_USER, // Your SMTP username
        pass: process.env.SMTP_PASS, // Your SMTP password
      },
    })

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify your account',
      text: `Your OTP is: ${otp}`,
    })

    return NextResponse.json({ message: 'User registered successfully. Please check your email for OTP.' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}