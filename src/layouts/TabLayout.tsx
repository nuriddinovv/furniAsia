import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/tabs/HomeScreen';
import SettingsScreen from '../screens/tabs/SettingsScreen';
import MarketScreen from '../screens/tabs/MarketScreen';
import QrScreen from '../screens/tabs/QrScreen';
import ShopLocationsScreen from '../screens/tabs/ShopLocationsScreen';
const Tab = createBottomTabNavigator();
import { t } from 'i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color } from '../../color';
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: color.primary,
        tabBarInactiveTintColor: color.darkGray,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: 'white',
          height: Platform.OS === 'ios' ? 80 : 65 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? 15 : 8 + insets.bottom / 2,
          borderTopWidth: 0.4,
          borderTopColor: '#E0E0E0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          headerShadowVisible: false,
          title: t('layout.home'),
          headerTitle: t('layout.home'),

          tabBarIconStyle: {
            marginTop: 5,
            width: 34,
            height: 34,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={32}
              name={focused ? 'home' : 'home-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="market"
        component={MarketScreen}
        options={{
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          headerTitle: t('layout.market'),
          title: t('layout.market'),
          tabBarIconStyle: {
            marginTop: 5,
            width: 34,
            height: 34,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={32}
              name={focused ? 'file-tray-full' : 'file-tray-full-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="qrcode"
        component={QrScreen}
        options={{
          headerShown: false,
          title: '',
          tabBarIconStyle: {
            width: 58,
            height: 58,
            justifyContent: 'flex-start',
            alignItems: 'center',
            display: 'flex',
            marginBottom: 5,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={54}
              name={focused ? 'qr-code' : 'qr-code-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="marketlocation"
        component={ShopLocationsScreen}
        options={{
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          title: t('layout.location'),
          headerTitle: t('layout.location'),
          tabBarIconStyle: {
            marginTop: 5,
            width: 34,
            height: 34,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={32}
              name={focused ? 'location' : 'location-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="settings"
        component={SettingsScreen}
        options={{
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          headerTitle: t('layout.more'),
          title: t('layout.more'),
          tabBarIconStyle: {
            marginTop: 5,
            width: 34,
            height: 34,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={32}
              name={focused ? 'person' : 'person-outline'}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
