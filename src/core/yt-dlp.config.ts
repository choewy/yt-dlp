import { FFMPEG_PATH } from '../common';

import { YtDlpConfigOptions, YtDlpConfigSetter, YtDlpMergeFormat, YtDlpThumbnailFormat } from './types';

export class YtDlpConfig implements YtDlpConfigSetter<YtDlpConfig> {
  private readonly options: YtDlpConfigOptions;

  constructor(options: YtDlpConfigOptions) {
    this.options = {
      ffmpeg: FFMPEG_PATH,
      format: 'bv*[vcodec^=avc1][ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b',
      playlist: false,
      overwrite: true,
      quiet: true,
      noWarnings: true,
      noProgress: true,
      retries: 3,
      fragmentRetries: 3,
      concurrentFragments: 4,
      ...options,
    };
  }

  values(): YtDlpConfigOptions {
    return { ...this.options };
  }

  clone(): YtDlpConfig {
    return new YtDlpConfig(this.values());
  }

  get stdio() {
    return this.options.debug ? 'inherit' : 'pipe';
  }

  debug(value?: boolean): this {
    this.options.debug = value;
    return this;
  }

  url(value: string): this {
    this.options.url = value;
    return this;
  }

  ffmpeg(value?: string): this {
    this.options.ffmpeg = value;
    return this;
  }

  format(value?: string): this {
    this.options.format = value;
    return this;
  }

  output(value?: string): this {
    this.options.output = value;
    return this;
  }

  mergeFormat(value?: YtDlpMergeFormat): this {
    this.options.mergeFormat = value;
    return this;
  }

  audioOnly(value?: boolean): this {
    this.options.audioOnly = value;
    return this;
  }

  overwrite(value?: boolean): this {
    this.options.overwrite = value;
    return this;
  }

  playlist(value?: boolean): this {
    this.options.playlist = value;
    return this;
  }

  audioFormat(value?: 'mp3' | 'm4a' | 'wav'): this {
    this.options.audioFormat = value;
    return this;
  }

  thumbnailOnly(value?: boolean): this {
    this.options.thumbnailOnly = value;
    return this;
  }

  quiet(value?: boolean): this {
    this.options.quiet = value;
    return this;
  }

  noWarnings(value?: boolean): this {
    this.options.noWarnings = value;
    return this;
  }

  noProgress(value?: boolean): this {
    this.options.noProgress = value;
    return this;
  }

  restrictFilenames(value?: boolean): this {
    this.options.restrictFilenames = value;
    return this;
  }

  paths(value?: string): this {
    this.options.paths = value;
    return this;
  }

  retries(value?: number): this {
    this.options.retries = value;
    return this;
  }

  fragmentRetries(value?: number): this {
    this.options.fragmentRetries = value;
    return this;
  }

  concurrentFragments(value?: number): this {
    this.options.concurrentFragments = value;
    return this;
  }

  embedThumbnail(value?: boolean): this {
    this.options.embedThumbnail = value;
    return this;
  }

  convertThumbnail(value?: YtDlpThumbnailFormat): this {
    this.options.convertThumbnail = value;
    return this;
  }

  printJson(value?: boolean): this {
    this.options.printJson = value;
    return this;
  }
}
