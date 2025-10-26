import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useEffect, useRef, useState } from 'react';
import { t } from 'i18next';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from '../../utils/UserContext';
import { goBack } from '../../utils/NavigationService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color } from '../../../color';

export default function SelectLocationScreen() {
  const navigation = useNavigation();
  const { setSelectedLocation } = useUserContext();
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      headerShadowVisible: false,
    });
  }, [navigation]);

  const handleSubmit = () => {
    webViewRef.current?.injectJavaScript(`postCenterCoords(); true;`);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.latitude && data.longitude) {
        setSelectedLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
        goBack();
      }
    } catch (e) {
      console.warn('Invalid data from WebView', e);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={handleMessage}
        style={{ flex: 1 }}
      />

      <View style={styles.box}>
        <SafeAreaView style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>{t('cart.confirm')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => goBack()}
          >
            <Text style={[styles.buttonText, { color: color.primary }]}>
              {t('app.back')}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  box: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    width: '90%',
    backgroundColor: color.primary,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: color.primary,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
          .center-pin {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -100%);
            font-size: 32px;
            color: #dc2626;
            z-index: 500;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="center-pin">📍</div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          var map = L.map('map').setView([41.311081, 69.240562], 16);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
          }).addTo(map);

          function postCenterCoords() {
            const center = map.getCenter();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              latitude: center.lat,
              longitude: center.lng
            }));
          }

          window.addEventListener("message", (event) => {
            if (event.data === "getLocation") {
              postCenterCoords();
            }
          });
        </script>
      </body>
    </html>
  `;
