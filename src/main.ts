import { YtDlp } from './yt-dlp';

async function main() {
  await new YtDlp()
    .format('bv*[vcodec^=avc1][ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b')
    .mergeFormat('mp4')
    .output('./test/test.mp4')
    .noPlaylist()
    .url('https://www.youtube.com/watch?v=Nu6G6riBy9o')
    .exec();
}

void main();
