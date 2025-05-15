import CryptoJS from 'crypto-js';

class CryptoService {
  /**
   * Encrypt data using AES-256 with the provided key
   * @param data Data to encrypt
   * @param key Encryption key (Base64 encoded)
   * @param iv Initialization vector (Base64 encoded)
   * @returns Base64 encoded encrypted data
   */
  encrypt(data: string, key: string, iv: string): string {
    // Convert Base64 key and IV to WordArrays
    const keyWA = CryptoJS.enc.Base64.parse(key);
    const ivWA = CryptoJS.enc.Base64.parse(iv);
    
    // Encrypt the data
    const encrypted = CryptoJS.AES.encrypt(data, keyWA, {
      iv: ivWA,
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.NoPadding
    });
    
    return encrypted.toString();
  }

  /**
   * Decrypt data using AES-256 with the provided key
   * @param encryptedData Base64 encoded encrypted data
   * @param key Encryption key (Base64 encoded)
   * @param iv Initialization vector (Base64 encoded)
   * @returns Decrypted data as a string
   */
  decrypt(encryptedData: string, key: string, iv: string): string {
    // Convert Base64 key and IV to WordArrays
    const keyWA = CryptoJS.enc.Base64.parse(key);
    const ivWA = CryptoJS.enc.Base64.parse(iv);
    
    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(encryptedData, keyWA, {
      iv: ivWA,
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.NoPadding
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Generate a random IV for AES encryption
   * @returns Base64 encoded IV string
   */
  generateIV(): string {
    const randomArray = CryptoJS.lib.WordArray.random(12); // 12 bytes for GCM mode
    return CryptoJS.enc.Base64.stringify(randomArray);
  }

  /**
   * Generate a random salt for PBKDF2
   * @returns Base64 encoded salt
   */
  generateSalt(): string {
    const randomArray = CryptoJS.lib.WordArray.random(16); // 16 bytes salt
    return CryptoJS.enc.Base64.stringify(randomArray);
  }

  /**
   * Generate a key derived from a password using PBKDF2
   * @param password The password to derive a key from
   * @param salt Base64 encoded salt
   * @param iterations Number of iterations (default 10000)
   * @returns Base64 encoded derived key
   */
  deriveKeyFromPassword(password: string, salt: string, iterations: number = 10000): string {
    const saltWA = CryptoJS.enc.Base64.parse(salt);
    const derivedKey = CryptoJS.PBKDF2(password, saltWA, {
      keySize: 256 / 32, // 256 bits
      iterations: iterations,
      hasher: CryptoJS.algo.SHA256
    });
    
    return CryptoJS.enc.Base64.stringify(derivedKey);
  }

  /**
   * Legacy method for backward compatibility
   * @param password The password to derive a key from
   * @returns Base64 encoded derived key
   */
  legacyDeriveKeyFromPassword(password: string): string {
    const derivedKey = CryptoJS.enc.Utf8.parse(password);
    return CryptoJS.enc.Base64.stringify(derivedKey);
  }
}

export default new CryptoService(); 