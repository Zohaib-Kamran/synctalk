import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register({ name, email, password })
    } catch (err) { setError(err.response?.data?.message || 'Registration failed') }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-800 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full p-2 rounded bg-slate-700" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full p-2 rounded bg-slate-700" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 rounded bg-slate-700" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full py-2 bg-indigo-600 rounded" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
      </form>
    </div>
  )
}
