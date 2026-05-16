import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import McpClient from 'src/providers/MCPClient';
import SttModel from 'src/providers/STT';
import TtsModel from 'src/providers/TTS';
import Logger from 'src/providers/Logger';

@Module({
  providers: [EventsGateway, McpClient, SttModel, TtsModel, Logger],
})
export class EventsModule {}
