# @choewy/yt-dlp

A Node.js/TypeScript wrapper around [`yt-dlp`](https://github.com/yt-dlp/yt-dlp).

This package runs a platform-specific `yt-dlp` binary under the hood and uses [`ffmpeg-static`](https://www.npmjs.com/package/ffmpeg-static) as the default FFmpeg executable.

## Features

- Fluent `YtDlp` builder API
- Downloads a platform-specific `yt-dlp` binary during installation
- Uses bundled FFmpeg from `ffmpeg-static` by default
- Supports custom FFmpeg paths
- Supports format selection, output templates, merge/recode formats, and audio extraction
- Enables `--no-playlist` and `--force-overwrites` by default
- Returns downloads as a file path, `Buffer`, or Node.js stream
- Optional debug mode that forwards yt-dlp output

## Installation

```bash
npm install @choewy/yt-dlp
```

```bash
pnpm add @choewy/yt-dlp
```

### pnpm approve-builds

This package uses install scripts in two places:

- `@choewy/yt-dlp` runs `postinstall` to download the platform-specific `yt-dlp` binary.
- `ffmpeg-static` runs an install script to prepare the FFmpeg binary.

With pnpm, build/install scripts can be blocked until they are explicitly approved.

If you install this package with pnpm, run:

```bash
pnpm approve-builds
```

Select both `@choewy/yt-dlp` and `ffmpeg-static` when prompted.

If the package was already installed before approval, rerun install or rebuild the packages:

```bash
pnpm install
```

```bash
pnpm rebuild ffmpeg-static
```

```bash
pnpm rebuild @choewy/yt-dlp
```

If FFmpeg cannot be found, the wrapper throws this hint as well:

```text
[@choewy/yt-dlp] ffmpeg not found. If you are using pnpm, run: pnpm approve-builds
```

## Requirements

- Node.js 18 or newer. The install script uses the global `fetch` API.
- Network access during installation to download the `yt-dlp` release asset.
- A supported operating system and architecture.

## Supported Platforms

| Platform | Architecture | yt-dlp asset |
| -------- | ------------ | ------------ |
| macOS    | `x64`, `arm64` | `yt-dlp_macos` |
| Linux    | `x64` | `yt-dlp_linux` |
| Linux    | `arm64` | `yt-dlp_linux_aarch64` |
| Windows  | `x64`, `arm64` | `yt-dlp.exe` |

## Quick Start

```ts
import { YtDlp } from '@choewy/yt-dlp';

async function main() {
  const path = await new YtDlp()
    .url('https://www.youtube.com/watch?v=VIDEO_ID')
    .output('./video.mp4')
    .mergeFormat('mp4')
    .toPath({ debug: true });

  console.log(path);
}

void main();
```

## Examples

### Download MP4 Video

```ts
import { YtDlp } from '@choewy/yt-dlp';

const path = await new YtDlp()
  .url('https://www.youtube.com/watch?v=VIDEO_ID')
  .output('./video.mp4')
  .mergeFormat('mp4')
  .toPath();
```

### Extract Audio

```ts
import { YtDlp } from '@choewy/yt-dlp';

const path = await new YtDlp()
  .url('https://www.youtube.com/watch?v=VIDEO_ID')
  .output('./audio.%(ext)s')
  .audioOnly()
  .audioFormat('mp3')
  .toPath({ debug: true });
```

### Download as Buffer

```ts
import { YtDlp } from '@choewy/yt-dlp';

const buffer = await new YtDlp()
  .url('https://www.youtube.com/watch?v=VIDEO_ID')
  .mergeFormat('mp4')
  .toBuffer();
```

### Download as Stream

```ts
import { createWriteStream } from 'fs';

import { YtDlp } from '@choewy/yt-dlp';

const stream = await new YtDlp()
  .url('https://www.youtube.com/watch?v=VIDEO_ID')
  .mergeFormat('mp4')
  .toStream();

stream.pipe(createWriteStream('./video.mp4'));
```

### Use a Custom FFmpeg Binary

```ts
import { YtDlp } from '@choewy/yt-dlp';

const path = await new YtDlp()
  .ffmpeg('/usr/local/bin/ffmpeg')
  .url('https://www.youtube.com/watch?v=VIDEO_ID')
  .output('./video.mp4')
  .mergeFormat('mp4')
  .toPath();
```

## API

### `new YtDlp()`

Creates a new builder instance.

Default options:

| Option | Default |
| ------ | ------- |
| FFmpeg | `ffmpeg-static` path |
| Format | `bv*[vcodec^=avc1][ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b` |
| Playlist handling | `--no-playlist` |
| Overwrite handling | `--force-overwrites` |

### Methods

| Method | Description |
| ------ | ----------- |
| `ffmpeg(path: string)` | Sets the FFmpeg executable path passed to `--ffmpeg-location`. |
| `format(format: string)` | Sets the yt-dlp format selector passed to `-f`. |
| `output(path: string)` | Sets the output path or yt-dlp output template passed to `-o`. Required. |
| `noPlaylist()` | Adds `--no-playlist`. This is already enabled by default. |
| `mergeFormat(format)` | Sets `--merge-output-format`. Accepts `mp4`, `mkv`, or `webm`. |
| `recodeVideo(format)` | Sets `--recode-video`. Accepts `mp4`, `mkv`, or `webm`. |
| `audioOnly()` | Adds `-x` to extract audio. |
| `audioFormat(format)` | Sets `--audio-format`. Accepts `mp3`, `m4a`, `aac`, or `wav`. |
| `url(url: string)` | Sets the source URL. Required. |
| `args()` | Builds and returns the yt-dlp argument list without executing it. |
| `toBuffer(options?)` | Runs yt-dlp and returns the downloaded file as a `Buffer`. |
| `toPath(options?)` | Runs yt-dlp, writes to `output(path)`, and returns the resolved file path. |
| `toStream(options?)` | Runs yt-dlp and returns the downloaded file as a Node.js `Readable` stream. |
| `exec(options?)` | Alias for `toPath(options?)` for existing callers. |

`toBuffer()`, `toPath()`, `toStream()`, and `exec()` accept:

```ts
type YtDlpRunOptions = {
  debug?: boolean;
};
```

When `debug` is `true`, yt-dlp output is printed directly. When `debug` is omitted or `false`, output is captured and included in thrown errors.

## Constraints

- `url()` and `output()` must be set before calling `args()` or `toPath()`.
- `toBuffer()` and `toStream()` require `url()` but use a temporary file internally, so `output()` is optional for those methods.
- FFmpeg must exist at the configured path.
- `audioOnly()` and `mergeFormat()` cannot be used together.
- The package currently exposes a library API only; it does not register a package CLI command.

## Development

```bash
pnpm install
pnpm approve-builds
pnpm build
pnpm test
```

Useful scripts:

| Script | Description |
| ------ | ----------- |
| `pnpm build` | Builds TypeScript into `dist`. |
| `pnpm test` | Runs Jest. |
| `pnpm lint` | Runs ESLint with `--fix`. |
| `pnpm dev` | Runs `src/main.ts` with nodemon. |

## Troubleshooting

### `ffmpeg not found`

If you use pnpm, run `pnpm approve-builds` and approve both `@choewy/yt-dlp` and `ffmpeg-static`, then reinstall or rebuild the packages.

You can also provide your own FFmpeg executable:

```ts
new YtDlp().ffmpeg('/path/to/ffmpeg');
```

### `yt-dlp` download failed

The install script downloads from GitHub releases. Check your network, proxy, firewall, or GitHub availability, then reinstall the package.

### Unsupported platform

Only the platform and architecture combinations listed in [Supported Platforms](#supported-platforms) are mapped to a bundled `yt-dlp` release asset.

## License

[MIT](./LICENSE)
