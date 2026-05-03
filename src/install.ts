import { BIN_PATH, YT_DLP_ASSET_NAME, YT_DLP_BIN_PATH } from './common';

import { chmodSync, createWriteStream, mkdirSync } from 'fs';
import os from 'os';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { ReadableStream } from 'stream/web';

async function install() {
  mkdirSync(BIN_PATH, { recursive: true });

  const platform = os.platform();
  const arch = os.arch();

  if (!YT_DLP_BIN_PATH || !YT_DLP_ASSET_NAME) {
    throw new Error(`[@choewy/yt-dlp] Unsupported platform: ${platform}(${arch})`);
  }

  const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${YT_DLP_ASSET_NAME}`;
  const res = await fetch(url, { redirect: 'follow' });

  if (!res.ok || !res.body) {
    throw new Error(`[@choewy/yt-dlp] Download failed: ${res.status}`);
  }

  const fileStream = createWriteStream(YT_DLP_BIN_PATH);
  const nodeStream = Readable.fromWeb(res.body as ReadableStream);

  await pipeline(nodeStream, fileStream);

  if (platform !== 'win32') {
    chmodSync(YT_DLP_BIN_PATH, 0o755);
  }

  console.log(`[@choewy/yt-dlp] yt-dlp installed at ${YT_DLP_BIN_PATH}`);
}

void install();
