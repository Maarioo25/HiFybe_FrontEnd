import React from 'react';
import { FaPaperclip, FaSmile, FaEllipsisH } from 'react-icons/fa';
import HeaderBar from '../components/HeaderBar';

const CHATS = [
  {
    id: 1,
    name: "Carlos",
    lastMessage: "¡Hola! ¿Qué tal estás?",
    time: "15:30",
    unread: 2,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 2,
    name: "Ana",
    lastMessage: "Me encanta la nueva canción de The Weeknd",
    time: "14:45",
    unread: 0,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 3,
    name: "Luis",
    lastMessage: "¿Has escuchado el nuevo álbum de Harry Styles?",
    time: "13:20",
    unread: 1,
    avatar: "https://randomuser.me/api/portraits/men/65.jpg"
  }
];

export default function Chats() {
  return (
    <div className="min-h-screen bg-harmony-primary">
      <HeaderBar />
      <div className="container mx-auto px-6">
        <div className="bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl p-6 border border-harmony-text-secondary/10 h-[calc(70vh)] max-h-[calc(70vh)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-harmony-accent">Chats</h2>
            <button className="text-harmony-accent hover:text-harmony-accent/80">
              <FaEllipsisH className="text-lg" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {CHATS.map((chat) => (
              <div key={chat.id} className="chat-card flex items-center gap-3 p-3 hover:bg-harmony-secondary/50 rounded-xl transition">
                <div className="relative">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full"
                  />
                  {chat.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-harmony-accent rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{chat.unread}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-harmony-text-primary truncate">{chat.name}</span>
                    <span className="text-xs text-harmony-text-secondary">{chat.time}</span>
                  </div>
                  <div className="text-sm text-harmony-text-secondary truncate">{chat.lastMessage}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-3xl bg-harmony-secondary/30 backdrop-blur-sm rounded-2xl p-3 border border-harmony-text-secondary/10">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-harmony-secondary/50 rounded-full">
                <FaSmile className="text-lg" />
              </button>
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-transparent border-none outline-none text-harmony-text-primary placeholder:text-harmony-text-secondary"
              />
              <button className="p-2 hover:bg-harmony-secondary/50 rounded-full">
                <FaPaperclip className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}