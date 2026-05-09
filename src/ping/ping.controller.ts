import { Controller, Get } from '@nestjs/common';
import { PingService } from './ping.service';
import type { PingResponse } from 'src/utils/types';

@Controller('/ping/')
export class PingController {
  constructor(private readonly pingService: PingService) {}

  @Get()
  ping(): PingResponse {
    return this.pingService.ping();
  }

  @Get('llm')
  async pingLlm(): Promise<PingResponse> {
    return await this.pingService.pingLlm();
  }
}
