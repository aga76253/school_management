import mongoose from "mongoose";

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

function getMongoUri() {
	const mongoUri = process.env.MONGODB_URI;
	if (!mongoUri) {
		throw new Error("Missing MONGODB_URI environment variable.");
	}
	return mongoUri;
}

export default async function dbConnect() {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const mongoUri = getMongoUri();
		cached.promise = mongoose.connect(mongoUri, {
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
