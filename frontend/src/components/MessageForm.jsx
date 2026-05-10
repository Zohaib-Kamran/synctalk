import React, { useState } from 'react'

export default function MessageForm({ onSend, onTyping }) {
  const [text, setText] = useState('')
  const sending = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    await onSend(text.trim())
    setText('')
    if (onTyping) onTyping(false)
  }
  return (
    <form onSubmit={sending} className="p-3 bg-slate-900">
      <div className="flex gap-2">
        <input value={text} onChange={e=>{ setText(e.target.value); if (onTyping) onTyping(true) }} placeholder="Type a message" className="flex-1 p-2 rounded bg-slate-800" />
        <button className="px-4 py-2 bg-indigo-600 rounded">Send</button>
      </div>
    </form>
  )
}
