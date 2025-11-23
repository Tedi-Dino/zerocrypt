import React, { useState } from 'react';
import { EncryptionMethod } from '../types';
import { generateRSAKeys } from '../services/cryptoService';
import { RefreshIcon, CopyIcon } from './Icons';

interface CryptoPanelProps {
  method: EncryptionMethod;
  mode: 'ENCODE' | 'DECODE';
  password: string;
  setPassword: (s: string) => void;
  rsaKey: string;
  setRsaKey: (s: string) => void;
}

const CryptoPanel: React.FC<CryptoPanelProps> = ({ 
  method, 
  mode, 
  password, 
  setPassword,
  rsaKey,
  setRsaKey
}) => {
  const [genLoading, setGenLoading] = useState(false);

  const handleGenerateKeys = async () => {
    setGenLoading(true);
    try {
      const keys = await generateRSAKeys();
      
      if (mode === 'ENCODE') {
        setRsaKey(keys.publicKey);
        alert(`密钥生成成功！\n\n已自动填入【公钥】。\n\n请务必保存以下【私钥】用于解密（这是唯一机会）：\n\n${keys.privateKey}`);
      } else {
        setRsaKey(keys.privateKey);
        alert(`密钥生成成功！\n\n已自动填入【私钥】。\n\n请将以下【公钥】发送给发信人：\n\n${keys.publicKey}`);
      }
    } catch (e) {
      alert("密钥生成失败");
    } finally {
      setGenLoading(false);
    }
  };

  const copyKey = async () => {
    if(!rsaKey) return;
    try {
        await navigator.clipboard.writeText(rsaKey);
        // Small visual feedback could go here, but default browser behavior works for simple UI
    } catch(e) {}
  };

  if (method === EncryptionMethod.NONE) return null;

  return (
    <div className="mt-4 p-4 bg-secondary rounded-lg border border-border animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center">
            {method === 'AES' ? '🔒 AES 安全配置' : '🔑 RSA 安全配置'}
        </span>
      </div>

      {method === EncryptionMethod.AES && (
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            加密密码 (共享密钥)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="设置一个强密码..."
            className="w-full bg-surface border border-border text-text p-2 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      )}

      {method === EncryptionMethod.RSA && (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-muted">
                {mode === 'ENCODE' ? '接收者公钥 (Public Key)' : '您的私钥 (Private Key)'}
              </label>
              <div className="flex gap-2">
                 {rsaKey && (
                     <button
                        onClick={copyKey}
                        className="text-xs flex items-center text-muted hover:text-primary transition-colors"
                        title="复制密钥"
                     >
                         <CopyIcon className="w-3 h-3 mr-1" />
                         复制
                     </button>
                 )}
                <button 
                    onClick={handleGenerateKeys}
                    disabled={genLoading}
                    className="text-xs flex items-center text-primary hover:text-blue-700 transition-colors font-medium"
                >
                    <RefreshIcon className={`w-3 h-3 mr-1 ${genLoading ? 'animate-spin' : ''}`} />
                    生成新密钥对
                </button>
              </div>
            </div>
            <textarea
              value={rsaKey}
              onChange={(e) => setRsaKey(e.target.value)}
              placeholder={mode === 'ENCODE' ? "请粘贴接收者的公钥..." : "请粘贴您的私钥..."}
              className="w-full h-24 bg-surface border border-border text-text p-2 rounded text-[10px] font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none placeholder:text-muted/50"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoPanel;