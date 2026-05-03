import { FFMPEG_PATH, YT_DLP_BIN_PATH } from './constants';
import { YtDlpBufferResult, YtDlpOptions, YtDlpPathResult, YtDlpRunOptions, YtDlpStreamResult } from './types';

import { spawn } from 'child_process';
import { createReadStream, existsSync } from 'fs';
import { mkdtemp, readdir, readFile, rm, stat } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

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

  async toBuffer(options?: YtDlpRunOptions): Promise<YtDlpBufferResult> {
    const { cleanup, result } = await this.toTemporaryPath(options);

    try {
      return {
        buffer: await readFile(result.path),
        origin: result.origin,
        title: result.title,
      };
    } finally {
      await cleanup();
    }
  }

  async toPath(options?: YtDlpRunOptions): Promise<YtDlpPathResult> {
    const output = this.requireOutput();
    const stdout = await this.run(this.withResultPrints(this.buildArgs(output)), options);
    const path = this.parsePrintValue(stdout, 'PATH') ?? output;

    return this.toResult(stdout, path);
  }

  async toStream(options?: YtDlpRunOptions): Promise<YtDlpStreamResult> {
    const { cleanup, result } = await this.toTemporaryPath(options);
    const stream = createReadStream(result.path);

    stream.on('close', () => {
      void cleanup();
    });

    return {
      origin: result.origin,
      stream,
      title: result.title,
    };
  }

  /**
   * @deprecated Use `toPath()` instead.
   */
  async exec(options?: YtDlpRunOptions): Promise<YtDlpPathResult> {
    return this.toPath(options);
  }

  args(): string[] {
    return this.buildArgs(this.requireOutput());
  }

  private buildArgs(output: string): string[] {
    if (!this.options.ffmpeg) {
      throw new Error('[@choewy/yt-dlp] ffmpeg is required');
    }

    if (!existsSync(this.options.ffmpeg)) {
      throw new Error('[@choewy/yt-dlp] ffmpeg not found. If you are using pnpm, run: pnpm approve-builds');
    }

    if (!this.options.url) {
      throw new Error('[@choewy/yt-dlp] url is required');
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

    args.push('-o', output);
    args.push(this.options.url);

    return args;
  }

  private async findDownloadedFile(directory: string): Promise<string> {
    const entries = await readdir(directory);

    for (const entry of entries) {
      const path = join(directory, entry);
      const entryStat = await stat(path);

      if (entryStat.isFile()) {
        return path;
      }
    }

    throw new Error('[@choewy/yt-dlp] downloaded file not found');
  }

  private parsePrintValue(stdout: string, key: 'PATH' | 'TITLE'): string | undefined {
    const prefix = `__YT_DLP_${key}__:`;

    return stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.startsWith(prefix))
      ?.slice(prefix.length);
  }

  private requireOutput(): string {
    if (!this.options.output) {
      throw new Error('[@choewy/yt-dlp] output is required');
    }

    return this.options.output;
  }

  private requireUrl(): string {
    if (!this.options.url) {
      throw new Error('[@choewy/yt-dlp] url is required');
    }

    return this.options.url;
  }

  private async toTemporaryPath(options?: YtDlpRunOptions): Promise<{ cleanup: () => Promise<void>; result: YtDlpPathResult }> {
    const directory = await mkdtemp(join(tmpdir(), 'yt-dlp-'));
    const cleanup = () => rm(directory, { force: true, recursive: true });

    try {
      const output = join(directory, 'download.%(ext)s');
      const stdout = await this.run(this.withResultPrints(this.buildArgs(output)), options);
      const path = this.parsePrintValue(stdout, 'PATH') ?? (await this.findDownloadedFile(directory));

      return { cleanup, result: this.toResult(stdout, path) };
    } catch (error) {
      await cleanup();
      throw error;
    }
  }

  private toResult(stdout: string, path: string): YtDlpPathResult {
    return {
      origin: this.requireUrl(),
      path,
      title: this.parsePrintValue(stdout, 'TITLE') ?? '',
    };
  }

  private withResultPrints(args: string[]): string[] {
    const url = args.at(-1);

    if (!url) {
      return args;
    }

    return [...args.slice(0, -1), '--print', 'after_move:__YT_DLP_PATH__:%(filepath)s', '--print', 'after_move:__YT_DLP_TITLE__:%(title)s', url];
  }

  private run(args: string[], options?: YtDlpRunOptions) {
    const debug = options?.debug ?? false;

    return new Promise<string>((resolve, reject) => {
      const child = spawn(YT_DLP_BIN_PATH, args, {
        stdio: ['ignore', 'pipe', debug ? 'inherit' : 'pipe'],
      });

      const stdout: Buffer[] = [];
      const stderr: Buffer[] = [];

      child.stdout?.on('data', (chunk: Buffer) => {
        stdout.push(chunk);

        if (debug) {
          process.stdout.write(chunk);
        }
      });

      if (!debug) {
        child.stderr?.on('data', (chunk: Buffer) => {
          stderr.push(chunk);
        });
      }

      child.on('error', reject);
      child.on('close', (code) => {
        if (code === 0) {
          resolve(Buffer.concat(stdout).toString('utf-8'));
        } else {
          reject(new Error(`[@choewy/yt-dlp] exited with code ${code}\n${Buffer.concat(stderr).toString('utf-8') || Buffer.concat(stdout).toString('utf-8')}`));
        }
      });
    });
  }
}
