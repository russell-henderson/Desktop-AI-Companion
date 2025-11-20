import fs from 'fs';
import path from 'path';
import initSqlJs, { Database as SqlJsDatabase, SqlJsStatic, SqlValue } from 'sql.js';

const SCHEMA_RELATIVE_PATH = '../../src/main/db/schema.sql';
const SQL_WASM_RELATIVE_PATH = '../../node_modules/sql.js/dist';

export class Database {
    private SQL: SqlJsStatic | null = null;
    private db: SqlJsDatabase | null = null;

    constructor(private readonly databaseFile: string) {}

    async initialize() {
        this.SQL = await initSqlJs({
            locateFile: (file: string) => path.resolve(__dirname, SQL_WASM_RELATIVE_PATH, file),
        });

        if (fs.existsSync(this.databaseFile)) {
            const fileBuffer = fs.readFileSync(this.databaseFile);
            this.db = new this.SQL.Database(fileBuffer);
        } else {
            this.db = new this.SQL.Database();
            await this.applySchema();
            await this.persist();
        }
    }

    get connection(): SqlJsDatabase {
        if (!this.db) {
            throw new Error('Database is not initialized');
        }
        return this.db;
    }

    async persist() {
        const database = this.connection;
        const data = database.export();
        fs.mkdirSync(path.dirname(this.databaseFile), { recursive: true });
        fs.writeFileSync(this.databaseFile, Buffer.from(data));
    }

    async execute(sql: string, params: Record<string, SqlValue> = {}) {
        const statement = this.connection.prepare(sql);
        try {
            statement.bind(params);
            statement.step();
        } finally {
            statement.free();
        }

        await this.persist();
    }

    query<T>(sql: string, params: Record<string, SqlValue> = {}): T[] {
        const statement = this.connection.prepare(sql);
        const results: T[] = [];

        try {
            statement.bind(params);

            while (statement.step()) {
                results.push(statement.getAsObject() as T);
            }
        } finally {
            statement.free();
        }

        return results;
    }

    get<T>(sql: string, params: Record<string, SqlValue> = {}): T | null {
        const [result] = this.query<T>(sql, params);
        return result ?? null;
    }

    private async applySchema() {
        const schemaPath = path.resolve(__dirname, SCHEMA_RELATIVE_PATH);
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        const statements = schema
            .split(';')
            .map((statement) => statement.trim())
            .filter(Boolean);

        statements.forEach((statement) => {
            this.connection.run(statement);
        });
    }
}

