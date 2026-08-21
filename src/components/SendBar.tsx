import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { theme } from '../theme';

interface SendBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const QUICK_CHIPS = [
  '👋 Radio Ping',
  '🔒 E2EE Check',
  '📡 Signal OK',
  '⚡ Offline Mesh',
  '📍 SOS / Help',
];

export const SendBar: React.FC<SendBarProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleChipPress = (chipText: string) => {
    onSend(chipText);
  };

  return (
    <View style={styles.container}>
      {/* Quick Action Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        {QUICK_CHIPS.map((chip, index) => (
          <TouchableOpacity
            key={index}
            style={styles.chip}
            onPress={() => handleChipPress(chip)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipText}>{chip}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Input Row */}
      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type offline message..."
            placeholderTextColor={theme.colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          {text.length > 0 && (
            <Text style={styles.charCount}>{500 - text.length}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!text.trim() || disabled) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!text.trim() || disabled}
          activeOpacity={0.8}
        >
          <Text style={styles.sendButtonIcon}>📡</Text>
          <Text style={styles.sendButtonText}>SEND</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
    paddingTop: theme.spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? 20 : theme.spacing.sm,
  },
  chipsScroll: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? theme.spacing.sm : 4,
    marginRight: theme.spacing.sm,
    minHeight: 44,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
    maxHeight: 100,
    paddingTop: 6,
    paddingBottom: 6,
  },
  charCount: {
    color: theme.colors.textMuted,
    fontSize: 10,
    marginLeft: 6,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 14,
    height: 44,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.cardBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  sendButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
