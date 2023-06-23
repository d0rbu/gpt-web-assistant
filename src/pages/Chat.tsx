import { useEffect, useState } from 'react';
import { useStore, Chat, Message } from '../state/store';
import { useNavigate, Link } from "react-router-dom";
import ChatWindow from '../components/ChatWindow';
import ChatBox from '../components/ChatBox';


export default function() {
  const { key, chatIdx, setChatIdx, chats, addToChat, addChat } = useStore();
  const navigate = useNavigate();
  const addMessage: (content: string) => void = (content) => {
    const message: Message = {
      content,
      timestamp: new Date(),
      sender: "user",
    }

    if (chatIdx < 0 || chatIdx >= chats.length) {
      const newChat: Chat = {
        title: "",
        messages: [message],
      }

      setChatIdx(chats.length);
      addChat(newChat);
      return;
    }
    
    addToChat(chatIdx, message);
  }
  
  return (
    <div className="flex flex-col items-center w-96 p-2 dark:bg-gray-900">
        <div className="w-full flex flex-row justify-between dark:text-white">
            <Link to="/key">
                <h1 className="text-md underline">Set Key</h1>
            </Link>
        </div>
        <h1 className="text-xl font-bold dark:text-white mb-6">Lumira🌙</h1>
        <ChatWindow chat={(chatIdx < 0 || chatIdx >= chats.length) ? { title: "New Chat", messages: [] } : chats[chatIdx] } />
        <ChatBox addMessage={addMessage} />
    </div>
  );
}