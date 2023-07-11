import { useEffect, useState, createRef } from 'react';
import { Chat, Message } from '../util/types';
import { XMarkIcon } from '@heroicons/react/24/solid';


export default function ({ thinking, chat, idx, selected, setChatIdx }: { thinking: boolean, chat: Chat | null, idx: number, selected: boolean, setChatIdx: (idx: number) => void }) {
  const navigateToChat = () => {
    if (!thinking) {
      setChatIdx(idx);
    }
  }

  return (
    <div className="my-1">
      <div className={`px-2 py-1 rounded-full flex flex-row items-center space-x-1 ${selected ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-800"}`}>
        <button onClick={navigateToChat}>
          {chat === null ? "+" : (chat.title ? chat.title : `Chat ${idx + 1}`)}
        </button>
        {selected && chat !== null ? 
          <button onClick={navigateToChat} className="ml-1 flex flex-col">
            <XMarkIcon className="w-4 h-4 text-red-500" />
          </button>
          : null}
      </div>
    </div>
  );
}