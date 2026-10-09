import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';
import { SkipClinicTenantContext } from './modules/clinic/tenant/skip-clinic-tenant.decorator.js';

@ApiTags('App')
@SkipClinicTenantContext()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Проверка состояния API' })
  getHello(): string {
    return this.appService.getHello();
  }
}
