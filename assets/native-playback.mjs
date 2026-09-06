                              
                          
                               
                            
                      
  

export function initializeNativePlayback({ audio, buttons, registration, status }                       ) {
  let selected = buttons.find(button => button.getAttribute('aria-pressed') === 'true') ?? buttons[0];
  function update() {
    registration.textContent = selected.dataset.recordingLabel ;
    status.textContent = `Use the audio controls to play the ${selected.dataset.instrument} recording. Excerpt playback and voice isolation are unavailable in this view.`;
    for (const button of buttons) button.setAttribute('aria-pressed', String(button === selected));
  }
  const listeners = buttons.map(button => {
    button.disabled = false;
    const select = () => {
      if (button === selected) return;
      audio.pause();
      audio.src = `./assets/audio/${button.dataset.instrument}.mp3`;
      selected = button;
      update();
    };
    button.addEventListener('click', select);
    return () => button.removeEventListener('click', select);
  });
  update();
  return {
    get instrument() { return selected.dataset.instrument                     ; },
    dispose() { for (const remove of listeners) remove(); },
  };
}
