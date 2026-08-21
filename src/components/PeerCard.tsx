import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Peer } from '../types';
import { theme } from '../theme';

interface PeerCardProps {
  peer: Peer;
  onPress: () => void;
}

export const PeerCard: React.FC<PeerCardProps> = ({ peer, onPress }) => {
  const isOnline = peer.status === 'nearby' || peer.status === 'connected';

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        {/* Avatar with Status Pulse */}
        <View style={styles.avatarContainer}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: peer.avatarColor || theme.colors.primary },
            ]}
          >
            <Text style={styles.avatarLetter}>
              {peer.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isOnline
                  ? theme.colors.accentGreen
                  : theme.colors.textMuted,
              },
            ]}
          />
        </View>

        {/* Peer Info */}
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.peerName} numberOfLines={1}>
              {peer.name}
            </Text>
            <View style={styles.badgeDistance}>
              <Text style={styles.badgeDistanceText}>
                {peer.distanceEstimate || '~15m'}
              </Text>
            </View>
          </View>

          <View style={styles.subRow}>
            <Text style={styles.peerId}>
              {peer.id.replace('node-', '')}
            </Text>
            <View style={styles.signalBadge}>
              <Text style={styles.signalIcon}>📶</Text>
              <Text style={styles.signalText}>{peer.signalStrength}%</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <View style={styles.chatButton}>
            <Text style={styles.chatButtonText}>CHAT</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarLetter: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '800',
  },
  statusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.cardBackground,
  },
  infoContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  peerName: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  badgeDistance: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  badgeDistanceText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  peerId: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalIcon: {
    fontSize: 10,
    marginRight: 3,
  },
  signalText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  actionContainer: {
    marginLeft: 6,
  },
  chatButton: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  chatButtonText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
