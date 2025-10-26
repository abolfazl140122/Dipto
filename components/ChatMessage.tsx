import React, { useState, useEffect, useMemo, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Author, type Message } from '../types';
import BotIcon from './icons/BotIcon';
import UserIcon from './icons/UserIcon';
import SourceIcon from './icons/SourceIcon';
import CopyIcon from './icons/CopyIcon';
import ErrorIcon from './icons/ErrorIcon';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [isCopied, setIsCopied] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const isUser = message.author === Author.USER;
  const isError = message.isError;
  const hasSources = !isUser && message.sources && message.sources.length > 0;

  const sanitizedHtml = useMemo(() => {
    const rawHtml = marked.parse(message.text, { async: false }) as string;
    return DOMPurify.sanitize(rawHtml);
  }, [message.text]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  useEffect(() => {
    // Cleanup for blob URLs to prevent memory leaks
    return () => {
      if (message.image && message.image.url.startsWith('blob:')) {
        URL.revokeObjectURL(message.image.url);
      }
    };
  }, [message.image]);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const pres = messageRef.current?.querySelectorAll('pre');
      if (!pres || pres.length === 0) return;

      pres.forEach(pre => {
        if (pre.parentElement?.classList.contains('code-block-wrapper')) return;

        const code = pre.querySelector('code')?.innerText || '';
        if (!code) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper relative group';
        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        const button = document.createElement('button');
        button.className = "copy-code-btn absolute top-2 left-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity";
        button.title = "کپی کردن کد";
        
        const copyIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>`;
        button.innerHTML = copyIconSVG;
        
        button.onclick = () => {
          navigator.clipboard.writeText(code).then(() => {
            button.textContent = 'کپی شد!';
            setTimeout(() => {
              button.innerHTML = copyIconSVG;
            }, 2000);
          });
        };
        
        wrapper.appendChild(button);
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [sanitizedHtml]);

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-blue-500' : isError ? 'bg-red-800' : 'bg-gray-700'}`}>
        {isUser ? <UserIcon /> : isError ? <ErrorIcon /> : <BotIcon />}
      </div>
      <div className={`relative group max-w-xs md:max-w-md lg:max-w-2xl p-3 rounded-lg break-words ${isUser ? 'bg-blue-600 rounded-br-none' : isError ? 'bg-red-900/50 border border-red-500/50 rounded-bl-none' : 'bg-gray-800 rounded-bl-none'}`}>
        {!isUser && !isError && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy} className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300">
              {isCopied ? 
                <span className="text-xs px-1">کپی شد!</span> : 
                <CopyIcon />
              }
            </button>
          </div>
        )}
        
        {isError && (
            <div className="flex items-center gap-2 mb-2 font-semibold text-red-400">
                <ErrorIcon />
                <span>خطا در پاسخ</span>
            </div>
        )}

        {message.image && (
          <img src={message.image.url} alt="User upload" className="rounded-lg mb-2 max-w-full h-auto max-h-64" />
        )}
        
        <div ref={messageRef} className={`prose ${isError ? 'text-red-300' : ''}`} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
        
        {hasSources && (
          <div className="mt-4 border-t border-gray-700 pt-3">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">منابع</h4>
            <ul className="space-y-2">
              {message.sources?.map((source, index) => (
                <li key={index}>
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm flex items-center gap-2 group"
                  >
                    <SourceIcon />
                    <span className="truncate group-hover:text-clip">{source.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;