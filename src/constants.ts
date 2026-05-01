import { resolve } from 'node:path';

import { YtDlpAssetName, YtDlpBinPath } from './types';

import ffmpegPath from 'ffmpeg-static';
import os from 'os';

const platform = os.platform();
const arch = os.arch();

export const ROOT_PATH = resolve(__dirname, '..');
export const BIN_PATH = resolve(ROOT_PATH, 'bin');

const ytDlpAssetName: YtDlpAssetName = {
  win32: {
    x64: 'yt-dlp.exe',
    arm64: 'yt-dlp.exe',
  },
  darwin: {
    x64: 'yt-dlp_macos',
    arm64: 'yt-dlp_macos',
  },
  linux: {
    x64: 'yt-dlp_linux',
    arm64: 'yt-dlp_linux_aarch64',
  },
};

const ytDlpBinPath: YtDlpBinPath = {
  win32: `${BIN_PATH}/yt-dlp.exe`,
  darwin: `${BIN_PATH}/yt-dlp`,
  linux: `${BIN_PATH}/yt-dlp`,
};

export const YT_DLP_ASSET_NAME = ytDlpAssetName[platform]?.[arch] ?? '';
export const YT_DLP_BIN_PATH = ytDlpBinPath[platform] ?? '';
export const FFMPEG_PATH = ffmpegPath ?? '';
