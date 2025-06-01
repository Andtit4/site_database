import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  getStatus(): string {
    return 'API fonctionnelle - Site Info Backend';
  }

  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'API fonctionnelle',
      service: 'Site Info Backend'
    };
  }

  @Get('api/health')
  async apiHealthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      api: 'Site Info Backend',
      version: '1.0.0'
    };
  }
} 
