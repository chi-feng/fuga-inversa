const SVG_NS = 'http://www.w3.org/2000/svg';
const VOICE_NAMES = { s: 'Soprano', a: 'Alto', b: 'Bass' };
let instance = 0;

export function annotationGeometry(boxes, lift = 5) {
  if (!boxes.length) throw new Error('An annotation needs at least one notehead.');
  return {
    left: Math.min(...boxes.map(box => box.x)) - 1,
    right: Math.max(...boxes.map(box => box.x + box.width)) + 1,
    top: Math.min(...boxes.map(box => box.y)) - lift,
  };
}

export function resolveAnnotation(figure, annotation) {
  const events = new Map(figure.events.map(event => [event.id, event]));
  return annotation.noteIds.map(id => {
    if (!events.has(id)) throw new Error(`Unknown source note: ${id}`);
    return events.get(id);
  });
}

function svgElement(name, attributes = {}, text = '') {
  const element = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  if (text) element.textContent = text;
  return element;
}

function rootBox(element, svg) {
  const box = element.getBBox();
  const transform = svg.getScreenCTM().inverse().multiply(element.getScreenCTM());
  const points = [
    [box.x, box.y], [box.x + box.width, box.y],
    [box.x, box.y + box.height], [box.x + box.width, box.y + box.height],
  ].map(([x, y]) => new DOMPoint(x, y).matrixTransform(transform));
  const left = Math.min(...points.map(point => point.x));
  const top = Math.min(...points.map(point => point.y));
  return { x: left, y: top, width: Math.max(...points.map(point => point.x)) - left, height: Math.max(...points.map(point => point.y)) - top };
}

function eventDescription(event) {
  const beat = event.onset + 1;
  const duration = event.duration === 1 ? 'one quarter note' : `${event.duration} quarter notes`;
  return `${VOICE_NAMES[event.voice]}, measure ${event.measure}, beat ${beat}: ${event.pitch ?? 'rest'}, ${duration}${event.tie_in ? ', tied from the preceding note' : ''}${event.tie_out ? ', tied forward' : ''}.`;
}

/** Mount trusted LilyPond SVG and attach annotations to its source note IDs. */
export async function mountAnnotatedScore(host, {
  figure, assetBase = './excerpts/', title = `Measures ${figure.start_measure}–${figure.end_measure}`,
  description = 'Select a note to read its pitch, duration and source position.',
  annotations = [], noteDescriptions = {}, minWidth = 600, voiceControlLabel = 'Highlight',
}) {
  const response = await fetch(new URL(figure.svg, new URL(assetBase, document.baseURI)));
  if (!response.ok) throw new Error(`Could not load ${figure.svg}: HTTP ${response.status}`);
  const documentSVG = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
  if (documentSVG.querySelector('parsererror')) throw new Error(`Invalid SVG: ${figure.svg}`);
  const svg = document.importNode(documentSVG.documentElement, true);
  const notes = new Map([...svg.querySelectorAll('[data-note-id]')].map(note => [note.dataset.noteId, note]));
  for (const event of figure.events) {
    if (!notes.has(event.id)) throw new Error(`The engraving is missing ${event.id}.`);
  }
  for (const annotation of annotations) resolveAnnotation(figure, annotation);

  const identifier = `score-component-${++instance}`;
  host.classList.add('annotated-score');
  host.dataset.figure = figure.name;
  host.replaceChildren();
  const toolbar = document.createElement('div');
  toolbar.className = 'score-toolbar';
  toolbar.setAttribute('aria-label', `${title}: ${voiceControlLabel.toLowerCase()} a voice`);
  const toolbarLabel = document.createElement('span');
  toolbarLabel.textContent = voiceControlLabel;
  toolbar.append(toolbarLabel);
  const voiceButtons = new Map();
  for (const [voice, label] of [['all', 'All voices'], ...figure.voices.map(voice => [voice, VOICE_NAMES[voice]])]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.dataset.voiceButton = voice;
    button.setAttribute('aria-pressed', String(voice === 'all'));
    button.addEventListener('click', () => {
      focusVoice(voice);
      host.dispatchEvent(new CustomEvent('voicefocus', { detail: { voice }, bubbles: true }));
    });
    voiceButtons.set(voice, button);
    toolbar.append(button);
  }
  if (figure.voices.length > 1) host.append(toolbar);

  const viewport = document.createElement('div');
  viewport.className = 'score-viewport';
  viewport.tabIndex = 0;
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-label', `${title}. Scroll horizontally on narrow screens. Use the arrow keys to move between notes and Enter to select.`);
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.classList.add('score-svg');
  svg.style.minWidth = `${minWidth}px`;
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', title);
  viewport.append(svg);
  host.append(viewport);
  const scrollHint = document.createElement('p');
  scrollHint.className = 'score-scroll-hint';
  scrollHint.textContent = 'Scroll horizontally to read the full excerpt.';
  scrollHint.hidden = true;
  host.append(scrollHint);
  const resizeObserver = new ResizeObserver(() => {
    scrollHint.hidden = viewport.scrollWidth <= viewport.clientWidth + 1;
  });
  resizeObserver.observe(viewport);

  const controls = document.createElement('div');
  controls.className = 'annotation-controls';
  controls.setAttribute('aria-label', `${title}: analytical annotations`);
  const readout = document.createElement('p');
  readout.className = 'score-readout';
  readout.id = `${identifier}-readout`;
  readout.setAttribute('role', 'status');
  readout.setAttribute('aria-live', 'polite');
  readout.textContent = description;
  const overlay = svgElement('g', { class: 'score-annotations', 'aria-hidden': 'true' });
  const haloLayer = svgElement('g', { class: 'score-selection', 'aria-hidden': 'true' });
  const annotationButtons = new Map();
  const boxes = new Map([...notes].map(([id, note]) => [id, rootBox(note, svg)]));

  for (const annotation of annotations) {
    const events = resolveAnnotation(figure, annotation);
    const { left, right, top } = annotationGeometry(annotation.noteIds.map(id => boxes.get(id)), annotation.lift ?? 5);
    const color = annotation.color ?? '#8c3b2d';
    const group = svgElement('g', { 'data-annotation': annotation.id, 'data-voice': events[0].voice, color, class: 'score-bracket' });
    group.append(svgElement('path', {
      d: `M ${left} ${top + 1.4} V ${top} H ${right} V ${top + 1.4}`,
      fill: 'none', stroke: 'currentColor', 'stroke-width': 0.22,
      ...(annotation.dashed ? { 'stroke-dasharray': '1.1 .8' } : {}),
    }));
    group.append(svgElement('text', { x: left + (right - left) * (annotation.labelFraction ?? .5), y: top - 1.2, 'text-anchor': 'middle', fill: 'currentColor', class: 'score-annotation-label' }, annotation.label));
    if (annotation.intervals) {
      annotation.intervals.forEach((interval, index) => {
        const current = boxes.get(annotation.noteIds[index]);
        const next = boxes.get(annotation.noteIds[index + 1]);
        group.append(svgElement('text', {
          x: (current.x + current.width / 2 + next.x + next.width / 2) / 2,
          y: top + 3.7, 'text-anchor': 'middle', fill: 'currentColor', class: 'score-interval-label',
        }, interval > 0 ? `+${interval}` : String(interval).replace('-', '−')));
      });
    }
    overlay.append(group);
    for (const id of annotation.noteIds) {
      notes.get(id).style.color = color;
      notes.get(id).style.fill = color;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = annotation.label;
    button.style.setProperty('--annotation-color', color);
    button.setAttribute('aria-pressed', 'false');
    button.dataset.annotationButton = annotation.id;
    button.addEventListener('click', () => {
      selectNotes(annotation.noteIds, annotation.description);
      for (const [id, peer] of annotationButtons) peer.setAttribute('aria-pressed', String(id === annotation.id));
    });
    annotationButtons.set(annotation.id, button);
    controls.append(button);
  }

  svg.append(overlay);
  const completeBox = svg.getBBox();
  svg.setAttribute('viewBox', `${completeBox.x - 2} ${completeBox.y - 2} ${completeBox.width + 4} ${completeBox.height + 4}`);
  svg.style.aspectRatio = `${completeBox.width + 4} / ${completeBox.height + 4}`;
  svg.append(haloLayer);
  for (const [eventIndex, event] of figure.events.entries()) {
    const note = notes.get(event.id);
    note.setAttribute('tabindex', eventIndex === 0 ? '0' : '-1');
    note.setAttribute('role', 'button');
    note.setAttribute('aria-label', eventDescription(event));
    note.setAttribute('aria-pressed', 'false');
    note.append(svgElement('title', {}, eventDescription(event)));
    const activate = () => selectNotes([event.id], noteDescriptions[event.id] ?? eventDescription(event));
    note.addEventListener('click', activate);
    note.addEventListener('keydown', keyboardEvent => {
      if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
        keyboardEvent.preventDefault();
        activate();
      } else if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(keyboardEvent.key)) {
        keyboardEvent.preventDefault();
        const nextIndex = keyboardEvent.key === 'Home' ? 0
          : keyboardEvent.key === 'End' ? figure.events.length - 1
            : Math.max(0, Math.min(figure.events.length - 1, eventIndex + (keyboardEvent.key === 'ArrowRight' ? 1 : -1)));
        note.setAttribute('tabindex', '-1');
        const nextNote = notes.get(figure.events[nextIndex].id);
        nextNote.setAttribute('tabindex', '0');
        nextNote.focus();
      }
    });
  }
  if (annotations.length) host.append(controls);
  host.append(readout);
  host.dataset.ready = 'true';

  function focusVoice(voice = 'all') {
    focusVoices(voice === 'all' ? ['s', 'a', 'b'] : [voice]);
  }

  function focusVoices(voices) {
    const selected = new Set(voices);
    const all = ['s', 'a', 'b'].every(voice => selected.has(voice));
    host.dataset.focusVoice = all ? 'all' : voices.join(',') || 'none';
    for (const element of svg.querySelectorAll('[data-voice]')) {
      element.style.opacity = selected.has(element.dataset.voice) ? '1' : '.22';
    }
    for (const [key, button] of voiceButtons) button.setAttribute('aria-pressed', String(key === 'all' ? all : !all && selected.has(key)));
  }

  function selectNotes(ids, text = description) {
    for (const id of ids) if (!notes.has(id)) throw new Error(`Unknown source note: ${id}`);
    haloLayer.replaceChildren();
    for (const note of notes.values()) note.setAttribute('aria-pressed', 'false');
    for (const button of annotationButtons.values()) button.setAttribute('aria-pressed', 'false');
    for (const id of ids) {
      const box = boxes.get(id);
      haloLayer.append(svgElement('rect', { x: box.x - 0.7, y: box.y - 0.7, width: box.width + 1.4, height: box.height + 1.4, rx: .55, fill: 'none', stroke: '#9b641e', 'stroke-width': .25 }));
      notes.get(id).setAttribute('aria-pressed', 'true');
    }
    readout.textContent = text;
    host.dispatchEvent(new CustomEvent('scoreselect', { detail: { figure: figure.name, noteIds: ids }, bubbles: true }));
  }

  return { svg, focusVoice, focusVoices, selectNotes, destroy: () => { resizeObserver.disconnect(); host.replaceChildren(); } };
}
