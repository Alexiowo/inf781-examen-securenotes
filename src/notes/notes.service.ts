import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Note } from './note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
    constructor(
        @InjectRepository(Note)
        private readonly repo: Repository<Note>,
    ) { }

    create(ownerId: string, dto: CreateNoteDto) {
        const note = this.repo.create({
            title: dto.title,
            content: dto.content,
            ownerId,
        });

        return this.repo.save(note);
    }

    findAll(ownerId: string) {
        return this.repo.find({
            where: { ownerId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(ownerId: string, id: string) {
        const note = await this.repo.findOne({
            where: { id, ownerId },
        });

        if (!note) {
            throw new NotFoundException('Nota no encontrada');
        }

        return note;
    }

    async update(ownerId: string, id: string, dto: UpdateNoteDto) {
        const note = await this.findOne(ownerId, id);

        Object.assign(note, dto);

        return this.repo.save(note);
    }

    async remove(ownerId: string, id: string) {
        const note = await this.findOne(ownerId, id);

        await this.repo.remove(note);

        return {
            message: 'Nota eliminada',
        };
    }
}