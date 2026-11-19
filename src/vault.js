import crypto from 'crypto';

class VaultManager {
  constructor(secretKey = process.env.HYDROGEN_VAULT_KEY) {
    if (!secretKey) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Fatal Security Error: HYDROGEN_VAULT_KEY environment variable is required in production.');
      }
      secretKey = 'hydrogen-secure-development-fallback-key-32bytes';
    }
    this.key = crypto.createHash('sha256').update(secretKey).digest();
  }

  encrypt(text) {
    try {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const tag = cipher.getAuthTag().toString('hex');
      return { iv: iv.toString('hex'), encrypted, tag };
    } catch (err) {
      throw new Error(`Vault encryption failed: ${err.message}`);
    }
  }

  decrypt(payload) {
    try {
      const iv = Buffer.from(payload.iv, 'hex');
      const tag = Buffer.from(payload.tag, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
      decipher.setAuthTag(tag);
      let decrypted = decipher.update(payload.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      throw new Error(`Vault decryption failed: ${err.message}`);
    }
  }
}

export const vault = new VaultManager();
