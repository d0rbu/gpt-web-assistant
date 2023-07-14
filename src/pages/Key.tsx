import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";
import { useStore } from '../state/store';
import { GPT } from '../util/llms';



export default function() {
  const { key, setKey, setLLM } = useStore();
  const navigate = useNavigate();

  const submitKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const keyConnection = browser.runtime.connect({ name: "key" });

    keyConnection.postMessage(key);
    setLLM(new GPT());
    navigate("/chat");
  }

  
  return (
    <div className="flex flex-col items-center justify-center w-[26rem] h-28 p-4 dark:bg-gray-800 dark:text-white">
      <h1 className="text-lg font-bold">OpenAI Key</h1>
      <div className="grow" />
      <form onSubmit={submitKey}>
        <input type="text" className="border border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 rounded-md p-2 w-96" value={key} onChange={e => setKey(e.target.value)} />
      </form>
    </div>
  );
}