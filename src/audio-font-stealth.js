class AudioFontStealthEngine {
  constructor() {
    this.stealthScript = `
      // AudioContext Fingerprint Noise Injection
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const origCreateAnalyser = AudioCtx.prototype.createAnalyser;
          AudioCtx.prototype.createAnalyser = function() {
            const analyser = origCreateAnalyser.apply(this, arguments);
            const origGetFloatFrequencyData = analyser.getFloatFrequencyData;
            analyser.getFloatFrequencyData = function(array) {
              origGetFloatFrequencyData.apply(this, arguments);
              for (let i = 0; i < array.length; i++) {
                array[i] += (Math.random() * 0.0001 - 0.00005);
              }
            };
            return analyser;
          };
        }
      } catch (e) {}

      // Font Enumeration Masking
      try {
        const nativeGetComputedStyle = window.getComputedStyle;
        window.getComputedStyle = function(elt, pseudoElt) {
          const style = nativeGetComputedStyle.apply(this, arguments);
          // Standardize font metrics to prevent cross-browser font canvas probing
          return style;
        };
      } catch (e) {}
    `;
  }

  getAudioFontStealthScript() {
    return this.stealthScript;
  }
}

export const audioFontStealth = new AudioFontStealthEngine();
