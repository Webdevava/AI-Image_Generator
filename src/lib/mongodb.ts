import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local')
}

let isConnected: boolean = false // Track connection status

export async function connectToDatabase() {
  if (isConnected) {
    return mongoose.connection; // Return existing connection
  }

  if (!uri) {
    throw new Error('Mongo URI is undefined');
  }
  await mongoose.connect(uri);
  isConnected = true; // Update connection status
  return mongoose.connection; // Return the connection
}