import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ImageUploader({
  selectedFile,
  onFileSelect,
  onClear,
  sampleImageGenerator,
  sampleLabel = "Load Sample Inspection Image",
  title = "Upload Site Image for Multimodal AI Triage",
  description = "Supports high-resolution JPEG, PNG, or WEBP up to 10MB."
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    setErrorMsg('');
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
      setErrorMsg('Unsupported format. Please upload JPEG, PNG, or WEBP.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 10MB limit.');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    if (onFileSelect) onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onClear) onClear();
  };

  const handleSampleLoad = () => {
    if (sampleImageGenerator) {
      const sampleFile = sampleImageGenerator();
      handleFile(sampleFile);
    }
  };

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative rounded-xl border border-slate-700 bg-slate-900/90 overflow-hidden group">
          <div className="max-h-80 flex items-center justify-center bg-black/40 p-2">
            <img 
              src={previewUrl} 
              alt="Inspection Preview" 
              className="max-h-72 object-contain rounded-lg shadow-md"
            />
          </div>
          
          {/* Top Overlay details */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready for AI Scan
            </span>
            <button
              onClick={handleClear}
              type="button"
              className="pointer-events-auto p-1.5 rounded-full bg-slate-900/90 text-slate-300 hover:text-white hover:bg-rose-600 transition-colors border border-slate-700 shadow-lg"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="truncate max-w-xs">{selectedFile?.name || "Uploaded Image"}</span>
            <span>{selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''}</span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-orange-500 bg-orange-500/10 scale-[1.01]' 
              : 'border-slate-700 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/70'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleFile(e.target.files[0])} 
            accept="image/jpeg,image/png,image/webp" 
            className="hidden" 
          />
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 mx-auto flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">{description}</p>
          <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors">
            Browse Local File
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg font-medium">
          {errorMsg}
        </div>
      )}

      {/* 1-Click Sample Image Button */}
      {sampleImageGenerator && !previewUrl && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500">Don't have a site photo ready?</span>
          <button
            type="button"
            onClick={handleSampleLoad}
            className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 px-3 py-1 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {sampleLabel}
          </button>
        </div>
      )}
    </div>
  );
}
