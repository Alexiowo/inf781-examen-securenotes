import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { GetCurrentUser } from './decorators/get-current-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) { }

    private setRefreshCookie(res: Response, token: string) {
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/auth',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    @Post('register')
    async register(
        @Body() dto: RegisterDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const pair = await this.auth.register(dto, req.headers['user-agent']);
        this.setRefreshCookie(res, pair.refreshToken);

        return {
            accessToken: pair.accessToken,
        };
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const pair = await this.auth.login(dto, req.headers['user-agent']);
        this.setRefreshCookie(res, pair.refreshToken);

        return {
            accessToken: pair.accessToken,
        };
    }

    @UseGuards(RefreshTokenGuard)
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refresh(
        @GetCurrentUser() user: any,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const pair = await this.auth.refreshTokens(
            user.sub,
            user.email,
            user.sessionId,
            user.refreshToken,
            req.headers['user-agent'],
        );

        this.setRefreshCookie(res, pair.refreshToken);

        return {
            accessToken: pair.accessToken,
        };
    }

    @UseGuards(RefreshTokenGuard)
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(
        @GetCurrentUser('sessionId') sessionId: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        await this.auth.logout(sessionId);
        res.clearCookie('refreshToken', { path: '/auth' });

        return {
            message: 'Sesión cerrada',
        };
    }

    @UseGuards(AccessTokenGuard)
    @Get('me')
    me(@GetCurrentUser() user: { sub: string; email: string; sessionId: string }) {
        return {
            id: user.sub,
            email: user.email,
            sessionId: user.sessionId,
        };
    }

    @UseGuards(AccessTokenGuard)
    @Get('sessions')
    sessions(@GetCurrentUser('sub') userId: string) {
        return this.auth.listSessions(userId);
    }
}