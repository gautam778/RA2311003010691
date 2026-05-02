import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Slider, Chip, Divider,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import NotificationCard from '../components/NotificationCard';
import { fetchNotifications, type Notification, type NotificationType } from '../lib/api';
import { getTopN, type ScoredNotification } from '../lib/priority';
import { Log } from 'logging-middleware';

const VIEWED_KEY = 'campus_notify_viewed';

function getViewedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(VIEWED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

function saveViewedIds(ids: Set<string>) {
  localStorage.setItem(VIEWED_KEY, JSON.stringify([...ids]));
}

export default function PriorityInboxPage() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [topN, setTopN]                         = useState<ScoredNotification[]>([]);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState('');
  const [n, setN]                               = useState(10);
  const [filterType, setFilterType]             = useState<NotificationType | ''>('');
  const [viewedIds, setViewedIds]               = useState<Set<string>>(getViewedIds);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Log("frontend", "info", "page", `Loaded: topN=${n} type=${filterType||'all'}`);
      const data = await fetchNotifications({ page: 1, limit: 10 });
      setAllNotifications(data);
      await Log("frontend", "info", "page", `Fetched ${data.length} items`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      await Log("frontend", "error", "page", `Failed to load priority items`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    let filtered = allNotifications;
    if (filterType) {
      filtered = allNotifications.filter(notif => notif.Type === filterType);
    }
    const computed = getTopN(filtered, n);
    setTopN(computed);
    void Log("frontend", "info", "state", `Priority computed`);
  }, [allNotifications, n, filterType]);

  const handleView = (id: string) => {
    setViewedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      saveViewedIds(next);
      return next;
    });
  };

  const handleTypeFilter = (_: React.MouseEvent<HTMLElement>, val: NotificationType | '') => {
    setFilterType(val ?? '');
  };

  const newCount = topN.filter(n => !viewedIds.has(n.ID)).length;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Box sx={{
          width: 44, height: 44, borderRadius: 2,
          background: 'linear-gradient(135deg, #FFD70022, #FFD70044)',
          border: '1px solid #FFD70055',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <StarIcon sx={{ color: '#FFD700' }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
            Priority Inbox
          </Typography>
          <Typography variant="caption" sx={{ color: '#888' }}>
            Top {n} most important notifications · Placement &gt; Result &gt; Event
          </Typography>
        </Box>
        {newCount > 0 && (
          <Chip
            label={`${newCount} NEW`}
            size="small"
            sx={{
              ml: 'auto',
              background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
              color: '#fff', fontWeight: 700, fontSize: '0.7rem',
            }}
          />
        )}
      </Box>
      <Box display="flex" alignItems="center" gap={3} mb={3} flexWrap="wrap">
        <Box display="flex" gap={1} flexWrap="wrap">
          {[
            { id: '', label: 'All', color: '#FFD700' },
            { id: 'Placement', label: 'Placement', color: '#6C63FF' },
            { id: 'Result', label: 'Result', color: '#00BFA5' },
            { id: 'Event', label: 'Event', color: '#FF6B6B' },
          ].map(item => {
            const isSelected = filterType === item.id;
            return (
              <Chip
                key={item.label}
                label={item.label}
                onClick={() => setFilterType(item.id as NotificationType | '')}
                sx={{
                  background: isSelected ? `${item.color}33` : 'transparent',
                  color: isSelected ? '#fff' : item.color,
                  border: `1px solid ${item.color}${isSelected ? '88' : '44'}`,
                  fontWeight: isSelected ? 700 : 500,
                  transition: 'all 0.2s',
                  '&:hover': { background: `${item.color}22` }
                }}
              />
            );
          })}
        </Box>
        <Box sx={{ ml: 'auto', minWidth: 200, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#888', whiteSpace: 'nowrap' }}>
            Top N: <strong style={{ color: '#FFD700' }}>{n}</strong>
          </Typography>
          <Slider
            value={n}
            min={5} max={20} step={5}
            onChange={(_, val) => setN(val as number)}
            marks={[
              { value: 5, label: '5' },
              { value: 10, label: '10' },
              { value: 15, label: '15' },
              { value: 20, label: '20' },
            ]}
            sx={{
              color: '#FFD700',
              '& .MuiSlider-markLabel': { color: '#666', fontSize: '0.65rem' },
              '& .MuiSlider-mark': { background: '#555' },
            }}
          />
        </Box>
      </Box>


      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress sx={{ color: '#FFD700' }} />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && topN.length === 0 && !error && (
        <Box textAlign="center" py={8}>
          <Typography sx={{ color: '#555' }}>No notifications found.</Typography>
        </Box>
      )}

      {!loading && topN.map(n => (
        <NotificationCard
          key={n.ID}
          notification={n}
          rank={n.rank}
          isNew={!viewedIds.has(n.ID)}
          onView={handleView}
        />
      ))}
    </Box>
  );
}
