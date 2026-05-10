import React from 'react'

export default function MessageItem({ msg, me }) {
  const isMe = String(msg.sender._id) === String(me?.id)
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] px-3 py-2 rounded-lg ${isMe ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-100'}`}>
        <div className="text-sm">{msg.content}</div>
        <div className="text-xs text-slate-400 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString()}</div>
      </div>
    </div>
  )
}
