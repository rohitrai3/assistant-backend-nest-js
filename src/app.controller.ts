import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { PingResponse } from './utils/types';

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('ping')
  ping(): PingResponse {
    const status = this.appService.ping();

    return {
      status: status
    };
  }
}
