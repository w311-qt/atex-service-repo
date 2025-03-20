import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
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

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

      // Act
      const result = await service.validateUser('test@example.com', 'testPassword');

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('user-id');
      expect(result.password).toBeUndefined();
    });

    it('should return null when user is not found', async () => {
      // Arrange
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      // Act
      const result = await service.validateUser('nonexistent@example.com', 'anyPassword');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
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

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

      // Act
      const result = await service.validateUser('test@example.com', 'wrongPassword');

      // Assert
      expect(result).toBeNull();
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
        department: 'IT',
        position: 'Developer',
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('test-jwt-token');

      // Act
      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
        remember: false
      });

      // Assert
      expect(result).toEqual({
        user: mockUser,
        token: 'test-jwt-token',
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'user-id', email: 'test@example.com', role: UserRole.USER },
        { expiresIn: '1d' }
      );
    });
  });
});
