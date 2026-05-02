import React from 'react';
import {
  Card, CardContent, Chip, Typography, Box, Collapse, IconButton,
} from '@mui/material';
import { keyframes } from '@mui/system';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import type { Notification } from '../lib/api';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const TYPE_COLOR = {
  Placement: '#6C63FF',
  Result:    '#00BFA5',
  Event:     '#FF6B6B',
} as const;

const TYPE_ICON = {
  Placement: <WorkIcon fontSize="small" />,
  Result:    <SchoolIcon fontSize="small" />,
  Event:     <EventIcon fontSize="small" />,
};

interface Props {
  notification: Notification;
  rank?:        number;
  isNew:        boolean;
  onView:       (id: string) => void;
}

export default function NotificationCard({ notification, rank, isNew, onView }: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const color = TYPE_COLOR[notification.Type];

  const handleExpand = () => {
    setExpanded(prev => !prev);
    if (isNew) onView(notification.ID);
  };

  const formattedTime = new Date(notification.Timestamp).toLocaleString('en-IN', {
    dateStyle: 'medium', timeStyle: 'short',
  });

  return (
    <Card
      sx={{
        mb: 1.5,
        borderRadius: 2,
        border: `1px solid`,
        borderColor: expanded ? color : 'rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.2s ease',
        animation: `${slideUp} 0.4s ease forwards`,
        animationDelay: rank ? `${rank * 0.05}s` : '0s',
        opacity: 0,
        '&:hover': {
          borderColor: color,
          background: 'rgba(255,255,255,0.07)',
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 20px ${color}22`,
        },
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {isNew && (
        <Box sx={{
          position: 'absolute', top: -8, right: 12,
          background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
          color: '#fff', fontSize: '0.6rem', fontWeight: 700,
          px: 1, py: 0.3, borderRadius: 1, letterSpacing: 1,
          boxShadow: '0 2px 8px rgba(255,107,107,0.5)',
        }}>
          NEW
        </Box>
      )}
      {rank !== undefined && (
        <Box sx={{
          position: 'absolute', top: 0, left: 0,
          background: `linear-gradient(135deg, ${color}, ${color}88)`,
          color: '#fff', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1,
          px: 2, py: 0.4, borderBottomRightRadius: 12, borderTopLeftRadius: 'inherit',
          boxShadow: `2px 2px 12px ${color}44`,
          zIndex: 1,
        }}>
          Rank #{rank}
        </Box>
      )}
      <CardContent sx={{ pb: '12px !important', pt: rank !== undefined ? 4 : 1.5, px: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ color, flexShrink: 0 }}>
            {TYPE_ICON[notification.Type]}
          </Box>

          <Chip
            label={notification.Type}
            size="small"
            sx={{
              background: `${color}22`,
              color, border: `1px solid ${color}55`,
              fontWeight: 600, fontSize: '0.7rem',
            }}
          />

          <Typography
            variant="body2"
            sx={{ flex: 1, color: '#E0E0E0', fontWeight: 500, fontSize: '0.875rem' }}
            noWrap
          >
            {notification.Message}
          </Typography>

          <Typography variant="caption" sx={{ color: '#888', flexShrink: 0 }}>
            {formattedTime}
          </Typography>

          <IconButton
            size="small"
            onClick={handleExpand}
            sx={{
              color: '#888', flexShrink: 0,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{
            mt: 1.5, p: 1.5,
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 1.5,
            borderLeft: `3px solid ${color}`,
          }}>
            <Typography variant="caption" sx={{ color: '#aaa', display: 'block', mb: 0.5 }}>
              Notification ID
            </Typography>
            <Typography variant="body2" sx={{ color: '#E0E0E0', fontSize: '0.75rem', wordBreak: 'break-all' }}>
              {notification.ID}
            </Typography>
            <Typography variant="caption" sx={{ color: '#aaa', display: 'block', mt: 1, mb: 0.5 }}>
              Full Message
            </Typography>
            <Typography variant="body2" sx={{ color: '#E0E0E0' }}>
              {notification.Message}
            </Typography>
            <Typography variant="caption" sx={{ color: '#aaa', display: 'block', mt: 1 }}>
              {formattedTime}
            </Typography>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
