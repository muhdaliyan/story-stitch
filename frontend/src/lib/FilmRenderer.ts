import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export type RenderTransition = 'none' | 'crossfade' | 'fadeBlack';
export type RenderEffect = 'none' | 'zoomIn' | 'zoomInOut';

export interface RenderAsset {
  scenes: {
    visualUrl: string;   // http://, blob:, or data: URI
    audioUrl: string;    // http://, blob:, or data: URI
    type: 'image' | 'video';
  }[];
  settings?: {
    transition: RenderTransition;
    effect: RenderEffect;
    format: 'short' | 'long';
  };
}

/**
 * Get audio duration using the browser's Audio object.
 */
async function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = url;
    audio.onloadedmetadata = () => resolve(audio.duration);
    audio.onerror = () => resolve(5); // Default to 5s if failed
  });
}

/**
 * Convert any URL type (http, blob, data:) into a Uint8Array for FFmpeg.
 */
async function toUint8Array(url: string): Promise<Uint8Array> {
  if (url.startsWith('data:')) {
    const base64 = url.split(',')[1];
    if (!base64) throw new Error(`Invalid data URI: ${url.slice(0, 40)}`);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch asset: ${url.slice(0, 80)} (${res.status})`);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

export class FilmRenderer {
  private ffmpeg = new FFmpeg();
  private loaded = false;

  async load() {
    if (this.loaded) return;
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    try {
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`,   'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      this.loaded = true;
    } catch (err) {
      console.error('FFmpeg load failed', err);
      throw new Error('FFmpeg failed to load.');
    }
  }

  async render(assets: RenderAsset, onProgress: (p: number) => void): Promise<string> {
    if (assets.scenes.length === 0) throw new Error('No scenes to render.');
    await this.load();

    const settings = assets.settings || { transition: 'none', effect: 'none', format: 'long' };
    const totalScenes = assets.scenes.length;
    let currentSceneIndex = 0;

    const width = settings.format === 'short' ? 720 : 1280;
    const height = settings.format === 'short' ? 1280 : 720;
    const res = `${width}x${height}`;

    this.ffmpeg.on('progress', ({ progress }) => {
      const pct = Math.round(((currentSceneIndex + progress) / (totalScenes + 1)) * 100);
      onProgress(Math.min(pct, 99));
    });

    const outFiles: string[] = [];

    for (let i = 0; i < assets.scenes.length; i++) {
      currentSceneIndex = i;
      const scene = assets.scenes[i];
      const duration = await getAudioDuration(scene.audioUrl);
      
      const visualExt = scene.type === 'video' ? 'mp4' : 'jpg';
      const vName   = `v${i}.${visualExt}`;
      const aName   = `a${i}.mp3`;
      const outName = `out${i}.mp4`;

      await this.ffmpeg.writeFile(vName, await toUint8Array(scene.visualUrl));
      await this.ffmpeg.writeFile(aName, await toUint8Array(scene.audioUrl));

      // ── Build Filter Graph ────────────────────────────────────────────────
      let vFilter = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,format=yuv420p`;
      
      if (scene.type === 'image') {
        // Apply Ken Burns / Zoom Effects
        if (settings.effect === 'zoomIn') {
          vFilter = `zoompan=z='min(zoom+0.0015,1.5)':d=${Math.ceil(duration * 25)}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${res},` + vFilter;
        } else if (settings.effect === 'zoomInOut') {
          vFilter = `zoompan=z='1.1+0.1*sin(in/10)':d=${Math.ceil(duration * 25)}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${res},` + vFilter;
        }
      }

      // Apply Transitions (Fades)
      if (settings.transition === 'fadeBlack' || settings.transition === 'crossfade') {
        const fadeDur = 0.3;
        vFilter += `,fade=t=in:st=0:d=${fadeDur},fade=t=out:st=${duration - fadeDur}:d=${fadeDur}`;
      }

      // ── Encode scene ───────────────────────────────────────────────────────
      // We use ultrafast preset for speed and explicit -t -r for timing
      const args = scene.type === 'image' 
        ? ['-loop', '1', '-i', vName]
        : ['-stream_loop', '-1', '-i', vName];

      await this.ffmpeg.exec([
        ...args,
        '-i',        aName,
        '-t',        duration.toString(),
        '-r',        '25',
        '-c:v',      'libx264',
        '-preset',   'ultrafast',
        '-tune',     'stillimage',
        '-c:a',      'aac',
        '-b:a',      '128k',
        '-pix_fmt',  'yuv420p',
        '-vf',       vFilter,
        outName,
      ]);

      outFiles.push(outName);
    }

    // ── Concatenate ────────────────────────────────────────────────────────
    const listContent = outFiles.map(f => `file '${f}'`).join('\n');
    await this.ffmpeg.writeFile('list.txt', listContent);

    await this.ffmpeg.exec([
      '-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'final.mp4'
    ]);

    const data = await this.ffmpeg.readFile('final.mp4');
    const blob = new Blob([(data as Uint8Array).buffer as ArrayBuffer], { type: 'video/mp4' });
    onProgress(100);
    return URL.createObjectURL(blob);
  }
}

export const filmRenderer = new FilmRenderer();
