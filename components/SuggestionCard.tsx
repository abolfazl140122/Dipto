import React from 'react';

interface SuggestionCardProps {
    icon: React.ReactNode;
    title: string;
    onClick: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ icon, title, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:bg-gray-700/80 hover:border-blue-500 transition-all duration-200 text-left w-full flex flex-col justify-start items-start"
            style={{ minHeight: '120px' }}
        >
            <div className="text-blue-400 mb-3">
                {icon}
            </div>
            <p className="text-gray-200 font-semibold text-sm">{title}</p>
        </button>
    );
};

export default SuggestionCard;
