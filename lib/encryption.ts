class CaesarCipher {
  private shift: number;

  constructor(shift: number = 3) {
    this.shift = ((shift % 26) + 26) % 26;
  }

  encrypt(text: string): string {
    if (!text) return "";
    let result = "";
    for (const char of text) {
      if (/[a-zA-Z]/.test(char)) {
        const base = char >= "a" ? 97 : 65;
        const shifted = ((char.charCodeAt(0) - base + this.shift) % 26) + base;
        result += String.fromCharCode(shifted);
      } else {
        result += char;
      }
    }
    return result;
  }

  decrypt(ciphertext: string): string {
    if (!ciphertext) return "";
    const reverse = new CaesarCipher(-this.shift);
    return reverse.encrypt(ciphertext);
  }
}

class VaultEncryptor {
  private cipher: CaesarCipher;

  constructor(masterKey: number = 3) {
    this.cipher = new CaesarCipher(masterKey);
  }

  encryptData(data: string): string {
    return this.cipher.encrypt(data);
  }

  decryptData(data: string): string {
    return this.cipher.decrypt(data);
  }

  encryptEntry<T>(entry: T): T {
    const encrypted = { ...entry } as Record<string, unknown>;
    const fields = ["title", "content", "category", "username", "password", "url", "file_name", "file_type", "file_path", "file_data"] as const;
    for (const field of fields) {
      if (typeof encrypted[field] === "string") {
        encrypted[field] = this.encryptData(encrypted[field] as string);
      }
    }
    return encrypted as T;
  }

  decryptEntry<T>(entry: T): T {
    const decrypted = { ...entry } as Record<string, unknown>;
    const fields = ["title", "content", "category", "username", "password", "url", "file_name", "file_type", "file_path", "file_data"] as const;
    for (const field of fields) {
      if (typeof decrypted[field] === "string") {
        decrypted[field] = this.decryptData(decrypted[field] as string);
      }
    }
    return decrypted as T;
  }
}

export { CaesarCipher, VaultEncryptor };
