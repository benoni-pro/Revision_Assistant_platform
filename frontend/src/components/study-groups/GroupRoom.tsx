import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import getSocket from '../../services/socket';

interface ChatMessage {
  id: number | string;
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  message: string;
  timestamp: string | Date;
}

export const GroupRoom: React.FC = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (id) socket.emit('study-group:join', id);

    const onNew = (msg: ChatMessage) => setMessages((prev) => [...prev, msg]);
    socket.on('chat:new-message', onNew);

    return () => {
      if (id) socket.emit('study-group:leave', id);
      socket.off('chat:new-message', onNew);
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed || !id) return;
    const socket = getSocket();
    socket.emit('chat:message', { groupId: id, message: trimmed, type: 'text' });
    setInput('');
  };

  return (
    <div className="flex flex-col h-[70vh] card">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="bg-gray-50 rounded-lg p-2">
            <div className="text-sm font-medium">{m.firstName} {m.lastName}</div>
            <div className="text-sm text-gray-700">{m.message}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t p-3 flex gap-2">
        <input className="form-input flex-1" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." />
        <button className="btn-primary" onClick={send}>
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default GroupRoom;

