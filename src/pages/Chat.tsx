import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { Chat, Message, LLM } from '../util/types';
import { useNavigate, Link } from "react-router-dom";
import ChatWindow from '../components/ChatWindow';
import ChatBox from '../components/ChatBox';


export default function() {
  const { key, chatIdx, setChatIdx, chats, llm, addToChat, addChat, addToLastChatMessageContent } = useStore();
  const [thinking, setThinking] = useState<boolean>(false);

  useEffect(() => {

  }, [chats])

  async function addMessage(content: string) {
    setThinking(true);

    const message: Message = {
      content,
      timestamp: new Date(),
      sender: "user",
    }
    const reply: Message = {
      content: "",
      timestamp: new Date(),
      sender: "assistant",
    }

    let currentChat: Chat;

    if (chatIdx < 0 || chatIdx >= chats.length) {
      const newChat: Chat = {
        title: "",
        messages: [message, reply],
      }

      currentChat = JSON.parse(JSON.stringify(newChat));
      setChatIdx(chats.length);
      addChat(newChat);
    } else {
      // deep copy
      currentChat = JSON.parse(JSON.stringify(chats[chatIdx]));
      addToChat(chatIdx, message);
      addToChat(chatIdx, reply);
    }

    currentChat.messages.push(message);

    let stream: ReadableStream<Uint8Array>;;
    try {
      stream = await llm.chatCompletionStream(currentChat);
    } catch (e) {
      console.log(`Failed to reach LLM: ${e}`);
      console.log(chats);
      if (!chats[chatIdx].messages[chats[chatIdx].messages.length - 1].content) {
        addToLastChatMessageContent(chatIdx, `Failed to reach ${llm.name}. Please check your key and try again.`);
      }
      setThinking(false);
      return;
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder("utf-8");
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      // Massage and parse the chunk of data
      const chunk = decoder.decode(value);
      // console log chunk but replace newlines with \n characters
      addToLastChatMessageContent(chatIdx, chunk);
    }



    setThinking(false);
  }
  
  return (
    <div className="flex flex-col items-center w-96 p-2 dark:bg-gray-900">
        <div className="w-full flex flex-row justify-between dark:text-white">
            <Link to="/key">
                <h1 className="text-md underline">Set Key</h1>
            </Link>
        </div>
        <h1 className="text-xl font-bold dark:text-white mb-6">Lumira🌙</h1>
        <ChatWindow thinking={thinking} />
        <ChatBox thinking={thinking} addMessage={addMessage} />
    </div>
  );
}