import { Controller, Get, VERSION_NEUTRAL, Version } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * API status endpoint that doesn't require authentication
   * Returns basic system status
   */
  @Public()
  @Get()
  getStatus() {
    return this.appService.getStatus();
  }

  /**
   * API info endpoint, also public
   * Returns detailed system information
   */
  @Public()
  @Get('info')
  @Version(VERSION_NEUTRAL)
  getSystemInfo() {
    return this.appService.getSystemInfo();
  }

  /**
   * API health check endpoint
   * Returns health check results including database connectivity
   */
  @Public()
  @Get('health')
  async getHealthCheck() {
    return this.appService.checkHealth();
  }
}
