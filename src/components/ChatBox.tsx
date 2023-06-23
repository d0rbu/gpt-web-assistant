import { useEffect, useState, createRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'


export default function ({ addMessage }: { addMessage: (message: string) => void }) {
  const [message, setMessage] = useState<string>("");
  const textareaRef: React.RefObject<HTMLTextAreaElement> = createRef();
  const formRef: React.RefObject<HTMLFormElement> = createRef();

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

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
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="rounded-b-lg dark:bg-gray-700 w-full">
      <div className="flex flex-row w-full h-full dark:text-white">
        <form onSubmit={handleSubmit} ref={formRef} className="grow h-full">
          <textarea ref={textareaRef} rows={1} className="w-full dark:bg-gray-700 dark:text-white px-3 pt-3 pb-2 text-md resize-none overflow-hidden focus:outline-none" value={message} onChange={handleInputChange} onKeyDown={handleKeyDown} />
        </form>
        <PaperAirplaneIcon className='w-11 h-11 text-gray-500 dark:text-gray-300 cursor-pointer p-3' onClick={submitMessage} />
      </div>
    </div>
  );
}