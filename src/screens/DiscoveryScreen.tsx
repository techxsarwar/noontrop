import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Peer, UserProfile } from '../types';
import { P2PService, PUBLIC_BROADCAST_PEER } from '../services/P2PService';
import { PermissionService } from '../services/PermissionService';
import { EncryptionService } from '../services/EncryptionService';
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
  const [hasPermissions, setHasPermissions] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [manualPeerName, setManualPeerName] = useState<string>('');
  const [manualFingerprint, setManualFingerprint] = useState<string>('');

  useEffect(() => {
    let unsubscribePeers: () => void = () => {};

    const init = async () => {
      const granted = await PermissionService.requestWifiDirectPermissions();
      setHasPermissions(granted);

      await P2PService.initialize();
      const profile = P2PService.getUserProfile();
      setUserProfile(profile);

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

  const handleGrantPermissions = async () => {
    const granted = await PermissionService.requestWifiDirectPermissions();
    setHasPermissions(granted);
    if (granted) {
      await P2PService.startScanning();
      await P2PService.startBroadcasting();
    }
  };

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

  const handleSpawnDemoNode = () => {
    const keyPair = EncryptionService.generateKeyPair();
    const fp = EncryptionService.getFingerprint(keyPair.publicKey);
    const names = ['Alpha-Node', 'Cyber-Relay', 'Echo-Probe', 'Radio-Sentinel', 'Vanguard-X'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const newPeer = P2PService.addManualPeer(`${randomName} (${fp.slice(0, 4)})`, fp);
    Alert.alert('⚡ Test Peer Active', `Node "${newPeer.name}" is now broadcasting on your radar!`);
  };

  const handleCreateManualChat = () => {
    if (!manualPeerName.trim()) {
      Alert.alert('Name Required', 'Please enter a name or alias for the peer.');
      return;
    }
    const peer = P2PService.addManualPeer(manualPeerName.trim(), manualFingerprint.trim() || undefined);
    setModalVisible(false);
    setManualPeerName('');
    setManualFingerprint('');
    navigation.navigate('Chat', { peer });
  };

  const userFingerprint = userProfile
    ? EncryptionService.getFingerprint(userProfile.publicKey)
    : EncryptionService.getFingerprint();

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

      {/* User Identity & Fingerprint Bar */}
      <View style={styles.fingerprintBadge}>
        <View style={styles.fingerprintLeft}>
          <View style={styles.fingerprintDot} />
          <Text style={styles.fingerprintTitle}>MY NODE FINGERPRINT:</Text>
        </View>
        <Text style={styles.fingerprintCode}>{userFingerprint}</Text>
      </View>

      {/* Permission Warning Banner if missing */}
      {!hasPermissions && (
        <TouchableOpacity
          style={styles.permissionWarningBanner}
          onPress={handleGrantPermissions}
          activeOpacity={0.85}
        >
          <Text style={styles.permissionWarningIcon}>⚠️</Text>
          <View style={styles.permissionWarningTextContainer}>
            <Text style={styles.permissionWarningTitle}>
              Nearby Device & Location Permission Required
            </Text>
            <Text style={styles.permissionWarningSubtitle}>
              Tap here to grant permissions so your phone can discover nearby WiFi radios.
            </Text>
          </View>
        </TouchableOpacity>
      )}

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

            {/* Quick Chat Actions */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.broadcastRoomCard}
                onPress={() => handleSelectPeer(PUBLIC_BROADCAST_PEER)}
                activeOpacity={0.8}
              >
                <View style={styles.broadcastIconWrapper}>
                  <Text style={styles.broadcastIcon}>📢</Text>
                </View>
                <View style={styles.broadcastTextContainer}>
                  <Text style={styles.broadcastTitle}>Public Mesh Broadcast</Text>
                  <Text style={styles.broadcastSubtitle}>
                    Open channel to transmit to all nearby radio nodes
                  </Text>
                </View>
                <View style={styles.broadcastEnterBadge}>
                  <Text style={styles.broadcastEnterText}>OPEN CHAT ›</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.extraActionsRow}>
                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  onPress={() => setModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryActionIcon}>💬</Text>
                  <Text style={styles.secondaryActionText}>+ New Direct Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  onPress={handleSpawnDemoNode}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryActionIcon}>⚡</Text>
                  <Text style={styles.secondaryActionText}>Spawn Test Node</Text>
                </TouchableOpacity>
              </View>
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
              Keep WiFi enabled. Tap "+ New Direct Chat" or "Spawn Test Node" above to start testing immediately.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Manual Direct Chat Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💬 START DIRECT OFFLINE CHAT</Text>
            <Text style={styles.modalSubtitle}>
              Enter a peer name or cryptographic fingerprint to open a dedicated 1-on-1 offline channel.
            </Text>

            <Text style={styles.modalInputLabel}>PEER NAME / ALIAS *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Charlie-Radio or Node-A1"
              placeholderTextColor={theme.colors.textMuted}
              value={manualPeerName}
              onChangeText={setManualPeerName}
            />

            <Text style={styles.modalInputLabel}>OPTIONAL FINGERPRINT (XXXX-XXXX-XXXX)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 7F2A-99B1-40D8"
              placeholderTextColor={theme.colors.textMuted}
              value={manualFingerprint}
              onChangeText={setManualFingerprint}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleCreateManualChat}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmText}>OPEN CHAT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: theme.spacing.xs,
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
  fingerprintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(14, 19, 31, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    borderRadius: theme.borderRadius.sm,
    marginHorizontal: theme.spacing.md,
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fingerprintLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fingerprintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accentGreen,
    marginRight: 6,
  },
  fingerprintTitle: {
    color: theme.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fingerprintCode: {
    color: theme.colors.accentGreen,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 1,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    paddingVertical: 5,
    paddingHorizontal: theme.spacing.md,
    marginTop: 2,
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
    marginBottom: theme.spacing.sm,
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
  actionButtonsRow: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  broadcastRoomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D2744',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    padding: 12,
    marginBottom: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  broadcastIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  broadcastIcon: {
    fontSize: 18,
  },
  broadcastTextContainer: {
    flex: 1,
  },
  broadcastTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  broadcastSubtitle: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  broadcastEnterBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
  },
  broadcastEnterText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  extraActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 9,
  },
  secondaryActionIcon: {
    fontSize: 13,
    marginRight: 5,
  },
  secondaryActionText: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionCount: {
    color: theme.colors.primary,
    fontSize: 11,
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
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  permissionWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    borderWidth: 1,
    borderColor: theme.colors.accentAmber,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    padding: theme.spacing.md,
  },
  permissionWarningIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  permissionWarningTextContainer: {
    flex: 1,
  },
  permissionWarningTitle: {
    color: theme.colors.accentAmber,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  permissionWarningSubtitle: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    lineHeight: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.lg,
    width: '100%',
  },
  modalTitle: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  modalSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: theme.spacing.md,
  },
  modalInputLabel: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.textPrimary,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: theme.spacing.md,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: theme.spacing.xs,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
