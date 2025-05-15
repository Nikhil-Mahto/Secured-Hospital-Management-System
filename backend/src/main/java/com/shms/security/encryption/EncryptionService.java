package com.shms.security.encryption;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;

@Service
public class EncryptionService {
    
    private static final String AES = "AES";
    private static final String AES_GCM_NOPADDING = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;
    private static final int GCM_IV_LENGTH = 12;
    private static final String PBKDF2_ALGORITHM = "PBKDF2WithHmacSHA256";
    private static final int PBKDF2_ITERATIONS = 10000;
    private static final int PBKDF2_KEY_LENGTH = 256; // bits
    private static final int SALT_LENGTH = 16; // bytes
    
    /**
     * Generate a new AES-256 key
     * @return Base64 encoded string of the key
     */
    public String generateAESKey() throws NoSuchAlgorithmException {
        KeyGenerator keyGenerator = KeyGenerator.getInstance(AES);
        keyGenerator.init(256);
        SecretKey key = keyGenerator.generateKey();
        return Base64.getEncoder().encodeToString(key.getEncoded());
    }
    
    /**
     * Generate a random initialization vector
     * @return Base64 encoded string of the IV
     */
    public String generateIV() {
        byte[] iv = new byte[GCM_IV_LENGTH];
        SecureRandom random = new SecureRandom();
        random.nextBytes(iv);
        return Base64.getEncoder().encodeToString(iv);
    }
    
    /**
     * Generate a random salt
     * @return Base64 encoded string of the salt
     */
    public String generateSalt() {
        byte[] salt = new byte[SALT_LENGTH];
        SecureRandom random = new SecureRandom();
        random.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }
    
    /**
     * Encrypt data using AES-256 GCM
     * @param data Data to encrypt
     * @param keyStr Base64 encoded AES key
     * @param ivStr Base64 encoded initialization vector
     * @return Base64 encoded encrypted data
     */
    public String encrypt(String data, String keyStr, String ivStr) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(keyStr);
        byte[] ivBytes = Base64.getDecoder().decode(ivStr);
        
        SecretKey key = new SecretKeySpec(keyBytes, AES);
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, ivBytes);
        
        Cipher cipher = Cipher.getInstance(AES_GCM_NOPADDING);
        cipher.init(Cipher.ENCRYPT_MODE, key, spec);
        
        byte[] encryptedData = cipher.doFinal(data.getBytes());
        return Base64.getEncoder().encodeToString(encryptedData);
    }
    
    /**
     * Decrypt data using AES-256 GCM
     * @param encryptedDataStr Base64 encoded encrypted data
     * @param keyStr Base64 encoded AES key
     * @param ivStr Base64 encoded initialization vector
     * @return Decrypted data
     */
    public String decrypt(String encryptedDataStr, String keyStr, String ivStr) throws Exception {
        byte[] encryptedData = Base64.getDecoder().decode(encryptedDataStr);
        byte[] keyBytes = Base64.getDecoder().decode(keyStr);
        byte[] ivBytes = Base64.getDecoder().decode(ivStr);
        
        SecretKey key = new SecretKeySpec(keyBytes, AES);
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, ivBytes);
        
        Cipher cipher = Cipher.getInstance(AES_GCM_NOPADDING);
        cipher.init(Cipher.DECRYPT_MODE, key, spec);
        
        byte[] decryptedData = cipher.doFinal(encryptedData);
        return new String(decryptedData);
    }
    
    /**
     * Encrypt an AES key with a password-derived key
     * This would be used to encrypt the patient's AES key with their password
     * @param aesKeyStr The AES key to encrypt
     * @param passwordDerivedKeyStr The password-derived key
     * @param ivStr The initialization vector
     * @return Encrypted AES key
     */
    public String encryptAESKey(String aesKeyStr, String passwordDerivedKeyStr, String ivStr) throws Exception {
        return encrypt(aesKeyStr, passwordDerivedKeyStr, ivStr);
    }
    
    /**
     * Decrypt an AES key with a password-derived key
     * @param encryptedAesKeyStr The encrypted AES key
     * @param passwordDerivedKeyStr The password-derived key
     * @param ivStr The initialization vector
     * @return Decrypted AES key
     */
    public String decryptAESKey(String encryptedAesKeyStr, String passwordDerivedKeyStr, String ivStr) throws Exception {
        return decrypt(encryptedAesKeyStr, passwordDerivedKeyStr, ivStr);
    }
    
    /**
     * Derive a key from a password using PBKDF2
     * @param password The password
     * @param salt The salt (Base64 encoded)
     * @return A key derived from the password (Base64 encoded)
     */
    public String deriveKeyFromPassword(String password, String salt) throws NoSuchAlgorithmException, InvalidKeySpecException {
        byte[] saltBytes = Base64.getDecoder().decode(salt);
        
        PBEKeySpec spec = new PBEKeySpec(
            password.toCharArray(),
            saltBytes,
            PBKDF2_ITERATIONS,
            PBKDF2_KEY_LENGTH
        );
        
        SecretKeyFactory factory = SecretKeyFactory.getInstance(PBKDF2_ALGORITHM);
        byte[] keyBytes = factory.generateSecret(spec).getEncoded();
        
        return Base64.getEncoder().encodeToString(keyBytes);
    }
    
    /**
     * Legacy method to maintain backward compatibility
     * In new code, use the version with salt parameter
     */
    public String deriveKeyFromPassword(String password) {
        try {
            // Use a fixed salt for backward compatibility - this is not secure!
            String fixedSalt = "VGhpc0lzQUZpeGVkU2FsdA=="; // "ThisIsAFixedSalt" in Base64
            return deriveKeyFromPassword(password, fixedSalt);
        } catch (Exception e) {
            // Fallback to old method
            return Base64.getEncoder().encodeToString(password.getBytes());
        }
    }
} 