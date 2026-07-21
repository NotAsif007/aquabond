// Web Audio API Synthesizer for AquaBond sound effects

let audioFeedbackEnabled = true;

export function setAudioFeedbackEnabled(enabled: boolean) {
  audioFeedbackEnabled = enabled;
}

export function isAudioFeedbackEnabled(): boolean {
  return audioFeedbackEnabled;
}

// Play droplet plop sound
export function playPlop() {
  if (!audioFeedbackEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(580, audioCtx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.22);
    
    gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.22);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.23);
  } catch (e) {
    console.warn("Audio Context sound blocked or not supported", e);
  }
}

// Play sweet synthesized heart burst chime sound
export function playHeartBurstSound() {
  if (!audioFeedbackEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // High chime tone
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.12); // G5
    gain1.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.25);

    // Sweet harmony tone
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.04); // E5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.16); // C6
    gain2.gain.setValueAtTime(0.12, audioCtx.currentTime + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(audioCtx.currentTime + 0.04);
    osc2.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    console.warn("Heart burst sound blocked", e);
  }
}

// Play happy level-up sound
export function playLevelUpSound() {
  if (!audioFeedbackEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    
    notes.forEach((freq, index) => {
      const time = audioCtx.currentTime + index * 0.08;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);
      
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(time);
      osc.stop(time + 0.22);
    });
  } catch (e) {
    console.warn("Level up sound blocked", e);
  }
}
