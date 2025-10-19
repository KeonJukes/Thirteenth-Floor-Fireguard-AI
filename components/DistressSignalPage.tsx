import React, { useState, useRef, useEffect } from 'react';
import { ResidentProfile, TranscriptEntry } from '../types';
import { DistressSignalIcon } from './icons/DistressSignalIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

// Helper functions for audio encoding/decoding
function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}


interface DistressSignalPageProps {
  profile: ResidentProfile;
}

const DistressSignalPage: React.FC<DistressSignalPageProps> = ({ profile }) => {
    const [sessionState, setSessionState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [currentUserText, setCurrentUserText] = useState('');
    const [currentDispatcherText, setCurrentDispatcherText] = useState('');
    const [textInput, setTextInput] = useState('');

    const aiRef = useRef<GoogleGenAI | null>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const transcriptEndRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        return () => {
            // Cleanup on unmount
            endSession();
        };
    }, []);

    useEffect(() => {
        // Auto-scroll transcript
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript, currentUserText, currentDispatcherText]);

    const endSession = async () => {
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                // Ignore errors on close, as the session might already be closed
            }
            sessionPromiseRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        setSessionState('idle');
    };

    const startSession = async () => {
        setSessionState('connecting');
        setErrorMessage(null);
        setTranscript([]);
        setCurrentUserText('');
        setCurrentDispatcherText('');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
        } catch (err: any) {
            console.error('Failed to get microphone access:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setErrorMessage('Microphone access denied. Please enable it in your browser settings to use this feature.');
            } else {
                setErrorMessage('Could not access the microphone. Please ensure it is connected and working.');
            }
            setSessionState('error');
            return;
        }

        try {
            // Use 'any' to handle vendor prefix for older browsers
            const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
            inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
            outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
            
            const systemInstruction = `You are a calm, reassuring AI emergency dispatcher for a residential building. A resident has activated a distress signal, indicating they are trapped by a fire. Your first and immediate action is to speak. Do not wait for them to talk.

Start the conversation by saying something like: "This is the emergency line. We've received your distress signal from apartment ${profile.aptNumber} on floor ${profile.floor}. Help is on the way. Can you tell me what's happening? Are you safe right now?"

Your primary goals are:
1. Speak first to initiate the conversation immediately.
2. Confirm their location (Name: ${profile.name}, Apartment: ${profile.aptNumber}, Floor: ${profile.floor}).
3. Provide a simulated ETA for first responders (e.g., 'First responders have an estimated arrival of 5-7 minutes.').
4. Keep the resident calm and gather more details about their situation.`;

            sessionPromiseRef.current = aiRef.current!.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        setSessionState('connected');
                        
                        if (sessionPromiseRef.current) {
                            sessionPromiseRef.current.then((session: any) => {
                                session.sendRealtimeInput({ text: "The user has activated the distress signal. Please respond immediately based on your instructions." });
                            });
                        }

                        const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session: any) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle transcription
                        if (message.serverContent?.inputTranscription) {
                            setCurrentUserText(prev => prev + message.serverContent.inputTranscription.text);
                        }
                        if (message.serverContent?.outputTranscription) {
                            setCurrentDispatcherText(prev => prev + message.serverContent.outputTranscription.text);
                        }
                        if (message.serverContent?.turnComplete) {
                            setCurrentUserText(prevUserText => {
                                setCurrentDispatcherText(prevDispatcherText => {
                                    const newEntries: TranscriptEntry[] = [];
                                    if (prevUserText.trim()) {
                                        newEntries.push({ speaker: 'user', text: prevUserText.trim() });
                                    }
                                    if (prevDispatcherText.trim()) {
                                        newEntries.push({ speaker: 'dispatcher', text: prevDispatcherText.trim() });
                                    }
                                    if (newEntries.length > 0) {
                                        setTranscript(prevTranscript => [...prevTranscript, ...newEntries]);
                                    }
                                    return ''; // Clear dispatcher text
                                });
                                return ''; // Clear user text
                            });
                        }
                        
                        // Handle audio playback
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData) {
                            const outputCtx = outputAudioContextRef.current!;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            source.addEventListener('ended', () => {
                                sourcesRef.current.delete(source);
                            });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }
                    },
                    onerror: (e) => {
                        console.error('Session error:', e);
                        setErrorMessage('An unexpected error occurred during the call. The connection has been closed.');
                        setSessionState('error');
                        endSession();
                    },
                    onclose: () => {
                        endSession();
                    },
                },
            });

        } catch (err) {
            console.error('Failed to connect to Gemini Live:', err);
            setErrorMessage('Failed to connect to the emergency line. Please check your internet connection and try again.');
            setSessionState('error');
        }
    };

    const handleSendText = (e: React.FormEvent) => {
        e.preventDefault();
        if (!textInput.trim() || sessionState !== 'connected' || !sessionPromiseRef.current) return;
        
        const messageToSend = textInput.trim();
        
        setTranscript(prev => [...prev, { speaker: 'user', text: messageToSend }]);
        
        sessionPromiseRef.current.then(session => {
            session.sendRealtimeInput({ text: messageToSend });
        });
        
        setTextInput('');
    };


    return (
        <div className="w-full max-w-lg bg-fire-card rounded-xl shadow-2xl p-8 space-y-6 text-center animate-fade-in border border-fire-border shadow-[0_0_15px_rgba(224,163,74,0.1)]">
             <div className="mx-auto bg-fire-red/20 rounded-full h-20 w-20 flex items-center justify-center border-4 border-fire-red/50">
                <DistressSignalIcon className="h-10 w-10 text-fire-red" />
            </div>
            <h1 className="text-3xl font-bold text-fire-gold font-display">Distress Signal</h1>
            
            {sessionState === 'idle' && (
                <div className="space-y-4">
                    <p className="text-fire-text-secondary">
                        Press the button to start a <span className="font-bold text-fire-text-primary">live audio & text chat</span> with an emergency dispatcher AI.
                        <br />
                        <span className="font-bold text-fire-red">Use only in a genuine emergency.</span>
                    </p>
                    <button
                        onClick={startSession}
                        className="w-full bg-fire-red text-white font-extrabold py-4 px-4 rounded-full text-xl
                                   hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-fire-red/50
                                   transition-transform transform active:scale-95 animate-pulse"
                    >
                        SEND SIGNAL & START LIVE CHAT
                    </button>
                </div>
            )}
            
            {sessionState === 'connecting' && (
                <p className="text-lg text-fire-gold font-semibold">Connecting to emergency line...</p>
            )}

            {sessionState === 'error' && (
                <div className="space-y-4">
                    <p className="text-lg text-fire-red font-semibold">Connection Failed</p>
                    <p className="text-fire-text-secondary bg-fire-red/10 p-3 rounded-lg border border-fire-red/50">
                        {errorMessage || 'An unknown error occurred. Please try again.'}
                    </p>
                    <button onClick={startSession} className="w-full bg-fire-gold text-fire-dark font-bold py-3 rounded-lg hover:bg-opacity-90">
                        Try Again
                    </button>
                </div>
            )}
            
            {sessionState === 'connected' && (
                 <div className="flex flex-col h-[32rem] space-y-4">
                    <p className="text-lg text-fire-safe font-semibold bg-fire-safe/10 p-3 rounded-lg">
                        Connected - Live Audio & Chat Active
                    </p>
                    <div className="flex items-center justify-center gap-2 p-2 bg-fire-gold/10 rounded-lg border border-fire-gold/50">
                        <MicrophoneIcon className="h-6 w-6 text-fire-gold animate-pulse" />
                        <span className="font-semibold text-fire-gold">Microphone is ON. You can speak now.</span>
                    </div>
                    <div className="flex-1 bg-fire-dark rounded-lg p-3 overflow-y-auto text-left space-y-3">
                        {transcript.map((entry, index) => (
                            <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs rounded-lg px-3 py-2 ${entry.speaker === 'user' ? 'bg-fire-gold text-fire-dark' : 'bg-fire-border text-fire-text-primary'}`}>
                                    <p className="text-sm font-bold capitalize">{entry.speaker}</p>
                                    <p>{entry.text}</p>
                                </div>
                            </div>
                        ))}
                        {/* In-progress user text */}
                        {currentUserText && (
                            <div className="flex justify-end">
                                <div className="max-w-xs rounded-lg px-3 py-2 bg-fire-gold text-fire-dark opacity-70">
                                    <p className="text-sm font-bold capitalize">user</p>
                                    <p>{currentUserText}</p>
                                </div>
                            </div>
                        )}
                        {/* In-progress dispatcher text */}
                        {currentDispatcherText && (
                            <div className="flex justify-start">
                                <div className="max-w-xs rounded-lg px-3 py-2 bg-fire-border text-fire-text-primary opacity-70">
                                    <p className="text-sm font-bold capitalize">dispatcher</p>
                                    <p>{currentDispatcherText}</p>
                                </div>
                            </div>
                        )}
                        <div ref={transcriptEndRef} />
                    </div>
                     <form onSubmit={handleSendText} className="flex gap-2">
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="Type your message here..."
                          className="flex-1 w-full px-3 py-2 border border-fire-border bg-fire-dark rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-fire-gold transition text-fire-text-primary placeholder:text-fire-border"
                        />
                        <button type="submit" className="bg-fire-gold text-fire-dark font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition">Send</button>
                    </form>
                    <button onClick={endSession} className="w-full bg-fire-border text-fire-text-primary font-bold py-3 rounded-lg hover:bg-opacity-80">
                        End Call
                    </button>
                </div>
            )}
        </div>
    );
};

export default DistressSignalPage;