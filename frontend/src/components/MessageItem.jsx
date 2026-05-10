import React from 'react'

function CheckIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
    </svg>
  )
}

function DoubleCheckIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.56 7.22a1 1 0 00-1.41-.02L9 18.34l-3.15-3.14a1 1 0 10-1.41 1.42l3.86 3.85a1 1 0 001.42 0l12.28-12.27a1 1 0 00.01-1.42z" />
      <path d="M16.24 7.22a1 1 0 00-1.41-.02L9 12.99 7.76 11.75a1 1 0 10-1.41 1.42l2.35 2.34a1 1 0 001.41 0l6.13-6.12a1 1 0 00.0-1.42z" />
    </svg>
  )
}

export default function MessageItem({ msg, me }) {
  const isMe = String(msg.sender._id) === String(me?.id)

  const readers = Array.isArray(msg.readBy) ? msg.readBy : []
  const delivered = Array.isArray(msg.deliveredTo) ? msg.deliveredTo : []

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] px-3 py-2 rounded-lg ${isMe ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-100'}`}>
        <div className="text-sm">{msg.content}</div>
        <div className="flex items-center justify-between mt-1">
          <div className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleTimeString()}</div>
          <div className="ml-2 flex items-center gap-1">
            {isMe && readers.length > 0 && (
              <div className="flex -space-x-2">
                {readers.slice(0, 4).map(r => (
                  <img key={r._id} src={r.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=64748b&color=fff`} alt={r.name} title={r.name} className="w-5 h-5 rounded-full ring-1 ring-slate-900" />
                ))}
              </div>
            )}
            {isMe && readers.length === 0 && delivered.length > 0 && (
              <div className="text-slate-200">
                <DoubleCheckIcon className="w-4 h-4" />
              </div>
            )}
            {isMe && readers.length === 0 && delivered.length === 0 && (
              <div className="text-slate-400"> </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
