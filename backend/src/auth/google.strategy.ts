import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') as string,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') as string,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') as string,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const state = req.query.state as string;
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      full_name: `${name.givenName || ''} ${name.familyName || ''}`.trim(),
      avatar_url: photos?.[0]?.value,
      requested_role: state,
    };
    done(null, user);
  }
}
