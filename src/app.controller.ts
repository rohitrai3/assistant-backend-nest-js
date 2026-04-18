import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import type { LoginRequest, PingResponse, SyncData } from './utils/types';
import { MessageBody } from '@nestjs/websockets';

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('ping')
  ping(): PingResponse {
    const status = this.appService.ping();

    return {
      status: status,
    };
  }

  @Post('sync')
  async sync(@MessageBody() data: SyncData) {
    console.log('Sync API invoked:', data);
    await this.appService.sync(data);
  }

  @Post('login')
  async login(@MessageBody() data: LoginRequest) {
    console.log('Login API invoked:', data);
    return await this.appService.login(data);
  }
}
