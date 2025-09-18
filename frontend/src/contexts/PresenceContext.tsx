import React, { createContext, useContext, useEffect, useState } from 'react';
import getSocket from '../services/socket';

interface OnlineUser { userId: string; firstName: string; lastName: string; avatar?: string; status?: string }

interface PresenceContextType {
  onlineUsers: Record<string, OnlineUser>;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser>>({});

  useEffect(() => {
    const socket = getSocket();
    const upsert = (u: OnlineUser) => setOnlineUsers((prev) => ({ ...prev, [u.userId]: u }));
    const remove = (id: string) => setOnlineUsers((prev) => { const c = { ...prev }; delete c[id]; return c; });
    const onList = (list: OnlineUser[]) => {
      const map: Record<string, OnlineUser> = {};
      list.forEach(u => { map[u.userId] = u; });
      setOnlineUsers(map);
    };

    socket.on('users:online-list', onList);
    socket.on('user:online', upsert);
    socket.on('user:offline', (d: any) => remove(d.userId));
    socket.on('status:user-updated', (d: any) => setOnlineUsers((prev) => ({ ...prev, [d.userId]: { ...(prev[d.userId] || { userId: d.userId }), status: d.status } })));

    return () => {
      socket.off('users:online-list', onList);
      socket.off('user:online', upsert as any);
      socket.off('user:offline', remove as any);
      socket.off('status:user-updated');
    };
  }, []);

  return (
    <PresenceContext.Provider value={{ onlineUsers }}>{children}</PresenceContext.Provider>
  );
};

export const usePresence = () => {
  const ctx = useContext(PresenceContext);
  if (!ctx) throw new Error('usePresence must be used within PresenceProvider');
  return ctx;
};

