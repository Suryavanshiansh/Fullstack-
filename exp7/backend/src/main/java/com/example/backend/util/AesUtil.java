package com.example.backend.util;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AesUtil {
    private final String secret;

    public AesUtil(@Value("${aes.secret}") String secret) {
        this.secret = secret;
    }

    public String encrypt(String data) throws Exception {
        SecretKeySpec key = createKey();
        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return Base64.getEncoder().encodeToString(cipher.doFinal(data.getBytes()));
    }

    public String decrypt(String encryptedData) throws Exception {
        SecretKeySpec key = createKey();
        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.DECRYPT_MODE, key);
        return new String(cipher.doFinal(Base64.getDecoder().decode(encryptedData)));
    }

    private SecretKeySpec createKey() {
        byte[] key = secret.getBytes(StandardCharsets.UTF_8);
        if (key.length != 16 && key.length != 24 && key.length != 32) {
            throw new IllegalStateException("AES_SECRET must be 16, 24, or 32 bytes long.");
        }
        return new SecretKeySpec(key, "AES");
    }
}
