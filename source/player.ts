import { excerptRange, quarterAtTime, secondsForQuarter } from '../assets/timeline.mjs';

type Instrument = 'organ' | 'piano';
type Voice = 'soprano' | 'alto' | 'bass';
type Part = Voice | 'mix';
export type Timing = { bars: number; quarterStarts: number[]; gridStarts?: number[]; gridStep?: number };
type Range = { startQuarter: number; endQuarter: number; repeat: boolean };
const PARTS: Part[] = ['mix', 'soprano', 'alto', 'bass'];
const VOICES: Voice[] = ['soprano', 'alto', 'bass'];

export class ScorePlayer extends EventTarget {
  instrument: Instrument = 'organ';
  voices = new Set<Voice>(VOICES);
  playing = false;
  loading = false;
  range: Range | null = null;
  timings: Record<Instrument, Timing>;
  context: AudioContext | null = null;
  buffers = new Map<Instrument, Record<Part, AudioBuffer>>();
  pending = new Map<Instrument, Promise<Record<Part, AudioBuffer>>>();
  sources: AudioBufferSourceNode[] = [];
  gains = new Map<Part, GainNode>();
  bus: GainNode | null = null;
  base = 0;
  started = 0;
  request = 0;
  createContext: () => AudioContext;
  loadBuffer: (context: AudioContext, url: string) => Promise<AudioBuffer>;
  assetBase: string;

  constructor({ timings, assetBase = './assets/audio/', createContext = () => new AudioContext(),
    loadBuffer = async (context: AudioContext, url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Audio could not load (${response.status}).`);
      return context.decodeAudioData(await response.arrayBuffer());
    },
  }: { timings: Record<Instrument, Timing>; assetBase?: string; createContext?: () => AudioContext;
    loadBuffer?: (context: AudioContext, url: string) => Promise<AudioBuffer> }) {
    super();
    this.timings = timings;
    this.assetBase = assetBase;
    this.createContext = createContext;
    this.loadBuffer = loadBuffer;
  }

  get timing() { return this.timings[this.instrument]; }
  get duration() { return this.buffers.get(this.instrument)?.mix.duration ?? this.timing.quarterStarts.at(-1)! + 5; }
  get end() { return this.range ? secondsForQuarter(this.range.endQuarter, this.timing) : this.duration; }
  get position() {
    if (!this.playing || !this.context) return this.base;
    const raw = this.base + Math.max(0, this.context.currentTime - this.started);
    if (this.range?.repeat) {
      const start = secondsForQuarter(this.range.startQuarter, this.timing);
      const length = this.end - start;
      return start + ((raw - start) % length + length) % length;
    }
    return Math.min(raw, this.end);
  }
  get quarter() { return quarterAtTime(this.position, this.timing); }

  changed() { this.dispatchEvent(new Event('change')); }

  async load(instrument: Instrument) {
    if (this.buffers.has(instrument)) return this.buffers.get(instrument)!;
    if (!this.pending.has(instrument)) {
      const context = this.context!;
      const pending = Promise.all(PARTS.map(async part => {
        const name = part === 'mix' ? instrument : `${instrument}-${part}`;
        return [part, await this.loadBuffer(context, `${this.assetBase}${name}.mp3`)] as const;
      })).then(entries => {
        const buffers = Object.fromEntries(entries) as Record<Part, AudioBuffer>;
        const scoreEnd = this.timings[instrument].quarterStarts.at(-1)!;
        if (PARTS.some(part => buffers[part].duration < scoreEnd - .05)) {
          throw new Error('An audio file ends before the final score beat.');
        }
        this.buffers.set(instrument, buffers);
        return buffers;
      }).catch(error => { this.pending.delete(instrument); throw error; });
      this.pending.set(instrument, pending);
    }
    return this.pending.get(instrument)!;
  }

  async play() {
    if (this.playing) return;
    const request = ++this.request;
    this.context ??= this.createContext();
    this.loading = true;
    this.changed();
    try {
      await this.context.resume();
      await this.load(this.instrument);
      if (request !== this.request) return;
      if (this.base >= this.end - .01) {
        this.base = this.range ? secondsForQuarter(this.range.startQuarter, this.timing) : 0;
      }
      this.loading = false;
      this.playing = true;
      this.schedule();
      this.changed();
    } catch (error) {
      if (request === this.request) { this.loading = false; this.changed(); }
      throw error;
    }
  }

  schedule() {
    const context = this.context!;
    const buffers = this.buffers.get(this.instrument)!;
    const when = context.currentTime + .025;
    this.started = when;
    this.bus = context.createGain();
    this.bus.connect(context.destination);
    this.bus.gain.setValueAtTime(this.base > 0 ? 0 : 1, when);
    this.bus.gain.linearRampToValueAtTime(1, when + .008);
    if (this.range && !this.range.repeat) {
      const stop = when + this.end - this.base;
      this.bus.gain.setValueAtTime(1, Math.max(when + .008, stop - .012));
      this.bus.gain.linearRampToValueAtTime(0, stop);
    }
    const weights = this.gainValues();
    for (const part of PARTS) {
      const source = context.createBufferSource();
      const gain = context.createGain();
      gain.gain.setValueAtTime(weights[part], when);
      source.buffer = buffers[part];
      source.connect(gain);
      gain.connect(this.bus);
      if (this.range?.repeat) {
        source.loop = true;
        source.loopStart = secondsForQuarter(this.range.startQuarter, this.timing);
        source.loopEnd = this.end;
      }
      if (this.range && !this.range.repeat) source.start(when, this.base, this.end - this.base);
      else source.start(when, this.base);
      this.gains.set(part, gain);
      this.sources.push(source);
    }
    this.sources[0].onended = () => {
      if (!this.playing || this.range?.repeat) return;
      this.base = this.end;
      this.playing = false;
      this.stopNodes();
      this.changed();
    };
  }

  stopNodes() {
    for (const source of this.sources) {
      source.onended = null;
      try { source.stop(); } catch { /* A source may already have reached its recorded end. */ }
      source.disconnect();
    }
    this.sources = [];
    for (const gain of this.gains.values()) gain.disconnect();
    this.gains.clear();
    this.bus?.disconnect();
    this.bus = null;
  }

  pause() {
    this.base = this.position;
    this.request++;
    this.playing = false;
    this.loading = false;
    this.stopNodes();
    this.changed();
  }

  seekQuarter(quarter: number) {
    const resume = this.playing;
    this.pause();
    let q = Math.max(0, Math.min(this.timing.quarterStarts.length - 1, quarter));
    if (this.range && (q < this.range.startQuarter || q >= this.range.endQuarter)) this.range = null;
    this.base = secondsForQuarter(q, this.timing);
    if (resume) { this.playing = true; this.schedule(); }
    this.changed();
  }

  async setInstrument(instrument: Instrument) {
    if (instrument === this.instrument) return;
    if (!(instrument in this.timings)) throw new Error('Unknown instrument.');
    const quarter = this.quarter;
    const resume = this.playing || this.loading;
    this.pause();
    this.instrument = instrument;
    this.base = secondsForQuarter(quarter, this.timing);
    this.changed();
    if (resume) await this.play();
  }

  setVoices(voices: Voice[]) {
    if (voices.some(voice => !VOICES.includes(voice))) throw new Error('Unknown voice.');
    this.voices = new Set(voices);
    const weights = this.gainValues();
    if (this.context) for (const [part, gain] of this.gains) {
      gain.gain.cancelScheduledValues(this.context.currentTime);
      gain.gain.setTargetAtTime(weights[part], this.context.currentTime, .012);
    }
    this.changed();
  }

  gainValues(): Record<Part, number> {
    const master = this.voices.size === VOICES.length;
    return { mix: Number(master), ...Object.fromEntries(VOICES.map(voice => [voice, Number(!master && this.voices.has(voice))])) } as Record<Part, number>;
  }

  async playExcerpt(first: number, last: number, repeat = false) {
    const { start, startQuarter, endQuarter } = excerptRange(first, last, this.timing);
    this.pause();
    this.range = { startQuarter, endQuarter, repeat };
    this.base = start;
    await this.play();
  }

  clearExcerpt() {
    const quarter = this.quarter;
    this.range = null;
    this.seekQuarter(quarter);
  }

  poll() {
    if (this.playing && !this.range?.repeat && this.position >= this.end) {
      this.base = this.end;
      this.playing = false;
      this.stopNodes();
      this.changed();
    }
  }
}
