import mongoose from "mongoose";

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
	throw new Error("Missing MONGODB_URI environment variable.");
}

const MONGODB_URI: string = mongoUri;

type MongooseCache = {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
};


declare global {
	var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
	conn: null,
	promise: null,
};

global.mongooseCache = cached;

export default async function dbConnect() {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
			cached.promise = mongoose.connect(MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			bufferCommands: false,
			serverSelectionTimeoutMS: 5000,
			});

	}

	try {
		cached.conn = await cached.promise;
		return cached.conn;
	} catch (error) {
		cached.promise = null;
		cached.conn = null;
		throw error;
	}
}
