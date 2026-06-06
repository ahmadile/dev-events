import 'server-only';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    '❌ MONGODB_URI manquant dans .env.local\n' +
    'Ajoutez: MONGODB_URI=mongodb+srv://...'
  );
}

interface MongooseCache {
  conn: mongoose.Mongoose | null;
  promise: Promise<mongoose.Mongoose> | null;
}

declare global {
  
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cached;
}

/**
 * Connexion MongoDB avec caching HMR + options production-ready
 */
export async function connectDB(): Promise<mongoose.Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔌 Connexion à MongoDB...');
    
    cached.promise = mongoose.connect(MONGODB_URI!, {
      bufferCommands: false, // Fail-fast en serverless
      maxPoolSize: 10,       // Limite connexions simultanées
      serverSelectionTimeoutMS: 5000, // Timeout UX réactive
    }).then((mongooseInstance) => {
      console.log('✅ MongoDB connecté avec succès');
      return mongooseInstance;
    }).catch((error: unknown) => {
      // ⚠️ CRITIQUE: Reset pour permettre retry
      cached.promise = null;
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Échec connexion MongoDB:', message);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}