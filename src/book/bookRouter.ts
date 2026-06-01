import * as path from 'node:path';
import { fileURLToPath } from "url";
import express, { type Router } from 'express';
import multer from 'multer';
import authorization from "../middleware/authenticate.ts";
import { createBook, deleteBook, getBooks, updateBook, getSingleBook } from './bookController.ts';

const bookRouter: Router = express.Router();
const __fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fileName);

const upload = multer({
    dest: path.resolve(__dirname, '../../public/data/upload'),
    limits: { fileSize: 2 * 1024 * 1024 }
});


bookRouter.get('/', getBooks)
bookRouter.get('/:id', getSingleBook)
bookRouter.post('/', authorization, upload.fields([
    {
        name: 'coverImage',
        maxCount: 1,
    },
    {
        name: 'file',
        maxCount: 1
    }
]), createBook)
bookRouter.put('/:id', authorization, upload.fields([
    {
        name: 'coverImage',
        maxCount: 1,
    },
    {
        name: 'file',
        maxCount: 1
    }
]), updateBook)
bookRouter.delete('/:id', authorization, deleteBook)

export default bookRouter;