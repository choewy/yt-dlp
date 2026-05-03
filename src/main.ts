import { YtDlpConfig, YtDlpThumbnail, YtDlpVideo } from './core';

export class YtDlp extends YtDlpConfig {
  thumbnail(): YtDlpThumbnail {
    return new YtDlpThumbnail(this.clone());
  }

  video(): YtDlpVideo {
    return new YtDlpVideo(this.clone());
  }
}
