export type TransmissionMode = 'direct_wifi' | 'service_discovery' | 'mesh_relay' | 'simulated';

export interface UserProfile {
  id: string; // Unique peer identity (fingerprint)
  nickname: string;
  avatarColor: string;
  publicKey: string; // Base64 encoded public key
  secretKey?: string; // Base64 encoded private key (kept locally)
  createdTimestamp: number;
}

export interface Peer {
  id: string;
  name: string;
  avatarColor: string;
  publicKey?: string;
  signalStrength: number; // 0 to 100%
  distanceEstimate: string; // e.g. "~15m", "~50m"
  status: 'nearby' | 'connecting' | 'connected' | 'offline';
  lastSeen: number;
  isBroadcasting: boolean;
  unreadCount?: number;
}

export type MessageStatus = 'sending' | 'broadcasting' | 'delivered' | 'failed';

export interface Message {
  id: string;
  conversationId: string; // Peer ID
  fromPeerId: string;
  toPeerId: string;
  text: string;
  timestamp: number;
  status: MessageStatus;
  isMine: boolean;
  isEncrypted: boolean;
  nonce?: string;
  signature?: string;
}

export interface PacketPayload {
  version: number;
  type: 'MSG' | 'ACK' | 'HELLO' | 'KEY_EXCHANGE';
  msgId: string;
  from: string;
  to: string;
  fromName: string;
  avatarColor: string;
  publicKey: string;
  payload: string; // Ciphertext or raw text
  nonce?: string;
  timestamp: number;
}

export type RootStackParamList = {
  Discovery: undefined;
  Chat: { peer: Peer };
  Settings: undefined;
};
