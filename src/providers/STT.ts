import {
  AutomaticSpeechRecognitionPipeline,
  env,
  pipeline,
} from '@huggingface/transformers';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export default class SttModel {
  private readonly logger = new Logger(SttModel.name);
  private transcriber: AutomaticSpeechRecognitionPipeline | void;

  constructor() {
    this.logger.log('Initialize SttModel');

    env.allowRemoteModels = false;
    env.allowLocalModels = true;
    env.useBrowserCache = false;
  }

  async load() {
    this.logger.log('Loading model...');

    this.transcriber = await pipeline(
      'automatic-speech-recognition',
      'whisper-base-en',
    )
      .catch((err) => this.logger.error('Error loading model: ', err))
      .finally(() => this.logger.log('STT model loaded'));
  }

  async getTranscription(audio: Float32Array): Promise<string> {
    if (this.transcriber) {
      const text = await this.transcriber(audio)
        .then((res) => res.text)
        .catch((err) => this.logger.error('Error transcribing: ', err))
        .finally(() => this.logger.log('Transcription complete.'));

      return text ? text : '';
    }

    return '';
  }
}
