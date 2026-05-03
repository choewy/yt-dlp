import { YT_DLP_BIN_PATH } from '../common';

import { spawn } from 'child_process';

export class YtDlpRunner {
  static exec(args: string[], options: { debug?: boolean } = {}): Promise<string> {
    const debug = options.debug ?? false;

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

      child.once('error', reject);

      child.once('close', (code) => {
        const out = Buffer.concat(stdout).toString('utf8');
        const err = Buffer.concat(stderr).toString('utf8');

        if (code === 0) {
          resolve(out);
          return;
        }

        reject(new Error(`[@choewy/yt-dlp] exited with code ${code}\n${err || out}`));
      });
    });
  }
}
