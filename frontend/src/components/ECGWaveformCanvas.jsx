import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Activity,
  Gauge
} from 'lucide-react';

export default function ECGWaveformCanvas({
  signal = [],
  title = "ECG Heartbeat Waveform",
  samplingRate = 125, // Standard MIT-BIH PhysioNet frequency (125 Hz)
  height = 280,
  badge = null
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Interaction & Display States
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // 0.5x, 1.0x, 1.5x, 2.0x
  const [zoom, setZoom] = useState(1.0); // 1.0x to 4.0x
  const [panOffset, setPanOffset] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [startX, setStartX] = useState(0);
  const [fitToScreen, setFitToScreen] = useState(true);

  // Sweep animation head index
  const sweepHeadRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // R-Peak detection (maximum amplitude in heartbeat)
  const rPeakIndex = useMemo(() => {
    if (!signal || signal.length === 0) return -1;
    let maxIdx = 0;
    let maxVal = -Infinity;
    for (let i = 0; i < signal.length; i++) {
      if (signal[i] > maxVal) {
        maxVal = signal[i];
        maxIdx = i;
      }
    }
    return maxIdx;
  }, [signal]);

  // Clean signal array ensuring strictly finite numbers
  const safeSignal = useMemo(() => {
    if (!Array.isArray(signal) || signal.length < 2) return [];
    const cleaned = signal.map(Number).map(v => isFinite(v) ? v : 0);
    const minVal = Math.min(...cleaned);
    const maxVal = Math.max(...cleaned);
    const range = (maxVal - minVal) > 1e-5 ? (maxVal - minVal) : 1.0;
    // Normalize into [0, 1] range for reliable canvas plotting
    return cleaned.map(v => (v - minVal) / range);
  }, [signal]);

  // Reset viewport when new signal arrives
  useEffect(() => {
    sweepHeadRef.current = 0;
    setPanOffset(0);
  }, [signal]);

  // Main Canvas Render Routine
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const canvasHeight = canvas.height;

    // 1. Dark Medical Oscilloscope Background
    ctx.fillStyle = '#070b13';
    ctx.fillRect(0, 0, width, canvasHeight);

    // 2. Classical Medical ECG Grid (1mm & 5mm calibrated blocks)
    const smallGrid = 16;
    const largeGrid = smallGrid * 5;

    // Faint 1mm subdivision grid
    ctx.strokeStyle = '#1e293b40';
    ctx.lineWidth = 0.6;
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

    // Prominent 5mm major time/voltage blocks
    ctx.strokeStyle = '#0284c733';
    ctx.lineWidth = 1.2;
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

    // 3. Baseline Reference Line (0.0 mV isoelectric line)
    const paddingY = 32;
    const plotHeight = canvasHeight - paddingY * 2;
    const baselineY = canvasHeight - paddingY;

    ctx.strokeStyle = '#38bdf835';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, baselineY);
    ctx.lineTo(width, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);

    if (safeSignal.length < 2) {
      ctx.fillStyle = '#64748b';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Awaiting ECG waveform data. Select a sample or upload a recording.', width / 2, canvasHeight / 2);
      return;
    }

    // 4. Waveform Coordinates & Scaling
    const N = safeSignal.length;
    // Step size along X
    const visibleWidth = fitToScreen ? width : width * zoom;
    const stepX = visibleWidth / (N - 1);

    // Glow effect
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const currentHead = isPlaying ? sweepHeadRef.current : N;

    // Draw ECG Curve up to current sweep head
    ctx.beginPath();
    for (let i = 0; i <= currentHead && i < N; i++) {
      const x = i * stepX + panOffset;
      const normalizedY = safeSignal[i];
      const y = canvasHeight - paddingY - normalizedY * plotHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset glow

    // 5. Sweep Scan Head Beam (Medical Monitor sweep cursor)
    if (isPlaying && currentHead < N) {
      const headX = currentHead * stepX + panOffset;
      const headNormY = safeSignal[Math.floor(currentHead)] || 0;
      const headY = canvasHeight - paddingY - headNormY * plotHeight;

      // Bright phosphor cursor
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(headX, headY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Vertical tracer line
      const grad = ctx.createLinearGradient(headX, paddingY, headX, canvasHeight - paddingY);
      grad.addColorStop(0, '#00f0ff00');
      grad.addColorStop(0.5, '#00f0ff88');
      grad.addColorStop(1, '#00f0ff00');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(headX, paddingY);
      ctx.lineTo(headX, canvasHeight - paddingY);
      ctx.stroke();
    }

    // 6. R-Peak Marker (Only once sweep has passed it)
    if (rPeakIndex >= 0 && (!isPlaying || currentHead >= rPeakIndex)) {
      const peakX = rPeakIndex * stepX + panOffset;
      const peakNormY = safeSignal[rPeakIndex];
      const peakY = canvasHeight - paddingY - peakNormY * plotHeight;

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(peakX, peakY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(peakX, peakY, 7, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('R-Peak', peakX, peakY - 10);
    }

    // 7. Medical Calibration & Time Scale Legends
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('1.00 mV (Peak)', 12, paddingY - 10);
    ctx.fillText('0.00 mV (Isoelectric)', 12, baselineY + 18);

    const totalDurationSec = (N / samplingRate).toFixed(2);
    ctx.textAlign = 'right';
    ctx.fillText(
      `Duration: ~${totalDurationSec}s (${N} samples @ ${samplingRate}Hz)`,
      width - 12,
      baselineY + 18
    );

  }, [safeSignal, zoom, panOffset, isPlaying, rPeakIndex, samplingRate, fitToScreen]);

  // Animation Loop via requestAnimationFrame
  useEffect(() => {
    let animId;
    const animate = (now) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying && safeSignal.length > 0) {
        // Points per second based on standard 125 Hz * playbackSpeed
        const ptsAdvance = samplingRate * playbackSpeed * dt;
        sweepHeadRef.current += ptsAdvance;
        if (sweepHeadRef.current >= safeSignal.length + 15) {
          // Loop seamlessly
          sweepHeadRef.current = 0;
        }
      }

      drawFrame();
      animId = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(animate);
    animFrameIdRef.current = animId;

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, playbackSpeed, safeSignal, samplingRate, drawFrame]);

  // Adjust canvas resolution dynamically on window resize or container mount
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      if (rect.width > 0) {
        canvas.width = rect.width;
        canvas.height = height;
        drawFrame();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height, drawFrame]);

  // Mouse Pan Handlers
  const handleMouseDown = (e) => {
    if (fitToScreen) return;
    setIsPanning(true);
    setStartX(e.clientX - panOffset);
  };

  const handleMouseMove = (e) => {
    if (!isPanning || fitToScreen) return;
    const newOffset = e.clientX - startX;
    setPanOffset(newOffset);
  };

  const handleMouseUp = () => setIsPanning(false);

  return (
    <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* ── Control Header Bar ── */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-slate-200 tracking-wide">{title}</span>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-950 text-sky-400 border border-sky-800">
              {badge}
            </span>
          )}
        </div>

        {/* Playback & Visualization Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
            }`}
            title={isPlaying ? "Pause Sweep Animation" : "Play Sweep Animation"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Reset View */}
          <button
            onClick={() => {
              sweepHeadRef.current = 0;
              setPanOffset(0);
              setZoom(1.0);
              setFitToScreen(true);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
            title="Reset Waveform & View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 font-mono text-[11px]">
            <Gauge className="w-3 h-3 text-slate-400" />
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value={0.5} className="bg-slate-900">0.5x</option>
              <option value={1.0} className="bg-slate-900">1.0x</option>
              <option value={1.5} className="bg-slate-900">1.5x</option>
              <option value={2.0} className="bg-slate-900">2.0x</option>
            </select>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => {
                setFitToScreen(false);
                setZoom((z) => Math.min(4.0, z + 0.5));
              }}
              className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom((z) => {
                  const nextZ = Math.max(1.0, z - 0.5);
                  if (nextZ === 1.0) setFitToScreen(true);
                  return nextZ;
                });
              }}
              className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setFitToScreen(true);
                setZoom(1.0);
                setPanOffset(0);
              }}
              className={`p-1.5 rounded text-xs transition ${
                fitToScreen ? 'bg-sky-500 text-white' : 'hover:bg-slate-700 text-slate-300'
              }`}
              title="Fit Waveform to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── High-Precision Canvas Viewport ── */}
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden select-none ${
          !fitToScreen ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
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

        {/* Lead Calibration Technical Metadata */}
        <div className="absolute bottom-2 left-3 pointer-events-none text-[10px] font-mono text-slate-400/80 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800">
          Lead II • 125 Hz Standard • Time Base: 25mm/s • MIT-BIH PhysioNet
        </div>
      </div>
    </div>
  );
}
