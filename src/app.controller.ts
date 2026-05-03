import { Controller, Delete, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import type { LoginRequest, PingResponse } from './utils/types';
import { MessageBody } from '@nestjs/websockets';

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('ping')
  ping(): PingResponse {
    const status = this.appService.ping();

    return {
      status: status,
    };
  }

  @Post('login')
  async login(@MessageBody() data: LoginRequest) {
    console.log('Login API invoked:', data);

    return await this.appService.login(data);
  }

  @Delete('delete')
  async deleteAll() {
    console.log("Delete all API invoked");

    return await this.appService.deleteAll();
  }
}
