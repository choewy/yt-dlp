import { YtDlp } from '../src/main';

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
      child.stdout.end(`__YT_DLP_PATH__:${path}\n__YT_DLP_TITLE__:Example Video\n`);
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

      child.stdout.end(`__YT_DLP_PATH__:${path}\n__YT_DLP_TITLE__:Example Video\n`);
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

    const result = await new YtDlp({ url: 'https://example.com/video' }).ffmpeg(__filename).output('./video.%(ext)s').video().download();

    expect(result).toEqual({
      origin: 'https://example.com/video',
      path: './video.mp4',
      title: 'Example Video',
    });
  });

  it('returns the downloaded file as a Buffer', async () => {
    mockDownload('buffer-content');

    const result = await new YtDlp({ url: 'https://example.com/video' }).ffmpeg(__filename).video().buffer();

    expect(result.buffer).toEqual(Buffer.from('buffer-content'));
    expect(result.origin).toBe('https://example.com/video');
    expect(result.title).toBe('Example Video');
  });

  it('returns the downloaded file as a stream', async () => {
    mockDownload('stream-content');

    const result = await new YtDlp({ url: 'https://example.com/video' }).ffmpeg(__filename).video().stream();
    const chunks: Buffer[] = [];

    result.stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    await once(result.stream, 'end');

    expect(Buffer.concat(chunks)).toEqual(Buffer.from('stream-content'));
    expect(result.origin).toBe('https://example.com/video');
    expect(result.title).toBe('Example Video');
  });

  it('extracts audio through the audio API', async () => {
    mockPath('./audio.mp3');

    const result = await new YtDlp({ url: 'https://example.com/video' }).ffmpeg(__filename).mergeFormat('mp4').audioFormat('mp3').output('./audio.%(ext)s').audio().download();
    const [, args] = mockSpawn.mock.calls[0] as unknown as [string, string[]];

    expect(args).toEqual(expect.arrayContaining(['-x', '--audio-format', 'mp3']));
    expect(args).not.toContain('--merge-output-format');
    expect(result).toEqual({
      origin: 'https://example.com/video',
      path: './audio.mp3',
      title: 'Example Video',
    });
  });
});
