import { Readable } from 'stream';

export type YtDlpAssetName = Partial<Record<NodeJS.Platform, YtDlpAssetNameArchitectureMap>>;
export type YtDlpAssetNameArchitectureMap = Partial<Record<NodeJS.Architecture, string>>;
export type YtDlpBinPath = Partial<Record<NodeJS.Platform, string>>;

export type YtDlpOptionsKey = 'ffmpeg' | 'format' | 'output' | 'noPlaylist' | 'mergeFormat' | 'recodeVideo' | 'audioOnly' | 'audioFormat' | 'url' | 'overwrite';
export type YtDlpOptions = Partial<Record<YtDlpOptionsKey, string>>;
export type YtDlpRunOptions = {
  debug?: boolean;
};

export type YtDlpResult = {
  origin: string;
  title: string;
};

export type YtDlpPathResult = YtDlpResult & {
  path: string;
};

export type YtDlpStreamResult = YtDlpResult & {
  stream: Readable;
};

export type YtDlpBufferResult = YtDlpResult & {
  buffer: Buffer;
};
