import { YtDlp } from './main';

async function bootstrap() {
  const ytDlp = new YtDlp({ url: 'https://vimeo.com/501958307' });

  const thumbnail = await ytDlp.thumbnail().url();
  const video = await ytDlp.mergeFormat('mp4').video().buffer();

  console.log({ video, thumbnail });
}

void bootstrap();
