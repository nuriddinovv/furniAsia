import { NavigationContainer } from '@react-navigation/native';
import { UserProvider } from './src/utils/UserContext';
import { navigationRef, replace } from './src/utils/NavigationService';
import Toast from 'react-native-toast-message';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import RootLayout from './src/layouts/RootLayout';

function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const phoneNumber = await AsyncStorage.getItem('phoneNumber').then(
          res => {
            if (res) {
              setLoading(false);
              replace('lock');
            } else {
              setLoading(false);
              replace('login');
            }
          },
        );
      } catch (error) {
        console.error('Auth check error: ', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // router tayyor bo‘lganda ishlaydi

  return (
    <NavigationContainer ref={navigationRef}>
      <UserProvider>
        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#fff',
            }}
          >
            <ActivityIndicator size="large" color="#e30613" />
          </View>
        ) : (
          <RootLayout />
        )}
        <Toast />
      </UserProvider>
    </NavigationContainer>
  );
}

export default App;
