# @choewy/yt-dlp

A Node.js / TypeScript wrapper for [`yt-dlp`](https://github.com/yt-dlp/yt-dlp).

This package runs a platform-specific `yt-dlp` binary and uses `ffmpeg-static` by default.

---

## Features

- Fluent builder API
- Download video as file, buffer, or stream
- Fetch thumbnail URL
- Built-in yt-dlp binary (auto-installed)
- Built-in FFmpeg (`ffmpeg-static`)
- Fully typed API
- Debug mode support

---

## Installation

```bash
npm install @choewy/yt-dlp
```

```bash
pnpm add @choewy/yt-dlp
```

---

## pnpm users

This package requires install scripts.

```bash
pnpm approve-builds
```

Approve:

- `@choewy/yt-dlp`
- `ffmpeg-static`

---

## Quick Start

```ts
import { YtDlp } from '@choewy/yt-dlp';

const result = await new YtDlp({
  url: 'https://www.youtube.com/watch?v=VIDEO_ID',
})
  .mergeFormat('mp4')
  .video()
  .download();

console.log(result.path);
```

```ts
import { YtDlp } from '@choewy/yt-dlp';

const result = await new YtDlp({
  url: 'https://vimeo.com/VIDEO_ID',
})
  .mergeFormat('mp4')
  .video()
  .download();

console.log(result.path);
```

---

## Examples

### Download video (file)

```ts
const result = await new YtDlp({ url }).mergeFormat('mp4').output('./video.mp4').video().download();
```

---

### Download as buffer

```ts
const { buffer } = await new YtDlp({ url }).mergeFormat('mp4').video().buffer();
```

---

### Download as stream

```ts
import { createWriteStream } from 'fs';

const { stream } = await new YtDlp({ url }).mergeFormat('mp4').video().stream();

stream.pipe(createWriteStream('./video.mp4'));
```

---

### Extract audio

```ts
const result = await new YtDlp({ url }).audioOnly().audioFormat('mp3').output('./audio.%(ext)s').video().download();
```

---

### Get thumbnail URL

```ts
const thumbnail = await new YtDlp({ url }).thumbnail().url();
```

---

### Custom FFmpeg

```ts
new YtDlp({ url }).ffmpeg('/usr/local/bin/ffmpeg').video().download();
```

---

## API

### `new YtDlp(options)`

```ts
new YtDlp({
  url: string,
});
```

---

## Builder Methods

All methods are chainable.

```ts
ytDlp
  .url(url)
  .format(format)
  .output(path)
  .mergeFormat('mp4')
  .audioOnly()
  .audioFormat('mp3')
  .ffmpeg(path)
  .quiet()
  .noWarnings()
  .noProgress()
  .retries(3)
  .fragmentRetries(3)
  .concurrentFragments(4)
  .debug(true);
```

---

## Configuration Options

| Option                | Type                       | Default         | Description                               |
| --------------------- | -------------------------- | --------------- | ----------------------------------------- |
| `url`                 | `string`                   | **required**    | Target media URL                          |
| `ffmpeg`              | `string`                   | `ffmpeg-static` | Path to ffmpeg binary                     |
| `format`              | `string`                   | mp4 optimized   | yt-dlp format selector                    |
| `output`              | `string`                   | -               | Output path or template (`-o`)            |
| `playlist`            | `boolean`                  | `false`         | Download playlist instead of single video |
| `mergeFormat`         | `'mp4' \| 'mkv' \| 'webm'` | `mp4`           | Merge container format                    |
| `audioOnly`           | `boolean`                  | `false`         | Extract audio only (`-x`)                 |
| `audioFormat`         | `'mp3' \| 'm4a' \| 'wav'`  | -               | Audio format                              |
| `overwrite`           | `boolean`                  | `true`          | Overwrite existing files                  |
| `quiet`               | `boolean`                  | `true`          | Suppress output logs                      |
| `noWarnings`          | `boolean`                  | `true`          | Suppress warnings                         |
| `noProgress`          | `boolean`                  | `true`          | Disable progress output                   |
| `restrictFilenames`   | `boolean`                  | `false`         | Use ASCII filenames only                  |
| `paths`               | `string`                   | -               | Base output directory                     |
| `retries`             | `number`                   | `3`             | Retry count                               |
| `fragmentRetries`     | `number`                   | `3`             | Fragment retry count                      |
| `concurrentFragments` | `number`                   | `4`             | Parallel fragment downloads               |
| `embedThumbnail`      | `boolean`                  | `false`         | Embed thumbnail into media                |
| `convertThumbnail`    | `'jpg' \| 'png' \| 'webp'` | -               | Convert thumbnail format                  |
| `printJson`           | `boolean`                  | `false`         | Output metadata as JSON                   |
| `debug`               | `boolean`                  | `false`         | Print yt-dlp stdout/stderr                |

---

## Video API

```ts
ytDlp.video();
```

### download()

```ts
{
  origin: string;
  title: string;
  path: string;
}
```

---

### buffer()

```ts
{
  origin: string;
  title: string;
  buffer: Buffer;
}
```

---

### stream()

```ts
{
  origin: string;
  title: string;
  stream: Readable;
}
```

---

## Thumbnail API

```ts
ytDlp.thumbnail().url();
```

Returns:

```ts
Promise<string | null>;
```

---

## Constraints

- `url` is required
- `output` is required for `.download()`
- `audioOnly` and `mergeFormat` should not be used together
- FFmpeg must exist

---

## Architecture

```
YtDlp
 ├─ YtDlpConfig
 ├─ YtDlpArgsBuilder
 ├─ YtDlpRunner
 ├─ YtDlpVideo
 └─ YtDlpThumbnail
```

---

## Debug Mode

```ts
new YtDlp({ url }).debug(true).video().download();
```

---

## Development

```bash
pnpm install
pnpm approve-builds
pnpm build
pnpm test
```

---

## License

MIT License

---

## Note

Recommended for stable MP4 downloads:

```ts
new YtDlp({ url }).mergeFormat('mp4').video().download();
```
