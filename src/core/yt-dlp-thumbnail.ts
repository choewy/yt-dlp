import { YtDlpArgsBuilder } from './yt-dlp.args-builder';
import { YtDlpConfig } from './yt-dlp.config';
import { YtDlpRunner } from './yt-dlp.runner';

export class YtDlpThumbnail {
  constructor(private readonly config: YtDlpConfig) {}

  async url(): Promise<string | null> {
    const options = this.config.values();
    const args = new YtDlpArgsBuilder(options).thumbnailUrl();

    const stdout = await YtDlpRunner.exec(args, {
      debug: options.debug,
    });

    return stdout.trim() || null;
  }
}
