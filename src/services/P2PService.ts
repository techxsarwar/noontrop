import { WifiP2P, NativePeerEvent, NativeMessageEvent } from '../native/WifiP2P';
import { Peer, Message, PacketPayload, UserProfile } from '../types';
import { EncryptionService } from './EncryptionService';
import { StorageService } from './StorageService';
import { PermissionService } from './PermissionService';

type PeerListener = (peers: Peer[]) => void;
type MessageListener = (message: Message) => void;

export const PUBLIC_BROADCAST_PEER: Peer = {
  id: 'node-mesh-broadcast',
  name: '📢 Public Radio Broadcast (Mesh Room)',
  avatarColor: '#00E5FF',
  signalStrength: 100,
  distanceEstimate: 'Omnidirectional Mesh',
  status: 'connected',
  lastSeen: Date.now(),
  isBroadcasting: true,
};

class P2PManager {
  private peers: Map<string, Peer> = new Map();
  private peerListeners: Set<PeerListener> = new Set();
  private messageListeners: Set<MessageListener> = new Set();
  private userProfile: UserProfile | null = null;
  private isScanning: boolean = false;
  private isBroadcasting: boolean = false;
  private simInterval: any = null;

  public async initialize(): Promise<void> {
    this.userProfile = await StorageService.getOrCreateUserProfile();

    // Request Android runtime permissions for Wi-Fi Direct and Nearby Devices
    await PermissionService.requestWifiDirectPermissions();

    // Load cached peers from previous sessions
    const cachedPeers = await StorageService.getSavedPeers();
    cachedPeers.forEach(p => {
      if (p.id !== PUBLIC_BROADCAST_PEER.id) {
        this.peers.set(p.id, { ...p, status: 'offline' });
      }
    });

    // Populate initial demo peers if empty so the user can immediately test
    if (this.peers.size === 0) {
      this.populateInitialDemoNodes();
    }

    this.notifyPeers();

    if (WifiP2P.isAvailable()) {
      await WifiP2P.initialize();
      WifiP2P.onPeerDiscovered(this.handleNativePeerDiscovered.bind(this));
      WifiP2P.onMessageReceived(this.handleNativeMessageReceived.bind(this));
    }
  }

  public getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  public async refreshUserProfile(): Promise<UserProfile> {
    this.userProfile = await StorageService.getOrCreateUserProfile();
    return this.userProfile;
  }

  /**
   * Starts scanning for nearby radio signals (WiFi Direct or Simulated mesh).
   */
  public async startScanning(): Promise<void> {
    if (this.isScanning) return;
    this.isScanning = true;

    if (WifiP2P.isAvailable()) {
      await WifiP2P.startDiscovery();
    } else {
      this.startSimulatedDiscovery();
    }
  }

  /**
   * Stops scanning.
   */
  public async stopScanning(): Promise<void> {
    this.isScanning = false;
    if (WifiP2P.isAvailable()) {
      await WifiP2P.stopDiscovery();
    }
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
  }

  /**
   * Broadcasts local identity over WiFi Direct DNS-SD.
   */
  public async startBroadcasting(): Promise<void> {
    if (!this.userProfile) return;
    this.isBroadcasting = true;

    if (WifiP2P.isAvailable()) {
      await WifiP2P.startAdvertising(this.userProfile.nickname, {
        id: this.userProfile.id,
        name: this.userProfile.nickname,
        pubKey: this.userProfile.publicKey,
        color: this.userProfile.avatarColor,
      });
    }
  }

  public async stopBroadcasting(): Promise<void> {
    this.isBroadcasting = false;
    if (WifiP2P.isAvailable()) {
      await WifiP2P.stopAdvertising();
    }
  }

  /**
   * Manually adds a peer (e.g. from manual fingerprint input or quick test).
   */
  public addManualPeer(name: string, customId?: string): Peer {
    const keyPair = EncryptionService.generateKeyPair();
    const fingerprint = customId || EncryptionService.getFingerprint(keyPair.publicKey);
    const peer: Peer = {
      id: customId ? `node-${customId}` : `node-${fingerprint}`,
      name: name || `Node-${fingerprint.slice(0, 4)}`,
      avatarColor: '#7928CA',
      publicKey: keyPair.publicKey,
      signalStrength: 95,
      distanceEstimate: '~10m',
      status: 'nearby',
      lastSeen: Date.now(),
      isBroadcasting: true,
    };
    this.peers.set(peer.id, peer);
    StorageService.savePeer(peer);
    this.notifyPeers();
    return peer;
  }

  /**
   * Sends an offline encrypted message to a peer or public broadcast room.
   */
  public async sendMessage(peer: Peer, text: string): Promise<Message> {
    if (!this.userProfile) {
      this.userProfile = await StorageService.getOrCreateUserProfile();
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let ciphertext = text;
    let nonce = '';
    let isEncrypted = false;

    // Perform E2E authenticated encryption if peer's public key is known
    if (peer.publicKey && this.userProfile.secretKey && peer.id !== PUBLIC_BROADCAST_PEER.id) {
      const encryptedPkg = EncryptionService.encrypt(
        text,
        peer.publicKey,
        this.userProfile.secretKey,
      );
      ciphertext = encryptedPkg.ciphertext;
      nonce = encryptedPkg.nonce;
      isEncrypted = true;
    }

    const packet: PacketPayload = {
      version: 1,
      type: peer.id === PUBLIC_BROADCAST_PEER.id ? 'MSG' : 'MSG',
      msgId: messageId,
      from: this.userProfile.id,
      to: peer.id,
      fromName: this.userProfile.nickname,
      avatarColor: this.userProfile.avatarColor,
      publicKey: this.userProfile.publicKey,
      payload: ciphertext,
      nonce: nonce || undefined,
      timestamp: Date.now(),
    };

    const newMsg: Message = {
      id: messageId,
      conversationId: peer.id,
      fromPeerId: this.userProfile.id,
      toPeerId: peer.id,
      text: text,
      timestamp: Date.now(),
      status: 'broadcasting',
      isMine: true,
      isEncrypted,
      nonce,
    };

    // Save to local storage
    await StorageService.saveMessage(peer.id, newMsg);

    // Transmit via native hardware or simulated radio channel
    if (WifiP2P.isAvailable()) {
      await WifiP2P.sendMessage(peer.id, JSON.stringify(packet));
      setTimeout(async () => {
        newMsg.status = 'delivered';
        await StorageService.updateMessageStatus(peer.id, messageId, 'delivered');
        this.notifyMessage(newMsg);
      }, 1000);
    } else {
      // Simulator transmission: simulated radio propagation with delivery and reply
      this.simulateTransmission(peer, newMsg, packet);
    }

    return newMsg;
  }

  // --- Handlers & Listeners ---

  private handleNativePeerDiscovered(event: NativePeerEvent) {
    const existing = this.peers.get(event.peerId);
    const peer: Peer = {
      id: event.peerId,
      name: event.deviceName || `Peer-${event.peerId.slice(0, 4)}`,
      avatarColor: event.avatarColor || '#00E5FF',
      publicKey: event.publicKey,
      signalStrength: event.signalStrength || 85,
      distanceEstimate: '~18m',
      status: 'nearby',
      lastSeen: Date.now(),
      isBroadcasting: true,
      unreadCount: existing?.unreadCount || 0,
    };

    this.peers.set(peer.id, peer);
    StorageService.savePeer(peer);
    this.notifyPeers();
  }

  private async handleNativeMessageReceived(event: NativeMessageEvent) {
    try {
      const packet: PacketPayload = JSON.parse(event.payload);
      if (!this.userProfile) return;

      let decryptedText = packet.payload;
      let isEncrypted = false;

      if (packet.nonce && packet.publicKey && this.userProfile.secretKey) {
        const decrypted = EncryptionService.decrypt(
          packet.payload,
          packet.nonce,
          packet.publicKey,
          this.userProfile.secretKey,
        );
        if (decrypted) {
          decryptedText = decrypted;
          isEncrypted = true;
        }
      }

      const conversationId = packet.to === PUBLIC_BROADCAST_PEER.id ? PUBLIC_BROADCAST_PEER.id : packet.from;

      const msg: Message = {
        id: packet.msgId,
        conversationId: conversationId,
        fromPeerId: packet.from,
        toPeerId: this.userProfile.id,
        text: decryptedText,
        timestamp: packet.timestamp || Date.now(),
        status: 'delivered',
        isMine: false,
        isEncrypted,
        nonce: packet.nonce,
      };

      await StorageService.saveMessage(conversationId, msg);
      this.notifyMessage(msg);
    } catch (e) {
      console.warn('Failed to parse incoming packet:', e);
    }
  }

  public subscribePeers(listener: PeerListener): () => void {
    this.peerListeners.add(listener);
    listener(Array.from(this.peers.values()));
    return () => this.peerListeners.delete(listener);
  }

  public subscribeMessages(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  private notifyPeers() {
    const list = Array.from(this.peers.values()).sort(
      (a, b) => b.lastSeen - a.lastSeen,
    );
    this.peerListeners.forEach(listener => listener(list));
  }

  private notifyMessage(msg: Message) {
    this.messageListeners.forEach(listener => listener(msg));
  }

  // --- Initial Demo Nodes Setup ---

  private populateInitialDemoNodes() {
    const demoNodes = [
      {
        id: 'node-7F2A-99B1-40D8',
        name: 'Nexus-7 (Direct Radio)',
        avatarColor: '#00E5FF',
        distanceEstimate: '~12m',
        signalStrength: 92,
      },
      {
        id: 'node-A4C1-308D-E922',
        name: 'GhostProtocol-09',
        avatarColor: '#7928CA',
        distanceEstimate: '~35m',
        signalStrength: 78,
      },
      {
        id: 'node-55E0-18FA-BC01',
        name: 'Echo-Vanguard',
        avatarColor: '#00FF88',
        distanceEstimate: '~65m',
        signalStrength: 64,
      },
    ];

    demoNodes.forEach(item => {
      const keypair = EncryptionService.generateKeyPair();
      const peer: Peer = {
        id: item.id,
        name: item.name,
        avatarColor: item.avatarColor,
        publicKey: keypair.publicKey,
        signalStrength: item.signalStrength,
        distanceEstimate: item.distanceEstimate,
        status: 'nearby',
        lastSeen: Date.now(),
        isBroadcasting: true,
      };
      this.peers.set(peer.id, peer);
      StorageService.savePeer(peer);
    });
  }

  // --- Realistic Simulator for testing ---

  private startSimulatedDiscovery() {
    // Keep peers alive and refresh timestamps
    this.simInterval = setInterval(() => {
      this.peers.forEach(peer => {
        peer.lastSeen = Date.now();
        peer.status = 'nearby';
      });
      this.notifyPeers();
    }, 4000);
  }

  private simulateTransmission(
    peer: Peer,
    message: Message,
    _packet: PacketPayload,
  ) {
    setTimeout(async () => {
      message.status = 'delivered';
      await StorageService.updateMessageStatus(
        peer.id,
        message.id,
        'delivered',
      );
      this.notifyMessage({ ...message, status: 'delivered' });

      // Simulate incoming peer response after radio propagation delay
      setTimeout(async () => {
        const isBroadcast = peer.id === PUBLIC_BROADCAST_PEER.id;
        const replies = isBroadcast
          ? [
              '📢 [Mesh Beacon]: Broadcast packet bounced across local mesh nodes! Signal verified.',
              '📡 [Node-Nexus]: Received your open radio transmission clearly.',
              '⚡ [Node-Echo]: Offline radio mesh channel operational at 100% throughput.',
            ]
          : [
              '📡 Packet received over WiFi radio beacon! Signal strong at 92%.',
              '🔒 Decrypted E2E with Curve25519 authenticated key. Zero internet required!',
              'Roger that! Relay hop established directly without cell towers.',
              'Message confirmed on offline peer node. Radio channel open.',
            ];
        const replyText =
          replies[Math.floor(Math.random() * replies.length)];

        const replyMsgId = `reply-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
        const replyMsg: Message = {
          id: replyMsgId,
          conversationId: peer.id,
          fromPeerId: isBroadcast ? 'node-mesh-repeater' : peer.id,
          toPeerId: this.userProfile?.id || '',
          text: replyText,
          timestamp: Date.now(),
          status: 'delivered',
          isMine: false,
          isEncrypted: !isBroadcast,
        };

        await StorageService.saveMessage(peer.id, replyMsg);
        this.notifyMessage(replyMsg);
      }, 1800);
    }, 600);
  }
}

export const P2PService = new P2PManager();
