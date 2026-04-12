import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import McpClient from 'src/providers/MCPClient';
import SttModel from 'src/providers/STT';
import TtsModel from 'src/providers/TTS';

@Module({
  providers: [EventsGateway, McpClient, SttModel, TtsModel],
})
export class EventsModule {}
