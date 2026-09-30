window.SURPRISE_AUDIO = window.SURPRISE_AUDIO || {};
(function() {
  let context = null;
  let masterGain = null;
  let ambientOsc1 = null;
  let ambientOsc2 = null;
  let lfo = null;
  let isMuted = false;
  let enabled = false;

  function createAmbient() {
    context = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = context.createGain();
    masterGain.gain.value = 0.02;
    masterGain.connect(context.destination);

    ambientOsc1 = context.createOscillator();
    ambientOsc1.type = 'triangle';
    ambientOsc1.frequency.value = 130;
    const gain1 = context.createGain();
    gain1.gain.value = 0.014;
    ambientOsc1.connect(gain1).connect(masterGain);

    ambientOsc2 = context.createOscillator();
    ambientOsc2.type = 'sine';
    ambientOsc2.frequency.value = 174.61;
    const gain2 = context.createGain();
    gain2.gain.value = 0.008;
    ambientOsc2.connect(gain2).connect(masterGain);

    lfo = context.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    const lfoGain = context.createGain();
    lfoGain.gain.value = 0.006;
    lfo.connect(lfoGain).connect(masterGain.gain);

    ambientOsc1.start();
    ambientOsc2.start();
    lfo.start();
    enabled = true;
  }

  window.SURPRISE_AUDIO.start = function() {
    if (!enabled) {
      try {
        createAmbient();
      } catch (error) {
        console.warn('Audio initialization failed:', error);
      }
    }
    if (context?.state === 'suspended') {
      context.resume().catch(() => {});
    }
  };

  window.SURPRISE_AUDIO.toggleMute = function() {
    if (!enabled) {
      this.start();
    }
    isMuted = !isMuted;
    if (masterGain && context) {
      const now = context.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.linearRampToValueAtTime(isMuted ? 0.0001 : 0.02, now + 0.28);
    }
    return isMuted;
  };
})();
