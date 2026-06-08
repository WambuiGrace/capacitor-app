'use client'

import { useState, useEffect } from 'react'

type Note = {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('notes')
    if (stored) setNotes(JSON.parse(stored))
  }, [])

  function persist(updated: Note[]) {
    localStorage.setItem('notes', JSON.stringify(updated))
    setNotes(updated)
  }

  function openCreate() {
    setEditingNote(null)
    setTitle('')
    setContent('')
    setIsModalOpen(true)
  }

  function openEdit(note: Note) {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    setIsModalOpen(true)
  }

  function handleSave() {
    if (!title.trim()) return
    const now = new Date().toISOString()
    if (editingNote) {
      persist(
        notes.map((n) =>
          n.id === editingNote.id
            ? { ...n, title: title.trim(), content: content.trim(), updatedAt: now }
            : n
        )
      )
    } else {
      persist([
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          content: content.trim(),
          createdAt: now,
          updatedAt: now,
        },
        ...notes,
      ])
    }
    setIsModalOpen(false)
  }

  function handleDelete(id: string) {
    persist(notes.filter((n) => n.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Notes</h1>
            {notes.length > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </p>
            )}
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New Note
          </button>
        </div>
      </header>

      {/* Notes list */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {notes.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="2" width="14" height="16" rx="2" stroke="#9ca3af" strokeWidth="1.5" />
                <path d="M7 7h6M7 10h6M7 13h4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-base font-medium text-gray-500">No notes yet</p>
            <p className="text-sm text-gray-400 mt-1">Click &ldquo;New Note&rdquo; to get started</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {notes.map((note) => (
              <li
                key={note.id}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4 group hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-gray-900 truncate">{note.title}</h2>
                    {note.content && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {note.content}
                      </p>
                    )}
                    <p className="mt-2.5 text-xs text-gray-400">
                      {note.updatedAt !== note.createdAt ? 'Edited ' : 'Added '}
                      {formatDate(note.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(note)}
                      aria-label="Edit note"
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteId(note.id)}
                      aria-label="Delete note"
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M2 3.5h10M5.5 3.5V2.5h3v1M5.5 6v4M8.5 6v4M3 3.5l.75 8h6.5L11 3.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Add / Edit modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/25 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              {editingNote ? 'Edit note' : 'New note'}
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                autoFocus
              />
              <textarea
                placeholder="Content (optional)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none leading-relaxed"
              />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {editingNote ? 'Save changes' : 'Add note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div
          className="fixed inset-0 bg-black/25 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-gray-900">Delete note?</h2>
            <p className="mt-1 text-sm text-gray-500">This can&apos;t be undone.</p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
