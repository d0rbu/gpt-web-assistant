import { useStore } from '../state/store';
import { Chat, Message } from '../util/types';
import { useEffect, useState, useRef } from 'react';


export default function ({ parentWindowRef, message, scrollIntoView }: { parentWindowRef: React.RefObject<HTMLDivElement>, message: Message, scrollIntoView: boolean }) {
  const chatBubble = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollIntoView) {
      return;
    }

    if (!chatBubble.current) {
      return;
    }

    chatBubble.current.scrollIntoView(false);
  }, [scrollIntoView]);


  useEffect(() => useStore.subscribe((state) => state.chats, (chats) => {
    if (!scrollIntoView) {
      return;
    }

    if (!chatBubble.current) {
      return;
    }

    // TODO: check if we were at the bottom of the chat window previously and not now

    chatBubble.current?.scrollIntoView(false);
  }), []);

  return (
    <div className={`flex flex-row items-center ${message.sender == "user" ? "justify-end" : "justify-start"} pb-2 w-full`} ref={chatBubble}>
      <div className={`p-2 rounded-lg bg-gray-200 dark:bg-gray-700 max-w-xs`}>
        <p className="text-sm dark:text-white whitespace-pre-line w-full break-words">{message.content}</p>
      </div>
    </div>
  );
}