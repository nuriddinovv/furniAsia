import {
  View,
  Text,
  Image,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Linking,
  SafeAreaView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { t } from 'i18next';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { color } from '../../../color';

export default function Page({ route }: any) {
  const navigation = useNavigation();
  const { image, link } = route.params as {
    image: string;
    link: string;
  };
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const [isScreenPressed, setIsScreenPressed] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });

    if (!isScreenPressed) {
      const timer = setTimeout(() => {
        navigation.goBack();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [navigation, isScreenPressed]);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleOpenLink = async () => {
    if (!link) return;

    try {
      let formattedLink = link;
      if (
        !formattedLink.startsWith('http://') &&
        !formattedLink.startsWith('https://')
      ) {
        formattedLink = `https://${formattedLink}`;
      }

      const canOpen = await Linking.canOpenURL(formattedLink);
      if (canOpen) {
        await Linking.openURL(formattedLink);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => setIsScreenPressed(true)}
        onPressOut={() => setIsScreenPressed(false)}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <Image
            source={{ uri: image }}
            style={{ height: screenHeight, width: screenWidth }}
            resizeMode="contain"
          />
          <StatusBar
            barStyle={'light-content'}
            backgroundColor={'transparent'}
          />

          {/* Yopish tugmasi */}
          <TouchableOpacity
            onPress={handleClose}
            style={{ position: 'absolute', top: 30, right: 20, zIndex: 1 }}
          >
            <AntDesign name="close" size={32} color="white" />
          </TouchableOpacity>

          {/* Link tugmasi */}
          {link && (
            <View style={styles.linkContainer}>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={handleOpenLink}
              >
                <Text style={styles.buttonText}>{t('stories.goToLink')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: color.primary,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  linkContainer: {
    position: 'absolute',
    bottom: 20,
    zIndex: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
});
