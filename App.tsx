import React, { useState, useEffect } from 'react';
import { EncryptionMethod, AppMode } from './types';
import { hideText, extractText } from './services/zwService';
import { encryptAES, decryptAES, encryptRSA, decryptRSA } from './services/cryptoService';
import CryptoPanel from './components/CryptoPanel';
import { LockIcon, UnlockIcon, CopyIcon, EyeOffIcon, ArrowRightIcon } from './components/Icons';

export default function App() {
  // Global State
  const [mode, setMode] = useState<AppMode>(AppMode.ENCODE);
  const [method, setMethod] = useState<EncryptionMethod>(EncryptionMethod.NONE);

  // Input States
  const [carrierText, setCarrierText] = useState(''); // Visible text
  const [secretText, setSecretText] = useState(''); // Text to hide
  const [inputDecodeText, setInputDecodeText] = useState(''); // Text to decode

  // Crypto Keys
  const [password, setPassword] = useState('');
  const [rsaKey, setRsaKey] = useState('');

  // Result States
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<{msg: string, type: 'idle' | 'success' | 'error' | 'loading'}>({ msg: '', type: 'idle' });

  // Reset status on input change
  useEffect(() => {
    if (status.type !== 'idle') setStatus({ msg: '', type: 'idle' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carrierText, secretText, inputDecodeText, password, rsaKey, method]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus({ msg: '已复制到剪贴板！', type: 'success' });
      setTimeout(() => setStatus({ msg: '', type: 'idle' }), 2000);
    } catch (err) {
      setStatus({ msg: '复制失败', type: 'error' });
    }
  };

  const handleEncode = async () => {
    if (!secretText) {
      setStatus({ msg: '请输入要隐藏的秘密信息', type: 'error' });
      return;
    }
    
    setStatus({ msg: '正在加密...', type: 'loading' });

    try {
      let payload = secretText;

      // Layer 1: Encryption
      if (method === EncryptionMethod.AES) {
        if (!password) throw new Error("AES 加密需要密码");
        payload = await encryptAES(secretText, password);
      } else if (method === EncryptionMethod.RSA) {
        if (!rsaKey) throw new Error("RSA 加密需要接收者的公钥");
        payload = await encryptRSA(secretText, rsaKey);
      }

      // Layer 2: Steganography
      // If no carrier is provided, we use a single space, but user might want a carrier.
      // We will proceed even if carrier is empty (it will look like invisible text).
      const finalResult = hideText(carrierText, payload);
      
      setOutput(finalResult);
      setStatus({ msg: '加密隐写成功！', type: 'success' });
    } catch (e: any) {
      setStatus({ msg: e.message || '加密失败', type: 'error' });
    }
  };

  const handleDecode = async () => {
    if (!inputDecodeText) {
      setStatus({ msg: '请输入需要解密的文本', type: 'error' });
      return;
    }

    setStatus({ msg: '正在解密...', type: 'loading' });

    try {
      // Layer 1: Steganography
      const extractedPayload = extractText(inputDecodeText);
      
      if (!extractedPayload) {
        throw new Error("在文本中未发现隐藏的零宽字符信息。");
      }

      // Layer 2: Decryption
      let finalSecret = extractedPayload;

      if (method === EncryptionMethod.AES) {
        if (!password) throw new Error("AES 解密需要密码");
        finalSecret = await decryptAES(extractedPayload, password);
      } else if (method === EncryptionMethod.RSA) {
        if (!rsaKey) throw new Error("RSA 解密需要您的私钥");
        finalSecret = await decryptRSA(extractedPayload, rsaKey);
      }

      setOutput(finalSecret);
      setStatus({ msg: '提取解密成功！', type: 'success' });
    } catch (e: any) {
      setStatus({ msg: e.message || '解密失败', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-text p-4 md:p-8 flex items-center justify-center font-sans selection:bg-primary selection:text-white">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar / Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <EyeOffIcon className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-text">ZeroCrypt</h1>
            </div>
            <p className="text-muted text-sm leading-relaxed mb-6">
              利用零宽字符将秘密信息隐藏在普通文本中。生成的文本在视觉上与原文完全一致，但包含了加密数据。
              <br/><br/>
              适用于在公开社交媒体、聊天软件中传输敏感信息。
            </p>
            
            <div className="space-y-2">
               <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">选择加密模式</div>
               <div className="flex flex-col gap-2">
                 <button 
                  onClick={() => setMethod(EncryptionMethod.NONE)}
                  className={`px-4 py-3 rounded-xl border text-left text-sm transition-all shadow-sm ${method === EncryptionMethod.NONE ? 'bg-primary/5 border-primary text-primary ring-1 ring-primary' : 'bg-white border-border text-muted hover:border-primary/50 hover:text-text'}`}
                 >
                   <span className="font-bold block">不加密 (纯隐写)</span>
                   <span className="text-xs opacity-70">仅隐藏文字，无密码保护</span>
                 </button>
                 <button 
                  onClick={() => setMethod(EncryptionMethod.AES)}
                  className={`px-4 py-3 rounded-xl border text-left text-sm transition-all shadow-sm ${method === EncryptionMethod.AES ? 'bg-primary/5 border-primary text-primary ring-1 ring-primary' : 'bg-white border-border text-muted hover:border-primary/50 hover:text-text'}`}
                 >
                   <span className="font-bold block">AES 加密 (对称)</span>
                   <span className="text-xs opacity-70">使用密码保护，双方需知晓密码</span>
                 </button>
                 <button 
                  onClick={() => setMethod(EncryptionMethod.RSA)}
                  className={`px-4 py-3 rounded-xl border text-left text-sm transition-all shadow-sm ${method === EncryptionMethod.RSA ? 'bg-primary/5 border-primary text-primary ring-1 ring-primary' : 'bg-white border-border text-muted hover:border-primary/50 hover:text-text'}`}
                 >
                   <span className="font-bold block">RSA 加密 (非对称)</span>
                   <span className="text-xs opacity-70">使用公私钥对，更高级的安全性</span>
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tabs */}
          <div className="bg-surface p-1.5 rounded-xl flex border border-border shadow-sm">
            <button
              onClick={() => { setMode(AppMode.ENCODE); setOutput(''); setStatus({msg:'', type: 'idle'}); }}
              className={`flex-1 flex items-center justify-center py-3 rounded-lg text-sm font-bold transition-all ${mode === AppMode.ENCODE ? 'bg-secondary text-primary shadow-sm ring-1 ring-border' : 'text-muted hover:text-text hover:bg-slate-50'}`}
            >
              <LockIcon className="w-4 h-4 mr-2" />
              加密 (隐藏)
            </button>
            <button
              onClick={() => { setMode(AppMode.DECODE); setOutput(''); setStatus({msg:'', type: 'idle'}); }}
              className={`flex-1 flex items-center justify-center py-3 rounded-lg text-sm font-bold transition-all ${mode === AppMode.DECODE ? 'bg-secondary text-primary shadow-sm ring-1 ring-border' : 'text-muted hover:text-text hover:bg-slate-50'}`}
            >
              <UnlockIcon className="w-4 h-4 mr-2" />
              解密 (提取)
            </button>
          </div>

          <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm min-h-[500px] flex flex-col relative">
            
            {/* ENCODE MODE UI */}
            {mode === AppMode.ENCODE && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                 <div>
                  <label className="block text-sm font-semibold text-text mb-2">1. 明文载体 (公开显示的文本)</label>
                  <textarea
                    value={carrierText}
                    onChange={(e) => setCarrierText(e.target.value)}
                    placeholder="请输入任何人都能看到的普通文本 (例如一段问候、新闻或推文)..."
                    className="w-full h-24 bg-secondary border border-border text-text p-4 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none placeholder:text-muted/60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-2">2. 秘密信息 (将被隐藏的内容)</label>
                  <textarea
                    value={secretText}
                    onChange={(e) => setSecretText(e.target.value)}
                    placeholder="请输入您想秘密传递的信息..."
                    className="w-full h-24 bg-secondary border border-border text-text p-4 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none placeholder:text-muted/60"
                  />
                </div>

                <CryptoPanel 
                  method={method} 
                  mode="ENCODE" 
                  password={password} 
                  setPassword={setPassword}
                  rsaKey={rsaKey}
                  setRsaKey={setRsaKey}
                />

                <button 
                  onClick={handleEncode}
                  disabled={status.type === 'loading'}
                  className="w-full py-4 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center justify-center active:scale-[0.98]"
                >
                  {status.type === 'loading' ? '正在处理...' : '执行隐写加密'}
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </button>
              </div>
            )}

            {/* DECODE MODE UI */}
            {mode === AppMode.DECODE && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">粘贴包含隐藏信息的文本</label>
                  <textarea
                    value={inputDecodeText}
                    onChange={(e) => setInputDecodeText(e.target.value)}
                    placeholder="在此粘贴收到的可疑文本..."
                    className="w-full h-32 bg-secondary border border-border text-text p-4 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none placeholder:text-muted/60"
                  />
                </div>

                <CryptoPanel 
                  method={method} 
                  mode="DECODE" 
                  password={password} 
                  setPassword={setPassword}
                  rsaKey={rsaKey}
                  setRsaKey={setRsaKey}
                />

                <button 
                  onClick={handleDecode}
                  disabled={status.type === 'loading'}
                  className="w-full py-4 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center justify-center active:scale-[0.98]"
                >
                  {status.type === 'loading' ? '正在处理...' : '提取并解密'}
                  <UnlockIcon className="ml-2 w-5 h-5" />
                </button>
              </div>
            )}

            {/* OUTPUT SECTION */}
            {output && (
              <div className="mt-8 pt-6 border-t border-dashed border-border animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-green-600">
                    {mode === AppMode.ENCODE ? '生成结果 (请复制下方内容)' : '解密出的秘密信息'}
                  </label>
                  <button 
                    onClick={() => copyToClipboard(output)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg flex items-center transition-colors shadow-sm"
                  >
                    <CopyIcon className="w-3 h-3 mr-1.5" />
                    复制结果
                  </button>
                </div>
                <div className="bg-secondary p-4 rounded-xl border border-border text-sm break-all font-mono max-h-40 overflow-y-auto shadow-inner text-text">
                   {output}
                </div>
                {mode === AppMode.ENCODE && (
                   <p className="text-xs text-muted mt-2 flex items-center">
                     <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                     提示：此文本包含不可见的零宽字符，字符长度会比看起来多。
                   </p>
                )}
              </div>
            )}

            {/* STATUS NOTIFICATION */}
            {status.msg && (
              <div className={`absolute bottom-6 left-6 right-6 p-4 rounded-xl text-center font-bold text-sm backdrop-blur-md border shadow-lg ${
                status.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' :
                status.type === 'success' ? 'bg-green-50 border-green-200 text-green-600' :
                'bg-slate-800/90 border-slate-700 text-white'
              } animate-in fade-in slide-in-from-bottom-2`}>
                {status.msg}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}