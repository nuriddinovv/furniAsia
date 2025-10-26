import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';
import { UserData } from '../../interface';
import { goBack, replace } from './NavigationService';
import i18next from 'i18next';

export interface UserContextType {
  language: string;
  setLanguage: (lang: string) => void;
  sessionId: string;
  setSessionId: (id: string) => void;
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  oneTimeCode: number;
  setOneTimeCode: (code: number) => void;
  cartItem: any;
  setCartItem: (data: any) => void;
  clearAllData: () => Promise<void>;
  selectedLocation: { latitude: number; longitude: number } | null;
  setSelectedLocation: (
    location: { latitude: number; longitude: number } | null,
  ) => void;
}
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // LOCK Screen
  const appState = useRef(AppState.currentState);
  const LOCK_TIME = 3000;

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: any) => {
    if (nextAppState === 'inactive') {
      replace('home');
    } else {
        goBack();
    }

    if (nextAppState === 'background') {
      recordStartTime();
    } else if (
      nextAppState === 'active' &&
      appState.current.match(/background/)
    ) {
      const elapsed =
        Date.now() - parseInt((await AsyncStorage.getItem('startTime')) || '0');
      const phoneNumber = parseInt(
        (await AsyncStorage.getItem('phoneNumber')) || '0',
      );
      if (phoneNumber && elapsed && elapsed >= LOCK_TIME) {
        replace('lock');
      }
    }

    appState.current = nextAppState;
  };

  const recordStartTime = async () => {
    await AsyncStorage.setItem('startTime', Date.now().toString());
  };

  const [language, setLanguageState] = useState(i18next.language);
  const [sessionId, setSessionIdState] = useState<string>('');
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [oneTimeCode, setOneTimeCodeState] = useState<number>(1);
  const [cartItem, setCartItemState] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    const loadLang = async () => {
      const storedLang = await AsyncStorage.getItem('language');
      if (storedLang) {
        setLanguageState(storedLang);
        i18next.changeLanguage(storedLang);
      }
    };
    loadLang();
  }, []);

  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('language', lang);
    i18next.changeLanguage(lang);
  };

  const clearAllData = async () => {
    try {
      setSessionIdState('');
      setUserDataState(null);
      setCartItemState(null);
      setSelectedLocation(null);
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        cartItem,
        setCartItem: setCartItemState,
        language,
        setLanguage,
        sessionId,
        setSessionId: setSessionIdState,
        userData,
        setUserData: setUserDataState,
        oneTimeCode,
        setOneTimeCode: setOneTimeCodeState,
        clearAllData,
        selectedLocation,
        setSelectedLocation,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// **Context Hook**
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
