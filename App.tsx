import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types';
import { DiscoveryScreen } from './src/screens/DiscoveryScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { theme } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: theme.colors.background,
    card: theme.colors.backgroundSecondary,
    text: theme.colors.textPrimary,
    border: theme.colors.cardBorder,
    primary: theme.colors.primary,
  },
};

export default function App() {
  return (
    <NavigationContainer theme={AppNavTheme}>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator
        initialRouteName="Discovery"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Discovery" component={DiscoveryScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
