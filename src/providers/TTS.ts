import {
  AutoProcessor,
  AutoTokenizer,
  env,
  PreTrainedModel,
  PreTrainedTokenizer,
  Processor,
  SpeechT5ForTextToSpeech,
  SpeechT5HifiGan,
  Tensor,
} from '@huggingface/transformers';
import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path/posix';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { WaveFile } from 'wavefile';
import { Server } from 'socket.io';

config();

@Injectable()
export default class TtsModel {
  private speechModelId = 'speecht5_tts';
  private vocoderModelId = 'speecht5_hifigan';
  private readonly logger = new Logger(TtsModel.name);
  private tokenizer: PreTrainedTokenizer;
  private processor: Processor;
  private model: PreTrainedModel;
  private vocoder: PreTrainedModel;

  constructor() {
    this.logger.log('Initialize SttModel');

    env.localModelPath = join(process.cwd(), 'src/assets/models/');
    env.allowRemoteModels = false;
    env.allowLocalModels = true;
    env.useBrowserCache = false;
  }

  async load() {
    this.logger.log('Loading model...');

    this.tokenizer = await AutoTokenizer.from_pretrained(this.speechModelId);
    this.processor = await AutoProcessor.from_pretrained(this.speechModelId);
    this.model = await SpeechT5ForTextToSpeech.from_pretrained(
      this.speechModelId,
      { dtype: 'fp32' },
    );
    this.vocoder = await SpeechT5HifiGan.from_pretrained(this.vocoderModelId, {
      dtype: 'fp32',
    });
  }

  async synthesizeSpeech(text: string, server: Server) {
    const speaker_embeddings = this.getSpeakerEmbeddings();

    const vocoder = this.vocoder;
    const { input_ids } = this.tokenizer(text);

    // @ts-expect-error: No type declaration for generate_speech
    const { waveform } = await this.model.generate_speech(
      input_ids,
      speaker_embeddings,
      { vocoder },
    );

    const feature_extractor = this.processor.feature_extractor;

    if (feature_extractor && feature_extractor.config) {
      const wav = new WaveFile();
      wav.fromScratch(
        1,
        feature_extractor.config.sampling_rate,
        '32f',
        waveform.data,
      );

      server.emit('speech', wav.toBuffer());
    }
  }

  getSpeakerEmbeddings(): Tensor | null {
    const speakerEmbeddingsPath = process.env.SPEAKER_EMBEDDING_PATH;

    if (!speakerEmbeddingsPath) {
      console.error('Speaker embeddings path not found');

      return null;
    }

    const buffer = readFileSync(speakerEmbeddingsPath);
    const speaker_embeddings_data = new Float32Array(
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length),
    );
    const speakerEmbeddings = new Tensor('float32', speaker_embeddings_data, [
      1,
      speaker_embeddings_data.length,
    ]);

    return speakerEmbeddings;
  }
}
