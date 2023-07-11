import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { Chat, Message, LLM } from '../util/types';
import { useNavigate, Link } from "react-router-dom";
import ChatWindow from '../components/ChatWindow';
import ChatBox from '../components/ChatBox';
import ChatSwitcher from '../components/ChatSwitcher';


export default function() {
  const { key, chatIdx, setChatIdx, chats, llm, addToChat, embedMessage, addChat, addToLastChatMessageContent } = useStore();
  const [thinking, setThinking] = useState<boolean>(false);

  useEffect(() => {
    console.log(llm);
  }, [])

  async function addMessage(content: string) {
    setThinking(true);

    const message: Message = {
      content,
      sender: "user",
      id: "",
      website: false,
    }
    const reply: Message = {
      content: "",
      sender: "assistant",
      id: "",
      website: false,
    }

    let currentChat: Chat;

    if (chatIdx < 0 || chatIdx >= chats.length) {
      const newId = crypto.randomUUID();
      const newChat: Chat = {
        title: "",
        messages: [message, reply],
        id: newId,
      }

      message.id = newId;
      reply.id = newId;

      currentChat = JSON.parse(JSON.stringify(newChat));
      setChatIdx(chats.length);
      addChat(newChat);
    } else {
      message.id = chats[chatIdx].id;
      reply.id = chats[chatIdx].id;
      
      // deep copy
      currentChat = JSON.parse(JSON.stringify(chats[chatIdx]));
      addToChat(chatIdx, message);
      embedMessage(chatIdx, message);
      addToChat(chatIdx, reply);
    }

    currentChat.messages.push(message);

    let stream: ReadableStream<Uint8Array>;;
    try {
      if (!llm) {
        throw new Error("No LLM set");
      }

      console.log(llm);
      stream = await llm.chatCompletionStream(currentChat);
    } catch (e) {
      console.log(`Failed to reach LLM: ${e}`);
      console.log(chats);
      if (!chats[chatIdx]?.messages[chats[chatIdx]?.messages.length - 1].content) {
        addToLastChatMessageContent(chatIdx, `Failed to reach ${llm?.name}. Please check your key and try again.`);
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
    embedMessage(chatIdx, reply);  // by this point the reply should be done and ready to embed

    setThinking(false);
  }
  
  return (
    <div className="flex flex-col items-center w-[26rem] p-2 dark:bg-gray-900">
        <div className="w-full flex flex-row justify-between dark:text-white">
            <Link to="/key">
                <h1 className="text-md underline">Set Key</h1>
            </Link>
        </div>
        <h1 className="text-xl font-bold dark:text-white">Lumira🌙</h1>
        <ChatSwitcher thinking={thinking} chats={chats} chatIdx={chatIdx} setChatIdx={setChatIdx} />
        <ChatWindow thinking={thinking} />
        <ChatBox thinking={thinking} addMessage={addMessage} />
    </div>
  );
}