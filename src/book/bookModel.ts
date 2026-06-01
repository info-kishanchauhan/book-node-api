import mongoose from 'mongoose';
import type { UserInterface } from '../user/userModel.ts';

export interface BookInterface {
    _id: string;
    title: string;
    author: UserInterface;
    genre: string;
    coverImage: string;
    file: string;
    createdAt: Date;
    updatedAt: Date;
}

const bookSchema = new mongoose.Schema<BookInterface>({
    title: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    genre: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model<BookInterface>("Book", bookSchema, "books");