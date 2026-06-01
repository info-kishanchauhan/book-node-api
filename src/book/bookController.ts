import path from "path";
import { fileURLToPath } from 'node:url';
import fs from "node:fs";
import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import cloudinary from "../config/cloudinary.ts";
import bookModel from "./bookModel.ts";
import validateBook from "../validation/bookValidation.ts";
import type { AuthRequest } from "../middleware/authenticate.js";
import mongoose from "mongoose";


const unlinkFile = async (pathName: string | null) => {
    if (pathName) {
        await fs.promises.unlink(pathName);
    }
}

const getDirName = () => {
    const fileUrl = fileURLToPath(import.meta.url);
    return path.dirname(fileUrl);
}

export const getBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const books = await bookModel.find();
        res.status(200).json({ success: true, message: "Books fetched successfully", data: books })
    } catch (err) {
        return next(createHttpError(404, "Books not found", { details: err }));
    }
}

export const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as { [fileName: string]: Express.Multer.File[] };
    const dirname = getDirName();

    let imageResult = null;
    let fileResult = null;

    const coverImage = files.coverImage[0];
    const coverImageMimeType = coverImage?.mimetype?.split("/").at(-1);
    const fileName = coverImage?.filename;
    const pathName = fileName ? path.resolve(dirname, '../../public/data/upload', fileName) : null;

    const file = files.file[0];
    const pdfFileName = file?.filename;
    const pdfPathName = pdfFileName ? path.resolve(dirname, '../../public/data/upload', pdfFileName) : null;

    const inputErrors = await validateBook(req.body);
    if (inputErrors) {
        await unlinkFile(pathName);
        await unlinkFile(pdfPathName);
        return next(createHttpError(422, "All fields are required", { details: inputErrors }));
    }

    if (files.coverImage?.length) {
        try {
            imageResult = pathName ? (await cloudinary.uploader.upload(pathName, {
                filename_override: fileName,
                folder: 'book-cover',
                format: coverImageMimeType,
            })) : null;
        } catch (err) {
            console.log('upload image file error:=> ', err);
        } finally {
            await unlinkFile(pathName);
        }

    }

    if (files.file?.length) {
        try {
            fileResult = pdfPathName ? (await cloudinary.uploader.upload(pdfPathName, {
                resource_type: 'raw',
                filename_override: fileName,
                folder: 'book-cover',
                format: 'pdf'
            })) : null;
        } catch (error) {
            console.log('upload pdf file error:=> ', error);
        } finally {
            await unlinkFile(pdfPathName);
        }

    }

    const _req = req as AuthRequest;
    const newBook = await bookModel.create({
        title: req.body.title,
        author: _req.userId,
        genre: req.body.genre,
        coverImage: imageResult?.secure_url || '',
        file: fileResult?.secure_url || '',
    });


    res.status(201).json({ success: true, message: "Book created successfully", data: newBook._id })
}

export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.id;

    const inputErrors = await validateBook(req.body);
    if (inputErrors) {
        return next(createHttpError(422, "All fields are required", { details: inputErrors }));
    }

    const book = await bookModel.findById(bookId);
    if (!book) {
        return next(createHttpError(404, "Book not found"));
    }

    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
        return next(createHttpError(403, "Unauthorized to access this book"));
    }

    const files = req.files as { [filename: string]: Express.Multer.File[] };
    let completeCoverImage = null;
    let completePdfUrl = null;

    if (files.coverImage) {
        const filename = files?.coverImage[0]?.filename;
        const coverImageMimeType = files?.coverImage[0]?.mimetype.split("/").at(-1);
        const dirname = getDirName();
        const pathName = filename ? path.resolve(dirname, '../../public/data/upload', filename) : null;
        const fileImageResult = await cloudinary.uploader.upload(pathName, {
            filename_override: filename,
            folder: 'book-cover',
            format: coverImageMimeType,
        });
        await unlinkFile(pathName);
        completeCoverImage = fileImageResult.secure_url;
    }

    if (files?.file) {
        const pdfFilename = files?.file[0]?.filename;
        const dirname = getDirName();
        const pdfPathName = path.resolve(dirname, '../../public/data/upload', files?.file[0]?.filename);
        const filePdfResult = await cloudinary.uploader.upload(pdfPathName, {
            resource_type: 'raw',
            filename_override: pdfFilename,
            folder: 'book-cover',
            format: 'pdf',
        });
        await unlinkFile(pdfPathName);
        completePdfUrl = filePdfResult.secure_url;
    }

    const updateBook = await bookModel.findByIdAndUpdate(bookId, {
        title: req.body.title,
        genre: req.body.genre,
        coverImage: completeCoverImage || book.coverImage,
        file: completePdfUrl || book.file,
    }, { new: true });

    res.status(201).json({ success: true, message: "Book updated successfully", data: updateBook })
}

export const getSingleBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const book = await bookModel.findById(req.params.id).select('title genre coverImage file').populate('author', "name");
        // const book = await bookModel.aggregate([
        //     {
        //         $match: {
        //             _id: new mongoose.Types.ObjectId(req.params.id)
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "users",
        //             localField: "author",
        //             foreignField: "_id",
        //             as: "authorData"
        //         }
        //     },
        //     {
        //         $unwind: "$authorData"
        //     },
        //     {
        //         $project:{
        //             title:1,
        //             genre:1,
        //             coverImage:1,
        //             file:1,
        //             authorName:"$authorData.name"
        //         }
        //     }
        // ]);
        if (!book) {
            return next(createHttpError(404, "Book not found"));
        }
        res.status(200).json({ success: true, message: "Book fetched successfully", data: book })
    } catch (err) {
        return next(createHttpError(404, "Book not found", { details: err }))
    }
}

export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookId = req.params.id;
        const book = await bookModel.findById(bookId);
        if (!book) {
            return next(createHttpError(404, "Book not found"));
        }

        const _req = req as AuthRequest;
        if (book.author.toString() !== _req.userId) {
            return next(createHttpError(403, "Unauthorized to access this book"));
        }


        if (book.coverImage?.trim() !== '') {
            const publicId = book.coverImage.split('/').at(-1)?.split('.')[0] as string;
            const folderName = book.coverImage.split('/').at(-2) as string;
            await cloudinary.uploader.destroy(`${folderName}/${publicId}`)
        }
        if (book.file?.trim() !== '') {
            const publicId = book.file.split('/').at(-1)?.split('.')[0] as string;
            const folderName = book.file.split('/').at(-2) as string;
            await cloudinary.uploader.destroy(`${folderName}/${publicId}`, { resource_type: 'raw' })
        }

        await bookModel.findByIdAndDelete(bookId);
        res.status(200).json({ success: true, message: "Book deleted successfully" })
    } catch (err) {
        return next(createHttpError(404, "Book not found", { details: err }))
    }
}