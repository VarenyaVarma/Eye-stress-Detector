import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const nav=useNavigate()

  const submit=async(e)=>{
    e.preventDefault()
    setLoading(true)
    setError('')
    try{
      const res = await axios.post((import.meta.env.VITE_API_URL||'http://localhost:5000') + '/api/auth/login', { email, password })
      if (res.data.token){
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        window.dispatchEvent(new Event("storage")) // ✅ Refresh navbar
        nav('/') // ✅ Redirect to home
      }
    }catch(err){
      setError(err?.response?.data?.error || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Log in</h2>
      <form onSubmit={submit} className="space-y-3">
        <input required value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" className="w-full p-2 rounded-md bg-slate-700/40" />
        <input required value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-2 rounded-md bg-slate-700/40" />
        {error && <div className="text-red-400">{error}</div>}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-teal-400 to-cyan-400 text-black rounded-md" disabled={loading}>
            {loading?'Logging...':'Login'}
          </button>
          <a href="/signup" className="text-sm text-slate-400">Create account</a>
        </div>
      </form>
    </div>
  )
}
