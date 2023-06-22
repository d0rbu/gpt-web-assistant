import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { useNavigate } from "react-router-dom";


export default function() {
  const { key, setKey } = useStore();
  const navigate = useNavigate();

  const submitKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    navigate("/chat");
  }

  
  return (
    <div className="flex flex-col items-center justify-center w-64 h-28 p-4">
      <h1 className="text-lg font-bold">OpenAI Key</h1>
      <div className="grow" />
      <form onSubmit={submitKey}>
        <input type="text" className="border border-gray-400 rounded-md p-2 w-56" value={key} onChange={e => setKey(e.target.value)} />
      </form>
    </div>
  );
}