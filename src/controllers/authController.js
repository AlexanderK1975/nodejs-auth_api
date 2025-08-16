import { createUser, authUser } from '@services/authService';
import { registerSchema, loginSchema } from '@validators/accountValidator';
import { errorResponse, successResponse } from '@builders/responseBuilder';
import { USERNAME_TAKEN } from '@constants/errors';
import { logger } from '@utils/logger';

async function register(req, res) {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) return res.status(400).json(errorResponse(error.message));

        const { username, password } = value;

        try {
            const user = await createUser(username, password);
            return res.status(200).json(successResponse(user));
        } catch (e) {
            if (e.code === USERNAME_TAKEN) return res.status(409).json(errorResponse('Username already exists'));
            console.error('Registration failed', e);
            logger.log('error', e.message);
            return res.status(500).json(errorResponse('Internal server error'));
        }
    } catch (err) {
        console.error('Unexpected error', err);
        logger.log('', err.message);
        return res.status(500).json(errorResponse('Internal server error'));
    }
}

async function login(req, res) {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) return res.status(400).json(errorResponse(error.message));

        const { username, password } = value;
    
        const user = await authUser(username, password);
        if (!user) return res.status(401).json(errorResponse('Login failed due to invalid credentials'));

        // TODO: In the future, it should return a token (OAuth2 or JWT)
        return res.status(200).json(successResponse(user));
    } catch (err) {
        console.error('Unexpected error', err);
        logger.log('error', err.message);
        return res.status(500).json(errorResponse('Internal server error'));
    }
}

export { login, register };