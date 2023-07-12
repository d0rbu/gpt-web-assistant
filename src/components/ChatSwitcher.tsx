import { useEffect, useState, createRef } from 'react';
import { useStore } from '../state/store';
import { Chat, Message } from '../util/types';
import ChatChip from './ChatChip';


export default function ({ thinking, chats, chatIdx }: { thinking: boolean, chats: Chat[], chatIdx: number }) {
  return (
    <div className="flex flex-row w-full h-full dark:text-white space-x-1 overflow-x-auto scrollbar-hide">
      {
        chats.map((chat, index) => {
          return <ChatChip thinking={thinking} chat={chat} idx={index} key={index} selected={index === chatIdx} />
        })
      }
      <ChatChip thinking={thinking} chat={null} idx={chats.length} key={chats.length} selected={chatIdx === chats.length} />
    </div>
  );
}