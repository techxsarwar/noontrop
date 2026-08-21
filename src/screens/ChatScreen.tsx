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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Message } from '../types';
import { P2PService } from '../services/P2PService';
import { StorageService } from '../services/StorageService';
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
  const flatListRef = useRef<FlatList>(null);

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
      setMessages(prev => [...prev, msg]);
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

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

        <View style={styles.peerAvatar}>
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: peer.avatarColor || theme.colors.primary },
            ]}
          >
            <Text style={styles.avatarLetter}>
              {peer.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.peerInfo}>
          <Text style={styles.peerName} numberOfLines={1}>
            {peer.name}
          </Text>
          <View style={styles.subStatusRow}>
            <View style={styles.statusLed} />
            <Text style={styles.subStatusText}>
              Direct Radio • {peer.distanceEstimate || '~15m'}
            </Text>
          </View>
        </View>

        <View style={styles.encryptionBadge}>
          <Text style={styles.encryptionIcon}>🔒</Text>
          <Text style={styles.encryptionText}>E2E</Text>
        </View>
      </View>

      {/* Security banner */}
      <View style={styles.cryptoBanner}>
        <Text style={styles.cryptoBannerText}>
          🔒 End-to-end encrypted via Curve25519. Zero internet servers involved.
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
              <Text style={styles.emptyIcon}>📡</Text>
              <Text style={styles.emptyTitle}>Secure Offline Channel Open</Text>
              <Text style={styles.emptySubtitle}>
                You are directly connected over WiFi radio waves. Send a message to
                start chatting without internet.
              </Text>
            </View>
          }
        />

        {/* Input Bar */}
        <SendBar onSend={handleSendMessage} />
      </KeyboardAvoidingView>
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
    marginRight: 6,
  },
  backIcon: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: '300',
    marginTop: -4,
  },
  peerAvatar: {
    marginRight: theme.spacing.sm,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  encryptionIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  encryptionText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '800',
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
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
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
});
