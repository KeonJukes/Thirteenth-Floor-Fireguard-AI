import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CameraIcon } from './icons/CameraIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';

// A utility function to convert a Blob to a Base64 string
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Analyze 1 frame every 4 seconds to stay within API rate limits.
const FRAME_RATE = 0.25; 
const JPEG_QUALITY = 0.8;

interface FireMonitoringPageProps {
  onFireDetected: (floor: number | null) => void;
}

const FireMonitoringPage: React.FC<FireMonitoringPageProps> = ({ onFireDetected }) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState<Array<{ timestamp: string; message: string }>>([]);
  const [floorNumber, setFloorNumber] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const lastLogRef = useRef<string>('');

  useEffect(() => {
    // Initialize the Gemini AI client once.
    aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    // Cleanup function when the component unmounts.
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    };
  }, []); // Empty dependency array ensures this runs only once.

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleRemoveVideo(); // Clean up previous video first
      const url = URL.createObjectURL(file);
      const mockFloor = Math.floor(Math.random() * 16) + 1;
      setFloorNumber(mockFloor);
      setVideoSrc(url);
      setVideoFile(file);
      setLogs([]);
    }
  };

  const cleanupAnalysis = () => {
    if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
    }
    const videoEl = videoRef.current;
    if (videoEl) {
        videoEl.pause();
    }
    setIsAnalyzing(false);
  };
  
  const handleRemoveVideo = () => {
    if (isAnalyzing) return;
    cleanupAnalysis();
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoSrc(null);
    setVideoFile(null);
    setLogs([]);
    setFloorNumber(null);
    lastLogRef.current = '';
    onFireDetected(null); // Notify parent that the threat is cleared
  };

  const analyzeFrame = async (base64Data: string) => {
    if (!aiRef.current) return;
    
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data,
            },
        };
        const textPart = { text: "You are a fire safety monitoring system. Analyze this image from a security camera. Describe any signs of fire or smoke you see in a short, descriptive sentence. Be specific but concise. For example: 'Thick smoke is filling the room.' or 'Flames are visible near the ceiling.' If there are no signs of fire or smoke, respond with the single word 'CLEAR'." };

        const response = await aiRef.current.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        
        const originalText = response.text.trim();
        const upperCaseText = originalText.toUpperCase();
        
        if (originalText && upperCaseText !== 'CLEAR') {
            const eventMessage = `Floor ${floorNumber}: ${originalText}`;
            // Log only if the message is different from the last one to avoid spam
            if(lastLogRef.current !== eventMessage) {
              setLogs(prev => [...prev, {
                  timestamp: new Date().toLocaleTimeString(),
                  message: eventMessage
              }]);
              lastLogRef.current = eventMessage;
              onFireDetected(floorNumber); // Notify parent of the detected threat
            }
        } else {
          // Reset last log if the scene is clear
          lastLogRef.current = '';
        }

    } catch (error) {
        console.error("Frame analysis error:", error);
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: `Floor ${floorNumber}: Error during frame analysis.` }]);
        cleanupAnalysis();
    }
  };

  const handleAnalyzeVideo = async () => {
    const videoEl = videoRef.current;
    const canvasEl = canvasRef.current;
    if (!videoFile || !videoEl || !canvasEl || isAnalyzing) return;

    setIsAnalyzing(true);
    setLogs([{ timestamp: new Date().toLocaleTimeString(), message: `Floor ${floorNumber}: Starting video analysis...` }]);

    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    
    videoEl.muted = true;
    videoEl.currentTime = 0;
    videoEl.play();

    videoEl.onended = () => {
        cleanupAnalysis();
        setLogs(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            message: `Floor ${floorNumber}: Video analysis complete.`
        }]);
    };

    frameIntervalRef.current = window.setInterval(() => {
        if (videoEl.paused || videoEl.ended) {
            cleanupAnalysis();
            return;
        }

        canvasEl.width = videoEl.videoWidth;
        canvasEl.height = videoEl.videoHeight;
        ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);

        canvasEl.toBlob(
            async (blob) => {
                if (blob) {
                    const base64Data = await blobToBase64(blob);
                    await analyzeFrame(base64Data);
                }
            },
            'image/jpeg',
            JPEG_QUALITY
        );
    }, 1000 / FRAME_RATE);
  };

  return (
    <div className="w-full max-w-5xl bg-fire-card rounded-xl shadow-2xl p-8 space-y-6 animate-fade-in border border-fire-border shadow-[0_0_15px_rgba(224,163,74,0.1)]">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold text-fire-gold font-display">Fire Safety Monitoring</h1>
            <p className="text-fire-text-secondary mt-2">Upload a video to analyze for fire and smoke with Gemini.</p>
        </div>
        {floorNumber && (
            <div className="text-center p-3 bg-fire-red/20 border-2 border-fire-red rounded-lg">
                <p className="text-sm font-semibold text-fire-red">ALERT ON</p>
                <p className="text-4xl font-bold text-fire-red">Floor {floorNumber}</p>
            </div>
        )}
    </div>

      <div className="border-t border-fire-border pt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Log Panel */}
        <div className="md:col-span-1 space-y-3">
          <h2 className="text-xl font-semibold text-fire-text-primary flex items-center gap-2">
            <ClipboardListIcon className="h-6 w-6 text-fire-text-secondary" />
            Analysis Log
          </h2>
          <div className="bg-fire-dark rounded-lg p-3 h-96 overflow-y-auto space-y-2 text-sm">
            {logs.length > 0 ? logs.map((log, index) => (
                <div key={index} className="p-2 bg-fire-card rounded shadow-sm animate-fade-in border border-fire-border/50">
                    <span className="font-mono text-xs text-fire-text-secondary">{log.timestamp}</span>
                    <p className={`font-semibold ${log.message.includes('CLEAR') ? 'text-fire-text-primary' : 'text-fire-red'}`}>{log.message}</p>
                </div>
            )) : <p className="text-fire-text-secondary text-center pt-16">Upload a video and start analysis to see logs here.</p>}
          </div>
        </div>

        {/* Video Panel */}
        <div className="md:col-span-2 space-y-4">
          {videoSrc ? (
            <div className="space-y-4">
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} src={videoSrc} controls={!isAnalyzing} className="w-full h-full">
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="flex flex-wrap justify-between items-center gap-4">
                <p className="text-sm font-medium text-fire-text-secondary truncate" title={videoFile?.name}>
                  File: <span className="font-bold text-fire-text-primary">{videoFile?.name}</span>
                </p>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleRemoveVideo} 
                        className="flex items-center gap-2 bg-fire-border text-fire-text-primary font-bold py-2 px-3 rounded-lg hover:bg-opacity-80 transition disabled:opacity-50"
                        aria-label="Remove video"
                        disabled={isAnalyzing}
                    >
                        <TrashIcon className="h-5 w-5" /> Remove
                    </button>
                    <button 
                        onClick={handleAnalyzeVideo} 
                        className="flex items-center gap-2 bg-fire-gold text-fire-dark font-bold py-2 px-3 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze with Gemini'}
                    </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-fire-border rounded-lg h-full">
              <CameraIcon className="h-12 w-12 text-fire-text-secondary mb-4" />
              <h3 className="text-lg font-semibold text-fire-text-primary">Upload a Video</h3>
              <p className="text-fire-text-secondary text-sm mb-4">Select a video file from your device.</p>
              <label htmlFor="video-upload" className="cursor-pointer bg-fire-gold text-fire-dark font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fire-gold transition">
                Choose File
              </label>
              <input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FireMonitoringPage;