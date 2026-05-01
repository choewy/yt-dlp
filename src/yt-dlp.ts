import { FFMPEG_PATH, YT_DLP_BIN_PATH } from './constants';
import { YtDlpOptions, YtDlpRunOptions } from './types';

import { spawn } from 'child_process';
import { existsSync } from 'fs';

export class YtDlp {
  private readonly options: YtDlpOptions = {
    ffmpeg: FFMPEG_PATH,
    format: 'bv*[vcodec^=avc1][ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b',
    noPlaylist: '--no-playlist',
    overwrite: '--force-overwrites',
  };

  ffmpeg(path: string): this {
    this.options.ffmpeg = path;
    return this;
  }

  format(format: string): this {
    this.options.format = format;
    return this;
  }

  output(path: string): this {
    this.options.output = path;
    return this;
  }

  noPlaylist(): this {
    this.options.noPlaylist = '--no-playlist';
    return this;
  }

  mergeFormat(format: 'mp4' | 'mkv' | 'webm'): this {
    this.options.mergeFormat = format;
    return this;
  }

  recodeVideo(format: 'mp4' | 'mkv' | 'webm'): this {
    this.options.recodeVideo = format;
    return this;
  }

  audioOnly(): this {
    this.options.audioOnly = '-x';
    return this;
  }

  audioFormat(format: 'mp3' | 'm4a' | 'aac' | 'wav'): this {
    this.options.audioFormat = format;
    return this;
  }

  url(url: string): this {
    this.options.url = url;
    return this;
  }

  async exec(options?: YtDlpRunOptions) {
    return this.run(this.args(), options);
  }

  args(): string[] {
    if (!this.options.ffmpeg) {
      throw new Error('[@choewy/yt-dlp] ffmpeg is required');
    }

    if (!existsSync(this.options.ffmpeg)) {
      throw new Error('[@choewy/yt-dlp] ffmpeg not found. If you are using pnpm, run: pnpm approve-builds');
    }

    if (!this.options.url) {
      throw new Error('[@choewy/yt-dlp] url is required');
    }

    if (!this.options.output) {
      throw new Error('[@choewy/yt-dlp] output is required');
    }

    if (this.options.audioOnly && this.options.mergeFormat) {
      throw new Error('[@choewy/yt-dlp] audioOnly and mergeFormat cannot be used together');
    }

    const args: string[] = [];

    args.push('--ffmpeg-location', this.options.ffmpeg);

    if (this.options.format) {
      args.push('-f', this.options.format);
    }

    if (this.options.noPlaylist) {
      args.push(this.options.noPlaylist);
    }

    if (this.options.overwrite) {
      args.push(this.options.overwrite);
    }

    if (this.options.mergeFormat) {
      args.push('--merge-output-format', this.options.mergeFormat);
    }

    if (this.options.recodeVideo) {
      args.push('--recode-video', this.options.recodeVideo);
    }

    if (this.options.audioOnly) {
      args.push(this.options.audioOnly);
    }

    if (this.options.audioFormat) {
      args.push('--audio-format', this.options.audioFormat);
    }

    args.push('-o', this.options.output);
    args.push(this.options.url);

    return args;
  }

  private run(args: string[], options?: YtDlpRunOptions) {
    const debug = options?.debug ?? false;

    return new Promise<void>((resolve, reject) => {
      const child = spawn(YT_DLP_BIN_PATH, args, {
        stdio: debug ? 'inherit' : 'pipe',
      });

      let stdout = '';
      let stderr = '';

      if (!debug) {
        child.stdout?.setEncoding('utf-8');
        child.stdout?.on('data', (chunk: string) => {
          stdout += chunk.toString();
        });
        child.stderr?.on('data', (chunk: string) => {
          stderr += chunk.toString();
        });
      }

      child.on('error', reject);
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`[@choewy/yt-dlp] exited with code ${code}\n${stderr || stdout}`));
        }
      });
    });
  }
}
