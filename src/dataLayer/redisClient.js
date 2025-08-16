import { createClient } from 'redis';
import { logger } from '@utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const dbClient = createClient({ url: REDIS_URL });
let connecting = false;

dbClient.on('error', (err) => {
    console.error('Redis Error', err);
    logger.log('error', err.message);
});

async function dbConnect () {
    if (!connecting && !dbClient.isOpen) {
        connecting = true;
        await dbClient.connect();
        connecting = false;
    }
}

export { dbClient, dbConnect };