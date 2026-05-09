import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PingController } from './ping.controller';
import { PingService } from './ping.service';

@Module({
  imports: [ConfigModule],
  controllers: [PingController],
  providers: [PingService],
})
export class PingModule {}
