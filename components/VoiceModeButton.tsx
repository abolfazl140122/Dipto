import React from 'react';
import MicrophoneIcon from './icons/MicrophoneIcon';
import StopIcon from './icons/StopIcon';

interface VoiceModeButtonProps {
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

const VoiceModeButton: React.FC<VoiceModeButtonProps> = ({ isActive, onClick, disabled }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-full transition-colors flex-shrink-0 ${
        isActive
          ? 'bg-red-600 hover:bg-red-700'
          : 'bg-green-600 hover:bg-green-700'
      } disabled:bg-gray-600 disabled:cursor-not-allowed`}
      title={isActive ? 'پایان مکالمه' : 'شروع مکالمه صوتی'}
    >
      {isActive ? <StopIcon /> : <MicrophoneIcon />}
    </button>
  );
};

export default VoiceModeButton;
