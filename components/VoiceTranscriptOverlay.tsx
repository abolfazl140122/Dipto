import React from 'react';
import UserIcon from './icons/UserIcon';
import BotIcon from './icons/BotIcon';
import SoundWave from './SoundWave';
import { useTypewriter } from '../hooks/useTypewriter';
import StopIcon from './icons/StopIcon';

interface VoiceTranscriptOverlayProps {
  userTranscript: string;
  botTranscript: string;
  onStop: () => void;
}

const VoiceTranscriptOverlay: React.FC<VoiceTranscriptOverlayProps> = ({ userTranscript, botTranscript, onStop }) => {
  const displayedBotTranscript = useTypewriter(botTranscript, 40);

  return (
    <div className="fixed inset-0 z-10 p-4 flex justify-center items-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
      <div 
        className="bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-700/80
                   relative overflow-hidden animate-fade-in animate-pulse-glow"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/10 via-transparent to-indigo-900/10"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
        
        <div className="p-6 sm:p-8 flex flex-col space-y-6 relative z-10">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500 shadow-md">
              <UserIcon />
            </div>
            <div className="flex-1 min-h-[50px] text-gray-200 text-lg">
              {userTranscript ? (
                <p>{userTranscript}</p>
              ) : (
                <div className="w-full h-[50px]">
                  <SoundWave />
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-700/50"></div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-700 shadow-md">
              <BotIcon />
            </div>
            <p className="flex-1 min-h-[50px] text-gray-200 text-lg font-light">{displayedBotTranscript}
              {botTranscript && displayedBotTranscript === botTranscript ? null : <span className="inline-block w-px h-5 bg-purple-400 align-middle animate-blink ml-1"></span>}
            </p>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 z-20">
            <button
                onClick={onStop}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
                title="پایان مکالمه"
            >
                <StopIcon />
            </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceTranscriptOverlay;