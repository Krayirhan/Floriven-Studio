import { useEffect, useRef, useState } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';

interface Props {
  text: string;
  duration?: number;
  className?: string;
  tag?: 'span' | 'h1' | 'h2' | 'h3' | 'p';
}

export function EncryptedText({ text, duration = 1400, className, tag: Tag = 'span' }: Props) {
  const [displayed, setDisplayed] = useState(text);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const totalFrames = 28;
    const delay = 300;
    let frame = 0;

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        if (frame >= totalFrames) {
          setDisplayed(text);
          clearInterval(interval);
          return;
        }
        setDisplayed(
          text
            .split('')
            .map((char, i) => {
              if (char === ' ' || char === '\n' || char === ',' || char === '.') return char;
              if (i / text.length < progress) return char;
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join('')
        );
      }, duration / totalFrames);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, duration]);

  return <Tag className={className}>{displayed}</Tag>;
}
