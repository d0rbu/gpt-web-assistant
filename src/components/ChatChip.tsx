import { useEffect, useState, createRef } from 'react';
import { Chat, Message } from '../util/types';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useStore } from '../state/store';


export default function ({ thinking, chat, idx, selected }: { thinking: boolean, chat: Chat | null, idx: number, selected: boolean }) {
  const { setChatIdx, removeChat } = useStore();

  const navigateToChat = () => {
    if (!thinking) {
      setChatIdx(idx);
    }
  }

  const deleteChat = () => {
    if (!thinking) {
      removeChat(idx);
    }
  }

  return (
    <div className="my-1">
      <div className={`rounded-full flex flex-row items-center ${selected ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-800"}`}>
        <button className={`pl-2 ${!selected || chat === null ? "pr-2" : "pr-1"} py-1`} onClick={navigateToChat}>
          {chat === null ? "+" : (chat.title ? chat.title : `Chat ${idx + 1}`)}
        </button>
        {selected && chat !== null ? 
          <button onClick={deleteChat} className="px-1 py-1 flex flex-col">
            <XMarkIcon className="w-4 h-4 dark:text-gray-300" />
          </button>
          : null}
      </div>
    </div>
  );
}