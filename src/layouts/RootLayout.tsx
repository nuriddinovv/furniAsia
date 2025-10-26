import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabLayout from './TabLayout';
import LoginScreen from '../screens/auth/LoginScreen';
import LockScreen from '../screens/auth/LockScreen';
import VerificationScreen from '../screens/auth/VerificationScreen';
import HistoryDetails from '../screens/details/HistoryDetails';
import LocationDetails from '../screens/details/LocationDetails';
import OrderDetails from '../screens/details/OrderDetails';
import CartScreen from '../screens/other/CartScreen';
import HistoryScreen from '../screens/other/HistoryScreen';
import OrderScreen from '../screens/other/OrderScreen';
import SelectLocationScreen from '../screens/other/SelectLocationScreen';
import StoryScreen from '../screens/other/StoryScreen';
import ChangeProfile from '../screens/settings/ChangeProfile';
import ChangeLanguage from '../screens/settings/ChangeLanguage';
import Comment from '../screens/settings/Comment';
import Notifications from '../screens/other/Notifications';
import NotificationDetail from '../screens/details/NotificationDetails';

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  return (
    <Stack.Navigator initialRouteName="login">
      <Stack.Screen
        name="tab"
        component={TabLayout}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="login"
        component={LoginScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="lock"
        component={LockScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="verification"
        component={VerificationScreen}
      />
      <Stack.Screen name="historyDetails" component={HistoryDetails} />
      <Stack.Screen name="locationDetails" component={LocationDetails} />
      <Stack.Screen name="orderDetails" component={OrderDetails} />
      <Stack.Screen name="cart" component={CartScreen} />
      <Stack.Screen name="history" component={HistoryScreen} />
      <Stack.Screen name="orders" component={OrderScreen} />
      <Stack.Screen name="selectLocation" component={SelectLocationScreen} />
      <Stack.Screen name="story" component={StoryScreen} />
      <Stack.Screen name="changeProfile" component={ChangeProfile} />
      <Stack.Screen name="changeLanguage" component={ChangeLanguage} />
      <Stack.Screen name="comment" component={Comment} />
      <Stack.Screen name="notifications" component={Notifications} />
      <Stack.Screen name="NotificationDetail" component={NotificationDetail} />
    </Stack.Navigator>
  );
}
