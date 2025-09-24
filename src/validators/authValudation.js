import Joi from "joi";

export const registerValudate = Joi.object({
    username: Joi.string().min(3).max(100).required(), 
    email:Joi.string().email().lowercase().required(), 
    password:Joi.string().min(6).required()
});

