import { useStore } from '../state/store';
import { Chat, Message } from '../util/types';
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
        <div className={`flex flex-row items-center ${message.sender == "user" ? "justify-end" : "justify-start"} w-full`} ref={chatBubble}>
            <div className={`p-2 rounded-lg bg-gray-200 dark:bg-gray-700 max-w-xs`}>
                <p className="text-sm dark:text-white whitespace-pre-line w-full break-words">{message.content}</p>
            </div>
        </div>
    );
}