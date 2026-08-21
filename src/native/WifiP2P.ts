import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { WifiP2PModule } = NativeModules;

export interface NativePeerEvent {
  peerId: string;
  deviceName: string;
  avatarColor?: string;
  publicKey?: string;
  signalStrength?: number;
  status: string;
}

export interface NativeMessageEvent {
  fromPeerId: string;
  payload: string; // JSON encoded packet
  timestamp: number;
}

class WifiP2PBridge {
  private eventEmitter: NativeEventEmitter | null = null;
  private isNativeAvailable: boolean = false;

  constructor() {
    if (WifiP2PModule) {
      this.isNativeAvailable = true;
      this.eventEmitter = new NativeEventEmitter(WifiP2PModule);
    }
  }

  public isAvailable(): boolean {
    return this.isNativeAvailable && Platform.OS === 'android';
  }

  /**
   * Initializes the native Wi-Fi Direct Manager and registers broadcast receivers.
   */
  public async initialize(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }
    try {
      return await WifiP2PModule.initialize();
    } catch (e) {
      console.warn('Native WifiP2P initialize failed:', e);
      return false;
    }
  }

  /**
   * Starts local DNS-SD service advertising with identity payload.
   */
  public async startAdvertising(
    serviceName: string,
    txtRecord: Record<string, string>,
  ): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      return await WifiP2PModule.startAdvertising(serviceName, txtRecord);
    } catch (e) {
      console.warn('Native WifiP2P startAdvertising failed:', e);
      return false;
    }
  }

  /**
   * Stops local DNS-SD service advertising.
   */
  public async stopAdvertising(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      return await WifiP2PModule.stopAdvertising();
    } catch (e) {
      console.warn('Native WifiP2P stopAdvertising failed:', e);
      return false;
    }
  }

  /**
   * Starts scanning for nearby P2P services.
   */
  public async startDiscovery(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      return await WifiP2PModule.startDiscovery();
    } catch (e) {
      console.warn('Native WifiP2P startDiscovery failed:', e);
      return false;
    }
  }

  /**
   * Stops scanning.
   */
  public async stopDiscovery(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      return await WifiP2PModule.stopDiscovery();
    } catch (e) {
      console.warn('Native WifiP2P stopDiscovery failed:', e);
      return false;
    }
  }

  /**
   * Sends raw string payload to a peer via direct P2P socket.
   */
  public async sendMessage(
    peerAddress: string,
    payload: string,
  ): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      return await WifiP2PModule.sendMessage(peerAddress, payload);
    } catch (e) {
      console.warn('Native WifiP2P sendMessage failed:', e);
      return false;
    }
  }

  /**
   * Subscribes to peer discovered events.
   */
  public onPeerDiscovered(
    callback: (peer: NativePeerEvent) => void,
  ): { remove: () => void } {
    if (this.eventEmitter) {
      const sub = this.eventEmitter.addListener(
        'onPeerDiscovered',
        (event: any) => callback(event as NativePeerEvent),
      );
      return { remove: () => sub.remove() };
    }
    return { remove: () => {} };
  }

  /**
   * Subscribes to message received events.
   */
  public onMessageReceived(
    callback: (event: NativeMessageEvent) => void,
  ): { remove: () => void } {
    if (this.eventEmitter) {
      const sub = this.eventEmitter.addListener(
        'onMessageReceived',
        (event: any) => callback(event as NativeMessageEvent),
      );
      return { remove: () => sub.remove() };
    }
    return { remove: () => {} };
  }
}

export const WifiP2P = new WifiP2PBridge();
