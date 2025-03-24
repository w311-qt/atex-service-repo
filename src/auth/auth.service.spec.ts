import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockRequest = {
    ip: '127.0.0.1',
    headers: {
      'user-agent': 'test-agent',
    },
  } as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => 'test-value'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object when credentials are valid', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('testPassword', 10);
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
      };

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      // Act
      const result = await service.validateUser('test@example.com', 'testPassword', mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('user-id');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.validateUser('nonexistent@example.com', 'anyPassword', mockRequest),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('correctPassword', 10);
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: UserRole.USER,
        isActive: true,
      };

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      // Act & Assert
      await expect(
        service.validateUser('test@example.com', 'wrongPassword', mockRequest),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return user info and token for valid credentials', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
      };

      jest.spyOn(jwtService, 'sign').mockReturnValue('test-jwt-token');

      // Act
      const result = await service.login(mockUser as any, mockRequest);

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });
});
