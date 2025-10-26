import React from 'react';

interface ThinkingToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}

const ThinkingToggle: React.FC<ThinkingToggleProps> = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="thinking-toggle-btn" className="text-sm font-medium text-gray-300 cursor-pointer select-none" onClick={onToggle}>
        حالت تفکر
      </label>
      <button
        type="button"
        id="thinking-toggle-btn"
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 ${
          isEnabled ? 'bg-purple-600' : 'bg-gray-600'
        }`}
        aria-checked={isEnabled}
        role="switch"
      >
        <span
          aria-hidden="true"
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-200 ease-in-out ${
            isEnabled ? 'end-1' : 'start-1'
          }`}
        />
      </button>
    </div>
  );
};

export default ThinkingToggle;