import { useEffect, useRef, useState } from 'react';
import { useStore } from '../state/store';
import { Message } from '../util/types';


const BOTTOM_LEEWAY = 12;


export default function ({ grandparentWindowRef, parentWindowRef, message, idx }: { grandparentWindowRef: React.RefObject<HTMLDivElement>, parentWindowRef: React.RefObject<HTMLDivElement>, message: Message, idx: number }) {
  function isOnBottom() {
    if (!grandparentWindowRef?.current) {
      return false;
    }

    const clientHeight: number = grandparentWindowRef.current.clientHeight;
    const distanceFromBottom: number = grandparentWindowRef.current.scrollHeight - grandparentWindowRef.current.scrollTop;

    return distanceFromBottom <= clientHeight + BOTTOM_LEEWAY;
  }

  const { chats } = useStore();
  const chatBubble = useRef<HTMLDivElement>(null);
  const [stickToBottom, setStickToBottom] = useState<boolean>(true);
  const [oldScrollTop, setOldScrollTop] = useState<number>(0);

  // set sticktobottom to true when isOnBottom is true and user doesn't scroll/scrolls down, false otherwise
  useEffect(() => {
    if (!grandparentWindowRef?.current) {
      return;
    }

    const onScroll = (event: Event) => {
      if (!grandparentWindowRef?.current) {
        return;
      }

      // check if scrolling down and if on bottom
      const isScrollingDown: boolean = grandparentWindowRef.current.scrollTop > oldScrollTop;
      const onBottom: boolean = isOnBottom();
      setOldScrollTop(grandparentWindowRef.current.scrollTop);

      // set stickToBottom
      setStickToBottom(onBottom && isScrollingDown);
    }

    grandparentWindowRef.current.addEventListener('scroll', onScroll);

    return () => {
      grandparentWindowRef.current?.removeEventListener('scroll', onScroll);
    }
  }, [grandparentWindowRef]);

  // scroll to bottom if stickToBottom is true
  useEffect(() => {
    if (!stickToBottom) {
      return;
    }

    if (!grandparentWindowRef?.current) {
      return;
    }

    chatBubble.current?.scrollIntoView(false);
  }, [chats]);

  return (
    <div className={`flex flex-row items-center ${message.sender == "user" ? "justify-end" : "justify-start"} pb-2 w-full`} ref={chatBubble}>
      <div className={`p-2 rounded-lg bg-gray-200 dark:bg-gray-700 max-w-xs`}>
        <p className="text-sm dark:text-white whitespace-pre-line w-full break-words min-h-[1rem]">{message.content ? message.content : "..."}</p>
      </div>
    </div>
  );
}