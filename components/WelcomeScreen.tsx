import React from 'react';
import GeminiLogo from './icons/GeminiLogo';
import SuggestionCard from './SuggestionCard';
import RocketIcon from './icons/RocketIcon';
import CodeIcon from './icons/CodeIcon';
import GlobeIcon from './icons/GlobeIcon';
import BulbIcon from './icons/BulbIcon';

interface WelcomeScreenProps {
    onSuggestionClick: (prompt: string) => void;
}

const suggestions = [
    {
        icon: <RocketIcon />,
        title: 'یک داستان کوتاه بنویس',
        prompt: 'یک داستان کوتاه درباره یک فضانورد گمشده که یک دوست غیرمنتظره پیدا می‌کند، بنویس.'
    },
    {
        icon: <CodeIcon />,
        title: 'کمک در برنامه‌نویسی',
        prompt: 'چگونه می‌توانم یک کامپوننت دکمه قابل استفاده مجدد در ری‌اکت با TypeScript بسازم؟'
    },
    {
        icon: <GlobeIcon />,
        title: 'پاسخ به سوالات',
        prompt: 'پایتخت استرالیا کجاست و چرا کانبرا به جای سیدنی یا ملبورن انتخاب شد؟'
    },
    {
        icon: <BulbIcon />,
        title: 'ایده پردازی کن',
        prompt: 'برای یک شام سالم، سریع و خوشمزه برای یک شب پرمشغله هفته، چند ایده پیشنهاد بده.'
    }
]

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSuggestionClick }) => {
  return (
    <div className="flex-grow flex flex-col justify-center items-center p-4 text-center">
      <div className="mb-8">
        <GeminiLogo width={80} height={80} />
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-200 mb-4">
        چگونه می‌توانم امروز به شما کمک کنم؟
      </h2>
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {suggestions.map((s, i) => (
          <SuggestionCard 
            key={i} 
            icon={s.icon} 
            title={s.title} 
            onClick={() => onSuggestionClick(s.prompt)} 
          />
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
