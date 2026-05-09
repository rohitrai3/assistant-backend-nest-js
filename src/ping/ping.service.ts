import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PingResponse } from 'src/utils/types';

@Injectable()
export class PingService {
  constructor(private configService: ConfigService) {}

  ping(): PingResponse {
    return {
      status: 'success',
    };
  }

  async pingLlm(): Promise<PingResponse> {
    const res = await fetch(
      `${this.configService.get<string>('LLM_BACKEND_URL')}/health`,
    )
      .then((res) => res.json())
      .then((data) => data.status as string)
      .catch((err) => console.log('LLM health error:', err));

    if (res == 'ok')
      return {
        status: 'success',
      };

    return {
      status: 'fail',
    };
  }
}
