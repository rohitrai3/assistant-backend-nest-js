import {
  AutomaticSpeechRecognitionPipeline,
  env,
  pipeline,
} from '@huggingface/transformers';
import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path/posix';

@Injectable()
export default class SttModel {
  private readonly logger = new Logger(SttModel.name);
  private transcriber: AutomaticSpeechRecognitionPipeline | void;

  constructor() {
    this.logger.log('Initialize SttModel');

    env.localModelPath = join(process.cwd(), 'src/assets/models/');
    env.allowRemoteModels = false;
    env.allowLocalModels = true;
    env.useBrowserCache = false;
  }

  async load() {
    this.logger.log('Loading model...');

    this.transcriber = await pipeline(
      'automatic-speech-recognition',
      'whisper-tiny-en',
      {
        dtype: {
          encoder_model: 'fp32',
          decoder_model_merged: 'q4',
        },
      },
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
