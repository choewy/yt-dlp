import { YtDlp } from './main';

async function bootstrap() {
  const ytDlp = new YtDlp({ url: 'https://www.youtube.com/watch?v=Nu6G6riBy9o' });

  const thumbnail = await ytDlp.thumbnail().url();
  const video = await ytDlp.mergeFormat('mp4').video().buffer();

  console.log({ video, thumbnail });
}

void bootstrap();
