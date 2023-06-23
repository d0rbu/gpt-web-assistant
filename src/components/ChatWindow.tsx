import { useEffect, useState } from 'react';
import { useStore, Chat, Message } from '../state/store';
import { useNavigate, Link } from "react-router-dom";
import ChatBubble from './ChatBubble';


export default function({ chat }: { chat: Chat }) {
  const { key } = useStore();
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center w-full p-2 rounded-t-md bg-gray-100 dark:bg-gray-800 gap-2 max-h-96 min-h-12 overflow-y-auto scrollbar-hide">
        {
            chat.messages.map((message, index) => {
                return (
                    <ChatBubble message={message} ai={index % 2 === 0} key={index} />
                );
            })
        }
    </div>
  );
}
