import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types';
import { theme } from '../theme';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isMine = message.isMine;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <View
      style={[
        styles.container,
        isMine ? styles.containerMine : styles.containerOther,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleOther,
        ]}
      >
        {/* Encrypted indicator tag */}
        {message.isEncrypted && (
          <View style={styles.cryptoBadge}>
            <Text style={styles.cryptoBadgeText}>🔒 E2E CURVE25519</Text>
          </View>
        )}

        {/* Message Text */}
        <Text
          style={[
            styles.messageText,
            isMine ? styles.textMine : styles.textOther,
          ]}
        >
          {message.text}
        </Text>

        {/* Footer: Time & Status */}
        <View style={styles.footerRow}>
          <Text
            style={[
              styles.timeText,
              isMine ? styles.timeMine : styles.timeOther,
            ]}
          >
            {formatTime(message.timestamp)}
          </Text>

          {isMine && (
            <View style={styles.statusContainer}>
              {message.status === 'broadcasting' && (
                <Text style={styles.statusIcon}>📡 Sending</Text>
              )}
              {message.status === 'delivered' && (
                <Text style={styles.statusDelivered}>✓✓ Radio Delivered</Text>
              )}
              {message.status === 'failed' && (
                <Text style={styles.statusFailed}>⚠️ Lost</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: theme.spacing.md,
    flexDirection: 'row',
  },
  containerMine: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  bubbleMine: {
    backgroundColor: '#0E3B6E',
    borderTopRightRadius: 2,
    borderWidth: 1,
    borderColor: '#1961A8',
  },
  bubbleOther: {
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: 2,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  cryptoBadge: {
    marginBottom: 4,
  },
  cryptoBadgeText: {
    color: theme.colors.primary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  textMine: {
    color: '#FFFFFF',
  },
  textOther: {
    color: theme.colors.textPrimary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  timeText: {
    fontSize: 10,
    marginRight: 6,
  },
  timeMine: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  timeOther: {
    color: theme.colors.textMuted,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    color: theme.colors.accentAmber,
    fontSize: 9,
    fontWeight: '700',
  },
  statusDelivered: {
    color: theme.colors.accentGreen,
    fontSize: 9,
    fontWeight: '700',
  },
  statusFailed: {
    color: theme.colors.accentRed,
    fontSize: 9,
    fontWeight: '700',
  },
});
