import crypto from 'crypto';

class MeshCryptoManager {
  constructor() {
    // Generate secure ephemeral 256-bit key for inter-node encrypted messaging
    this.masterKey = crypto.randomBytes(32);
  }

  encryptPayload(payloadString) {
    try {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, iv);
      let encrypted = cipher.update(payloadString, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const tag = cipher.getAuthTag();
      return {
        success: true,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        encryptedPayload: encrypted
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  decryptPayload(encryptedObj) {
    try {
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        this.masterKey,
        Buffer.from(encryptedObj.iv, 'hex')
      );
      decipher.setAuthTag(Buffer.from(encryptedObj.tag, 'hex'));
      let decrypted = decipher.update(encryptedObj.encryptedPayload, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return { success: true, decrypted };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

export const meshCrypto = new MeshCryptoManager();
