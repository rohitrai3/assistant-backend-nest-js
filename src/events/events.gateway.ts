import { Inject } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { config } from 'dotenv';
import { Server } from 'socket.io';
import Logger from 'src/providers/Logger';
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
  @Inject()
  private readonly logger: Logger;
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
    this.logger.info('Online');
    this.server.emit('online');
  }

  @SubscribeMessage('status.llm.check')
  checkLLMStatus() {
    setInterval(() => {
      fetch(`${process.env.LLM_URL}/health`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'ok') this.server.emit('status.llm.online');
          else this.server.emit('status.finance.offline');
        })
        .catch((err) => {
          this.server.emit('status.llm.offline');
        })
    }, 1000);
  }

  @SubscribeMessage('status.finance.check')
  async checkFinanceStatus() {
    this.logger.info('Check Finance status');
    await fetch(`${process.env.FINANCE_URL}/ping`)
      .then((res) => res.json())
      .then((data) => {
        this.logger.info(`data: ${data}`);
        if (data.status === 'success')
          this.server.emit('status.finance.online');
        else this.server.emit('status.finance.offline');
      })
      .catch((err) => {
        this.server.emit('status.finance.offline');
        this.logger.error(`Finance ping error: ${err}`);
      });
  }

  @SubscribeMessage('conversation.audio')
  async conversation(@MessageBody() data: Buffer) {
    this.logger.info('Message received');
    const transcription = await this.sttModel.getTranscription(
      new Float32Array(data.buffer),
    );

    this.logger.info('Transcription send');
    this.server.emit('conversation.user.message', transcription);

    await this.mcpClient.processQuery(transcription, this.server, true);
  }

  @SubscribeMessage('conversation.audio.chunk')
  conversationAudioChunk(@MessageBody() data: Buffer) {
    this.logger.info('Conversation audio chunk received');
    this.audioBuffer = Buffer.concat(
      [this.audioBuffer, data],
      this.audioBuffer.length + data.length,
    );
  }

  @SubscribeMessage('conversation.audio.chunk.stop')
  async conversationAudioChunkStop() {
    this.logger.info('Conversation audio chunk stop');

    const transcription = await this.sttModel.getTranscription(
      new Float32Array(this.audioBuffer.buffer),
    );
    this.server.emit('conversation.user.message', transcription);

    await this.mcpClient.processQuery(transcription, this.server, false);

    this.audioBuffer = Buffer.alloc(0);
  }

  @SubscribeMessage('speech')
  async speech(@MessageBody() data: string) {
    await this.ttsModel.synthesizeSpeech(data, this.server);
    this.logger.info('Speech synthesized');
  }

  @SubscribeMessage('conversation.user.text')
  async textConverstation(@MessageBody() data: string) {
    this.logger.info('Conversation use text received');
    this.server.emit('conversation.user.message', data);

    await this.mcpClient.processQuery(data, this.server, false);
  }

  @SubscribeMessage('conversation.assistant.init')
  async initAssistant(@MessageBody() data: string) {
    this.logger.info(`Conversation assistant init received: ${data}`);
    await this.mcpClient.initAssistant(data);
  }
}
