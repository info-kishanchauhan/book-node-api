import { config as conf } from 'dotenv';

conf();

const _config = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV,
    DB_URL: process.env.URL || null,
    JWT_SECRET: process.env.JWT_SECRET || null,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || null,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || null,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || null,
    FRONTEND_URL: process.env.FRONTEND_URL || null,
}

export const config = Object.freeze(_config);