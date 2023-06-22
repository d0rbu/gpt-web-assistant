import { useEffect, useState, createRef } from 'react';



export default function ({ addMessage }: { addMessage: (message: string) => void }) {
  const [message, setMessage] = useState<string>("");
  const textareaRef: React.RefObject<HTMLTextAreaElement> = createRef();

  const handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void = (event) => {
    event.preventDefault();
    addMessage(message);
    setMessage("");
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="rounded-b-lg dark:bg-gray-700 w-full">
      <div className="flex flex-row w-full h-full dark:text-white">
        <form onSubmit={handleSubmit} className="grow h-full">
          <textarea ref={textareaRef} rows={1} className="w-full dark:bg-gray-700 dark:text-white p-3 text-md resize-none overflow-hidden" value={message} onChange={handleInputChange} />
        </form>
        hi
      </div>
    </div>
  );
}