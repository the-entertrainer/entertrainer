// Audio-Visual Reactivity - Microphone + Ambient Sound Visualization
// Portfolio reacts to ambient sound frequencies in real-time

class AudioReactivity {
  constructor() {
    this.isActive = false;
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.animationId = null;
    this.stream = null;

    this.createToggleButton();
    this.detectMotionReduction();
  }

  detectMotionReduction() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced && this.toggleBtn) {
      this.toggleBtn.disabled = true;
      this.toggleBtn.title = 'Disabled due to motion preference';
    }
  }

  createToggleButton() {
    // Create button in footer
    const footer = document.querySelector('.foot');
    if (!footer) return;

    this.toggleBtn = document.createElement('button');
    this.toggleBtn.id = 'audio-toggle';
    this.toggleBtn.className = 'audio-toggle mono';
    this.toggleBtn.textContent = '🎵 Audio Reactivity';
    this.toggleBtn.title = 'Click to enable audio-reactive visuals (uses microphone)';
    this.toggleBtn.setAttribute('aria-label', 'Enable audio-reactive visuals');
    this.toggleBtn.setAttribute('data-cursor', '');

    this.toggleBtn.addEventListener('click', () => this.toggleAudio());

    // Add after footer text
    footer.parentElement.insertBefore(this.toggleBtn, footer);
  }

  async toggleAudio() {
    if (this.isActive) {
      this.stopAudio();
    } else {
      try {
        await this.startAudio();
      } catch (err) {
        console.warn('Microphone access denied:', err.message);
        alert('Microphone access required for audio reactivity.');
      }
    }
  }

  async startAudio() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.stream);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.isActive = true;
      this.toggleBtn.textContent = '🎵 Audio Reactivity: ON';
      this.toggleBtn.classList.add('audio-toggle--active');
      this.toggleBtn.setAttribute('aria-pressed', 'true');

      this.animate();
    } catch (err) {
      throw err;
    }
  }

  stopAudio() {
    this.isActive = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.toggleBtn.textContent = '🎵 Audio Reactivity';
    this.toggleBtn.classList.remove('audio-toggle--active');
    this.toggleBtn.setAttribute('aria-pressed', 'false');

    // Remove reactivity CSS
    document.body.style.setProperty('--audio-bass', '0');
    document.body.style.setProperty('--audio-mid', '0');
    document.body.style.setProperty('--audio-treble', '0');
    document.body.style.setProperty('--audio-energy', '0');
  }

  animate = () => {
    if (!this.isActive) return;

    this.analyser.getByteFrequencyData(this.dataArray);

    // Analyze frequency bands
    const bass = this.averageFrequency(0, this.dataArray.length / 3) / 255;
    const mid = this.averageFrequency(this.dataArray.length / 3, (this.dataArray.length * 2) / 3) / 255;
    const treble = this.averageFrequency((this.dataArray.length * 2) / 3, this.dataArray.length) / 255;
    const energy = (bass + mid + treble) / 3;

    // Apply CSS variables for reactive effects
    document.body.style.setProperty('--audio-bass', bass);
    document.body.style.setProperty('--audio-mid', mid);
    document.body.style.setProperty('--audio-treble', treble);
    document.body.style.setProperty('--audio-energy', energy);

    // Apply visual effects with lerp for smoothness
    this.applyVisualEffects(bass, mid, treble, energy);

    this.animationId = requestAnimationFrame(this.animate);
  };

  averageFrequency(start, end) {
    let sum = 0;
    const length = end - start;
    for (let i = start; i < end; i++) {
      sum += this.dataArray[i];
    }
    return sum / length;
  }

  applyVisualEffects(bass, mid, treble, energy) {
    const body = document.body;
    const grainOverlay = document.querySelector('.fx-grain');

    // Grain overlay opacity reacts to energy
    if (grainOverlay) {
      grainOverlay.style.opacity = Math.max(0.1, 0.3 + energy * 0.4);
    }

    // Hue rotation on marquee icons (treble band)
    const marquee = document.querySelector('.marquee');
    if (marquee) {
      const hueShift = Math.round(treble * 60);
      marquee.style.filter = `hue-rotate(${hueShift}deg)`;
    }

    // Brightness on hero section (bass band)
    const hero = document.querySelector('.hero');
    if (hero) {
      const brightnessBoost = 1 + bass * 0.15;
      hero.style.filter = `brightness(${brightnessBoost})`;
    }

    // Scale effect on buttons (mid band)
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach((btn, i) => {
      const scale = 1 + mid * 0.08 * (i % 2 === 0 ? 1 : -1);
      btn.style.transform = `scale(${scale})`;
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new AudioReactivity());
} else {
  new AudioReactivity();
}
