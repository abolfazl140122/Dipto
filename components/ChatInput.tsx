import React, { useState, useRef } from 'react';
import SendIcon from './icons/SendIcon';
import PaperclipIcon from './icons/PaperclipIcon';
import CloseIcon from './icons/CloseIcon';
import VoiceModeButton from './VoiceModeButton';
import StopGeneratingIcon from './icons/StopGeneratingIcon';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onStopGeneration: () => void;
  image: File | null;
  onImageChange: (file: File | null) => void;
  isVoiceModeActive: boolean;
  onToggleVoiceMode: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading,
  onStopGeneration, 
  image, 
  onImageChange,
  isVoiceModeActive,
  onToggleVoiceMode
}) => {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || image) && !isLoading) {
      onSendMessage(text);
      setText('');
      onImageChange(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
    }
  };
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        onImageChange(file);
    }
    if (e.target) {
        e.target.value = '';
    }
  };

  return (
    <div className="p-4 bg-gray-800 border-t border-gray-700 sticky bottom-0 flex-shrink-0">
      {image && !isVoiceModeActive && (
        <div className="relative w-24 h-24 mb-2 p-1 border border-gray-600 rounded-lg">
          <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover rounded" />
          <button 
            onClick={() => onImageChange(null)}
            className="absolute -top-2 -left-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-1"
          >
            <CloseIcon />
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isVoiceModeActive ? "در حال گوش دادن..." : "پیام خود را اینجا بنویسید..."}
          rows={1}
          className="flex-grow bg-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none disabled:opacity-50"
          disabled={isLoading || isVoiceModeActive}
          style={{maxHeight: '120px'}}
        />
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
            disabled={isVoiceModeActive || isLoading}
        />
        <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isVoiceModeActive}
            className="bg-gray-700 p-3 rounded-full hover:bg-gray-600 disabled:opacity-50 transition-colors flex-shrink-0"
            title="پیوست تصویر"
        >
            <PaperclipIcon />
        </button>
        
        <VoiceModeButton isActive={isVoiceModeActive} onClick={onToggleVoiceMode} disabled={isLoading && !isVoiceModeActive} />
        
        { isLoading && !isVoiceModeActive ? (
            <button
                type="button"
                onClick={onStopGeneration}
                className="bg-gray-700 p-3 rounded-full hover:bg-red-800/50 border border-red-500 text-red-400 transition-colors flex-shrink-0"
                title="توقف تولید"
            >
                <StopGeneratingIcon/>
            </button>
        ) : (
            <button
              type="submit"
              disabled={isLoading || (!text.trim() && !image) || isVoiceModeActive}
              className="bg-blue-600 p-3 rounded-full hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <SendIcon />
            </button>
        )}
      </form>
    </div>
  );
};

export default ChatInput;