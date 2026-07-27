import { Readable } from 'stream';

export type YtDlpMergeFormat = 'mp4' | 'mkv' | 'webm';
export type YtDlpAudioFormat = 'mp3' | 'm4a' | 'wav';
export type YtDlpThumbnailFormat = 'jpg' | 'png' | 'webp';

export type YtDlpRequiredConfigOptions = {
  /**
   * Target media URL to process.
   * 처리할 대상 미디어 URL입니다.
   *
   * This value is appended as the last argument passed to `yt-dlp`.
   * `yt-dlp` 실행 시 마지막 인자로 전달됩니다.
   *
   * @example https://www.youtube.com/watch?v=VIDEO_ID
   * @example https://youtu.be/VIDEO_ID
   */
  url: string;
};

export type YtDlpOptionalConfigOptions = {
  /**
   * Path to the `ffmpeg` binary or directory.
   * ffmpeg 실행 파일 또는 디렉토리 경로입니다.
   *
   * Maps to `--ffmpeg-location`.
   * `--ffmpeg-location` 옵션으로 전달됩니다.
   *
   * @default ffmpeg-static
   */
  ffmpeg?: string;

  /**
   * yt-dlp format selector.
   * yt-dlp 포맷 선택자입니다.
   *
   * Maps to `--format`.
   * `--format` 옵션으로 전달됩니다.
   *
   * @default 'bv*[vcodec^=avc1][ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b'
   */
  format?: string;

  /**
   * Output filename template or file path.
   * 출력 파일 경로 또는 템플릿입니다.
   *
   * Maps to `-o`.
   * `-o` 옵션으로 전달됩니다.
   *
   * @example '%(title)s.%(ext)s'
   */
  output?: string;

  /**
   * Download only a single video instead of an entire playlist.
   * 플레이리스트 전체가 아닌 단일 영상만 다운로드합니다.
   *
   * Maps to `--no-playlist`.
   * `--no-playlist` 옵션으로 전달됩니다.
   *
   * @default false
   */
  playlist?: boolean;

  /**
   * Container format used when merging video and audio streams.
   * 영상과 오디오 병합 시 사용할 컨테이너 포맷입니다.
   *
   * Maps to `--merge-output-format`.
   * `--merge-output-format` 옵션으로 전달됩니다.
   *
   * @default mp4
   */
  mergeFormat?: YtDlpMergeFormat;

  /**
   * Extract audio only.
   * 오디오만 추출합니다.
   *
   * Maps to `-x`.
   * `-x` 옵션으로 전달됩니다.
   */
  audioOnly?: boolean;

  /**
   * Overwrite existing output files.
   * 기존 파일이 있을 경우 덮어씁니다.
   *
   * Maps to `--force-overwrites`.
   * `--force-overwrites` 옵션으로 전달됩니다.
   *
   * @default true
   */
  overwrite?: boolean;

  /**
   * Audio format used when `audioOnly` is enabled.
   * `audioOnly` 사용 시 적용할 오디오 포맷입니다.
   *
   * Maps to `--audio-format`.
   * `--audio-format` 옵션으로 전달됩니다.
   */
  audioFormat?: YtDlpAudioFormat;

  /**
   * Download only the thumbnail and skip media download.
   * 영상 다운로드 없이 썸네일만 다운로드합니다.
   *
   * Maps to `--skip-download --write-thumbnail`.
   * `--skip-download --write-thumbnail` 옵션으로 전달됩니다.
   */
  thumbnailOnly?: boolean;

  /**
   * Suppress most yt-dlp output.
   * 대부분의 yt-dlp 출력 로그를 숨깁니다.
   *
   * Maps to `--quiet`.
   * `--quiet` 옵션으로 전달됩니다.
   *
   * @default true
   */
  quiet?: boolean;

  /**
   * Suppress warning messages.
   * warning 로그를 숨깁니다.
   *
   * Maps to `--no-warnings`.
   * `--no-warnings` 옵션으로 전달됩니다.
   *
   * @default true
   */
  noWarnings?: boolean;

  /**
   * Disable progress output.
   * 다운로드 진행 상태 출력(progress)을 비활성화합니다.
   *
   * Maps to `--no-progress`.
   * `--no-progress` 옵션으로 전달됩니다.
   *
   * @default true
   */
  noProgress?: boolean;

  /**
   * Restrict filenames to ASCII characters only.
   * 파일명을 ASCII 문자로만 제한합니다.
   *
   * Maps to `--restrict-filenames`.
   * `--restrict-filenames` 옵션으로 전달됩니다.
   */
  restrictFilenames?: boolean;

  /**
   * Base directory used by yt-dlp for output paths.
   * yt-dlp 출력 파일의 기본 경로입니다.
   *
   * Maps to `--paths`.
   * `--paths` 옵션으로 전달됩니다.
   */
  paths?: string;

  /**
   * Number of retries for failed downloads.
   * 다운로드 실패 시 재시도 횟수입니다.
   *
   * Maps to `--retries`.
   * `--retries` 옵션으로 전달됩니다.
   *
   * @default 3
   */
  retries?: number;

  /**
   * Number of retries for failed media fragments.
   * fragment 다운로드 실패 시 재시도 횟수입니다.
   *
   * Maps to `--fragment-retries`.
   * `--fragment-retries` 옵션으로 전달됩니다.
   *
   * @default 3
   */
  fragmentRetries?: number;

  /**
   * Number of fragments to download concurrently.
   * fragment를 동시에 다운로드할 개수입니다.
   *
   * Maps to `--concurrent-fragments`.
   * `--concurrent-fragments` 옵션으로 전달됩니다.
   *
   * @default 4
   */
  concurrentFragments?: number;

  /**
   * Embed the thumbnail into the downloaded media file.
   * 다운로드된 미디어 파일에 썸네일을 삽입합니다.
   *
   * Maps to `--embed-thumbnail`.
   * `--embed-thumbnail` 옵션으로 전달됩니다.
   */
  embedThumbnail?: boolean;

  /**
   * Convert downloaded thumbnails to the given image format.
   * 다운로드된 썸네일을 지정한 이미지 포맷으로 변환합니다.
   *
   * Maps to `--convert-thumbnails`.
   * `--convert-thumbnails` 옵션으로 전달됩니다.
   */
  convertThumbnail?: YtDlpThumbnailFormat;

  /**
   * Print the resolved media metadata as JSON.
   * 미디어 메타데이터를 JSON 형태로 출력합니다.
   *
   * Maps to `--print-json`.
   * `--print-json` 옵션으로 전달됩니다.
   */
  printJson?: boolean;

  debug?: boolean;
};

export type YtDlpConfigOptions = YtDlpRequiredConfigOptions & YtDlpOptionalConfigOptions;
export type YtDlpConfigSetter<TSelf> = {
  [K in keyof YtDlpOptionalConfigOptions]: (value: YtDlpOptionalConfigOptions[K]) => TSelf;
};

export type YtDlpThumbnailExecOptions = {
  debug?: boolean;
};

export type YtDlpVideoReturnValue = {
  origin: string;
  title: string;
};

export type YtDlpVideoDownloadReturnValue = YtDlpVideoReturnValue & {
  path: string;
};

export type YtDlpVideoBufferReturnValue = YtDlpVideoReturnValue & {
  buffer: Buffer;
};

export type YtDlpVideoStreamReturnValue = YtDlpVideoReturnValue & {
  stream: Readable;
};

export type YtDlpAudioReturnValue = YtDlpVideoReturnValue;
export type YtDlpAudioDownloadReturnValue = YtDlpVideoDownloadReturnValue;
export type YtDlpAudioBufferReturnValue = YtDlpVideoBufferReturnValue;
export type YtDlpAudioStreamReturnValue = YtDlpVideoStreamReturnValue;
