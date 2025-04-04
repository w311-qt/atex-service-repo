import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/entities/user.entity';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private startTime: Date;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.startTime = new Date();
  }

  /**
   * Returns basic API status information
   */
  getStatus() {
    return {
      status: 'online',
      environment: this.configService.get<string>('NODE_ENV') || 'development',
      uptime: this.getUptime(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Returns detailed system information
   */
  getSystemInfo() {
    return {
      name: 'Equipment Management System API',
      version: '1.0.0',
      description: 'API for managing equipment and service requests',
      environment: this.configService.get<string>('NODE_ENV') || 'development',
      nodeVersion: process.version,
      platform: process.platform,
      uptime: this.getUptime(),
      startTime: this.startTime.toISOString(),
      currentTime: new Date().toISOString(),
    };
  }

  /**
   * Performs health checks for critical system components
   */
  async checkHealth() {
    let databaseStatus = 'error';
    let databaseError = null;

    // Check database connection
    try {
      await this.userRepository.createQueryBuilder().select('COUNT(*)', 'count').getRawOne();
      databaseStatus = 'healthy';
    } catch (error) {
      databaseError = error.message;
      this.logger.error(`Database health check failed: ${error.message}`);
    }

    return {
      status: databaseStatus === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      components: {
        api: {
          status: 'healthy',
          uptime: this.getUptime(),
        },
        database: {
          status: databaseStatus,
          error: databaseError,
        },
      },
    };
  }

  /**
   * Helper method to calculate system uptime
   */
  private getUptime(): string {
    const uptime = new Date().getTime() - this.startTime.getTime();
    const seconds = Math.floor(uptime / 1000) % 60;
    const minutes = Math.floor(uptime / (1000 * 60)) % 60;
    const hours = Math.floor(uptime / (1000 * 60 * 60)) % 24;
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
}
