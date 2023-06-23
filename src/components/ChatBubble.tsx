import { useStore, Chat, Message } from '../state/store';


export default function({ message, ai }: { message: Message, ai: boolean }) {
    if (ai === true) {
        return (
            <div className="flex flex-row items-center justify-start w-full">
                <div className="flex flex-col items-start justify-start p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                    <p className="text-sm dark:text-white whitespace-pre-wrap">{message.content}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-row items-center justify-end w-full">
            <div className="flex flex-col items-end justify-start p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                <p className="text-sm dark:text-white whitespace-pre-line">{message.content}</p>
            </div>
        </div>
    );
}