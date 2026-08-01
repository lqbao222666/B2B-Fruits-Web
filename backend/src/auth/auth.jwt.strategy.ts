import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '6f8d1c2a3b4e5f67890abcdef1234567890abcdef1234567890abcdef12345678 ',
    });
  }

  async validate(payload: any) {
    const userId = payload.sub || payload.id || payload.userId;
    return {
      id: userId,
      user_id: userId,
      sub: userId,
      username: payload.username,
      role: payload.role,
    };
  }
}
