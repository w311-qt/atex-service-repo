import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public() // Add this decorator to make the endpoint public
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
