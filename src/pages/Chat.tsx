import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { useNavigate, Link } from "react-router-dom";
import ChatWindow from '../components/ChatWindow';
import ChatBox from '../components/ChatBox';


export default function() {
  const { key } = useStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<string[]>(["asdfads", "asdfsd", "a89sdf"]);
  const addMessage: (message: string) => void = (message) => {
    setMessages((messages) => [...messages, message]);
  }
  
  return (
    <div className="flex flex-col items-center w-96 p-2 dark:bg-gray-900">
        <div className="w-full flex flex-row justify-between dark:text-white">
            <Link to="/">
                <h1 className="text-md underline">Set Key</h1>
            </Link>
        </div>
        <h1 className="text-xl font-bold dark:text-white mb-6">Lumira🌙</h1>
        <ChatWindow messages={messages} />
        <ChatBox addMessage={addMessage} />
    </div>
  );
}