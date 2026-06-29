import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';

type Payload = {
    sub: string;
    email: string;
    sessionId: string;
};

const fromCookie = (req: Request): string | null => {
    return req?.cookies?.refreshToken ?? null;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh',
) {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([fromCookie]),
            secretOrKey: config.get<string>('JWT_REFRESH_SECRET')!,
            passReqToCallback: true,
        });
    }

    validate(req: Request, payload: Payload) {
        return {
            ...payload,
            refreshToken: req?.cookies?.refreshToken,
        };
    }
}