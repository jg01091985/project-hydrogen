import fs from 'fs';
import path from 'path';

class STEValidator {
  validateText(text) {
    const lines = text.split('\n');
    let warnings = 0;
    const issues = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#') || line.startsWith('```') || line.startsWith('-')) continue;

      const sentences = line.split(/[.!?]+/).filter(Boolean);
      for (const sentence of sentences) {
        const words = sentence.trim().split(/\s+/);
        if (words.length > 25) {
          warnings++;
          issues.push({ line: i + 1, sentence: sentence.trim(), count: words.length, message: 'Sentence exceeds 25 words (ASD-STE100 limit).' });
        }
      }
    }
    return { valid: issues.length === 0, warnings, issues };
  }
}

export const steValidator = new STEValidator();
