import mongoose from "mongoose";

export interface UserInterface {
    _id: string;
    name: string;
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema<UserInterface>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
    }

}, { timestamps: true });

export default mongoose.model<UserInterface>("User", userSchema, "users");