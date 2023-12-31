import { useEffect } from 'react';
import {
  Route,
  Routes,
  useNavigate
} from "react-router-dom";
import { useStore } from '../state/store';
import Chat from './Chat';
import Key from './Key';
import Settings from './Settings';


export default function() {
  const { key } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const startPage: string = key ? '/chat' : '/key';
    navigate(startPage);
  }, []);

  return (
    <Routes>
      <Route path="/key" element={<Key />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}
