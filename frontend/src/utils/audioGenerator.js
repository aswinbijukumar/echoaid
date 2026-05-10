// Audio generation utilities for sign language learning

class AudioGenerator {
  constructor() {
    this.isSupported = 'speechSynthesis' in window;
    this.voices = [];
    this._keepAliveInterval = null;
    this._currentUtterance = null;
    this.loadVoices();
  }

  // Load available voices
  loadVoices() {
    if (this.isSupported) {
      this.voices = speechSynthesis.getVoices();
      if (this.voices.length === 0) {
        speechSynthesis.addEventListener('voiceschanged', () => {
          this.voices = speechSynthesis.getVoices();
        });
      }
    }
  }

  // Get the best available voice
  getBestVoice() {
    if (!this.isSupported || this.voices.length === 0) return null;
    const preferredVoices = [
      'Google US English',
      'Microsoft Zira Desktop',
      'Microsoft David Desktop',
      'Alex',
      'Samantha'
    ];
    for (const preferred of preferredVoices) {
      const voice = this.voices.find(v => v.name.includes(preferred));
      if (voice) return voice;
    }
    return this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
  }

  // Chrome bug fix: speechSynthesis stops after ~15s — keep it alive
  _startKeepAlive() {
    this._stopKeepAlive();
    this._keepAliveInterval = setInterval(() => {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
        speechSynthesis.resume();
      }
    }, 10000);
  }

  _stopKeepAlive() {
    if (this._keepAliveInterval) {
      clearInterval(this._keepAliveInterval);
      this._keepAliveInterval = null;
    }
  }

  // Generate audio using browser TTS
  generateAudio(text, options = {}) {
    if (!this.isSupported) {
      console.warn('Speech synthesis not supported');
      return Promise.reject('Speech synthesis not supported');
    }

    // Cancel any currently playing speech first
    this.stop();

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = this.getBestVoice();
        if (voice) utterance.voice = voice;

        utterance.lang = options.language || 'en-US';
        utterance.rate = options.rate || 0.8;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        utterance.onend = () => {
          this._stopKeepAlive();
          this._currentUtterance = null;
          resolve('Audio generated successfully');
        };

        utterance.onerror = (event) => {
          this._stopKeepAlive();
          this._currentUtterance = null;
          // 'interrupted' is not a real error — it means we called cancel()
          if (event.error === 'interrupted' || event.error === 'canceled') {
            resolve('cancelled');
          } else {
            reject(`Speech synthesis error: ${event.error}`);
          }
        };

        this._currentUtterance = utterance;
        speechSynthesis.speak(utterance);
        this._startKeepAlive();
      } catch (error) {
        this._stopKeepAlive();
        reject(`Error generating audio: ${error.message}`);
      }
    });
  }

  // Stop current speech
  stop() {
    this._stopKeepAlive();
    if (this.isSupported) {
      speechSynthesis.cancel();
    }
    this._currentUtterance = null;
  }

  // Check if currently speaking
  isSpeaking() {
    return this.isSupported && speechSynthesis.speaking;
  }
}

// Create singleton instance
const audioGenerator = new AudioGenerator();

export default audioGenerator;
