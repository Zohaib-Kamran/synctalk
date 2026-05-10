import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { initSocket, getSocket } from '../services/socket'
import { getMyChats } from '../services/chatService'
import { getMessages, sendMessage } from '../services/messageService'
import ChatList from '../components/ChatList'
import MessageItem from '../components/MessageItem'
import MessageForm from '../components/MessageForm'
import UserSearch from '../components/UserSearch'
import { createOneToOne } from '../services/chatService'

export default function ChatPage() {
  const { user, accessToken } = useAuth()
  const [chats, setChats] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyChats()
        // attach myId to each chat for UI
        const data = res.data.chats.map(c => ({ ...c, myId: user?.id }))
        setChats(data)
      } catch (err) { console.error(err) }
    })()
  }, [user])

  useEffect(() => {
    if (!accessToken) return
    const socket = initSocket(accessToken)
    socket.on('connect', () => console.log('socket connected'))
    socket.on('message:new', (msg) => {
      // if message belongs to active chat, append
      if (msg.chat === active?._id) setMessages(prev => [msg, ...prev])
      // notify server that this client delivered the message
      try { const s = getSocket(); if (s && msg._id) s.emit('message:delivered', { messageId: msg._id, chatId: msg.chat }) } catch (e) { }
    })
    socket.on('message:delivered', ({ messageId, userId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, deliveredTo: Array.from(new Set([...(m.deliveredTo||[]), userId])) } : m))
    })
    socket.on('message:read', ({ messageId, userId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, readBy: Array.from(new Set([...(m.readBy||[]), userId])) } : m))
    })
    socket.on('typing', ({ userId, typing }) => {
      if (userId === user?.id) return
      setTypingUsers(prev => {
        if (typing) return Array.from(new Set([...prev, userId]))
        return prev.filter(id => id !== userId)
      })
    })
    return () => {
      const s = getSocket();
      if (!s) return
      s.off('message:new')
      s.off('message:delivered')
      s.off('message:read')
      s.off('typing')
    }
  }, [accessToken, active])

  const openChat = async (chat) => {
    setActive(chat)
    // join room
    const socket = getSocket()
    if (socket) socket.emit('join:chat', chat._id)
    // load messages
    try {
      const res = await getMessages(chat._id)
      setMessages(res.data.messages)
      // mark messages as delivered and read where appropriate
      const s = getSocket()
      if (s) {
        // notify delivered for each message
        for (const m of res.data.messages) {
          if (m._id) s.emit('message:delivered', { messageId: m._id, chatId: chat._id })
        }
        // notify read for messages not sent by me and not yet read
        for (const m of res.data.messages) {
          if (m.sender && String(m.sender._id) !== String(user?.id) && !(m.readBy || []).map(String).includes(String(user?.id))) {
            s.emit('message:read', { messageId: m._id, chatId: chat._id })
          }
        }
      }
    } catch (err) { console.error(err) }
  }

  const typingTimeoutRef = React.useRef(null)

  const handleTyping = (isTyping) => {
    const s = getSocket()
    if (!s || !active) return
    s.emit('typing', { chatId: active._id, typing: isTyping })
    if (isTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => { s.emit('typing', { chatId: active._id, typing: false }) }, 1500)
    }
  }

  const handleSend = async (text) => {
    if (!active) return
    try {
      const res = await sendMessage({ chatId: active._id, content: text })
      // optimistic append
      setMessages(prev => [res.data.message, ...prev])
    } catch (err) { console.error(err) }
  }

  const handleCreateWithUser = async (userObj) => {
    try {
      const res = await createOneToOne(userObj._id)
      const chat = res.data.chat
      // refresh chats and open
      const list = await getMyChats()
      setChats(list.data.chats.map(c => ({ ...c, myId: user?.id })))
      if (chat) openChat(chat)
    } catch (err) { console.error(err) }
  }

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100">
      <div className="w-72 flex flex-col">
        <UserSearch onCreate={handleCreateWithUser} />
        <ChatList chats={chats} onSelect={openChat} selectedId={active?._id} />
      </div>
      <main className="flex-1 flex flex-col">
        {active ? (
          <div className="flex-1 flex flex-col">
            <header className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>{active.isGroup ? active.name : active.members.filter(m=>m._id!==user?.id).map(m=>m.name).join(', ')}</div>
                <div className="text-sm text-slate-400">{typingUsers.length > 0 ? 'typing...' : ''}</div>
              </div>
            </header>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col-reverse">
              {messages.map(m => <MessageItem key={m._id} msg={m} me={user} />)}
            </div>
            <MessageForm onSend={handleSend} onTyping={handleTyping} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">Select a chat to start messaging</div>
        )}
      </main>
    </div>
  )
}
