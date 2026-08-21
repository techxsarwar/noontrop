export const theme = {
  colors: {
    // Backgrounds
    background: '#07090E',
    backgroundSecondary: '#0E131F',
    cardBackground: '#131A29',
    cardBorder: '#1F2B42',
    cardGlow: 'rgba(0, 229, 255, 0.12)',

    // Accents & Signals
    primary: '#00E5FF', // Neon Cyan / Electric Blue
    primaryGlow: 'rgba(0, 229, 255, 0.4)',
    primaryDark: '#0090A8',
    secondary: '#7928CA', // Electric Purple
    accentGreen: '#00FF88', // Radio Signal Active
    accentAmber: '#FFB800',
    accentRed: '#FF3366',

    // Text colors
    textPrimary: '#F0F4FC',
    textSecondary: '#8E9BAE',
    textMuted: '#526079',
    textHighlight: '#00E5FF',

    // Chat Specific
    sentBubble: '#0D3B66',
    sentBubbleBorder: '#1A5F9E',
    receivedBubble: '#161D2D',
    receivedBubbleBorder: '#232D42',

    // Radar
    radarRing: 'rgba(0, 229, 255, 0.18)',
    radarGrid: 'rgba(0, 229, 255, 0.08)',
    radarSweep: 'rgba(0, 229, 255, 0.25)',
    radarCenter: '#00E5FF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    xxl: 36,
  },
  borderRadius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    round: 9999,
  },
  typography: {
    title: {
      fontSize: 24,
      fontWeight: '700' as const,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      letterSpacing: 0.3,
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '500' as const,
      letterSpacing: 0.2,
    },
    mono: {
      fontFamily: 'monospace',
      fontSize: 12,
      letterSpacing: 0.5,
    },
  },
};
