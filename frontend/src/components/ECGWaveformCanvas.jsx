import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Activity,
  Maximize2
} from 'lucide-react';

export default function ECGWaveformCanvas({
  signal = [],
  title = "ECG Heartbeat Waveform",
  samplingRate = 125, // MIT-BIH dataset resampled at 125 Hz
  highlightPeak = true,
  height = 240,
  badge = null
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [startX, setStartX] = useState(0);

  // Reset zoom & pan when a new signal is loaded
  useEffect(() => {
    setZoom(1);
    setPanOffset(0);
  }, [signal]);

  // Find R-peak (maximum amplitude) index
  const rPeakIndex = useMemo(() => {
    if (!signal || signal.length === 0) return -1;
    let maxIdx = 0;
    let maxVal = signal[0];
    for (let i = 1; i < signal.length; i++) {
      if (signal[i] > maxVal) {
        maxVal = signal[i];
        maxIdx = i;
      }
    }
    return maxIdx;
  }, [signal]);

  // Draw medical ECG grid and waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const canvasHeight = canvas.height;

    // Clear background
    ctx.fillStyle = '#090d16'; // Deep medical dark
    ctx.fillRect(0, 0, width, canvasHeight);

    // 1. Draw ECG Grid (Classic 1mm & 5mm pink/cyan medical scale)
    const smallGrid = 15;
    const largeGrid = smallGrid * 5;

    // Small grid lines
    ctx.strokeStyle = '#1e293b55';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x < width; x += smallGrid) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
    }
    for (let y = 0; y < canvasHeight; y += smallGrid) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Large grid lines (standard 0.20s blocks)
    ctx.strokeStyle = '#0284c728';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    for (let x = 0; x < width; x += largeGrid) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
    }
    for (let y = 0; y < canvasHeight; y += largeGrid) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // 2. Draw Baseline (0.0 mV / reference line)
    const paddingY = 28;
    const plotHeight = canvasHeight - paddingY * 2;
    const baselineY = canvasHeight - paddingY;

    ctx.strokeStyle = '#38bdf840';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, baselineY);
    ctx.lineTo(width, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);

    if (!signal || signal.length < 2) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No ECG waveform loaded. Select a demo sample or upload a signal.', width / 2, canvasHeight / 2);
      return;
    }

    // 3. Plot ECG Waveform with Zoom & Pan
    const minVal = 0.0;
    const maxVal = 1.0;
    const range = maxVal - minVal || 1.0;

    const visibleWidth = width * zoom;
    const stepX = visibleWidth / (signal.length - 1);

    // Waveform glow effect
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    signal.forEach((val, i) => {
      const x = i * stepX + panOffset;
      // Invert Y so high amplitude peaks go UP
      const normalizedY = (val - minVal) / range;
      const y = canvasHeight - paddingY - normalizedY * plotHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.shadowBlur = 0; // reset glow

    // 4. Highlight R-Peak annotation if enabled
    if (highlightPeak && rPeakIndex >= 0 && rPeakIndex < signal.length) {
      const peakX = rPeakIndex * stepX + panOffset;
      const peakVal = signal[rPeakIndex];
      const peakY = canvasHeight - paddingY - ((peakVal - minVal) / range) * plotHeight;

      // Marker circle
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(peakX, peakY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Pulse ring
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(peakX, peakY, 7.5, 0, Math.PI * 2);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('R-Peak', peakX, peakY - 12);
    }

    // 5. Axes Calibration Legends
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('1.00 mV (Max)', 10, paddingY - 8);
    ctx.fillText('0.00 mV (Isoelectric)', 10, baselineY + 16);

    const totalDurationSec = (signal.length / samplingRate).toFixed(2);
    ctx.textAlign = 'right';
    ctx.fillText(`Duration: ~${totalDurationSec}s (${signal.length} pts @ ${samplingRate}Hz)`, width - 12, baselineY + 16);

  }, [signal, zoom, panOffset, highlightPeak, rPeakIndex, samplingRate]);

  // Adjust canvas resolution for high-DPI screens
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = height * (window.devicePixelRatio || 1);
    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }, [height]);

  // Pan interaction handlers
  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    setStartX(e.clientX - panOffset);
  };

  const handleMouseMove = (e) => {
    if (!isPanning || zoom <= 1) return;
    const newOffset = e.clientX - startX;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maxPan = 0;
    const minPan = -(canvas.width / (window.devicePixelRatio || 1)) * (zoom - 1);
    setPanOffset(Math.max(minPan, Math.min(maxPan, newOffset)));
  };

  const handleMouseUp = () => setIsPanning(false);

  return (
    <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
      {/* Waveform Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-200 tracking-wide">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 text-sky-400 border border-sky-800">
              {badge}
            </span>
          )}
        </div>

        {/* Zoom & Pan Controls */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="text-[10px] uppercase tracking-wider font-mono mr-1">
            Zoom: {zoom.toFixed(1)}x
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(4.0, z + 0.5))}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoom((z) => Math.max(1.0, z - 0.5));
              if (zoom <= 1.5) setPanOffset(0);
            }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoom(1.0);
              setPanOffset(0);
            }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden select-none ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
        style={{ height: `${height}px` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: `${height}px` }}
          className="block"
        />

        {/* Lead Calibration Watermark */}
        <div className="absolute bottom-2 left-3 pointer-events-none text-[9px] font-mono text-slate-500/70">
          Lead II • 125 Hz • Cal: 10mm/mV • MIT-BIH PhysioNet
        </div>
      </div>
    </div>
  );
}
