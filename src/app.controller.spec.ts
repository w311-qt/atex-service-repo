import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              if (key === 'NODE_ENV') return 'test';
              return 'test-value';
            }),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({ count: '0' }),
            }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return API status', () => {
      const result = {
        status: 'online',
        environment: 'test',
        uptime: '0d 0h 0m 0s',
        timestamp: '2023-01-01T00:00:00.000Z',
      };

      jest.spyOn(appService, 'getStatus').mockImplementation(() => result);
      expect(appController.getStatus()).toEqual(result);
    });

    it('should return system info', () => {
      const result = {
        name: 'Equipment Management System API',
        version: '1.0.0',
        description: 'API for managing equipment and service requests',
        environment: 'test',
        nodeVersion: 'v16.x.x',
        platform: 'linux',
        apiPrefix: 'api',
        uptime: '0d 0h 0m 0s',
        startTime: '2023-01-01T00:00:00.000Z',
        currentTime: '2023-01-01T00:00:00.000Z',
      };

      jest.spyOn(appService, 'getSystemInfo').mockImplementation(() => result);
      expect(appController.getSystemInfo()).toEqual(result);
    });

    it('should check health', async () => {
      const result = {
        status: 'healthy',
        timestamp: '2023-01-01T00:00:00.000Z',
        components: {
          api: {
            status: 'healthy',
            uptime: '0d 0h 0m 0s',
          },
          database: {
            status: 'healthy',
            error: null,
          },
        },
      };

      jest.spyOn(appService, 'checkHealth').mockResolvedValue(result);
      expect(await appController.getHealthCheck()).toEqual(result);
    });
  });
});
