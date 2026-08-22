'use client';

import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  isListening: boolean;
  stream: MediaStream | null;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ isListening, stream }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;

    if (isListening && stream) {
      try {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
      } catch (e) {
        console.error('AudioContext error:', e);
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      if (isListening && analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 1.5;
        let x = 0;

        ctx.fillStyle = 'rgba(34, 197, 94, 0.85)';
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (height * 0.8);
          ctx.fillRect(x, centerY - barHeight / 2, barWidth - 2, barHeight);
          x += barWidth + 1;
        }
      } else {
        // Ambient sine wave pulse
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
        const time = Date.now() * 0.003;

        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * 0.05 + time) * 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
    };
  }, [isListening, stream]);

  return (
    <div className="w-full flex items-center justify-center my-3">
      <canvas
        ref={canvasRef}
        width={320}
        height={50}
        className="rounded-xl border border-slate-800/60 bg-slate-950/80 shadow-inner"
      />
    </div>
  );
};
