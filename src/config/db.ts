import mongoose from "mongoose";
import { config } from './config.ts'

const connection = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("Connected to MongoDB database");
        });

        mongoose.connection.on("error", (err) => {
            console.log("Error in connection in database:=>", err);
        });

        await mongoose.connect(config.DB_URL as string);
        console.log("DB connect success");
    } catch (error) {
        console.log("Fail to connect database :=>", error);
        process.exit(1);
    }
}

export default connection;