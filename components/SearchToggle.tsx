import React from 'react';

interface SearchToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}

const SearchToggle: React.FC<SearchToggleProps> = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="search-toggle-btn" className="text-sm font-medium text-gray-300 cursor-pointer select-none" onClick={onToggle}>
        جستجوی گوگل
      </label>
      <button
        type="button"
        id="search-toggle-btn"
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
          isEnabled ? 'bg-blue-500' : 'bg-gray-600'
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

export default SearchToggle;
