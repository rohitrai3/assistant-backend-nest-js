import { Logger } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { config } from 'dotenv';
import { Server } from 'socket.io';
import McpClient from 'src/providers/MCPClient';
import SttModel from 'src/providers/STT';
import TtsModel from 'src/providers/TTS';

config();

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  private readonly logger = new Logger('EventsGateway');
  @WebSocketServer()
  server: Server;
  audioBuffer = Buffer.alloc(0);

  constructor(
    private sttModel: SttModel,
    private ttsModel: TtsModel,
    private mcpClient: McpClient,
  ) {
    this.sttModel.load();
    this.ttsModel.load();
    this.mcpClient.loadServers();
  }

  @SubscribeMessage('online')
  online() {
    console.log('Online');
    this.server.emit('online');
  }

  @SubscribeMessage('conversation.audio')
  async conversation(@MessageBody() data: Buffer) {
    this.logger.log('Message received');
    const transcription = await this.sttModel.getTranscription(
      new Float32Array(data.buffer),
    );

    this.logger.log('Transcription send');
    this.server.emit('conversation.user.message', transcription);

    await this.mcpClient.processQuery(transcription, this.server, true);
    this.logger.log('LLM reply sent');
  }

  @SubscribeMessage('conversation.audio.chunk')
  conversationAudioChunk(@MessageBody() data: Buffer) {
    this.logger.log('Conversation audio chunk received');
    this.audioBuffer = Buffer.concat(
      [this.audioBuffer, data],
      this.audioBuffer.length + data.length,
    );
  }

  @SubscribeMessage('conversation.audio.chunk.stop')
  async conversationAudioChunkStop() {
    console.log('Conversation audio chunk stop');

    const transcription = await this.sttModel.getTranscription(
      new Float32Array(this.audioBuffer.buffer),
    );
    this.server.emit('conversation.user.message', transcription);

    await this.mcpClient.processQuery(transcription, this.server, false);
    this.logger.log('LLM reply sent');

    this.audioBuffer = Buffer.alloc(0);
  }

  @SubscribeMessage('speech')
  async speech(@MessageBody() data: string) {
    await this.ttsModel.synthesizeSpeech(data, this.server);
    this.logger.log('Speech synthesized');
  }

  @SubscribeMessage('conversation.user.text')
  async textConverstation(@MessageBody() data: string) {
    this.logger.log('Conversation use text received');
    this.server.emit('conversation.user.message', data);

    await this.mcpClient.processQuery(data, this.server, false);
    this.logger.log('LLM reply sent');
  }

  @SubscribeMessage('conversation.assistant.init')
  async initAssistant(@MessageBody() data: string) {
    this.logger.log('Conversation assistant init received:', data);
    await this.mcpClient.initAssistant(data, this.server, false);
  }
}
