# ZeroCrypt - Zero-Width Character Steganography Tool
# ZeroCrypt - 零宽字符隐写工具

[English](#english) | [中文](#chinese)

---

<a name="english"></a>
## English

**ZeroCrypt** is a web-based steganography tool that allows you to hide secret messages within normal, visible text using **Zero-Width Characters**. The resulting text looks identical to the original carrier text but contains your hidden data.

### Features
*   **Invisible Encoding**: Embeds data using Zero-Width Space, Non-Joiner, and Joiner characters.
*   **Multiple Security Levels**:
    *   **None**: Plain text hiding (Steganography only).
    *   **AES**: Symmetric encryption (Password protected).
    *   **RSA**: Asymmetric encryption (Public/Private key pair).
*   **Client-Side Only**: All processing happens in your browser. No data is sent to any server.

### How to Use
1.  **Encode**:
    *   Enter a "Carrier Text" (the visible cover text).
    *   Enter the "Secret Message".
    *   (Optional) Select encryption (AES/RSA) and provide credentials.
    *   Click "Encode" and copy the result.
2.  **Decode**:
    *   Paste the text containing hidden characters.
    *   (Optional) Enter the decryption password or private key.
    *   Click "Decode" to reveal the secret.

---

<a name="chinese"></a>
## 中文 (Chinese)

**ZeroCrypt** 是一个基于 Web 的隐写术工具，允许您利用 **零宽字符 (Zero-Width Characters)** 将秘密信息隐藏在普通的可见文本中。处理后的文本在视觉上与原文完全一致，但其中包含了您的加密数据。

### 功能特点
*   **隐形编码**：使用零宽空格、零宽不连字和零宽连字嵌入数据。
*   **多重安全级别**：
    *   **不加密**：仅隐藏文本（纯隐写）。
    *   **AES**：对称加密（密码保护）。
    *   **RSA**：非对称加密（公私钥对保护）。
*   **纯客户端运行**：所有处理均在您的浏览器中完成，没有任何数据会发送到服务器。

### 如何使用
1.  **加密 (隐藏)**：
    *   输入“明文载体”（即公开显示的文本）。
    *   输入“秘密信息”。
    *   （可选）选择加密方式（AES/RSA）并设置密码或密钥。
    *   点击“加密”并复制结果。
2.  **解密 (提取)**：
    *   粘贴包含隐藏字符的文本。
    *   （可选）输入解密密码或私钥。
    *   点击“解密”查看秘密信息。
