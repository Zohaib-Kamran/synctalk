import React, { useState } from 'react'
import { searchUsers } from '../services/userService'

export default function UserSearch({ onCreate }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const doSearch = async (e) => {
    e.preventDefault()
    const term = q.trim()
    if (!term) return setResults([])
    setLoading(true)
    try {
      const res = await searchUsers(term)
      setResults(res.data.users || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  return (
    <div className="p-3 border-b border-slate-800">
      <form onSubmit={doSearch} className="flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search users by name or email" className="flex-1 p-2 rounded bg-slate-800" />
        <button className="px-3 py-2 bg-indigo-600 rounded" disabled={loading}>{loading ? '...' : 'Search'}</button>
      </form>
      {results.length > 0 && (
        <ul className="mt-2 max-h-48 overflow-y-auto">
          {results.map(u => (
            <li key={u._id} className="flex items-center justify-between p-2 hover:bg-slate-700 rounded">
              <div>
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-slate-400">{u.email}</div>
              </div>
              <div>
                <button onClick={() => onCreate(u)} className="px-3 py-1 bg-indigo-600 rounded">Chat</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
