import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import Key from './Key';
import Chat from './Chat';
import {
  MemoryRouter,
  Routes,
  Route,
} from "react-router-dom";


export default function() {
  return (
    <Routes>
      <Route path="/" element={<Key />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  )
}
