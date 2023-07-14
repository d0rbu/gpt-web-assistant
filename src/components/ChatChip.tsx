import { useEffect, useState, useRef } from 'react';
import { Chat, Message } from '../util/types';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useStore } from '../state/store';


const ADD_CHAT_TEXT = "+";


export default function ({ thinking, chat, idx, selected }: { thinking: boolean, chat: Chat | null, idx: number, selected: boolean }) {
  const { setChatIdx, removeChat, setTitle } = useStore();
  const [ currentTitle, setCurrentTitle ] = useState<string>(chat ? chat.title : "");
  const [ editingTitle, setEditingTitle ] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    if (measureRef.current && chat !== null) {
      const textToMeasure = (editingTitle || currentTitle) ? currentTitle : `Chat ${idx + 1}`;
      measureRef.current.textContent = textToMeasure; // Set the text content to measure its width
      const contentWidth = Math.max(measureRef.current.offsetWidth, 2);
      inputRef.current.style.width = `${contentWidth}px`; // Set the width to the content width
    }

    if (editingTitle && currentTitle) {
      setTitle(idx, currentTitle);
    }
  }, [currentTitle, editingTitle]);

  useEffect(() => {
    const handleFocus = () => {
      setEditingTitle(true);
    };

    const handleBlur = () => {
      setEditingTitle(false);
    };

    const inputElement = inputRef.current;

    if (!inputElement) {
      return;
    }

    if (!measureRef.current) {
      return;
    }

    let unsubscribeToTitleChanges: (() => void) | null = null;
    if (chat === null) {
      measureRef.current.textContent = ADD_CHAT_TEXT
      const contentWidth = Math.max(measureRef.current.offsetWidth, 2);
      inputRef.current.style.width = `${contentWidth}px`; // Set the width to the content width
    } else {
      unsubscribeToTitleChanges = useStore.subscribe((state) => {
        if (idx < 0 || idx >= state.chats.length) {
          return '';
        }

        return state.chats[idx].title;
      }, (title: string) => {
        setCurrentTitle(title);
      });
    }

    inputElement.addEventListener('focusin', handleFocus);
    inputElement.addEventListener('focusout', handleBlur);

    return () => {
      if (unsubscribeToTitleChanges) {
        unsubscribeToTitleChanges();
      }

      if (inputElement) {
        inputElement.removeEventListener('focusin', handleFocus);
        inputElement.removeEventListener('focusout', handleBlur);
      }
    };
  }, [])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (chat === null) {
      return;
    }

    setCurrentTitle(event.target.value);
    setTitle(idx, event.target.value);
  };

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
          <input
            ref={inputRef}
            value={chat === null ? ADD_CHAT_TEXT : (currentTitle ? currentTitle : (editingTitle ? "" : `Chat ${idx + 1}`))}
            onChange={handleChange}
            className={`bg-transparent ${selected ? "cursor-text" : "cursor-pointer"}`}
            disabled={!selected}
          />
          <div
            ref={measureRef}
            style={{ visibility: 'hidden', whiteSpace: 'pre', position: 'absolute', top: 0, left: 0 }}
          >
            {currentTitle}
          </div>
        </button>
        {selected && chat !== null ? 
          <button onClick={deleteChat} className="pr-1 py-1 flex flex-col">
            <XMarkIcon className="w-4 h-4 dark:text-gray-300" />
          </button>
          : null}
      </div>
    </div>
  );
}