import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Peer, UserProfile } from '../types';
import { P2PService } from '../services/P2PService';
import { RadarView } from '../components/RadarView';
import { PeerCard } from '../components/PeerCard';
import { theme } from '../theme';

type DiscoveryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Discovery'>;
};

export const DiscoveryScreen: React.FC<DiscoveryScreenProps> = ({
  navigation,
}) => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribePeers: () => void = () => {};

    const init = async () => {
      await P2PService.initialize();
      setUserProfile(P2PService.getUserProfile());

      unsubscribePeers = P2PService.subscribePeers(updatedPeers => {
        setPeers(updatedPeers);
      });

      // Auto start scanning and broadcasting
      await P2PService.startScanning();
      await P2PService.startBroadcasting();
    };

    init();

    return () => {
      unsubscribePeers();
    };
  }, []);

  const toggleScanning = async () => {
    if (isScanning) {
      await P2PService.stopScanning();
      setIsScanning(false);
    } else {
      await P2PService.startScanning();
      setIsScanning(true);
    }
  };

  const toggleBroadcasting = async () => {
    if (isBroadcasting) {
      await P2PService.stopBroadcasting();
      setIsBroadcasting(false);
    } else {
      await P2PService.startBroadcasting();
      setIsBroadcasting(true);
    }
  };

  const handleSelectPeer = (peer: Peer) => {
    navigation.navigate('Chat', { peer });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>NOONTROP</Text>
          <Text style={styles.appSubtitle}>OFFLINE RADIO MESH</Text>
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.8}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Offline Status Badge */}
      <View style={styles.offlineBanner}>
        <View style={styles.pulseLed} />
        <Text style={styles.offlineBannerText}>
          ZERO INTERNET • DIRECT RADIO BROADCAST • ~200M RANGE
        </Text>
      </View>

      <FlatList
        data={peers}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View>
            {/* Radar Animation */}
            <RadarView
              userProfile={userProfile}
              peers={peers}
              isScanning={isScanning}
              onSelectPeer={handleSelectPeer}
            />

            {/* Radio Control Bar */}
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  isScanning && styles.controlButtonActive,
                ]}
                onPress={toggleScanning}
                activeOpacity={0.8}
              >
                <Text style={styles.controlButtonIcon}>
                  {isScanning ? '📡' : '⏸️'}
                </Text>
                <Text
                  style={[
                    styles.controlButtonText,
                    isScanning && styles.controlButtonTextActive,
                  ]}
                >
                  {isScanning ? 'Scanning Active' : 'Resume Scan'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.controlButton,
                  isBroadcasting && styles.controlButtonActive,
                ]}
                onPress={toggleBroadcasting}
                activeOpacity={0.8}
              >
                <Text style={styles.controlButtonIcon}>
                  {isBroadcasting ? '📶' : '🔇'}
                </Text>
                <Text
                  style={[
                    styles.controlButtonText,
                    isBroadcasting && styles.controlButtonTextActive,
                  ]}
                >
                  {isBroadcasting ? 'Beacon Visible' : 'Hidden Mode'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>NEARBY RADIO NODES</Text>
              <Text style={styles.sectionCount}>
                {peers.length} {peers.length === 1 ? 'peer' : 'peers'}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <PeerCard peer={item} onPress={() => handleSelectPeer(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📡</Text>
            <Text style={styles.emptyTitle}>Searching for Nearby Radios...</Text>
            <Text style={styles.emptySubtitle}>
              Keep WiFi enabled. Nearby phones running NoonTrop will appear on the
              radar automatically.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  appTitle: {
    color: theme.colors.primary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  appSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  settingsButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 16,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.md,
  },
  pulseLed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accentGreen,
    marginRight: 8,
  },
  offlineBannerText: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  controlsRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.cardBackground,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  controlButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
  },
  controlButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  controlButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  controlButtonTextActive: {
    color: theme.colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionCount: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: theme.spacing.sm,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
