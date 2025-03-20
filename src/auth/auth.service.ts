import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string, req: Request): Promise<any> {
    const userIp = req.ip || 'unknown';

    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      this.logger.warn(`Login attempt with non-existent email: ${email} from IP: ${userIp}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      this.logger.warn(`Login attempt for inactive account: ${email} from IP: ${userIp}`);
      throw new UnauthorizedException('Your account is inactive');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      this.logger.warn(`Failed login attempt for user: ${email} from IP: ${userIp}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    this.logger.log(`Successful login for user: ${email} from IP: ${userIp}`);
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: User, req: Request): Promise<any> {
    const userIp = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    this.logger.log(`User ${user.email} logged in from IP: ${userIp}, User-Agent: ${userAgent}`);

    return this.generateJwtToken(user);
  }

  // Helper method to generate JWT token
  generateJwtToken(user: User) {
    // Include essential claims in the JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      // Add unique token ID and timestamps for additional security
      jti: this.generateTokenId(),
      iat: Math.floor(Date.now() / 1000),
    };

    const token = this.jwtService.sign(payload);

    // Log token creation (without the actual token)
    this.logger.log(`Generated JWT token for user ${user.email}`);

    return {
      access_token: token,
      expires_in: 28800, // 8 hours in seconds
      token_type: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  // Helper to generate a unique token ID
  private generateTokenId(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }
}
