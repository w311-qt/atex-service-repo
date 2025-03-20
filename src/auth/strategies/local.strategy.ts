import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true, // Enable passing the request to the callback
    });
  }

  async validate(req: Request, email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password, req);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
