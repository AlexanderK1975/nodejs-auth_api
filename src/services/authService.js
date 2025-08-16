import { dbClient } from '@data/redisClient';
import { v4 as uuidv4 } from 'uuid';
import { USERNAME_TAKEN } from '@constants/errors';
import { logger } from '@utils/logger';
import argon2 from 'argon2';

const { hash, argon2id, verify } = argon2;
const USERNAME_SET = 'usernames';

const userKey = (username) => {
    return `user:${username}`;
}

async function createUser(username, password) {
    const key = userKey(username);

    const exists = await dbClient.exists(key);
    if (exists) {
        const err = new Error('Username already exists');
        err.code = USERNAME_TAKEN;
        throw err;
    }

    const passwordHash = await hash(password, { type: argon2id });
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await dbClient.hSet(key, {
        id,
        username,
        password_hash: passwordHash,
        created_at: createdAt
    });

    await dbClient.sAdd(USERNAME_SET, username);

    return { id, username, createdAt };
}

async function authUser(username, password) {
    const key = userKey(username);

    const exists = await dbClient.exists(key);
    if (!exists) return false;

    const user = await dbClient.hGetAll(key);
    if (!user || !user.password_hash) return false;

    try {
        const ok = await verify(user.password_hash, password);
        return ok ? { id: user.id, username: user.username } : false;
    } catch (err) {
        console.error('Password verifycation error', err);
        logger.log('error', err.message);
        return false;
    }
}

export { createUser, authUser };