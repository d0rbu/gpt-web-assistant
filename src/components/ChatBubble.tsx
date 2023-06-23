import { useStore, Chat, Message } from '../state/store';
import { useEffect, useState, useRef } from 'react';


export default function({ message, scrollIntoView }: { message: Message, scrollIntoView: boolean }) {
    const chatBubble = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!scrollIntoView) {
            return;
        }

        if (!chatBubble.current) {
            return;
        }

        chatBubble.current.scrollIntoView();
    }, [scrollIntoView]);

    return (
        <div className="flex flex-row items-center justify-end w-full" ref={chatBubble}>
            <div className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"} justify-start p-2 rounded-lg bg-gray-200 dark:bg-gray-700 max-w-xs`}>
                <p className="text-sm dark:text-white whitespace-pre-line w-full break-words">{message.content}</p>
            </div>
        </div>
    );
}