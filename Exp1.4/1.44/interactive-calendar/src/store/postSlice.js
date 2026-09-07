import { createSlice } from '@reduxjs/toolkit';

// Build sample dates anchored in the current month so the calendar always shows data
function buildSamplePosts() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = (offset) => {
    const d = new Date(year, month, today.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  return [
    {
      id: 'p1',
      title: 'Launch Reel',
      description: '15-second product teaser',
      platform: 'Instagram',
      date: day(0),
      time: '10:00',
      status: 'scheduled',
      priority: 'high',
      author: 'Asha',
    },
    {
      id: 'p2',
      title: 'Hiring Post',
      description: 'We are hiring senior engineers',
      platform: 'LinkedIn',
      date: day(2),
      time: '14:30',
      status: 'draft',
      priority: 'medium',
      author: 'Rohan',
    },
    {
      id: 'p3',
      title: 'Tutorial Drop',
      description: 'Full walkthrough of the new dashboard',
      platform: 'YouTube',
      date: day(4),
      time: '17:00',
      status: 'scheduled',
      priority: 'high',
      author: 'Mei',
    },
    {
      id: 'p4',
      title: 'Thread Recap',
      description: 'Recap of last week in 7 tweets',
      platform: 'Twitter',
      date: day(1),
      time: '09:15',
      status: 'scheduled',
      priority: 'low',
      author: 'Asha',
    },
    {
      id: 'p5',
      title: 'Event Promo',
      description: 'Save the date for our live Q&A',
      platform: 'Facebook',
      date: day(6),
      time: '12:00',
      status: 'published',
      priority: 'medium',
      author: 'Diego',
    },
  ];
}

const STORAGE_KEY = 'interactive-calendar:posts:v1';

function loadInitial() {
  if (typeof window === 'undefined') return buildSamplePosts();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // fall through to sample
  }
  return buildSamplePosts();
}

const initialState = {
  posts: loadInitial(),
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    addPost: (state, action) => {
      const post = action.payload;
      state.posts.push({ ...post, id: post.id || `p${Date.now()}` });
    },
    updatePost: (state, action) => {
      const { id, changes } = action.payload;
      const idx = state.posts.findIndex((p) => p.id === id);
      if (idx !== -1) {
        state.posts[idx] = { ...state.posts[idx], ...changes };
      }
    },
    deletePost: (state, action) => {
      const id = action.payload;
      state.posts = state.posts.filter((p) => p.id !== id);
    },
    reschedulePost: (state, action) => {
      // payload: { id, date } — FullCalendar eventDrop only changes the date
      const { id, date } = action.payload;
      const idx = state.posts.findIndex((p) => p.id === id);
      if (idx !== -1) {
        state.posts[idx].date = date;
      }
    },
  },
});

export const { addPost, updatePost, deletePost, reschedulePost } = postSlice.actions;
export default postSlice.reducer;
