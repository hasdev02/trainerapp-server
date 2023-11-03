import Joi from "joi";

export const registerValidation = (data: Object) => {
	const schema = Joi.object({
		fullName: Joi.string().min(4).max(100).required(),
		email: Joi.string().required().email(),
		password: Joi.string().min(6).required(),
	});
	return schema.validate(data);
};

export const loginValidation = (data: Object) => {
	const schema = Joi.object({
		email: Joi.string().required(),
		password: Joi.string().required(),
		os: Joi.string(),
		browser: Joi.string(),
		deviceVendor: Joi.string(),
		deviceModel: Joi.string(),
		deviceType: Joi.string(),
	});
	return schema.validate(data);
};

export const changePasswordValidation = (data: Object) => {
	const schema = Joi.object({
		currentPassword: Joi.string().required(),
		newPassword: Joi.string().min(6).required(),
	});
	return schema.validate(data);
};

export const changeNameValidation = (data: Object) => {
	const schema = Joi.object({
		name: Joi.string().min(4).max(100).required(),
	});
	return schema.validate(data);
};

export const setClientSubscriptionValidation = (data: Object) => {
	const schema = Joi.object({
		subscription: Joi.string().valid("INACTIVE", "STANDARD", "ENTRENAMIENTO", "DIETA", "FULL"),
		subscriptionEnd: Joi.number(),
	});
	return schema.validate(data);
};
