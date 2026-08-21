import { PermissionsAndroid, Platform } from 'react-native';

export class PermissionService {
  /**
   * Requests necessary Wi-Fi Direct and Nearby Device permissions at runtime on Android.
   */
  static async requestWifiDirectPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const permissionsToRequest: Array<any> = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ];

      // Android 13 (API 33+) requires NEARBY_WIFI_DEVICES
      if (Platform.Version >= 33) {
        permissionsToRequest.push('android.permission.NEARBY_WIFI_DEVICES');
      }

      const results = await PermissionsAndroid.requestMultiple(
        permissionsToRequest,
      );

      const allGranted = Object.values(results).every(
        result => result === PermissionsAndroid.RESULTS.GRANTED,
      );

      return allGranted;
    } catch (e) {
      console.warn('Error requesting Wi-Fi Direct permissions:', e);
      return false;
    }
  }

  /**
   * Checks if required Wi-Fi Direct permissions are already granted.
   */
  static async checkPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const hasFine = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (Platform.Version >= 33) {
        const hasNearby = await PermissionsAndroid.check(
          'android.permission.NEARBY_WIFI_DEVICES' as any,
        );
        return hasFine && hasNearby;
      }

      return hasFine;
    } catch {
      return false;
    }
  }
}
