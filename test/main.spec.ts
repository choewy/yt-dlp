import { YtDlp } from '../src/yt-dlp';

import { spawn } from 'child_process';
import { EventEmitter, once } from 'events';
import { writeFileSync } from 'fs';
import { PassThrough } from 'stream';

jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

const mockSpawn = jest.mocked(spawn);

function mockPath(path: string) {
  mockSpawn.mockImplementation(() => {
    const child = new EventEmitter() as EventEmitter & {
      stderr: PassThrough;
      stdout: PassThrough;
    };
    child.stderr = new PassThrough();
    child.stdout = new PassThrough();

    process.nextTick(() => {
      child.stdout.end(`${path}\n`);
      child.stderr.end();
      child.emit('close', 0);
    });

    return child as never;
  });
}

function mockDownload(content = 'media') {
  mockSpawn.mockImplementation((_, args) => {
    const child = new EventEmitter() as EventEmitter & {
      stderr: PassThrough;
      stdout: PassThrough;
    };
    child.stderr = new PassThrough();
    child.stdout = new PassThrough();

    process.nextTick(() => {
      const output = args[args.indexOf('-o') + 1];
      const path = output.replace('%(ext)s', 'mp4');

      writeFileSync(path, content);

      child.stdout.end(`${path}\n`);
      child.stderr.end();
      child.emit('close', 0);
    });

    return child as never;
  });
}

describe('YtDlp', () => {
  beforeEach(() => {
    mockSpawn.mockReset();
  });

  it('returns the resolved file path from toPath', async () => {
    mockPath('./video.mp4');

    const path = await new YtDlp().ffmpeg(__filename).url('https://example.com/video').output('./video.%(ext)s').toPath();

    expect(path).toBe('./video.mp4');
  });

  it('returns the downloaded file as a Buffer', async () => {
    mockDownload('buffer-content');

    const buffer = await new YtDlp().ffmpeg(__filename).url('https://example.com/video').toBuffer();

    expect(buffer).toEqual(Buffer.from('buffer-content'));
  });

  it('returns the downloaded file as a stream', async () => {
    mockDownload('stream-content');

    const stream = await new YtDlp().ffmpeg(__filename).url('https://example.com/video').toStream();
    const chunks: Buffer[] = [];

    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    await once(stream, 'end');

    expect(Buffer.concat(chunks)).toEqual(Buffer.from('stream-content'));
  });
});
