import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { RefreshToken } from '../refresh-token.entity';

type Payload = {
    sub: string;
    email: string;
    sessionId: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        config: ConfigService,

        @InjectRepository(RefreshToken)
        private readonly tokens: Repository<RefreshToken>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get<string>('JWT_ACCESS_SECRET')!,
        });
    }

    async validate(payload: Payload) {
        if (!payload?.sessionId) {
            throw new UnauthorizedException('Sesión inválida');
        }

        const session = await this.tokens.findOne({
            where: { id: payload.sessionId },
        });

        if (!session || session.revoked) {
            throw new UnauthorizedException('Sesión inválida');
        }

        return payload;
    }
}