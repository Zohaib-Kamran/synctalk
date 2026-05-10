import React from 'react'

export default function ChatList({ chats, onSelect, selectedId }) {
  return (
    <aside className="w-72 bg-slate-800 p-3 overflow-y-auto">
      <h3 className="text-slate-300 font-semibold px-2 mb-2">Chats</h3>
      <ul className="space-y-2">
        {chats.map(c => (
          <li key={c._id} className={`p-2 rounded cursor-pointer ${selectedId===c._id ? 'bg-slate-700' : 'hover:bg-slate-700'}`} onClick={() => onSelect(c)}>
            <div className="text-sm font-medium">{c.isGroup ? c.name : c.members.filter(m=>m._id!==c.myId).map(m=>m.name).join(', ')}</div>
            {c.lastMessage && <div className="text-xs text-slate-400 truncate">{c.lastMessage.content}</div>}
          </li>
        ))}
      </ul>
    </aside>
  )
}
