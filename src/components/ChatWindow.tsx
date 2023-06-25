import { useEffect, useState, useRef } from 'react';
import { useStore } from '../state/store';
import { Chat, Message } from '../util/types';
import { useNavigate, Link } from "react-router-dom";
import ChatBubble from './ChatBubble';


export default function({ thinking }: { thinking: boolean }) {
  const { chats, chatIdx } = useStore();
  const windowRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!windowRef.current) {
      return;
    }

    // scroll to bottom
    windowRef.current.scrollTop = windowRef.current.scrollHeight;
  }, [chatIdx]);
  
  return (
    <div className="w-full pt-2 px-2 rounded-t-md bg-gray-100 dark:bg-gray-800 min-h-[8rem] max-h-96 overflow-y-auto scrollbar-hide" ref={windowRef}>
      <div className="flex flex-col items-center justify-center gap-2" ref={chatRef}>
        {
          (chatIdx < 0 || chatIdx >= chats.length) ? null : chats[chatIdx].messages.map((message, index) => {
            return <ChatBubble grandparentWindowRef={windowRef} parentWindowRef={chatRef} message={message} idx={index} key={index} />
          })
        }
      </div>
    </div>
  );
}
