(() => {
  const output = {};
  for (const host of document.querySelectorAll('[data-score]')) {
    const source = host.querySelector('svg');
    if (!source) throw new Error(`Figure missing: ${host.dataset.score}`);
    const svg = source.cloneNode(true);
    svg.querySelector('.score-selection')?.remove();
    for (const element of svg.querySelectorAll('[tabindex], [aria-pressed]')) {
      element.removeAttribute('tabindex');
      element.removeAttribute('aria-pressed');
      element.style.opacity = '';
      element.classList.remove('is-sounding');
    }
    svg.removeAttribute('style');
    const box = svg.getAttribute('viewBox').split(/\s+/).map(Number);
    svg.setAttribute('width', `${box[2]}mm`);
    svg.setAttribute('height', `${box[3]}mm`);
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = '.score-annotation-label{font:2.15px Georgia,serif;letter-spacing:.02px}.score-interval-label{font:600 1.7px sans-serif}';
    svg.prepend(style);
    output[host.dataset.score] = new XMLSerializer().serializeToString(svg);
  }
  return output;
})()
