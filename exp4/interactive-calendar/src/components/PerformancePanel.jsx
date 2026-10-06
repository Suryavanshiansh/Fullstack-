// PerformancePanel — shows per-hook status and live render counts.
export default function PerformancePanel({ memoOn, useMemoOn, useCallbackOn, counts }) {
  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    fontSize: '13px',
    borderBottom: '1px solid #f3f4f6',
  };
  const labelStyle = { color: '#374151' };
  const valOn = { color: '#059669', fontWeight: 600 };
  const valOff = { color: '#dc2626', fontWeight: 600 };
  const sectionStyle = { marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' };
  const sectionTitle = {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '4px',
    textTransform: 'uppercase',
  };

  const tag = (on) => (on ? { text: 'Active', style: valOn } : { text: 'Inactive', style: valOff });

  return (
    <div className="performance-panel" style={{ background: '#fff', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
      <h3 style={{ margin: '0 0 8px', fontSize: '14px' }}>Performance Panel</h3>

      <div style={rowStyle}>
        <span style={labelStyle}>React.memo</span>
        <span style={tag(memoOn).style} data-testid="memo-status">
          {tag(memoOn).text}
        </span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>useMemo</span>
        <span style={tag(useMemoOn).style} data-testid="usememo-status">
          {tag(useMemoOn).text}
        </span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>useCallback</span>
        <span style={tag(useCallbackOn).style} data-testid="usecallback-status">
          {tag(useCallbackOn).text}
        </span>
      </div>

      <div style={sectionStyle}>
        <div style={sectionTitle}>Render Counts</div>
        <div style={rowStyle}>
          <span style={labelStyle}>App</span>
          <span data-testid="render-count-app">{counts.App || 0}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Calendar</span>
          <span data-testid="render-count-calendar">{counts.Calendar || 0}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>PostCard</span>
          <span data-testid="render-count-postcard">{counts.PostCard || 0}</span>
        </div>
      </div>
    </div>
  );
}