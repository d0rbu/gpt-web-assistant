import { useEffect, useState, createRef } from 'react';
import { Chat, Message } from '../util/types';
import ChatChip from './ChatChip';


export default function ({ thinking, chats, chatIdx, setChatIdx }: { thinking: boolean, chats: Chat[], chatIdx: number, setChatIdx: (idx: number) => void }) {
  return (
    <div className="flex flex-row w-full h-full dark:text-white space-x-1 overflow-x-auto scrollbar-hide">
      {
        chats.map((chat, index) => {
          return <ChatChip thinking={thinking} chat={chat} idx={index} key={index} selected={index === chatIdx} setChatIdx={setChatIdx} />
        })
      }
      <ChatChip thinking={thinking} chat={null} idx={chats.length} key={chats.length} selected={chats.length === chatIdx} setChatIdx={setChatIdx} />
    </div>
  );
}