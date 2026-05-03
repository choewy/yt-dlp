import { YtDlpVideoBufferReturnValue, YtDlpVideoDownloadReturnValue, YtDlpVideoStreamReturnValue } from './types';
import { YtDlpArgsBuilder } from './yt-dlp.args-builder';
import { YtDlpConfig } from './yt-dlp.config';
import { YtDlpRunner } from './yt-dlp.runner';

import { createReadStream } from 'fs';
import { mkdtemp, readdir, readFile, rm, stat } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export class YtDlpVideo {
  constructor(private readonly config: YtDlpConfig) {}

  async download(): Promise<YtDlpVideoDownloadReturnValue> {
    const options = this.config.values();
    const args = new YtDlpArgsBuilder(options).video();

    const stdout = await YtDlpRunner.exec(args, { debug: options.debug });
    const path = this.parsePath(stdout);
    const title = this.parseTitle(stdout);

    return {
      origin: options.url,
      path,
      title,
    };
  }

  async buffer(): Promise<YtDlpVideoBufferReturnValue> {
    const directory = await mkdtemp(join(tmpdir(), 'yt-dlp-'));
    const cleanup = () => rm(directory, { force: true, recursive: true });

    try {
      const options = this.config.values();
      const output = join(directory, 'download.%(ext)s');
      const args = new YtDlpArgsBuilder(options).video(output);

      const stdout = await YtDlpRunner.exec(args, { debug: options.debug });
      const path = this.parsePath(stdout) || (await this.findDownloadedFile(directory));
      const title = this.parseTitle(stdout);
      const buffer = await readFile(path);

      return {
        origin: options.url,
        title,
        buffer,
      };
    } finally {
      await cleanup();
    }
  }

  async stream(): Promise<YtDlpVideoStreamReturnValue> {
    const directory = await mkdtemp(join(tmpdir(), 'yt-dlp-'));
    const cleanup = () => rm(directory, { force: true, recursive: true });

    const options = this.config.values();
    const output = join(directory, 'download.%(ext)s');
    const args = new YtDlpArgsBuilder(options).video(output);

    try {
      const stdout = await YtDlpRunner.exec(args, { debug: options.debug });
      const path = this.parsePath(stdout) || (await this.findDownloadedFile(directory));
      const title = this.parseTitle(stdout);
      const stream = createReadStream(path);

      stream.once('close', () => {
        void cleanup();
      });

      stream.once('error', () => {
        void cleanup();
      });

      return {
        origin: options.url,
        stream,
        title,
      };
    } catch (e) {
      await cleanup();
      throw e;
    }
  }

  private parsePath(stdout: string): string {
    const prefix = '__YT_DLP_PATH__:';
    const line = stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.startsWith(prefix));

    return line?.slice(prefix.length) ?? '';
  }

  private parseTitle(stdout: string): string {
    const prefix = '__YT_DLP_TITLE__:';
    const line = stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.startsWith(prefix));

    return line?.slice(prefix.length) ?? '';
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
}
