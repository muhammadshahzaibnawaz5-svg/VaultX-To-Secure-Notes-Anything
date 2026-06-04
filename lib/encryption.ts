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
    if (entry && typeof entry === "object") {
      const e = entry as Record<string, unknown>;
      for (const field of ["title", "content", "username", "password", "url"] as const) {
        if (typeof e[field] === "string") {
          e[field] = this.encryptData(e[field] as string);
        }
      }
    }
    return entry;
  }

  decryptEntry<T>(entry: T): T {
    if (entry && typeof entry === "object") {
      const e = entry as Record<string, unknown>;
      for (const field of ["title", "content", "username", "password", "url"] as const) {
        if (typeof e[field] === "string") {
          e[field] = this.decryptData(e[field] as string);
        }
      }
    }
    return entry;
  }
}

export { CaesarCipher, VaultEncryptor };
