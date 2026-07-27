import { YtDlpAudioBufferReturnValue, YtDlpAudioDownloadReturnValue, YtDlpAudioStreamReturnValue } from './types';
import { YtDlpConfig } from './yt-dlp.config';
import { YtDlpVideo } from './yt-dlp-video';

export class YtDlpAudio {
  constructor(private readonly config: YtDlpConfig) {}

  download(): Promise<YtDlpAudioDownloadReturnValue> {
    return this.createVideo().download();
  }

  buffer(): Promise<YtDlpAudioBufferReturnValue> {
    return this.createVideo().buffer();
  }

  stream(): Promise<YtDlpAudioStreamReturnValue> {
    return this.createVideo().stream();
  }

  private createVideo(): YtDlpVideo {
    return new YtDlpVideo(this.config.clone().audioOnly(true));
  }
}
