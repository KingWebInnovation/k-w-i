import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

export async function connectDB(): Promise<mongoose.Connection> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: "kwi",
    });
  }

  try {
    const mongooseInstance = await cached.promise;
    cached.conn = mongooseInstance.connection;
    console.log("✅ DB Connected to:", cached.conn.name);
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  global.mongoose = cached;

  if (!cached.conn)
    throw new Error("Failed to establish a database connection.");

  return cached.conn;
}
