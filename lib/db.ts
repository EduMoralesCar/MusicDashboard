import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Por favor define la variable de entorno MONGODB_URI en .env.local")
}

interface MongooseGlobal {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Global is used here to maintain a cached connection across hot reloads in development.
// This prevents connections from growing exponentially during API Route usage.
declare global {
  // eslint-disable-next-line no-var
  var mongooseGlobal: MongooseGlobal | undefined
}

let cached = global.mongooseGlobal

if (!cached) {
  cached = global.mongooseGlobal = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    console.log(MONGODB_URI)

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log("Conectado a MongoDB")
      return mongooseInstance
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}
