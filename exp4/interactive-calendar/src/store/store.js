import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './postSlice';

const STORAGE_KEY = 'interactive-calendar:posts:v1';

// Subscribe to store changes and persist the posts slice to localStorage.
// This is the side-effect channel that keeps Redux state in sync with disk.
export const store = configureStore({
  reducer: {
    posts: postsReducer,
  },
});

store.subscribe(() => {
  try {
    const state = store.getState();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.posts.posts));
    }
  } catch (e) {
    // storage may be unavailable (e.g. private mode) — ignore
  }
});
