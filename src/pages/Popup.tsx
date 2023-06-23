import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import Key from './Key';
import Chat from './Chat';
import {
  MemoryRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";


export default function() {
  const { key, setKey } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const startPage: string = key ? '/chat' : '/key';
    navigate(startPage);
  }, []);

  return (
    <Routes>
      <Route path="/key" element={<Key />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  )
}
