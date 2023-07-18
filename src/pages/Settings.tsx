import browser from "webextension-polyfill";
import { useStore } from '../state/store';
import { GPT } from '../util/llms';
import { Link } from "react-router-dom";
import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';


function slideOptions(props: { options: string[], setOption: (option: string) => void }) {
  return (
    <div>
      
    </div>
  )
}


function setting(props: { name: string, children: React.ReactNode }) {
  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex flex-row">
        <h1 className="text-lg w-1/2">{props.name}</h1>
        <div className="w-1/2 flex flex-row justify-center">
          {props.children}
        </div>
      </div>
    </div>
  );
}

const Setting = setting;  // dumb hot reload dont be recognizing the function if its uppercase smh

export default function() {
  const { key, setKey, setLLM } = useStore();
  
  return (
    <div className="flex flex-col w-[26rem] p-2 dark:bg-gray-800 dark:text-white gap-3">
      <div className="absolute top-2 left-2">
        <Link to="/chat">
          <ChatBubbleOvalLeftIcon className="w-7 h-7 dark:text-gray-300" />
        </Link>
      </div>
      <div className="w-full flex flex-row justify-center pb-2">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>
      <Setting name="Website Filtering Mode">
        <div className="text-lg">yea</div>
      </Setting>
    </div>
  );
}