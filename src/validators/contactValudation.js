import Joi from "joi";

export const contactValudate = Joi.object({
    name: Joi.string().min(3).max(100).required(), 
    email:Joi.string().email().lowercase().required(), 
    phone:Joi.string().min(10).max(10).required(),
    comment:Joi.string().min(5).required(),
});