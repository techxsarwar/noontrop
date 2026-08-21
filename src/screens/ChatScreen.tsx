import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Message } from '../types';
import { P2PService, PUBLIC_BROADCAST_PEER } from '../services/P2PService';
import { StorageService } from '../services/StorageService';
import { EncryptionService } from '../services/EncryptionService';
import { MessageBubble } from '../components/MessageBubble';
import { SendBar } from '../components/SendBar';
import { theme } from '../theme';

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export const ChatScreen: React.FC<ChatScreenProps> = ({
  route,
  navigation,
}) => {
  const { peer } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const isBroadcast = peer.id === PUBLIC_BROADCAST_PEER.id;

  useEffect(() => {
    // Load historical messages from offline storage
    const loadHistory = async () => {
      const stored = await StorageService.getMessages(peer.id);
      setMessages(stored);
    };

    loadHistory();

    // Subscribe to live incoming/outgoing message updates
    const unsubscribe = P2PService.subscribeMessages(newMsg => {
      if (
        newMsg.conversationId === peer.id ||
        newMsg.fromPeerId === peer.id ||
        newMsg.toPeerId === peer.id
      ) {
        setMessages(prev => {
          const index = prev.findIndex(m => m.id === newMsg.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = newMsg;
            return updated;
          }
          return [...prev, newMsg];
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [peer.id]);

  const handleSendMessage = async (text: string) => {
    try {
      const msg = await P2PService.sendMessage(peer, text);
      setMessages(prev => {
        const exists = prev.some(m => m.id === msg.id);
        if (exists) return prev;
        return [...prev, msg];
      });
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (e) {
      console.error('Failed to send message:', e);
      Alert.alert('Send Error', 'Could not transmit message over radio channel.');
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to delete all messages in this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await StorageService.savePeer({ ...peer });
            setMessages([]);
          },
        },
      ],
    );
  };

  const peerFingerprint = peer.publicKey
    ? EncryptionService.getFingerprint(peer.publicKey)
    : peer.id.replace('node-', '');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.peerAvatarRow}
          onPress={() => setInfoModalVisible(true)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: peer.avatarColor || theme.colors.primary },
            ]}
          >
            <Text style={styles.avatarLetter}>
              {isBroadcast ? '📢' : peer.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.peerInfo}>
            <Text style={styles.peerName} numberOfLines={1}>
              {peer.name}
            </Text>
            <View style={styles.subStatusRow}>
              <View
                style={[
                  styles.statusLed,
                  {
                    backgroundColor:
                      peer.status === 'offline'
                        ? theme.colors.textMuted
                        : theme.colors.accentGreen,
                  },
                ]}
              />
              <Text style={styles.subStatusText}>
                {isBroadcast
                  ? 'All Nearby Nodes (Mesh Broadcast)'
                  : `Direct Radio • ${peer.distanceEstimate || '~15m'}`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.encryptionBadge}
          onPress={() => setInfoModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.encryptionIcon}>{isBroadcast ? '📡' : '🔒'}</Text>
          <Text style={styles.encryptionText}>
            {isBroadcast ? 'MESH' : 'E2EE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Security banner */}
      <View style={styles.cryptoBanner}>
        <Text style={styles.cryptoBannerText}>
          {isBroadcast
            ? '📢 Open Public Broadcast: All nearby radio nodes receive these packets.'
            : '🔒 End-to-end encrypted via Curve25519-XSalsa20. Zero servers.'}
        </Text>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>{isBroadcast ? '📢' : '📡'}</Text>
              <Text style={styles.emptyTitle}>
                {isBroadcast ? 'Public Radio Room' : 'Encrypted Radio Channel Open'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {isBroadcast
                  ? 'Type a message or tap one of the quick buttons below to broadcast over the local WiFi radio mesh.'
                  : 'You are directly connected over local radio waves. Messages are signed and sealed on your device.'}
              </Text>
            </View>
          }
        />

        {/* Input Bar */}
        <SendBar onSend={handleSendMessage} />
      </KeyboardAvoidingView>

      {/* Peer Verification & Info Modal */}
      <Modal
        visible={infoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🛡️ NODE VERIFICATION</Text>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>NODE ALIAS</Text>
              <Text style={styles.modalValue}>{peer.name}</Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>CRYPTOGRAPHIC FINGERPRINT</Text>
              <Text style={styles.modalFingerprint}>{peerFingerprint}</Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>RADIO SIGNAL & DISTANCE</Text>
              <Text style={styles.modalValue}>
                {peer.signalStrength}% Signal • {peer.distanceEstimate || '~15m'}
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>ENCRYPTION PRIMITIVE</Text>
              <Text style={styles.modalValue}>
                {isBroadcast
                  ? 'Plaintext Public Broadcast Frame'
                  : 'Authenticated nacl.box (Curve25519 + Poly1305)'}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalClearBtn}
                onPress={() => {
                  setInfoModalVisible(false);
                  handleClearHistory();
                }}
              >
                <Text style={styles.modalClearText}>CLEAR CHAT</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setInfoModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>DONE</Text>
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  backIcon: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: '300',
    marginTop: -4,
  },
  peerAvatarRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarLetter: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
  peerInfo: {
    flex: 1,
  },
  peerName: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  subStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusLed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accentGreen,
    marginRight: 5,
  },
  subStatusText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  encryptionIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  encryptionText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  cryptoBanner: {
    backgroundColor: 'rgba(11, 19, 36, 0.95)',
    paddingVertical: 5,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.1)',
  },
  cryptoBannerText: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: theme.spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 38,
    marginBottom: 8,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
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
    marginBottom: theme.spacing.md,
  },
  modalSection: {
    marginBottom: theme.spacing.md,
  },
  modalLabel: {
    color: theme.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modalValue: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  modalFingerprint: {
    color: theme.colors.accentGreen,
    fontSize: 15,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: theme.spacing.sm,
  },
  modalClearBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 51, 102, 0.12)',
    borderWidth: 1,
    borderColor: theme.colors.accentRed,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalClearText: {
    color: theme.colors.accentRed,
    fontSize: 11,
    fontWeight: '800',
  },
  modalCloseBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
  },
});
