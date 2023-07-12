import { useEffect, useState, createRef } from 'react';
import { Chat, Message } from '../util/types';
import { XMarkIcon } from '@heroicons/react/24/solid';


export default function ({ thinking, chat, idx, selected, setChatIdx }: { thinking: boolean, chat: Chat | null, idx: number, selected: boolean, setChatIdx: (idx: number) => void }) {
  const navigateToChat = () => {
    if (!thinking) {
      setChatIdx(idx);
    }
  }

  const deleteChat = () => {
    if (!thinking) {
      setChatIdx(idx + 1);
    }
  }

  return (
    <div className="my-1">
      <button onClick={navigateToChat}>
        <div className={`px-2 py-1 rounded-full flex flex-row items-center space-x-1 ${selected ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-800"}`}>
          {chat === null ? "+" : (chat.title ? chat.title : `Chat ${idx + 1}`)}
        {selected && chat !== null ? 
          <button onClick={deleteChat} className="ml-1 flex flex-col">
            <XMarkIcon className="w-4 h-4 dark:text-gray-300" />
          </button>
          : null}
        </div>
      </button>
    </div>
  );
}