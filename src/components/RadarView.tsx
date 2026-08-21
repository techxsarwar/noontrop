import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Peer, UserProfile } from '../types';
import { theme } from '../theme';

interface RadarViewProps {
  userProfile: UserProfile | null;
  peers: Peer[];
  isScanning: boolean;
  onSelectPeer: (peer: Peer) => void;
}

const { width } = Dimensions.get('window');
const RADAR_SIZE = Math.min(width - 48, 300);

export const RadarView: React.FC<RadarViewProps> = ({
  userProfile,
  peers,
  isScanning,
  onSelectPeer,
}) => {
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning) {
      // Pulse animation 1
      Animated.loop(
        Animated.timing(pulseAnim1, {
          toValue: 1,
          duration: 2600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ).start();

      // Staggered pulse 2
      Animated.loop(
        Animated.sequence([
          Animated.delay(1300),
          Animated.timing(pulseAnim2, {
            toValue: 1,
            duration: 2600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Radar sweep rotation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      pulseAnim1.setValue(0);
      pulseAnim2.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [isScanning, pulseAnim1, pulseAnim2, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Calculate peer positions around concentric circles
  const getPeerPosition = (index: number, total: number) => {
    const angle = (index / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2;
    const radius = (RADAR_SIZE / 2) * 0.65; // Orbit radius
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  return (
    <View style={styles.container}>
      {/* Outer Radar Boundary */}
      <View style={[styles.radarCircle, { width: RADAR_SIZE, height: RADAR_SIZE }]}>
        {/* Concentric grid rings */}
        <View
          style={[
            styles.gridRing,
            { width: RADAR_SIZE * 0.75, height: RADAR_SIZE * 0.75 },
          ]}
        />
        <View
          style={[
            styles.gridRing,
            { width: RADAR_SIZE * 0.5, height: RADAR_SIZE * 0.5 },
          ]}
        />
        <View
          style={[
            styles.gridRing,
            { width: RADAR_SIZE * 0.25, height: RADAR_SIZE * 0.25 },
          ]}
        />

        {/* Crosshair lines */}
        <View style={styles.crosshairH} />
        <View style={styles.crosshairV} />

        {/* Pulsing Sonar Waves */}
        {isScanning && (
          <>
            <Animated.View
              style={[
                styles.pulseWave,
                {
                  transform: [
                    {
                      scale: pulseAnim1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.2, 1.1],
                      }),
                    },
                  ],
                  opacity: pulseAnim1.interpolate({
                    inputRange: [0, 0.7, 1],
                    outputRange: [0.6, 0.2, 0],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.pulseWave,
                {
                  transform: [
                    {
                      scale: pulseAnim2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.2, 1.1],
                      }),
                    },
                  ],
                  opacity: pulseAnim2.interpolate({
                    inputRange: [0, 0.7, 1],
                    outputRange: [0.6, 0.2, 0],
                  }),
                },
              ]}
            />
          </>
        )}

        {/* Sweeping Scanner Beam */}
        {isScanning && (
          <Animated.View
            style={[
              styles.sweepContainer,
              {
                width: RADAR_SIZE,
                height: RADAR_SIZE,
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <View style={styles.sweepLine} />
          </Animated.View>
        )}

        {/* Center Node (Local User Device) */}
        <View style={styles.centerNode}>
          <View
            style={[
              styles.centerDot,
              { backgroundColor: userProfile?.avatarColor || theme.colors.primary },
            ]}
          >
            <Text style={styles.centerText}>YOU</Text>
          </View>
        </View>

        {/* Orbiting Discovered Peers */}
        {peers.map((peer, idx) => {
          const { x, y } = getPeerPosition(idx, peers.length);
          return (
            <TouchableOpacity
              key={peer.id}
              activeOpacity={0.8}
              onPress={() => onSelectPeer(peer)}
              style={[
                styles.peerBlip,
                {
                  transform: [{ translateX: x }, { translateY: y }],
                },
              ]}
            >
              <View
                style={[
                  styles.blipHalo,
                  { borderColor: peer.avatarColor || theme.colors.accentGreen },
                ]}
              />
              <View
                style={[
                  styles.blipDot,
                  { backgroundColor: peer.avatarColor || theme.colors.accentGreen },
                ]}
              />
              <View style={styles.blipLabelContainer}>
                <Text style={styles.blipName} numberOfLines={1}>
                  {peer.name.split(' ')[0]}
                </Text>
                <Text style={styles.blipDist}>{peer.distanceEstimate}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Radar Legend & Status */}
      <View style={styles.legendContainer}>
        <View style={styles.statusIndicatorRow}>
          <View
            style={[
              styles.statusLed,
              {
                backgroundColor: isScanning
                  ? theme.colors.accentGreen
                  : theme.colors.textMuted,
              },
            ]}
          />
          <Text style={styles.statusText}>
            {isScanning
              ? `WiFi Radio Sweeping (${peers.length} nearby)`
              : 'Radio Scanning Paused'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
  },
  radarCircle: {
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: theme.colors.radarRing,
    backgroundColor: 'rgba(7, 13, 24, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  gridRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: theme.colors.radarGrid,
  },
  crosshairH: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: theme.colors.radarGrid,
  },
  crosshairV: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: theme.colors.radarGrid,
  },
  pulseWave: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  sweepContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sweepLine: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: '50%',
    backgroundColor: theme.colors.primary,
    opacity: 0.8,
    shadowColor: theme.colors.primary,
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  centerNode: {
    position: 'absolute',
    zIndex: 10,
  },
  centerDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
  },
  centerText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  peerBlip: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  blipHalo: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    opacity: 0.6,
  },
  blipDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  blipLabelContainer: {
    position: 'absolute',
    top: 20,
    backgroundColor: 'rgba(11, 16, 26, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
  },
  blipName: {
    color: theme.colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  blipDist: {
    color: theme.colors.primary,
    fontSize: 8,
    fontWeight: '600',
  },
  legendContainer: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  statusLed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  statusText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
