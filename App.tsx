import React, { useState } from 'react';
import { Viewer } from './components/Viewer';
import { ControlPanel } from './components/ControlPanel';
import { MediaType, MediaSource, AnalysisState } from './types';
import { analyzeScene } from './services/geminiService';

// Using a reliable CDN-hosted equirectangular image from A-Frame examples to ensure CORS compatibility
const DEFAULT_IMAGE_URL = 'https://cdn.jsdelivr.net/gh/aframevr/aframe@master/examples/boilerplate/panorama/puydesancy.jpg';

const App: React.FC = () => {
  const [media, setMedia] = useState<MediaSource>({
    type: MediaType.IMAGE,
    url: DEFAULT_IMAGE_URL,
    file: undefined
  });

  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    error: null
  });

  const handleMediaUpload = (newMedia: MediaSource) => {
    // Revoke old URL if it was a blob to avoid memory leaks
    if (media.url.startsWith('blob:')) {
      URL.revokeObjectURL(media.url);
    }
    setMedia(newMedia);
    // Reset analysis when media changes
    setAnalysis({
      isLoading: false,
      result: null,
      error: null
    });
  };

  const handleAnalyze = async () => {
    if (!media.file || media.type !== MediaType.IMAGE) {
      setAnalysis(prev => ({ ...prev, error: "Please upload a local image file to analyze." }));
      return;
    }

    setAnalysis({ isLoading: true, result: null, error: null });

    try {
      const result = await analyzeScene(media.file);
      setAnalysis({ isLoading: false, result, error: null });
    } catch (err: any) {
      setAnalysis({ isLoading: false, result: null, error: err.message || "Analysis failed" });
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans selection:bg-blue-500/30">
      <Viewer media={media} />
      
      <ControlPanel 
        currentMedia={media}
        onMediaUpload={handleMediaUpload}
        onAnalyze={handleAnalyze}
        analysisState={analysis}
      />
    </div>
  );
};

export default App;