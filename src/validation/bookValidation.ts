import Joi from 'joi';
import { __prepareErrorObject } from './validationHandler.ts';

const validateBook = (data: object) => {
    const schema = Joi.object({
        title: Joi.string().trim().required().label("Title")
            .messages({
                "string.empty": "Title is required",
            }),
        genre: Joi.string().trim().required().label("Genre")
            .messages({
                "string.empty": "Genre is required",
            }),
    });

    const { error } = schema.validate(data, {
        abortEarly: true,
        allowUnknown: true
    });
    return __prepareErrorObject(error?.details)
}

export default validateBook