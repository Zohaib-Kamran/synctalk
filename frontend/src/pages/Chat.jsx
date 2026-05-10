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
    })
    return () => { const s = getSocket(); if (s) s.off('message:new') }
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
    } catch (err) { console.error(err) }
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
            <header className="p-4 border-b border-slate-700">{active.isGroup ? active.name : active.members.filter(m=>m._id!==user?.id).map(m=>m.name).join(', ')}</header>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col-reverse">
              {messages.map(m => <MessageItem key={m._id} msg={m} me={user} />)}
            </div>
            <MessageForm onSend={handleSend} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">Select a chat to start messaging</div>
        )}
      </main>
    </div>
  )
}
