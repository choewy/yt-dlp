import { YtDlpConfigOptions } from './types';

export class YtDlpArgsBuilder {
  constructor(private readonly options: YtDlpConfigOptions) {}

  video(output?: string): string[] {
    this.requireUrl();

    const args = this.commonArgs();

    if (this.options.format) {
      args.push('--format', this.options.format);
    }

    const resolvedOutput = output ?? this.options.output;

    if (!resolvedOutput) {
      throw new Error('[@choewy/yt-dlp] output is required');
    }

    args.push('-o', resolvedOutput);

    if (this.options.mergeFormat && !this.options.audioOnly) {
      args.push('--merge-output-format', this.options.mergeFormat);
    }

    if (this.options.audioOnly) {
      args.push('-x');

      if (this.options.audioFormat) {
        args.push('--audio-format', this.options.audioFormat);
      }
    }

    args.push('--print', 'after_move:__YT_DLP_PATH__:%(filepath)s', '--print', 'after_move:__YT_DLP_TITLE__:%(title)s', this.options.url);

    return args;
  }

  thumbnailUrl(): string[] {
    this.requireUrl();

    return [...this.commonArgs(), '--get-thumbnail', this.options.url];
  }

  private commonArgs(): string[] {
    const args: string[] = [];

    if (this.options.ffmpeg) {
      args.push('--ffmpeg-location', this.options.ffmpeg);
    }

    if (this.options.playlist === false) {
      args.push('--no-playlist');
    }

    if (this.options.overwrite) {
      args.push('--force-overwrites');
    }

    if (this.options.quiet) {
      args.push('--quiet');
    }

    if (this.options.noWarnings) {
      args.push('--no-warnings');
    }

    if (this.options.noProgress) {
      args.push('--no-progress');
    }

    if (this.options.retries !== undefined) {
      args.push('--retries', String(this.options.retries));
    }

    if (this.options.fragmentRetries !== undefined) {
      args.push('--fragment-retries', String(this.options.fragmentRetries));
    }

    if (this.options.concurrentFragments !== undefined) {
      args.push('--concurrent-fragments', String(this.options.concurrentFragments));
    }

    return args;
  }

  private requireUrl(): asserts this is this {
    if (!this.options.url) {
      throw new Error('[@choewy/yt-dlp] url is required');
    }
  }
}
