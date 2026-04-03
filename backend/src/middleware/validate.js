const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            error: 'Validation Error',
            details: error.details.map(d => d.message)
        });
    }
    next();
};

const schemas = {
    login: Joi.object({
        email: Joi.string().email({ tlds: { allow: false } }).required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().min(1).required().messages({
            'any.required': 'Password is required'
        })
    }),

    register: Joi.object({
        name: Joi.string().min(2).max(100).required().messages({
            'string.min': 'Name must be at least 2 characters',
            'any.required': 'Name is required'
        }),
        email: Joi.string().email({ tlds: { allow: false } }).required(),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters',
            'any.required': 'Password is required'
        })
    }),

    createRecord: Joi.object({
        amount: Joi.number().positive().precision(2).required().messages({
            'number.positive': 'Amount must be a positive number',
            'any.required': 'Amount is required'
        }),
        type: Joi.string().valid('income', 'expense').required().messages({
            'any.only': 'Type must be either income or expense',
            'any.required': 'Type is required'
        }),
        category: Joi.string().min(1).max(50).required().messages({
            'any.required': 'Category is required'
        }),
        date: Joi.string().isoDate().required().messages({
            'string.isoDate': 'Date must be a valid ISO date (YYYY-MM-DD)',
            'any.required': 'Date is required'
        }),
        notes: Joi.string().max(500).optional().allow('')
    }),

    updateRecord: Joi.object({
        amount: Joi.number().positive().precision(2).optional(),
        type: Joi.string().valid('income', 'expense').optional(),
        category: Joi.string().min(1).max(50).optional(),
        date: Joi.string().isoDate().optional(),
        notes: Joi.string().max(500).optional().allow('')
    }).min(1).messages({
        'object.min': 'At least one field required to update'
    }),

    updateRole: Joi.object({
        role: Joi.string().valid('VIEWER', 'ANALYST', 'ADMIN').required().messages({
            'any.only': 'Role must be VIEWER, ANALYST, or ADMIN',
            'any.required': 'Role is required'
        })
    }),

    requestRole: Joi.object({
        requestedRole: Joi.string().valid('ANALYST', 'ADMIN').required().messages({
            'any.only': 'You can only request ANALYST or ADMIN role',
        })
    })
};

module.exports = { validate, schemas };
