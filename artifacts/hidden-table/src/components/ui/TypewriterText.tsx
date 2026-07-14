import { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps { text: string; speed?: number; onComplete?: () => void; className?: string; }

export function TypewriterText({ text, speed = 25, onComplete, className }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed(''); setDone(false); indexRef.current = 0;
    const interval = setInterval(() => {
      if (indexRef.current >= text.length) { clearInterval(interval); setDone(true); onComplete?.(); return; }
      setDisplayed(text.slice(0, indexRef.current + 1)); indexRef.current++;
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  if (done) return <div className={className}>{text}</div>;
  return <div className={className}>{displayed}<span className="animate-pulse">▊</span></div>;
}
