import { useEffect, useState, useRef } from 'react';
import { useStore } from '../state/store';
import { Chat, Message } from '../util/types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import ChatChip from './ChatChip';


const SHOW_ARROWS_WIDTH = 380;
const VERTICAL_TO_HORIZONTAL_SCROLL_RATIO = 2;


export default function ({ thinking, chats, chatIdx }: { thinking: boolean, chats: Chat[], chatIdx: number }) {
  const chatChipsRef = useRef<HTMLDivElement>(null);
  const chatChipsContainerRef = useRef<HTMLDivElement>(null);
  let [showArrows, setShowArrows] = useState<boolean>(false);
  let [scrollLeft, setScrollLeft] = useState<number>(0);

  useEffect(() => {
    if (!chatChipsRef.current) {
      return;
    }

    const newShowArrows = chatChipsRef.current.scrollWidth > SHOW_ARROWS_WIDTH;
    if (newShowArrows === showArrows) {
      return;
    }

    setShowArrows(newShowArrows);
  }, [chats]);

  useEffect(() => {
    if (chatChipsRef.current === null) {
      return;
    }

    const trackScroll = () => {
      setScrollLeft(chatChipsRef.current?.scrollLeft || 0);
    }

    chatChipsRef.current?.addEventListener('scroll', trackScroll);

    return () => chatChipsRef.current?.removeEventListener('scroll', trackScroll)
  }, [chatChipsRef])

  useEffect(() => {
    if (chatChipsRef.current === null) {
      return;
    }

    const scrollSide = (event: WheelEvent) => {
      if (event.deltaX !== 0) {
        return;
      }

      event.preventDefault();

      if (!chatChipsRef.current) {
        return;
      }

      const scrollAmt = event.deltaY;
      chatChipsRef.current.scrollBy({ left: scrollAmt / VERTICAL_TO_HORIZONTAL_SCROLL_RATIO, behavior: 'auto'});
    }

    chatChipsRef.current?.addEventListener('wheel', scrollSide);

    return () => chatChipsRef.current?.removeEventListener('wheel', scrollSide)
  }, [chatChipsRef])

  const scrollFn = (scrollAmt: number) => {
    return () => {
      if (!chatChipsRef.current) {
        return;
      }

      chatChipsRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    }
  }

  return (
    <div className={`w-full flex flex-row ${chats.length > 0 ? "gap-1" : null} dark:text-white`}>
      {showArrows
        ? <button onClick={scrollFn(-SHOW_ARROWS_WIDTH)} disabled={scrollLeft === 0}>
        <ChevronLeftIcon className={`w-4 h-4 ${scrollLeft === 0 ? "text-gray-600 dark:text-gray-500" : "text-gray-800 dark:text-gray-300"}`} />
          </button>
        : null
      }
      <div className="overflow-x-hidden" ref={chatChipsContainerRef}>
        <div className={`flex flex-row h-full space-x-1 whitespace-nowrap overflow-x-auto scrollbar-hide`} ref={chatChipsRef}>
          {
            chats.map((chat, index) => {
              return <ChatChip thinking={thinking} chat={chat} idx={index} key={index} selected={index === chatIdx} />
            })
          }
        </div>
      </div>
      {showArrows
        ? <button onClick={scrollFn(SHOW_ARROWS_WIDTH)} disabled={(chatChipsRef.current && chatChipsContainerRef.current) ? scrollLeft + chatChipsContainerRef.current.scrollWidth === chatChipsRef.current.scrollWidth : false}>
            <ChevronRightIcon className={`w-4 h-4 ${(chatChipsRef.current && chatChipsContainerRef.current) && scrollLeft + chatChipsContainerRef.current.scrollWidth === chatChipsRef.current.scrollWidth ? "text-gray-600 dark:text-gray-500" : "text-gray-800 dark:text-gray-300"}`} />
          </button>
        : null
      }
      <ChatChip thinking={thinking} chat={null} idx={chats.length} key={chats.length} selected={chatIdx === chats.length} />
    </div>
  );
}