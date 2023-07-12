import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, useColorScheme } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {NavigationContainer, DefaultTheme, DarkTheme, useTheme} from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import Soundboard from './components/Soundboard';
import Settings from './components/Settings';

const Tab = createBottomTabNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
      <NavigationContainer theme={theme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            // tabBarActiveTintColor: colors.primary,
            // tabBarInactiveTintColor: colors.text,
            tabBarLabelStyle: {
              fontSize: 14,
              fontFamily: 'System',
            },
            // tabBarStyle: {
              // backgroundColor: colors.card,
            // },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Soundboard') {
                iconName = focused ? 'ios-musical-notes' : 'ios-musical-notes-outline';
                return <Ionicons name={iconName} size={size} color={color} />;
              } else if (route.name === 'Settings') {
                iconName = focused ? 'cog' : 'cog-outline';
                return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
              }

              // Default fallback icon
              return <Ionicons name="help-circle" size={size} color={color} />;
            },
            headerTitleStyle: {
              fontSize: 24,
              fontWeight: 'bold',
              alignSelf: 'flex-start',
              marginLeft: 10,
            },
            headerTitleContainerStyle: {
              position: 'absolute',
              transform: [{ translateY: 4 }],
            },
          })}
        >
          <Tab.Screen
            name="Soundboard"
            component={Soundboard}
            options={{ title: 'Soundboard' }}
          />
          <Tab.Screen name="Settings" component={Settings} options={{ title: 'Settings' }} />
        </Tab.Navigator>
      </NavigationContainer>
  );
}
