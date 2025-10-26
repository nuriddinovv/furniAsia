import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useEffect } from 'react';
import { t } from 'i18next';
import { useNavigation } from '@react-navigation/native';
import { goBack } from '../../utils/NavigationService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShopAddressData } from '../../../interface';
import { color } from '../../../color';

export default function LocationDetails({ route }: any) {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const openDefaultMaps = (latitude: number, longitude: number, t: any) => {
    let url = '';

    if (Platform.OS === 'ios') {
      url = `http://maps.apple.com/?ll=${latitude},${longitude}&z=16`;
    } else {
      url = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
    }

    Linking.openURL(url).catch(() => {
      Alert.alert(t('location.errorCode'), t('location.errorText'));
    });
  };
  const { shopData } = route.params;

  const parsedData: ShopAddressData = JSON.parse(
    Array.isArray(shopData) ? shopData[0] : shopData,
  );

  const latitude = parsedData.latitude;

  const longitude = parsedData.longitude;

  if (latitude === null || longitude === null) {
    return (
      <View style={styles.noLocation}>
        <Text style={styles.noLocationText}>{t('location.noLocation')}</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => goBack()}>
          <Text
            style={{
              color: color.primary,
              textAlign: 'center',
            }}
          >
            {t('app.back')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        var map = L.map('map').setView([${latitude}, ${longitude}], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);
        L.marker([${latitude}, ${longitude}]).addTo(map)
          .bindPopup("${parsedData.shopName || "Do'kon"}")
          .openPopup();
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView originWhitelist={['*']} source={{ html }} style={{ flex: 1 }} />
      <SafeAreaView style={styles.box}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => openDefaultMaps(latitude, longitude, t)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{t('location.button')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => goBack()}
          style={[styles.button, styles.backButton]}
        >
          <Text style={[styles.buttonText, { color: color.primary }]}>
            {t('app.back')}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  noLocation: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  noLocationText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'black',
  },
  box: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: color.primary,
    width: '90%',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: color.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
