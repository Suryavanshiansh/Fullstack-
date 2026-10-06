// PostCard — exactly 8 props, all used in JSX
// When optimization is ON this export is replaced by a React.memo-wrapped version.
import React from 'react';
import RenderCounter from './RenderCounter';

function PostCardPlain({ title, description, date, time, platform, status, priority, author, onCount, resetToken, countValue }) {
  const priorityColor =
    priority === 'high' ? '#dc2626' : priority === 'medium' ? '#d97706' : '#059669';

  const cardStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '10px',
    marginBottom: '8px',
    background: '#fff',
    fontSize: '13px',
  };
  const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const platformBadge = {
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '4px',
    background: '#eef2ff',
    color: '#3730a3',
  };
  const metaStyle = { color: '#4b5563', marginTop: '4px' };
  const footerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '6px',
    fontSize: '11px',
    color: '#6b7280',
  };

  return (
    <div className="post-card" style={cardStyle} data-testid={`post-card-${title}`}>
      <RenderCounter key={`postcard-counter-${resetToken}`} name="PostCard" onCount={onCount} resetToken={resetToken} value={countValue ?? 0} color="#10b981" />
      <div style={headerStyle}>
        <strong>{title}</strong>
        <span style={platformBadge}>{platform}</span>
      </div>
      <div style={metaStyle}>{description}</div>
      <div style={metaStyle}>
        {date} at {time}
      </div>
      <div style={footerStyle}>
        <span>by {author}</span>
        <span style={{ color: priorityColor, fontWeight: 600 }}>{priority}</span>
        <span>{status}</span>
      </div>
    </div>
  );
}

// React.memo — skips re-render if props unchanged
export const PostCardMemo = React.memo(PostCardPlain);

// Default export is the plain component; App.jsx chooses which one to render.
export default PostCardPlain;
