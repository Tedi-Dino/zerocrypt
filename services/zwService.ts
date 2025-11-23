// Zero Width Space
const ZWSP = '\u200B'; 
// Zero Width Non-Joiner
const ZWNJ = '\u200C'; 
// Zero Width Joiner (used as start/stop delimiter)
const ZWJ = '\u200D';  

const stringToBinary = (str: string): string => {
  return str.split('').map(char => {
    return char.charCodeAt(0).toString(2).padStart(16, '0');
  }).join('');
};

const binaryToString = (bin: string): string => {
  const bytes = bin.match(/.{1,16}/g) || [];
  return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
};

export const hideText = (visible: string, secret: string): string => {
  if (!visible) visible = " "; // Ensure there is a carrier
  
  // Convert secret to binary
  const binary = stringToBinary(secret);
  
  // Map binary to zero-width chars
  const hidden = binary.split('').map(b => b === '1' ? ZWNJ : ZWSP).join('');
  
  // Wrap in delimiters to help extraction
  const payload = `${ZWJ}${hidden}${ZWJ}`;
  
  // Insert after the first character of the visible text
  // This is often less suspicious than at the very start
  if (visible.length > 0) {
    return visible.slice(0, 1) + payload + visible.slice(1);
  }
  return payload;
};

export const extractText = (text: string): string | null => {
  // Regex to find content between ZWJ delimiters
  // We match ZWSP and ZWNJ inside ZWJ
  const regex = new RegExp(`${ZWJ}([${ZWSP}${ZWNJ}]+)${ZWJ}`);
  const match = text.match(regex);
  
  if (!match) return null;
  
  const rawHidden = match[1];
  
  // Convert back to binary
  const binary = rawHidden.split('').map(c => c === ZWNJ ? '1' : '0').join('');
  
  try {
    return binaryToString(binary);
  } catch (e) {
    console.error("Binary decoding failed", e);
    return null;
  }
};