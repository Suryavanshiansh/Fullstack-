import { createSlice } from '@reduxjs/toolkit'

const readDraftsFromStorage = () => {
  try {
    const storedDrafts = window.localStorage.getItem('post-drafts')
    return storedDrafts ? JSON.parse(storedDrafts) : []
  } catch {
    return []
  }
}

const initialState = {
  items: typeof window === 'undefined' ? [] : readDraftsFromStorage(),
  selectedDraftId: null,
}

const draftsSlice = createSlice({
  name: 'drafts',
  initialState,
  reducers: {
    addOrUpdateDraft(state, action) {
      const draft = action.payload
      const idx = state.items.findIndex((d) => d.id === draft.id)
      if (idx >= 0) {
        state.items[idx] = draft
      } else {
        state.items.unshift(draft)
      }
      state.selectedDraftId = draft.id
    },
    deleteDraft(state, action) {
      const id = action.payload
      state.items = state.items.filter((d) => d.id !== id)
      if (state.selectedDraftId === id) state.selectedDraftId = null
    },
    setSelectedDraftId(state, action) {
      state.selectedDraftId = action.payload
    },
    resetSelectedDraftId(state) {
      state.selectedDraftId = null
    },
    setDrafts(state, action) {
      state.items = action.payload || []
    },
  },
})

export const { addOrUpdateDraft, deleteDraft, setSelectedDraftId, resetSelectedDraftId, setDrafts } = draftsSlice.actions
export default draftsSlice.reducer
