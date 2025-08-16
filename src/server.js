import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { dbConnect } from '@data/redisClient';
import { login, register } from '@controllers/authController';
import { logger } from '@utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const RATE_LIMIT = process.env.RATE_LIMIT_PER_MIN || 30;

const app = express();
app.use(express.json());
app.use(helmet());

// Rate limit for endpoints per IP address
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: RATE_LIMIT,
    standardHeaders: true,
    legacyHeaders: false
});

// Middlewares
app.use('/register', limiter);
app.use('/login', limiter);

// Routes
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.post('/register', register);
app.post('/login', login);

// Service listener
(async () => {
    try {
        await dbConnect();
        console.log('Connected to database');
        app.listen(PORT, () => {
            console.log(`Auth service listening on port ${PORT}`);
        });
    } catch (e) {
        console.error('Failed to start service', e);
        logger.long('error', e.message);
        process.exit(1);
    }
})();