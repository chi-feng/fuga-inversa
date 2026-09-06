import { excerptRange, quarterAtTime, secondsForQuarter } from '../assets/timeline.mjs';

                                    
                                         
                          
                                                                                                         
                                                                           
                                                  
                                                                              
                                                     
const VOICES          = ['soprano', 'alto', 'bass'];
const PLAYBACK_GAIN_DB = { organ: -2.01, piano: 0 };
const ATTACK_SECONDS = .008;
const PAUSE_SECONDS = .01;
const LOOP_EDGE_SECONDS = .005;

function createPlaybackContext() {
  try {
    // Match the recordings so a high device rate does not enlarge every decoded buffer.
    return new AudioContext({ sampleRate: 48000 });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotSupportedError') return new AudioContext();
    throw error;
  }
}

function loopExcerpt(context              , buffer             , start        , end        ) {
  const first = Math.round(start * buffer.sampleRate);
  const last = Math.min(buffer.length, Math.round(end * buffer.sampleRate));
  const length = last - first;
  if (length < 4) throw new Error('The excerpt is too short to loop.');
  const excerpt = context.createBuffer(buffer.numberOfChannels, length, buffer.sampleRate);
  const edge = Math.min(Math.round(LOOP_EDGE_SECONDS * buffer.sampleRate), Math.floor(length / 2));
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const samples = excerpt.getChannelData(channel);
    samples.set(buffer.getChannelData(channel).subarray(first, last));
    for (let frame = 0; frame < edge; frame++) {
      const weight = frame / edge;
      samples[frame] *= weight;
      samples[length - 1 - frame] *= weight;
    }
  }
  return excerpt;
}

export class ScorePlayer extends EventTarget {
  instrument             = 'organ';
  voices = new Set       (VOICES);
  playing = false;
  loading = false;
  range               = null;
  timings                            ;
  context                      = null;
  buffers = new Map                     ();
  pending = new Map                 ();
  recordedDurations = new Map                    ();
  retiring = new Set          ();
  sources                          = [];
  gains = new Map                ();
  bus                  = null;
  scheduledStop                = null;
  scheduledLevel = 1;
  base = 0;
  started = 0;
  request = 0;
  createContext                    ;
  loadBuffer                                                                                    ;
  assetBase        ;

  constructor({ timings, assetBase = './assets/audio/', createContext = createPlaybackContext,
    loadBuffer = async (context              , url        , signal              ) => {
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error(`Audio could not load (${response.status}).`);
      return context.decodeAudioData(await response.arrayBuffer());
    },
  }                                                                                                
                                                                                                     ) {
    super();
    this.timings = timings;
    this.assetBase = assetBase;
    this.createContext = createContext;
    this.loadBuffer = loadBuffer;
  }

  get timing() { return this.timings[this.instrument]; }
  get duration() { return this.recordedDurations.get(this.instrument) ?? this.timing.quarterStarts.at(-1)  + 5; }
  get playbackGainDb() { return PLAYBACK_GAIN_DB[this.instrument]; }
  get decodedBytes() {
    const held = new Set             ();
    for (const buffers of this.buffers.values()) for (const buffer of Object.values(buffers)) held.add(buffer);
    for (const source of this.sources) if (source.buffer) held.add(source.buffer);
    for (const group of this.retiring) for (const source of group.sources) if (source.buffer) held.add(source.buffer);
    return [...held].reduce((bytes, buffer) => bytes + buffer.length * buffer.numberOfChannels * 4, 0);
  }
  get end() { return this.range ? secondsForQuarter(this.range.endQuarter, this.timing) : this.duration; }
  get position() {
    if (!this.playing || !this.context) return this.base;
    const raw = this.base + Math.max(0, this.context.currentTime - this.started);
    if (this.range?.repeat) {
      const start = secondsForQuarter(this.range.startQuarter, this.timing);
      const length = this.sources[0]?.buffer?.duration ?? this.end - start;
      return start + ((raw - start) % length + length) % length;
    }
    return Math.min(raw, this.end);
  }
  get quarter() { return quarterAtTime(this.position, this.timing); }

  changed() { this.dispatchEvent(new Event('change')); }

  selectedParts()         {
    return this.voices.size === VOICES.length ? ['mix'] : VOICES.filter(voice => this.voices.has(voice));
  }

  pruneBuffers() {
    const wanted = this.selectedParts();
    for (const [instrument, buffers] of this.buffers) {
      if (instrument !== this.instrument) this.buffers.delete(instrument);
      else {
        for (const part of Object.keys(buffers)          ) if (!wanted.includes(part)) delete buffers[part];
        if (!Object.keys(buffers).length) this.buffers.delete(instrument);
      }
    }
  }

  cancelLoads() {
    for (const pending of this.pending.values()) pending.controller.abort();
    this.pending.clear();
  }

  async loadPart(instrument            , part      ) {
    const existing = this.buffers.get(instrument)?.[part];
    if (existing) return existing;
    const key = `${instrument}:${part}`;
    if (this.pending.has(key)) return this.pending.get(key) .promise;
    const controller = new AbortController();
    const name = part === 'mix' ? instrument : `${instrument}-${part}`;
    const promise = this.loadBuffer(this.context , `${this.assetBase}${name}.mp3`, controller.signal).then(buffer => {
      if (controller.signal.aborted) throw new DOMException('Audio loading was cancelled.', 'AbortError');
      const scoreEnd = this.timings[instrument].quarterStarts.at(-1) ;
      if (buffer.duration < scoreEnd - .05) throw new Error('An audio file ends before the final score beat.');
      const duration = this.recordedDurations.get(instrument);
      if (duration !== undefined && Math.abs(buffer.duration - duration) > .05) {
        throw new Error('The voice recordings have different lengths.');
      }
      this.recordedDurations.set(instrument, buffer.duration);
      const buffers = this.buffers.get(instrument) ?? {};
      buffers[part] = buffer;
      this.buffers.set(instrument, buffers);
      return buffer;
    }).finally(() => {
      if (this.pending.get(key)?.promise === promise) this.pending.delete(key);
    });
    this.pending.set(key, { controller, promise });
    return promise;
  }

  async load(instrument            ) {
    this.pruneBuffers();
    await Promise.all(this.selectedParts().map(part => this.loadPart(instrument, part)));
  }

  async play() {
    if (this.playing) return;
    const request = ++this.request;
    this.context ??= this.createContext();
    this.loading = true;
    this.changed();
    try {
      await this.context.resume();
      if (request !== this.request) return;
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
      if (request !== this.request) return;
      this.loading = false;
      this.playing = false;
      this.cancelLoads();
      this.stopNodes();
      this.changed();
      throw error;
    }
  }

  schedule() {
    const context = this.context ;
    const buffers = this.buffers.get(this.instrument) ?? {};
    const parts = this.selectedParts();
    const loopStart = this.range?.repeat ? secondsForQuarter(this.range.startQuarter, this.timing) : null;
    const prepared = new Map(parts.map(part => [part, loopStart === null ? buffers[part] 
      : loopExcerpt(context, buffers[part] , loopStart, this.end)]));
    const when = context.currentTime + .025;
    this.started = when;
    this.bus = context.createGain();
    this.bus.connect(context.destination);
    this.scheduledLevel = 10 ** (this.playbackGainDb / 20);
    this.scheduledStop = null;
    this.bus.gain.setValueAtTime(0, when);
    this.bus.gain.linearRampToValueAtTime(this.scheduledLevel, when + ATTACK_SECONDS);
    if (this.range && !this.range.repeat) {
      const stop = when + this.end - this.base;
      this.scheduledStop = stop;
      this.bus.gain.setValueAtTime(this.scheduledLevel, Math.max(when + ATTACK_SECONDS, stop - .012));
      this.bus.gain.linearRampToValueAtTime(0, stop);
    }
    const weights = this.gainValues();
    for (const part of parts) {
      const source = context.createBufferSource();
      const gain = context.createGain();
      gain.gain.setValueAtTime(weights[part], when);
      source.buffer = prepared.get(part) ;
      source.connect(gain);
      gain.connect(this.bus);
      if (loopStart !== null) {
        source.loop = true;
        source.loopStart = 0;
        source.loopEnd = source.buffer.duration;
        source.start(when, Math.max(0, this.base - loopStart) % source.buffer.duration);
      }
      else if (this.range) source.start(when, this.base, this.end - this.base);
      else source.start(when, this.base);
      this.gains.set(part, gain);
      this.sources.push(source);
    }
    const first = this.sources[0];
    if (first) first.onended = () => {
      if (this.sources[0] !== first) return;
      if (!this.playing || this.range?.repeat) return;
      this.base = this.end;
      this.playing = false;
      this.stopNodes();
      this.changed();
    };
  }

  stopNodes(rampSeconds = 0) {
    const sources = this.sources;
    const gains = [...this.gains.values()];
    const bus = this.bus;
    this.sources = [];
    this.gains.clear();
    this.bus = null;
    const group = { sources };
    let released = false;
    let timer                                           ;
    const release = () => {
      if (released) return;
      released = true;
      if (timer !== undefined) clearTimeout(timer);
      for (const source of sources) { source.onended = null; source.disconnect(); }
      for (const gain of gains) gain.disconnect();
      bus?.disconnect();
      this.retiring.delete(group);
    };
    const now = this.context?.currentTime ?? 0;
    const fade = sources.length && bus ? rampSeconds : 0;
    if (fade) {
      this.retiring.add(group);
      const attack = Math.max(0, Math.min(1, (now - this.started) / ATTACK_SECONDS));
      const ending = this.scheduledStop === null ? 1 : Math.max(0, Math.min(1, (this.scheduledStop - now) / .012));
      bus .gain.cancelScheduledValues(now);
      bus .gain.setValueAtTime(this.scheduledLevel * Math.min(attack, ending), now);
      bus .gain.linearRampToValueAtTime(0, now + fade);
      timer = setTimeout(release, Math.ceil(fade * 1000) + 20);
    }
    for (const source of sources) {
      source.onended = fade ? release : null;
      try { source.stop(now + fade); } catch { /* A source may already have reached its recorded end. */ }
    }
    if (!fade) release();
  }

  pause() {
    this.base = this.position;
    this.request++;
    this.playing = false;
    this.loading = false;
    this.cancelLoads();
    this.stopNodes(PAUSE_SECONDS);
    this.changed();
  }

  seekQuarter(quarter        ) {
    const resume = this.playing;
    this.pause();
    let q = Math.max(0, Math.min(this.timing.quarterStarts.length - 1, quarter));
    if (this.range && (q < this.range.startQuarter || q >= this.range.endQuarter)) this.range = null;
    this.base = secondsForQuarter(q, this.timing);
    if (resume) { this.playing = true; this.schedule(); }
    this.changed();
  }

  async setInstrument(instrument            ) {
    if (instrument === this.instrument) return;
    if (!(instrument in this.timings)) throw new Error('Unknown instrument.');
    const quarter = this.quarter;
    const resume = this.playing || this.loading;
    this.pause();
    this.instrument = instrument;
    this.pruneBuffers();
    this.base = secondsForQuarter(quarter, this.timing);
    this.changed();
    if (resume) await this.play();
  }

  async setVoices(voices         ) {
    if (voices.some(voice => !VOICES.includes(voice))) throw new Error('Unknown voice.');
    const selected = new Set(voices);
    if (selected.size === this.voices.size && [...selected].every(voice => this.voices.has(voice))) return;
    const resume = this.playing || this.loading;
    this.pause();
    this.voices = selected;
    this.pruneBuffers();
    this.changed();
    if (resume) await this.play();
  }

  gainValues()                       {
    const master = this.voices.size === VOICES.length;
    return { mix: Number(master), ...Object.fromEntries(VOICES.map(voice => [voice, Number(!master && this.voices.has(voice))])) }                        ;
  }

  async playExcerpt(first        , last        , repeat = false) {
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
