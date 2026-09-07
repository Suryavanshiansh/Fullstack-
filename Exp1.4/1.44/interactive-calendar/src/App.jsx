// Optimization toggles — each hook has its own switch so the user can flip
// them independently. All three start ON.
//   - memoOn: PostCard is wrapped in React.memo (skips re-render when props unchanged)
//   - useMemoOn: Calendar postsByDay map is memoized
//   - useCallbackOn: App handlers + Calendar event handlers use useCallback
//
// Calendar uses native HTML5 drag-and-drop:
//   - each post chip has draggable + onDragStart
//   - each day cell has onDragOver (preventDefault) + onDrop
//   - on drop, App dispatches reschedulePost with the new date
import { useState, useCallback, useRef, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deletePost, reschedulePost } from './store/postSlice';
import PostForm from './components/PostForm';
import Calendar from './components/Calendar';
import PostCard from './components/PostCard';
import RenderCounter from './components/RenderCounter';
import PerformancePanel from './components/PerformancePanel';

// React.memo — skips re-render if props unchanged. Hoisted to module scope so
// the wrapper identity is stable across renders.
const PostCardMemo = memo(PostCard);

export default function App() {
  // Optimization toggles — each controls a real rendering behavior.
    const [optimized, setOptimized] = useState(true);
  const [editingPost, setEditingPost] = useState(null);

  const posts = useSelector((state) => state.posts.posts);
  const dispatch = useDispatch();

  // Live render counts — kept in refs so updating them does not trigger a
  // re-render and risk feedback loops. We mirror the values into state only
  // when one of the toggles flips, which is exactly when we want to display
  // the new numbers anyway.
  const countsRef = useRef({ App: 0, Calendar: 0, PostCard: 0 });
  const [counts, setCounts] = useState({ App: 0, Calendar: 0, PostCard: 0 });
  countsRef.current.App += 1;

  const handleCounts = useCallback((name, value) => {
    countsRef.current[name] = value;
  }, []);

  // Stable handlers when useCallback is ON; recreated every render when OFF.
  const handleEditStable = useCallback((post) => setEditingPost(post), []);
  const handleDeleteStable = useCallback((id) => dispatch(deletePost(id)), [dispatch]);
  const handlePostDropStable = useCallback(
    (id, newDate) => dispatch(reschedulePost({ id, date: newDate })),
    [dispatch],
  );
  const handlePostClickStable = useCallback((post) => setEditingPost(post), []);

  const handleEditPlain = (post) => setEditingPost(post);
  const handleDeletePlain = (id) => dispatch(deletePost(id));
  const handlePostDropPlain = (id, newDate) =>
    dispatch(reschedulePost({ id, date: newDate }));
  const handlePostClickPlain = (post) => setEditingPost(post);

  const handleEdit = optimized ? handleEditStable : handleEditPlain;
  const handleDelete = optimized ? handleDeleteStable : handleDeletePlain;
  const handlePostDrop = optimized ? handlePostDropStable : handlePostDropPlain;
  const handlePostClick = optimized ? handlePostClickStable : handlePostClickPlain;

  // Mirror counts into state whenever any toggle flips so the panel updates.
  const prevOptimized = useRef(optimized);
  if (prevOptimized.current !== optimized) {
    prevOptimized.current = optimized;
    setCounts({ ...countsRef.current });
  }

  // Selected post for the bottom detail panel — first one if none highlighted
  const selectedPost = editingPost || posts[0];

  const PostCardToUse = optimized ? PostCardMemo : PostCard;

  const topbarStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
  };
  const titleRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };
  const layoutStyle = {
    display: 'grid',
    gridTemplateColumns: '320px 1fr 280px',
    gap: '12px',
    padding: '12px',
    alignItems: 'start',
  };
  const bottomStyle = {
    margin: '0 12px 12px',
    padding: '10px',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
  };
  const toggleBtn = (on) => ({
    padding: '5px 10px',
    background: on ? '#059669' : '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  });

  // Wrap a setter so the panel's numbers visibly jump right after the flip.
  const flip = (setter) => {
    setCounts({ ...countsRef.current });
    setter((v) => !v);
  };

  return (
    <div className="app-shell">
      <div className="topbar" style={topbarStyle}>
        <div style={titleRowStyle}>
          <strong>Interactive Post Scheduler</strong>
          <RenderCounter name="App" onCount={handleCounts} color="#7c3aed" />
        </div>
        <button
          type="button"
          data-testid="optimization-toggle"
          onClick={() => flip(setOptimized)}
          className="toggle-btn"
          style={toggleBtn(optimized)}
          title="Toggle React.memo, useMemo, and useCallback together"
        >
          Optimization: {optimized ? 'ON' : 'OFF'}
        </button>
        <button
          type="button"
          className="reset-btn"
          onClick={() => setCounts({ App: 0, Calendar: 0, PostCard: 0 })}
        >
          Reset counts
        </button>
      </div>

      <div className="dashboard" style={layoutStyle}>
        <div className="panel form-panel">
          <PostForm editingPost={editingPost} onDone={() => setEditingPost(null)} />
        </div>

        <div className="calendar-column">
          <Calendar
            posts={posts}
            onPostDrop={handlePostDrop}
            onPostClick={handlePostClick}
            onCountsChange={handleCounts}
            useMemoOn={optimized}
            useCallbackOn={optimized}
          />

          <div className="selected-panel" style={bottomStyle} data-testid="selected-post-panel">
            <strong style={{ fontSize: '13px' }}>Selected Post</strong>
            {selectedPost ? (
              <PostCardToUse
                title={selectedPost.title}
                description={selectedPost.description}
                date={selectedPost.date}
                time={selectedPost.time}
                platform={selectedPost.platform}
                status={selectedPost.status}
                priority={selectedPost.priority}
                author={selectedPost.author}
              />
            ) : (
              <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '6px' }}>
                No post selected.
              </div>
            )}
          </div>
        </div>

        <div className="side-column">
          <PerformancePanel
            memoOn={optimized}
            useMemoOn={optimized}
            useCallbackOn={optimized}
            counts={counts}
          />

          <div className="posts-panel" style={{ marginTop: '10px', background: '#fff', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
            <strong style={{ fontSize: '13px' }}>Posts</strong>
            <div style={{ maxHeight: '320px', overflowY: 'auto', marginTop: '6px' }}>
              {posts.map((p) => (
                <div key={p.id} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleEdit(p)}
                    style={{ flex: 1, padding: '4px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    data-testid={`delete-${p.id}`}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}