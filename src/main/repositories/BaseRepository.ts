import { randomUUID } from 'crypto';
import { Database } from '../db/Database';

export abstract class BaseRepository {
    constructor(protected readonly db: Database) {}

    protected generateId() {
        return randomUUID();
    }

    protected now() {
        return new Date().toISOString();
    }
}

