import crypto from 'crypto';

class InstantMessageScrambler {
  constructor(secret = process.env.HYDROGEN_SCRAMBLE_SECRET || 'hydrogen-polymorphic-scramble-key') {
    this.key = crypto.createHash('sha256').update(secret).digest();
  }

  scramble(plainText) {
    if (!plainText || typeof plainText !== 'string') return plainText;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return {
      scrambled: true,
      iv: iv.toString('hex'),
      payload: encrypted,
      tag
    };
  }

  descramble(scrambledObj) {
    if (!scrambledObj || !scrambledObj.scrambled) return scrambledObj;
    try {
      const iv = Buffer.from(scrambledObj.iv, 'hex');
      const tag = Buffer.from(scrambledObj.tag, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
      decipher.setAuthTag(tag);
      let decrypted = decipher.update(scrambledObj.payload, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      throw new Error(`IM Descrambling failed: ${err.message}`);
    }
  }
}

export const imScrambler = new InstantMessageScrambler();
