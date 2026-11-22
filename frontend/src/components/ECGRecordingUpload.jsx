import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck2,
  FileWarning,
  X,
  Play,
  Loader2,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function ECGRecordingUpload({
  onAnalyzeFile,
  isAnalyzing = false,
  error = null,
  onClear = () => {}
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [clientError, setClientError] = useState(null);
  const inputRef = useRef(null);

  const processFile = (file) => {
    setClientError(null);
    if (!file) return;

    const validExtensions = ['.csv', '.txt', '.json', '.dat'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(ext)) {
      setClientError(`Unsupported file format (${ext}). Supported formats: CSV, TXT, JSON, DAT.`);
      setSelectedFile(null);
      setFileDetails(null);
      return;
    }

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

    setSelectedFile(file);
    setFileDetails({
      name: file.name,
      size: sizeFormatted,
      type: file.type || 'text/plain',
      lastModified: new Date(file.lastModified).toLocaleDateString()
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setFileDetails(null);
    setClientError(null);
    if (inputRef.current) inputRef.current.value = "";
    onClear();
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;
    onAnalyzeFile(selectedFile);
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
          dragActive
            ? 'border-sky-500 bg-sky-950/30'
            : selectedFile
            ? 'border-emerald-500/50 bg-emerald-950/10'
            : 'border-slate-700/80 hover:border-sky-500/60 bg-slate-900/50 hover:bg-slate-900/80'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt,.json,.dat"
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/10 to-blue-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-md">
            {selectedFile ? (
              <FileCheck2 className="w-7 h-7 text-emerald-400" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200">
              {selectedFile ? "ECG Recording Ready for Analysis" : "Upload ECG Heartbeat Recording"}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Drag & drop your ECG recording file here, or click to browse files.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">.CSV</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">.TXT</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">.JSON</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">.DAT</span>
          </div>
        </div>
      </div>

      {/* Selected File Details Bar */}
      {selectedFile && fileDetails && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">{fileDetails.name}</p>
              <p className="text-[11px] text-slate-400">
                Size: <span className="font-mono text-slate-300">{fileDetails.size}</span> • Modified: {fileDetails.lastModified}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              disabled={isAnalyzing}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Replace</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAnalyze();
              }}
              disabled={isAnalyzing}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold shadow-md shadow-sky-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing ECG...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Analyze ECG</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error Notices */}
      {(clientError || error) && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
          <FileWarning className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">ECG Input Processing Notice</p>
            <p className="text-[11px] text-rose-300/90 mt-0.5">{clientError || error}</p>
          </div>
        </div>
      )}

      {/* Helpful Backend Input Format Note */}
      <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-900/40 text-[11px] text-slate-400 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p>
          <strong>Supported Input Architecture:</strong> The LightGBM classifier evaluates single-beat segmented ECG recordings (187 amplitude points). Files with arbitrary lengths are automatically resampled and min-max normalized to [0, 1] using standard MIT-BIH PhysioNet preprocessing.
        </p>
      </div>
    </div>
  );
}
