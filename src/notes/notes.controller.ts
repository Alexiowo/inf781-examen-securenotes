import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';

@Controller('notes')
@UseGuards(AccessTokenGuard)
export class NotesController {
    constructor(private readonly notesService: NotesService) { }

    @Post()
    create(
        @GetCurrentUser('sub') userId: string,
        @Body() dto: CreateNoteDto,
    ) {
        return this.notesService.create(userId, dto);
    }

    @Get()
    findAll(@GetCurrentUser('sub') userId: string) {
        return this.notesService.findAll(userId);
    }

    @Get(':id')
    findOne(
        @GetCurrentUser('sub') userId: string,
        @Param('id') id: string,
    ) {
        return this.notesService.findOne(userId, id);
    }

    @Patch(':id')
    update(
        @GetCurrentUser('sub') userId: string,
        @Param('id') id: string,
        @Body() dto: UpdateNoteDto,
    ) {
        return this.notesService.update(userId, id, dto);
    }

    @Delete(':id')
    remove(
        @GetCurrentUser('sub') userId: string,
        @Param('id') id: string,
    ) {
        return this.notesService.remove(userId, id);
    }
}