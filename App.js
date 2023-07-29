import React, {useEffect} from 'react';
import { useColorScheme } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {NavigationContainer, DefaultTheme, DarkTheme, useTheme} from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import mobileAds from 'react-native-google-mobile-ads';

import Soundboard from './components/Soundboard';
import Settings from './components/Settings';
import Upload from "./components/Upload";

const Tab = createBottomTabNavigator();

mobileAds()
  .initialize()
  .then(adapterStatuses => {
    // Initialization complete!
  });

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={theme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarLabelStyle: {
            fontSize: 14,
            fontFamily: 'System',
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Soundboard') {
              iconName = focused ? 'ios-musical-notes' : 'ios-musical-notes-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            } else if (route.name === 'Upload') {
              iconName = focused ? 'add' : 'add-outline';
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
        <Tab.Screen name="Soundboard" component={Soundboard} options={{ title: 'Soundboard' }} />
        <Tab.Screen name="Upload" component={Upload} options={{ title: 'Upload' }} />
        <Tab.Screen name="Settings" component={Settings} options={{ title: 'Settings' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
