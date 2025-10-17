// Audio generation utilities for sign language learning

class AudioGenerator {
  constructor() {
    this.isSupported = 'speechSynthesis' in window;
    this.voices = [];
    this.loadVoices();
  }

  // Load available voices
  loadVoices() {
    if (this.isSupported) {
      this.voices = speechSynthesis.getVoices();
      
      // If voices aren't loaded yet, wait for them
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

    // Prefer natural-sounding voices
    const preferredVoices = [
      'Google US English',
      'Microsoft Zira Desktop',
      'Microsoft David Desktop',
      'Alex',
      'Samantha'
    ];

    // Find preferred voice
    for (const preferred of preferredVoices) {
      const voice = this.voices.find(v => v.name.includes(preferred));
      if (voice) return voice;
    }

    // Fallback to first English voice
    return this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
  }

  // Generate audio using browser TTS
  generateAudio(text, options = {}) {
    if (!this.isSupported) {
      console.warn('Speech synthesis not supported');
      return Promise.reject('Speech synthesis not supported');
    }

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = this.getBestVoice();
        
        if (voice) {
          utterance.voice = voice;
        }

        // Configure speech settings
        utterance.lang = options.language || 'en-US';
        utterance.rate = options.rate || 0.8; // Slower for learning
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        // Event handlers
        utterance.onend = () => resolve('Audio generated successfully');
        utterance.onerror = (event) => reject(`Speech synthesis error: ${event.error}`);

        // Speak the text
        speechSynthesis.speak(utterance);

      } catch (error) {
        reject(`Error generating audio: ${error.message}`);
      }
    });
  }

  // Generate audio and save as file (for admin use)
  async generateAudioFile(text, filename, options = {}) {
    try {
      // First try browser TTS
      await this.generateAudio(text, options);
      
      // For file generation, you'd typically use a backend API
      // This is a placeholder for the actual implementation
      console.log(`Would generate audio file: ${filename} for text: ${text}`);
      
      return {
        success: true,
        filename: filename,
        text: text
      };
    } catch (error) {
      console.error('Error generating audio file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Stop current speech
  stop() {
    if (this.isSupported) {
      speechSynthesis.cancel();
    }
  }

  // Check if currently speaking
  isSpeaking() {
    return this.isSupported && speechSynthesis.speaking;
  }
}

// Create singleton instance
const audioGenerator = new AudioGenerator();

export default audioGenerator;
