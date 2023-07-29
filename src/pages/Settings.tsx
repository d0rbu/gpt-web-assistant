import browser from "webextension-polyfill";
import { useStore } from '../state/store';
import SlideOptions from "../components/SlideOptions";
import Setting from "../components/Setting";
import { Link } from "react-router-dom";
import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from "react";


export default function() {
  const { key, setKey, setLLM, filteringMode, setFilteringMode } = useStore();
  
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
        <SlideOptions options={["blocklist", "allowlist"]} option={filteringMode} setOption={setFilteringMode} width={24} />
      </Setting>
    </div>
  );
}