import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, Peer, Message } from '../types';
import { EncryptionService } from './EncryptionService';

const KEYS = {
  USER_PROFILE: '@noontrop_user_profile',
  PEERS_LIST: '@noontrop_peers_list',
  MESSAGES_PREFIX: '@noontrop_msgs_',
  SETTINGS: '@noontrop_settings',
};

const AVATAR_COLORS = [
  '#00E5FF', // Cyan
  '#7928CA', // Purple
  '#FF007A', // Neon Pink
  '#00FF88', // Emerald
  '#FFB800', // Amber
  '#3B82F6', // Cobalt
];

export class StorageService {
  /**
   * Retrieves or initializes the local device offline identity.
   */
  static async getOrCreateUserProfile(): Promise<UserProfile> {
    try {
      const stored = await AsyncStorage.getItem(KEYS.USER_PROFILE);
      if (stored) {
        return JSON.parse(stored);
      }

      // First time initialization: generate fresh keypair and identity
      const keyPair = EncryptionService.generateKeyPair();
      const fingerprint = EncryptionService.getFingerprint(keyPair.publicKey);
      const randomColor =
        AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
      const randomNum = Math.floor(1000 + Math.random() * 9000);

      const newProfile: UserProfile = {
        id: `node-${fingerprint}`,
        nickname: `WaveNode-${randomNum}`,
        avatarColor: randomColor,
        publicKey: keyPair.publicKey,
        secretKey: keyPair.secretKey,
        createdTimestamp: Date.now(),
      };

      await AsyncStorage.setItem(
        KEYS.USER_PROFILE,
        JSON.stringify(newProfile),
      );
      return newProfile;
    } catch (e) {
      console.error('Failed to get/create user profile:', e);
      // Fallback
      const keyPair = EncryptionService.generateKeyPair();
      return {
        id: 'node-fallback',
        nickname: 'WaveNode-0001',
        avatarColor: '#00E5FF',
        publicKey: keyPair.publicKey,
        secretKey: keyPair.secretKey,
        createdTimestamp: Date.now(),
      };
    }
  }

  /**
   * Updates user nickname and avatar color.
   */
  static async updateUserProfile(
    updates: Partial<Pick<UserProfile, 'nickname' | 'avatarColor'>>,
  ): Promise<UserProfile> {
    const current = await this.getOrCreateUserProfile();
    const updated: UserProfile = {
      ...current,
      ...updates,
    };
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(updated));
    return updated;
  }

  /**
   * Loads all saved peers from local cache.
   */
  static async getSavedPeers(): Promise<Peer[]> {
    try {
      const stored = await AsyncStorage.getItem(KEYS.PEERS_LIST);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Saves or updates a peer in the local database.
   */
  static async savePeer(peer: Peer): Promise<void> {
    try {
      const peers = await this.getSavedPeers();
      const index = peers.findIndex(p => p.id === peer.id);
      if (index >= 0) {
        peers[index] = { ...peers[index], ...peer };
      } else {
        peers.unshift(peer);
      }
      await AsyncStorage.setItem(KEYS.PEERS_LIST, JSON.stringify(peers));
    } catch (e) {
      console.error('Failed to save peer:', e);
    }
  }

  /**
   * Loads conversation messages with a peer.
   */
  static async getMessages(peerId: string): Promise<Message[]> {
    try {
      const stored = await AsyncStorage.getItem(
        `${KEYS.MESSAGES_PREFIX}${peerId}`,
      );
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Saves a message to conversation storage.
   */
  static async saveMessage(peerId: string, message: Message): Promise<void> {
    try {
      const messages = await this.getMessages(peerId);
      // Avoid duplicates
      const exists = messages.some(m => m.id === message.id);
      if (!exists) {
        messages.push(message);
        await AsyncStorage.setItem(
          `${KEYS.MESSAGES_PREFIX}${peerId}`,
          JSON.stringify(messages),
        );
      }
    } catch (e) {
      console.error('Failed to save message:', e);
    }
  }

  /**
   * Updates status of an existing message (e.g. from 'broadcasting' to 'delivered').
   */
  static async updateMessageStatus(
    peerId: string,
    messageId: string,
    status: Message['status'],
  ): Promise<void> {
    try {
      const messages = await this.getMessages(peerId);
      const target = messages.find(m => m.id === messageId);
      if (target) {
        target.status = status;
        await AsyncStorage.setItem(
          `${KEYS.MESSAGES_PREFIX}${peerId}`,
          JSON.stringify(messages),
        );
      }
    } catch (e) {
      console.error('Failed to update message status:', e);
    }
  }

  /**
   * Clears all local offline data (reset).
   */
  static async clearAllData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(k => k.startsWith('@noontrop_'));
      await Promise.all(appKeys.map(k => AsyncStorage.removeItem(k)));
    } catch (e) {
      console.error('Failed to clear data:', e);
    }
  }
}
