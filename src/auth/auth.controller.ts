import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Get,
  Inject
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { Request as ExpressRequest } from 'express';
import { UsersService } from '../users/users.service';

// Define a type for the request with user property
interface RequestWithUser extends ExpressRequest {
  user: User;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: RequestWithUser, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user, req);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req: any) {
    console.log('User from JWT token:', req.user);

    const userId = req.user.id;

    if (!userId) {
      return { error: 'User ID not found in token' };
    }

    return this.usersService.findOne(userId);
  }
}