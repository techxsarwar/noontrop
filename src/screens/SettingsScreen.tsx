import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, UserProfile } from '../types';
import { StorageService } from '../services/StorageService';
import { P2PService } from '../services/P2PService';
import { EncryptionService } from '../services/EncryptionService';
import { theme } from '../theme';

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const AVATAR_COLORS = [
  '#00E5FF',
  '#7928CA',
  '#FF007A',
  '#00FF88',
  '#FFB800',
  '#3B82F6',
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nickname, setNickname] = useState('');
  const [selectedColor, setSelectedColor] = useState('#00E5FF');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const p = await StorageService.getOrCreateUserProfile();
      setProfile(p);
      setNickname(p.nickname);
      setSelectedColor(p.avatarColor);
    };
    load();
  }, []);

  const handleSaveProfile = async () => {
    if (!nickname.trim()) return;
    const updated = await StorageService.updateUserProfile({
      nickname: nickname.trim(),
      avatarColor: selectedColor,
    });
    setProfile(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleClearData = () => {
    Alert.alert(
      'Purge All Offline Data',
      'This will delete all saved offline messages and generate a new cryptographic identity. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purge',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAllData();
            const p = await StorageService.getOrCreateUserProfile();
            setProfile(p);
            setNickname(p.nickname);
            setSelectedColor(p.avatarColor);
            Alert.alert('Reset Complete', 'Fresh cryptographic identity created.');
          },
        },
      ],
    );
  };

  const fingerprint = profile
    ? EncryptionService.getFingerprint(profile.publicKey)
    : 'LOADING...';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>OFFLINE NODE SETTINGS</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>RADIO IDENTITY</Text>
          <Text style={styles.cardSubtitle}>
            This identity is broadcast directly over WiFi beacons to nearby peers.
          </Text>

          <View style={styles.avatarRow}>
            <View
              style={[
                styles.avatarPreview,
                { backgroundColor: selectedColor },
              ]}
            >
              <Text style={styles.avatarLetter}>
                {nickname ? nickname.charAt(0).toUpperCase() : 'N'}
              </Text>
            </View>

            <View style={styles.colorPalette}>
              {AVATAR_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorDot,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorDotSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>

          <Text style={styles.inputLabel}>BROADCAST NICKNAME</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Enter node name..."
            placeholderTextColor={theme.colors.textMuted}
            maxLength={24}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {isSaved ? '✓ SAVED' : 'UPDATE IDENTITY'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cryptographic Key Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CRYPTOGRAPHIC FINGERPRINT</Text>
          <Text style={styles.cardSubtitle}>
            Every node generates an offline Curve25519 authenticated keypair.
          </Text>

          <View style={styles.fingerprintBox}>
            <Text style={styles.fingerprintLabel}>KEY FINGERPRINT</Text>
            <Text style={styles.fingerprintValue}>{fingerprint}</Text>
          </View>

          <View style={styles.keyDetails}>
            <Text style={styles.keyDetailsLabel}>PUBLIC KEY (BASE64):</Text>
            <Text style={styles.keyDetailsValue} numberOfLines={2}>
              {profile?.publicKey || 'Loading...'}
            </Text>
          </View>
        </View>

        {/* Technology Explanation Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>HOW NOONTROP WORKS</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📡</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>WiFi Radio Beacons</Text>
              <Text style={styles.featureDesc}>
                Uses native WiFi hardware to discover peers and exchange encrypted
                frames without connecting to a router or needing a password.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🚫</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Zero Internet & No SIM</Text>
              <Text style={styles.featureDesc}>
                Functions in disaster zones, remote terrains, airplanes, and offline
                environments.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔒</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>End-to-End Encryption</Text>
              <Text style={styles.featureDesc}>
                Authenticated x25519 + Poly1305 ensures messages can only be read
                by the destination node.
              </Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleClearData}
          activeOpacity={0.8}
        >
          <Text style={styles.dangerButtonText}>PURGE ALL OFFLINE DATA</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  backIcon: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: '300',
    marginTop: -4,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: theme.spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarPreview: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.lg,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarLetter: {
    color: '#000000',
    fontSize: 22,
    fontWeight: '900',
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 8,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    color: theme.colors.textPrimary,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: theme.spacing.md,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  fingerprintBox: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: theme.spacing.sm,
  },
  fingerprintLabel: {
    color: theme.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fingerprintValue: {
    color: theme.colors.accentGreen,
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  keyDetails: {
    marginTop: 4,
  },
  keyDetailsLabel: {
    color: theme.colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 2,
  },
  keyDetailsValue: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    color: theme.colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 51, 102, 0.1)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.accentRed,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    color: theme.colors.accentRed,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
