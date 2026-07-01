import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';

export default function Chat() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/chat/threads').then((res) => setThreads(res.data.data));

    const socket = getSocket();
    socket.connect();
    socketRef.current = socket;

    socket.on('new_message', (msg) => {
      setMessages((prev) => {
        // Avoid duplicate if this client sent it and it's already appended optimistically
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.off('new_message');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openThread = async (thread) => {
    setActiveThread(thread);
    const res = await api.get(`/chat/${thread._id}/messages`);
    setMessages(res.data.data);
    socketRef.current?.emit('join_room', { interestId: thread._id });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeThread) return;
    socketRef.current?.emit('send_message', { interestId: activeThread._id, text }, (ack) => {
      if (!ack.success) alert(ack.message);
    });
    setText('');
  };

  return (
    <div className="chat-layout">
      <aside className="thread-list">
        <h3>Conversations</h3>
        {threads.length === 0 && <p className="muted">No accepted conversations yet.</p>}
        {threads.map((t) => {
          const otherParty = user.role === 'tenant' ? t.owner : t.tenant;
          return (
            <button
              key={t._id}
              className={`thread-item ${activeThread?._id === t._id ? 'active' : ''}`}
              onClick={() => openThread(t)}
            >
              <strong>{otherParty?.name}</strong>
              <span className="muted">{t.listing?.location}</span>
            </button>
          );
        })}
      </aside>
      <section className="chat-window">
        {!activeThread ? (
          <p className="muted">Select a conversation to start chatting.</p>
        ) : (
          <>
            <div className="chat-header">
              {activeThread.listing?.location} — with{' '}
              {user.role === 'tenant' ? activeThread.owner?.name : activeThread.tenant?.name}
            </div>
            <div className="chat-messages">
              {messages.map((m) => (
                <div
                  key={m._id}
                  className={`chat-bubble ${String(m.sender?._id || m.sender) === String(user.id) ? 'mine' : ''}`}
                >
                  <p>{m.text}</p>
                  <span className="muted small">{new Date(m.createdAt).toLocaleTimeString()}</span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form className="chat-input" onSubmit={sendMessage}>
              <input
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
