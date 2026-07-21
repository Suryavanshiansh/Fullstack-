import { useEffect, useMemo, useState } from 'react'
import './App.css'

const platformRules = {
  instagram: {
    key: 'instagram',
    label: 'Instagram',
    maxLength: 220,
    minLength: 10,
    note: 'Visual-first captions work best with a strong opening line.',
    hashtagWarning: 3,
  },
  twitter: {
    key: 'twitter',
    label: 'X / Twitter',
    maxLength: 280,
    minLength: 1,
    note: 'Short, punchy messages usually land better on this channel.',
    hashtagWarning: 2,
  },
  linkedin: {
    key: 'linkedin',
    label: 'LinkedIn',
    maxLength: 3000,
    minLength: 20,
    note: 'A clear value proposition improves engagement for professional audiences.',
    hashtagWarning: 3,
  },
  facebook: {
    key: 'facebook',
    label: 'Facebook',
    maxLength: 63206,
    minLength: 10,
    note: 'Longer posts are fine, but a strong opening keeps readers engaged.',
    hashtagWarning: 5,
  },
}

const readDraftsFromStorage = () => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedDrafts = window.localStorage.getItem('post-drafts')
    return storedDrafts ? JSON.parse(storedDrafts) : []
  } catch {
    return []
  }
}

const saveDraftToMockApi = (draft) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve({ ...draft, synced: true }), 600)
  })

function App() {
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'twitter'])
  const [title, setTitle] = useState('Weekly product update')
  const [content, setContent] = useState(
    'Our team is preparing a fresh experience for creators and we cannot wait to share it with you this week.',
  )
  const [scheduleLater, setScheduleLater] = useState(false)
  const [drafts, setDrafts] = useState(readDraftsFromStorage)
  const [selectedDraftId, setSelectedDraftId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState('Drafts are stored locally and can be edited anytime.')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('post-drafts', JSON.stringify(drafts))
    }
  }, [drafts])

  const togglePlatform = (platform) => {
    setSelectedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    )
  }

  const resetComposer = () => {
    setSelectedPlatforms(['instagram', 'twitter'])
    setTitle('')
    setContent('')
    setScheduleLater(false)
    setSelectedDraftId(null)
  }

  const handleSaveDraft = async () => {
    const draft = {
      id: selectedDraftId || `draft-${Date.now()}`,
      title: title.trim() || 'Untitled draft',
      content: content.trim(),
      selectedPlatforms,
      scheduleLater,
      createdAt: drafts.find((item) => item.id === selectedDraftId)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setIsSaving(true)
    setStatusMessage('Saving draft to the mock store...')

    try {
      const savedDraft = await saveDraftToMockApi(draft)

      setDrafts((current) => {
        const existingIndex = current.findIndex((item) => item.id === savedDraft.id)

        if (existingIndex >= 0) {
          return current.map((item) => (item.id === savedDraft.id ? savedDraft : item))
        }

        return [savedDraft, ...current]
      })

      setSelectedDraftId(savedDraft.id)
      setStatusMessage(`Draft "${savedDraft.title}" saved successfully.`)
    } catch {
      setStatusMessage('Unable to save draft right now.')
    } finally {
      setIsSaving(false)
    }
  }

  const loadDraftIntoComposer = (draft) => {
    setTitle(draft.title || '')
    setContent(draft.content || '')
    setSelectedPlatforms(draft.selectedPlatforms || ['instagram'])
    setScheduleLater(Boolean(draft.scheduleLater))
    setSelectedDraftId(draft.id)
    setStatusMessage(`Loaded draft "${draft.title}".`)
  }

  const handleDeleteDraft = (draftId) => {
    const draftToDelete = drafts.find((draft) => draft.id === draftId)

    setDrafts((current) => current.filter((draft) => draft.id !== draftId))

    if (selectedDraftId === draftId) {
      resetComposer()
    }

    setStatusMessage(draftToDelete ? `Removed draft "${draftToDelete.title}".` : 'Removed draft.')
  }

  const handleNewDraft = () => {
    resetComposer()
    setStatusMessage('Started a fresh draft.')
  }

  const validation = useMemo(() => {
    const hashtagCount = (content.match(/#[A-Za-z0-9_]+/g) || []).length

    return selectedPlatforms.map((platform) => {
      const rule = platformRules[platform]
      const length = content.trim().length
      const messages = []

      if (!content.trim()) {
        messages.push('Add some post copy before publishing.')
      } else {
        if (length > rule.maxLength) {
          messages.push(`Exceeds the ${rule.maxLength}-character limit for ${rule.label}.`)
        }
        if (length < rule.minLength) {
          messages.push(`Add a bit more detail for ${rule.label}.`)
        }
        if (platform === 'twitter' && length > 220) {
          messages.push('Shorter posts tend to perform better on X.')
        }
        if (hashtagCount > rule.hashtagWarning) {
          messages.push(`Too many hashtags for ${rule.label}; keep it focused.`)
        }
        if (hashtagCount === 0 && platform === 'instagram') {
          messages.push('Adding a few hashtags can improve discoverability on Instagram.')
        }
      }

      const status = messages.some((message) => message.includes('Exceeds') || message.includes('Too many'))
        ? 'error'
        : messages.length > 0
          ? 'warning'
          : 'success'

      return { ...rule, messages, status }
    })
  }, [content, selectedPlatforms])

  const canPublish =
    selectedPlatforms.length > 0 && content.trim().length > 0 && validation.every((item) => item.status !== 'error')

  return (
    <main className="composer-shell">
      <section className="composer-card">
        <div className="composer-form">
          <p className="eyebrow">Multi-platform post composer</p>
          <h1>Plan once. Publish everywhere.</h1>
          <p className="lead">Compose a message, choose your channels, and receive instant constraints for each platform.</p>

          <label className="field">
            <span>Post title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Announcing a new feature" />
          </label>

          <label className="field">
            <span>Post content</span>
            <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write your next announcement here..." rows="8" />
          </label>

          <div className="toolbar">
            <div className="char-badge">
              <strong>{content.length}</strong>
              <span>characters</span>
            </div>

            <label className="switch">
              <input type="checkbox" checked={scheduleLater} onChange={() => setScheduleLater((current) => !current)} />
              <span>Schedule later</span>
            </label>
          </div>
        </div>

        <aside className="composer-sidebar">
          <div className="platform-panel">
            <h2>Platforms</h2>
            <div className="platform-grid">
              {Object.values(platformRules).map((platform) => {
                const active = selectedPlatforms.includes(platform.key)
                return (
                  <button
                    key={platform.key}
                    type="button"
                    className={`platform-pill ${active ? 'active' : ''}`}
                    onClick={() => togglePlatform(platform.key)}
                  >
                    {platform.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="summary-panel">
            <h2>Real-time checks</h2>
            {validation.map((item) => (
              <article key={item.key} className={`rule-card ${item.status}`}>
                <div className="rule-head">
                  <strong>{item.label}</strong>
                  <span>{item.maxLength} chars</span>
                </div>
                <p>{item.note}</p>
                {item.messages.length > 0 ? (
                  <ul>
                    {item.messages.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="ready">Ready to publish</p>
                )}
              </article>
            ))}
          </div>

          <div className="draft-panel">
            <div className="draft-panel-head">
              <h2>Draft library</h2>
              <button type="button" className="ghost-btn" onClick={handleNewDraft}>
                New draft
              </button>
            </div>

            <p className="status-message">{statusMessage}</p>

            <div className="draft-actions">
              <button type="button" className="primary-btn" onClick={handleSaveDraft} disabled={isSaving}>
                {isSaving ? 'Saving...' : selectedDraftId ? 'Update draft' : 'Save draft'}
              </button>
            </div>

            <div className="draft-list">
              {drafts.length === 0 ? (
                <p className="empty-state">No drafts yet. Save your first post to build your queue.</p>
              ) : (
                drafts.map((draft) => (
                  <article key={draft.id} className={`draft-card ${selectedDraftId === draft.id ? 'selected' : ''}`}>
                    <button type="button" className="draft-summary" onClick={() => loadDraftIntoComposer(draft)}>
                      <div className="draft-card-head">
                        <strong>{draft.title}</strong>
                        <span>{new Date(draft.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <p>{draft.content || 'No content yet'}</p>
                      <div className="draft-meta">
                        <span>{draft.selectedPlatforms.length} channel(s)</span>
                        <span>{draft.scheduleLater ? 'Scheduled' : 'Draft'}</span>
                      </div>
                    </button>
                    <button type="button" className="delete-btn" onClick={() => handleDeleteDraft(draft.id)}>
                      Delete
                    </button>
                  </article>
                ))
              )}
            </div>
          </div>

          <button type="button" className="publish-btn" disabled={!canPublish}>
            {canPublish ? 'Publish now' : 'Fix validation issues'}
          </button>
        </aside>
      </section>
    </main>
  )
}

export default App
