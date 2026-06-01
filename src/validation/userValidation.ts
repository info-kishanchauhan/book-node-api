import Joi from 'joi';
import { __prepareErrorObject } from './validationHandler.ts';

export const validateRegisterUser = (data: object) => {
    const schema = Joi.object({
        name: Joi.string().trim().required().label('Name')
            .messages({
                'string.empty': 'name is required',
                'string.base': 'name must be a string',
                'string.trim': 'name is required',
            }),

        email: Joi.string()
            .trim()
            .lowercase()
            .email({
                minDomainSegments: 2,
                tlds: {
                    allow: ['com', 'net', 'org', 'in', 'co'],
                },
            })
            .required()
            .label('Email'),

        password: Joi.string().required().label('Password'),
    });

    const { error } = schema.validate(data, {
        abortEarly: true,
        allowUnknown: true,
    });

    return __prepareErrorObject(error?.details);
};

export const validateLoginUser = (data: Object) => {
    const schema = Joi.object({
        email: Joi.string()
            .trim()
            .lowercase()
            .email({
                minDomainSegments: 2,
                tlds: {
                    allow: ['com', 'net', 'org', 'in', 'co'],
                },
            })
            .required()
            .label('Email'),
        password: Joi.string().required().label('Password'),
    });
    const { error } = schema.validate(data, {
        abortEarly: true,
        allowUnknown: true
    });

    return __prepareErrorObject(error?.details);
}