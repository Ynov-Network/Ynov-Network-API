import mongoose from "mongoose";
import config from "@/config/config";

const connectMongoDB = async () => {
  try {
    const mongooseConnection = await mongoose.connect(config.database.url);
    console.log(`MongoDB connected: ${mongooseConnection.connection.host}`);
    return mongooseConnection;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`Error connection to mongoDB: ${errorMessage}`);
    process.exit(1);
  }
};

export async function getNativeClient() {
  const connection = await connectMongoDB();
  return connection.connection.getClient().db();
}

export default connectMongoDB;