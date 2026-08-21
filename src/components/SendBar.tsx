import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { theme } from '../theme';

interface SendBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const SendBar: React.FC<SendBarProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Transmit encrypted message via WiFi..."
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
        <Text style={styles.sendIcon}>📡</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Platform.OS === 'ios' ? theme.spacing.sm : 2,
    marginRight: theme.spacing.sm,
    minHeight: 44,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  charCount: {
    color: theme.colors.textMuted,
    fontSize: 10,
    marginLeft: 6,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.cardBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: {
    fontSize: 18,
  },
});
