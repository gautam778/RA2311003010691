import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Pagination, Select, MenuItem,
  FormControl, InputLabel, Divider, Chip,
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationCard from '../components/NotificationCard';
import { fetchNotifications, type Notification, type NotificationType } from '../lib/api';
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

export default function AllNotificationsPage() {
  const [notifications, setNotifications]   = useState<Notification[]>([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [page, setPage]                     = useState(1);
  const [limit, setLimit]                   = useState(10);
  const [filterType, setFilterType]         = useState<NotificationType | ''>('');
  const [viewedIds, setViewedIds]           = useState<Set<string>>(getViewedIds);
  const [hasMore, setHasMore]               = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Log("frontend", "info", "page", `Loading page=${page} limit=${limit}`);
      const data = await fetchNotifications({
        page,
        limit,
        notification_type: filterType || undefined,
      });
      setNotifications(data);
      setHasMore(data.length === limit);
      await Log("frontend", "info", "page", `Loaded ${data.length} items`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      await Log("frontend", "error", "page", `Failed to load items`);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterType]);

  useEffect(() => { void load(); }, [load]);

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
    setPage(1);
  };

  const newCount = notifications.filter(n => !viewedIds.has(n.ID)).length;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Box sx={{
          width: 44, height: 44, borderRadius: 2,
          background: 'linear-gradient(135deg, #6C63FF22, #6C63FF44)',
          border: '1px solid #6C63FF55',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <NotificationsNoneIcon sx={{ color: '#6C63FF' }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
            All Notifications
          </Typography>
          <Typography variant="caption" sx={{ color: '#888' }}>
            Campus-wide updates for Placements, Results & Events
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
      <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
        <Box display="flex" gap={1} flexWrap="wrap">
          {[
            { id: '', label: 'All', color: '#A0A0A0' },
            { id: 'Placement', label: 'Placement', color: '#6C63FF' },
            { id: 'Result', label: 'Result', color: '#00BFA5' },
            { id: 'Event', label: 'Event', color: '#FF6B6B' },
          ].map(item => {
            const isSelected = filterType === item.id;
            return (
              <Chip
                key={item.label}
                label={item.label}
                onClick={() => handleTypeFilter(null as any, item.id as NotificationType | '')}
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

        <FormControl size="small" sx={{ minWidth: 110, ml: 'auto' }}>
          <InputLabel sx={{ color: '#888' }}>Per page</InputLabel>
          <Select
            value={limit}
            label="Per page"
            onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
            sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' } }}
          >
            {[5, 10, 20, 50].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />
      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress sx={{ color: '#6C63FF' }} />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && notifications.length === 0 && !error && (
        <Box textAlign="center" py={8}>
          <Typography sx={{ color: '#555', fontSize: '1rem' }}>No notifications found.</Typography>
        </Box>
      )}

      {!loading && notifications.map(n => (
        <NotificationCard
          key={n.ID}
          notification={n}
          isNew={!viewedIds.has(n.ID)}
          onView={handleView}
        />
      ))}
      {!loading && notifications.length > 0 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            page={page}
            count={hasMore ? page + 1 : page}
            onChange={(_, v) => setPage(v)}
            sx={{
              '& .MuiPaginationItem-root': { color: '#aaa' },
              '& .Mui-selected': { background: 'rgba(108,99,255,0.3) !important', color: '#fff' },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
