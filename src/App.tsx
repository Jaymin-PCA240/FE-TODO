import React, { useEffect, useState } from 'react'
import { Todo } from './types'

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    setLoading(true)
    const res = await fetch('/api/todos')
    const data = await res.json()
    setTodos(data)
    setLoading(false)
  }

  async function addTodo(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!title.trim()) return alert('Title required')
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ title, description })
    })
    if (res.ok) {
      setTitle('')
      setDescription('')
      fetchTodos()
    } else {
      const err = await res.text()
      alert('Error: ' + err)
    }
  }

  async function removeTodo(id: number) {
    if (!confirm('Delete this todo?')) return
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
    if (res.ok) fetchTodos()
    else alert('Delete failed')
  }

  async function toggleComplete(t: Todo) {
    await fetch(`/api/todos/${t.id}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ completed: !t.completed })
    })
    fetchTodos()
  }

  function startEdit(t: Todo) {
    setEditingId(t.id)
    setEditTitle(t.title)
    setEditDescription(t.description ?? '')
  }

  async function saveEdit() {
    if (editingId == null) return
    const res = await fetch(`/api/todos/${editingId}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ title: editTitle, description: editDescription })
    })
    if (res.ok) {
      setEditingId(null)
      fetchTodos()
    } else {
      alert('Update failed')
    }
  }

  return (
    <div className="container">
      <h1>ToDo App - V2</h1>

      <form onSubmit={addTodo} className="add-form">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
        <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description (optional)" />
        <button type="submit">Add</button>
      </form>

      <hr />

      {loading ? <p>Loading...</p> : (
        <>
          {todos.length === 0 ? <p>No todos yet.</p> : (
            <ul className="todo-list">
              {todos.map(t => (
                <li key={t.id} className={t.completed ? 'completed' : ''}>
                  <div className="left">
                    <input type="checkbox" checked={t.completed} onChange={()=>toggleComplete(t)} />
                    {editingId === t.id ? (
                      <div className="edit">
                        <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} />
                        <input value={editDescription} onChange={e=>setEditDescription(e.target.value)} />
                        <button onClick={saveEdit}>Save</button>
                        <button onClick={()=>setEditingId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div className="meta">
                        <strong>{t.title}</strong>
                        {t.description && <p className="desc">{t.description}</p>}
                        <small>Created: {new Date(t.createdAt).toLocaleString()}</small>
                      </div>
                    )}
                  </div>
                  <div className="actions">
                    <button onClick={()=>startEdit(t)}>Edit</button>
                    <button onClick={()=>removeTodo(t.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
