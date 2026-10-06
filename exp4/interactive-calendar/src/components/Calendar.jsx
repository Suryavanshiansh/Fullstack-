// Calendar — custom month grid with native HTML5 drag-and-drop.
// Each post is rendered as a `draggable` chip; each day cell accepts drops
// via onDragOver (preventDefault to allow drop) + onDrop (reads post id from
// dataTransfer and dispatches reschedulePost).
//
// Each optimization is gated independently via props. To respect the Rules
// of Hooks we always call useMemo/useCallback with stable deps; the toggle
// just decides whether the *result* is used or recomputed.

import { useMemo, useCallback, useState } from 'react';
import RenderCounter from './RenderCounter';

function statusColor(status) {
  if (status === 'published') return '#059669';
  if (status === 'scheduled') return '#2563eb';
  return '#9ca3af';
}

function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildMonthGrid(viewDate) {
  // 6 rows × 7 columns of dates, starting from the Sunday on/before the 1st
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay()); // back up to Sunday
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push(d);
  }
  return cells;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar({
  posts,
  onPostDrop,
  onPostClick,
  onCountsChange,
  countValue,
  useMemoOn,
  useCallbackOn,
  resetToken,
}) {
  // useMemo — caches expensive calculation (postsByDay map)
  const memoedPostsByDay = useMemo(() => {
    const map = {};
    for (const p of posts) {
      (map[p.date] = map[p.date] || []).push(p);
    }
    return map;
  }, [posts]);
  const postsByDay = useMemoOn
    ? memoedPostsByDay
    : (() => {
        const map = {};
        for (const p of posts) {
          (map[p.date] = map[p.date] || []).push(p);
        }
        return map;
      })();

  // useCallback — stable function reference (handlers)
  const memoedDragStart = useCallback(
    (id) => (e) => {
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'move';
    },
    [],
  );
  const memoedDrop = useCallback(
    (date) => (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      if (id && onPostDrop) onPostDrop(id, date);
    },
    [onPostDrop],
  );
  const memoedClick = useCallback(
    (post) => () => {
      if (onPostClick) onPostClick(post);
    },
    [onPostClick],
  );

  const handleDragStart = useCallbackOn
    ? memoedDragStart
    : (id) => (e) => {
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
      };
  const handleDrop = useCallbackOn
    ? memoedDrop
    : (date) => (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        if (id && onPostDrop) onPostDrop(id, date);
      };
  const handleClick = useCallbackOn
    ? memoedClick
    : (post) => () => {
        if (onPostClick) onPostClick(post);
      };

  const [viewDate, setViewDate] = useState(() => new Date());
  const cells = buildMonthGrid(viewDate);
  const monthLabel = viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const todayStr = ymd(new Date());

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  };
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
    background: '#e5e7eb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '4px',
  };
  const weekdayStyle = {
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6b7280',
    padding: '4px 0',
  };
  const dayCellStyle = (isCurrentMonth, isToday) => ({
    minHeight: '70px',
    background: isToday ? '#fef3c7' : '#fff',
    border: '1px solid ' + (isCurrentMonth ? '#e5e7eb' : '#f3f4f6'),
    borderRadius: '4px',
    padding: '4px',
    fontSize: '11px',
    color: isCurrentMonth ? '#111' : '#9ca3af',
    overflow: 'hidden',
  });
  const dayNumStyle = {
    fontSize: '11px',
    fontWeight: 600,
    marginBottom: '2px',
  };
  const chipStyle = (status) => ({
    background: statusColor(status),
    color: '#fff',
    padding: '2px 4px',
    marginBottom: '2px',
    borderRadius: '3px',
    fontSize: '10px',
    cursor: 'grab',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  });
  const navBtn = {
    padding: '3px 8px',
    fontSize: '12px',
    border: '1px solid #d1d5db',
    background: '#fff',
    borderRadius: '3px',
    cursor: 'pointer',
  };

  return (
    <div
      className="calendar-panel"
      style={{ background: '#fff', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
      data-testid="calendar"
    >
      <div style={headerStyle}>
        <strong style={{ fontSize: '14px' }}>Calendar</strong>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button type="button" data-testid="cal-today" style={navBtn} onClick={() => setViewDate(new Date())}>
            Today
          </button>
          <button type="button" data-testid="cal-prev" style={navBtn} onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
            ‹
          </button>
          <span style={{ fontSize: '13px', minWidth: '140px', textAlign: 'center' }}>{monthLabel}</span>
          <button type="button" data-testid="cal-next" style={navBtn} onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
            ›
          </button>
          <RenderCounter key={`calendar-counter-${viewDate.toISOString()}`} name="Calendar" onCount={onCountsChange} resetToken={resetToken} value={countValue ?? 0} color="#2563eb" />
        </div>
      </div>

      <div style={gridStyle}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={weekdayStyle}>
            {w}
          </div>
        ))}
        {cells.map((d) => {
          const dateStr = ymd(d);
          const inMonth = d.getMonth() === viewDate.getMonth();
          const isToday = dateStr === todayStr;
          const dayPosts = postsByDay[dateStr] || [];
          return (
            <div
              key={dateStr}
              style={dayCellStyle(inMonth, isToday)}
              data-testid={`day-cell-${dateStr}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop(dateStr)}
            >
              <div style={dayNumStyle}>{d.getDate()}</div>
              {dayPosts.map((p) => (
                <div
                  key={p.id}
                  style={chipStyle(p.status)}
                  draggable
                  onDragStart={handleDragStart(p.id)}
                  onClick={handleClick(p)}
                  data-testid={`draggable-post-${p.id}`}
                  title={`${p.title} — ${p.platform}`}
                >
                  {p.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
