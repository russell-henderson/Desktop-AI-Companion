import { BaseRepository } from './BaseRepository';
import type { ProjectRecord } from '../types/database';

export interface CreateProjectInput {
    name: string;
    description?: string;
    path?: string;
    color?: string;
}

export interface UpdateProjectInput {
    name?: string;
    description?: string;
    path?: string;
    color?: string;
}

export class ProjectRepository extends BaseRepository {
    async getAll(): Promise<ProjectRecord[]> {
        return this.db.query<ProjectRecord>('SELECT * FROM projects ORDER BY updated_at DESC');
    }

    async getById(id: string): Promise<ProjectRecord | null> {
        return this.db.get<ProjectRecord>('SELECT * FROM projects WHERE id = :id', { ':id': id });
    }

    async create(input: CreateProjectInput): Promise<ProjectRecord> {
        const id = this.generateId();
        const timestamp = this.now();

        await this.db.execute(
            `INSERT INTO projects (id, name, description, path, color, created_at, updated_at)
             VALUES (:id, :name, :description, :path, :color, :created_at, :updated_at)`,
            {
                ':id': id,
                ':name': input.name,
                ':description': input.description ?? null,
                ':path': input.path ?? null,
                ':color': input.color ?? null,
                ':created_at': timestamp,
                ':updated_at': timestamp,
            },
        );

        const created = await this.getById(id);
        if (!created) {
            throw new Error('Failed to create project');
        }

        return created;
    }

    async update(id: string, input: UpdateProjectInput): Promise<ProjectRecord | null> {
        const project = await this.getById(id);
        if (!project) {
            return null;
        }

        await this.db.execute(
            `UPDATE projects
             SET name = :name,
                 description = :description,
                 path = :path,
                 color = :color,
                 updated_at = :updated_at
             WHERE id = :id`,
            {
                ':id': id,
                ':name': input.name ?? project.name,
                ':description': input.description ?? project.description ?? null,
                ':path': input.path ?? project.path ?? null,
                ':color': input.color ?? project.color ?? null,
                ':updated_at': this.now(),
            },
        );

        return this.getById(id);
    }

    async delete(id: string): Promise<void> {
        await this.db.execute('DELETE FROM projects WHERE id = :id', { ':id': id });
    }
}

