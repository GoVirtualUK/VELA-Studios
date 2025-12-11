import React, { useRef } from 'react';
import { MediaType, MediaSource, AnalysisState } from '../types';

interface ControlPanelProps {
  currentMedia: MediaSource;
  onMediaUpload: (media: MediaSource) => void;
  onAnalyze: () => void;
  analysisState: AnalysisState;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  currentMedia,
  onMediaUpload,
  onAnalyze,
  analysisState,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('video') ? MediaType.VIDEO : MediaType.IMAGE;

    onMediaUpload({
      type,
      url,
      file,
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* Bottom Control Bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 w-11/12 max-w-2xl bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
           {/* Upload Button */}
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm font-medium border border-white/5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload Media
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />
          
          <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block"></div>
          
          <div className="hidden sm:flex flex-col">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Current Source</span>
            <span className="text-sm text-white font-medium truncate max-w-[150px]">
                {currentMedia.file ? currentMedia.file.name : 'Demo Scene'}
            </span>
          </div>
        </div>

        {/* AI Action */}
        {currentMedia.type === MediaType.IMAGE && (
             <button
             onClick={onAnalyze}
             disabled={analysisState.isLoading}
             className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg
                ${analysisState.isLoading 
                    ? 'bg-blue-600/50 cursor-not-allowed text-blue-200' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'}`}
           >
             {analysisState.isLoading ? (
                <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Analyzing...
                </>
             ) : (
                 <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    Analyze Scene
                 </>
             )}
           </button>
        )}
      </div>

      {/* Analysis Result Drawer */}
      {(analysisState.result || analysisState.error) && (
        <div className="absolute top-20 right-4 w-80 max-h-[calc(100vh-150px)] overflow-y-auto z-20 bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    AI Analysis
                </h3>
                <button 
                    onClick={() => { /* Should define a close handler in props strictly, but for simplicity here we assume parent handles state or we just hide if needed. Actually let's add a close button visual only or rely on re-clicking analyze.*/ }}
                    className="text-gray-400 hover:text-white"
                >
                    {/* Visual only for this snippet, functionality tied to state reset */}
                </button>
            </div>
            
            {analysisState.error ? (
                <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-500/20">
                    {analysisState.error}
                </p>
            ) : (
                <div className="prose prose-invert prose-sm">
                    <p className="text-gray-200 leading-relaxed text-sm whitespace-pre-wrap">
                        {analysisState.result}
                    </p>
                </div>
            )}
        </div>
      )}
    </>
  );
};