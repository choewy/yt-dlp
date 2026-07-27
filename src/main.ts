import { YtDlpAudio, YtDlpConfig, YtDlpThumbnail, YtDlpVideo } from './core';

export class YtDlp extends YtDlpConfig {
  audio(): YtDlpAudio {
    return new YtDlpAudio(this.clone());
  }

  thumbnail(): YtDlpThumbnail {
    return new YtDlpThumbnail(this.clone());
  }

  video(): YtDlpVideo {
    return new YtDlpVideo(this.clone());
  }
}
