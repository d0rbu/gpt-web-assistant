import { useEffect, useState, createRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'


const TEXTAREA_MAX_HEIGHT = 90;


export default function ({ thinking, addMessage }: { thinking: boolean, addMessage: (message: string) => void }) {
  const [message, setMessage] = useState<string>("");
  const textareaRef: React.RefObject<HTMLTextAreaElement> = createRef();
  const formRef: React.RefObject<HTMLFormElement> = createRef();

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  useEffect(() => {
    if (!thinking) {
      textareaRef.current?.focus();
    }
  }, [thinking]);

  const submitMessage = () => {
    if (message.trim() === "") {
      return;
    }

    addMessage(message);
    setMessage("");
  }

  const handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void = (event) => {
    event.preventDefault();
    submitMessage();
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
    }
  };

  return (
    <div className={`rounded-b-lg ${thinking ? "dark:bg-gray-600 bg-gray-200" : "dark:bg-gray-700 bg-gray-100"} w-full`}>
      <div className="flex flex-row w-full h-full dark:text-white">
        <form onSubmit={handleSubmit} ref={formRef} className="grow h-full px-3 pt-3 pb-2">
          <textarea disabled={thinking} ref={textareaRef} rows={1} className="w-full bg-transparent dark:text-white text-md resize-none overflow-auto scrollbar-hide focus:outline-none" value={message} onChange={handleInputChange} onKeyDown={handleKeyDown} autoFocus />
        </form>
        <PaperAirplaneIcon className={`w-11 h-11 ${thinking ? "text-gray-400 dark:text-gray-400 cursor-not-allowed" : "text-gray-500 dark:text-gray-300 cursor-pointer"} p-3`} onClick={submitMessage} />
      </div>
    </div>
  );
}