import { useEffect, useState, useRef } from 'react';
import { useStore } from '../state/store';
import { Chat, Message } from '../util/types';
import { useNavigate, Link } from "react-router-dom";
import ChatBubble from './ChatBubble';


export default function() {
  const { chats, chatIdx } = useStore();
  const [stuckToBottom, setStuckToBottom] = useState<boolean>(true);  // if we are at the bottom of the chat window
  const windowRef = useRef<HTMLDivElement>(null);
  
  // if we are at the bottom of the chat window, scroll down
  useEffect(() => useStore.subscribe((state) => state.chats, (chats) => {
    if (chatIdx < 0 || chatIdx >= chats.length) {
      return;
    }

    if (!windowRef.current) {
      return;
    }

    // if we are not at the bottom of the chat window
    if (windowRef.current.scrollHeight - windowRef.current.scrollTop !== windowRef.current.clientHeight) {
      setStuckToBottom(false);
      return;
    }
    
    setStuckToBottom(true);
  }), []);
  
  return (
    <div className="w-full p-2 rounded-t-md bg-gray-100 dark:bg-gray-800 min-h-[8rem] max-h-64 overflow-y-auto scrollbar-hide" ref={windowRef}>
      <div className="flex flex-col items-center justify-center gap-2">
        {
          (chatIdx < 0 || chatIdx >= chats.length) ? null : chats[chatIdx].messages.map((message, index) => {
            return <ChatBubble message={message} key={index} scrollIntoView={index === chats[chatIdx].messages.length - 1 && stuckToBottom} />
          })
        }
      </div>
    </div>
  );
}
