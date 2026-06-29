import {
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';

import { UsersService } from '../users/users.service';
import { RefreshToken } from './refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly users: UsersService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService,

        @InjectRepository(RefreshToken)
        private readonly tokens: Repository<RefreshToken>,
    ) { }

    async register(dto: RegisterDto, userAgent?: string) {
        const existing = await this.users.findByEmail(dto.email);

        if (existing) {
            throw new ForbiddenException('El correo ya está registrado');
        }

        const hash = await argon2.hash(dto.password);
        const user = await this.users.create(dto.email, hash);

        return this.issueSession(user.id, user.email, userAgent);
    }

    async login(dto: LoginDto, userAgent?: string) {
        const user = await this.users.findByEmail(dto.email);

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const validPassword = await argon2.verify(user.password, dto.password);

        if (!validPassword) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        return this.issueSession(user.id, user.email, userAgent);
    }

    private async issueSession(userId: string, email: string, userAgent?: string) {
        const sessionId = randomUUID();

        const pair = await this.signTokens(userId, email, sessionId);

        await this.persistRefreshToken(
            sessionId,
            userId,
            pair.refreshToken,
            userAgent,
        );

        return pair;
    }

    private async signTokens(userId: string, email: string, sessionId: string) {
        const payload = {
            sub: userId,
            email,
            sessionId,
        };

        const accessExpires = this.config.get<string>('JWT_ACCESS_EXPIRES') ?? '15m';
        const refreshExpires = this.config.get<string>('JWT_REFRESH_EXPIRES') ?? '7d';

        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, {
                secret: this.config.get<string>('JWT_ACCESS_SECRET')!,
                expiresIn: accessExpires as any,
            }),

            this.jwt.signAsync(payload, {
                secret: this.config.get<string>('JWT_REFRESH_SECRET')!,
                expiresIn: refreshExpires as any,
            }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    private async persistRefreshToken(
        id: string,
        userId: string,
        token: string,
        userAgent?: string,
    ) {
        const hashedToken = await argon2.hash(token);

        const session = this.tokens.create({
            id,
            userId,
            hashedToken,
            userAgent: userAgent ?? null,
            revoked: false,
            expiresAt: this.refreshExpiry(),
        });

        await this.tokens.save(session);
    }

    private refreshExpiry(): Date {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date;
    }

    async refreshTokens(
        userId: string,
        email: string,
        sessionId: string,
        presentedRefreshToken: string,
        userAgent?: string,
    ) {
        const session = await this.tokens.findOne({
            where: { id: sessionId },
        });

        if (!session || session.revoked || session.expiresAt < new Date()) {
            await this.revokeAll(userId);
            throw new ForbiddenException('Sesión inválida. Inicia sesión de nuevo.');
        }

        const validRefresh = await argon2.verify(
            session.hashedToken,
            presentedRefreshToken,
        );

        if (!validRefresh) {
            await this.revokeAll(userId);
            throw new ForbiddenException(
                'Reúso detectado. Se cerraron todas las sesiones.',
            );
        }

        const pair = await this.signTokens(userId, email, sessionId);

        session.hashedToken = await argon2.hash(pair.refreshToken);
        session.expiresAt = this.refreshExpiry();
        session.userAgent = userAgent ?? session.userAgent;

        await this.tokens.save(session);

        return pair;
    }

    async logout(sessionId: string) {
        await this.tokens.update({ id: sessionId }, { revoked: true });
    }

    async revokeAll(userId: string) {
        await this.tokens.update(
            { userId, revoked: false },
            { revoked: true },
        );
    }

    listSessions(userId: string) {
        return this.tokens.find({
            where: {
                userId,
                revoked: false,
            },
            select: {
                id: true,
                userAgent: true,
                createdAt: true,
                expiresAt: true,
            },
        });
    }
}