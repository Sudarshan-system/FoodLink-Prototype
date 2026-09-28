import React, { createContext, useContext, useEffect, useState } from 'react';

export type TextSize = 'normal' | 'large' | 'xlarge';

interface TextSizeContextType {
  textSize: TextSize;
  increaseTextSize: () => void;
  decreaseTextSize: () => void;
  setTextSize: (size: TextSize) => void;
}

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

export const TextSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    try {
      const saved = localStorage.getItem('foodlink_text_size');
      if (saved === 'normal' || saved === 'large' || saved === 'xlarge') return saved;
    } catch {}
    return 'normal';
  });

  const applyTextSize = (size: TextSize) => {
    setTextSizeState(size);
    try {
      localStorage.setItem('foodlink_text_size', size);
    } catch {}

    const root = document.documentElement;
    if (size === 'normal') {
      root.style.fontSize = '100%';
    } else if (size === 'large') {
      root.style.fontSize = '112.5%'; // ~18px base
    } else if (size === 'xlarge') {
      root.style.fontSize = '125%'; // ~20px base
    }
  };

  useEffect(() => {
    applyTextSize(textSize);
  }, []);

  const increaseTextSize = () => {
    if (textSize === 'normal') applyTextSize('large');
    else if (textSize === 'large') applyTextSize('xlarge');
  };

  const decreaseTextSize = () => {
    if (textSize === 'xlarge') applyTextSize('large');
    else if (textSize === 'large') applyTextSize('normal');
  };

  return (
    <TextSizeContext.Provider value={{ textSize, increaseTextSize, decreaseTextSize, setTextSize: applyTextSize }}>
      {children}
    </TextSizeContext.Provider>
  );
};

export const useTextSize = () => {
  const ctx = useContext(TextSizeContext);
  if (!ctx) throw new Error('useTextSize must be used within TextSizeProvider');
  return ctx;
};
