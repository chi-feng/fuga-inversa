(async () => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const frame = () => new Promise(requestAnimationFrame);
  document.documentElement.style.scrollBehavior = 'auto';
  await document.fonts.ready;
  document.querySelector('#dissonance-and-preparation').scrollIntoView({ behavior: 'instant' });
  await frame(); await frame();
  scrollTo({ top: 0, behavior: 'instant' });
  await frame(); await frame();
  await new Promise(resolve => setTimeout(resolve, 100));
  const activeContents = document.querySelector('.contents a.active');
  assert(activeContents?.getAttribute('href') === '#analysis', 'The contents must return to Introduction above the paper.');
  const download = document.querySelector('.downloads').getBoundingClientRect();
  const alternatives = document.querySelector('.recording-alternatives').getBoundingClientRect();
  assert(alternatives.top > download.bottom, 'The download links overlap the alternatives paragraph.');
  const image = document.querySelector('.full-score img');
  image.scrollIntoView({ behavior: 'instant', block: 'center' });
  await image.decode();
  await frame(); await frame();
  const box = image.getBoundingClientRect();
  const ratioError = Math.abs(box.width / box.height - image.naturalWidth / image.naturalHeight);
  assert(ratioError < .002, 'The complete score is stretched.');
  const large = new Image();
  large.src = image.srcset.split(' ')[0];
  await large.decode();
  assert(large.naturalWidth === 2482, 'The high-density score image is missing.');
  const ui = [...document.querySelectorAll('button, .contents a, .registration, .transport-labels, .edition-data, .player-note, .score-voice-label, .score-scroll-hint, .footer, .downloads, .recording-alternatives')];
  const visibleUi = ui.filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
  const undersized = visibleUi.filter(element => parseFloat(getComputedStyle(element).fontSize) < 16);
  assert(!undersized.length, 'Interface text below 16 px remains: ' + undersized.map(element => element.className || element.tagName));
  const overflows = [...document.querySelectorAll('.shell, .hero, .player, .downloads, .reader-grid, .paper')].filter(element => element.getBoundingClientRect().right > innerWidth + 1);
  assert(!overflows.length && document.documentElement.scrollWidth === document.documentElement.clientWidth, 'The page overflows the viewport.');
  const phone = innerWidth < 760;
  assert(!phone || getComputedStyle(document.querySelector('.hero-score')).display === 'none', 'The illegible phone hero engraving remains.');
  scrollTo({ top: 0, behavior: 'instant' });
  await frame(); await frame();
  return { passed: true, viewport: { width: innerWidth, height: innerHeight }, devicePixelRatio,
    minimumInterfacePixels: Math.min(...visibleUi.map(element => parseFloat(getComputedStyle(element).fontSize))),
    downloadGapPixels: alternatives.top - download.bottom, fullScoreRatioError: ratioError,
    highDensityScore: { width: large.naturalWidth, height: large.naturalHeight },
    phoneHeroEngravingHidden: phone ? true : null, introductionReselected: true, horizontalPageOverflow: false,
    method: 'Chrome at the recorded CSS viewport; a narrow viewport does not establish physical phone behavior.' };
})()
