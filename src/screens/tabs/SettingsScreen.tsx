import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '../../utils/UserContext';
import { useNavigation } from '@react-navigation/native';
import { navigate, replace } from '../../utils/NavigationService';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { color } from '../../../color';

const settings = [
  {
    key: 'editProfile',
    icon: 'cogs',
    href: 'changeProfile',
  },
  {
    key: 'editLang',
    icon: 'language',
    href: 'changeLanguage',
  },
  {
    key: 'orderStatus',
    icon: 'shopping-bag',
    href: 'orders',
  },
  {
    key: 'comment',
    icon: 'comment-dots',
    href: 'comment',
  },
];

export default function SettingsScreen() {
  const { clearAllData } = useUserContext();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: t('layout.more'),
      title: t('layout.more'),
      headerShadowVisible: false,
    });
  }, [i18n.language, navigation]);

  const quitApp = async () => {
    replace('login');
    clearAllData();
  };

  return (
    <View style={styles.container}>
      <View>
        {settings.map(item => (
          <SettingItem
            key={item.key}
            text={t(`setting.${item.key}`)}
            icon={item.icon}
            href={item.href}
          />
        ))}
      </View>
      <View>
        <TouchableOpacity
          onPress={() => {
            setModalVisible(true);
          }}
          style={styles.box}
          activeOpacity={0.8}
        >
          <View>
            <Text style={styles.shopName}>{t('app.exit')}</Text>
          </View>
          <View style={styles.iconWrapper}>
            <FontAwesome5 name="sign-out-alt" size={24} color={'white'} />
          </View>
        </TouchableOpacity>
      </View>
      <Modal
        visible={modalVisible}
        statusBarTranslucent
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          onPress={() => {
            setModalVisible(false);
          }}
          style={changeQuantityModalStyles.overlay}
          activeOpacity={1}
        >
          <TouchableOpacity
            style={changeQuantityModalStyles.modal}
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
          >
            <Text style={changeQuantityModalStyles.inputText}>
              {t('app.modaltext1')}
            </Text>
            <View style={changeQuantityModalStyles.buttons}>
              <TouchableOpacity
                style={changeQuantityModalStyles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                }}
              >
                <Text
                  style={[
                    changeQuantityModalStyles.buttonText,
                    { color: 'black' },
                  ]}
                >
                  {t('app.back')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={changeQuantityModalStyles.acceptBtn}
                onPress={quitApp}
              >
                <Text style={changeQuantityModalStyles.buttonText}>
                  {t('app.exit')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const SettingItem = ({
  text,
  icon,
  href,
}: {
  text: string;
  icon: string;
  href: string;
}) => (
  <TouchableOpacity
    onPress={() => navigate(href)}
    style={styles.box}
    activeOpacity={0.8}
  >
    <View>
      <Text style={styles.shopName}>{text}</Text>
    </View>
    <View style={styles.iconWrapper}>
      <FontAwesome5 name={icon as any} size={24} color={'white'} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    backgroundColor: 'white',
  },
  box: {
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    marginVertical: 8,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopName: {
    fontSize: 16,
    fontWeight: 500,
    color: 'black',
  },
  iconWrapper: {
    backgroundColor: color.primary,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
});

const changeQuantityModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000088',
  },
  modal: {
    zIndex: 5,
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
  },
  inputText: {
    fontSize: 18,
    textAlign: 'center',
    margin: 10,
    color: 'black',
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  key: {
    width: 80,
    height: 80,
    margin: 5,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  keyText: {
    fontSize: 24,
    color: '#000',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  cancelBtn: {
    borderRadius: 20,
    width: '48%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: color.gray,
  },
  acceptBtn: {
    borderRadius: 20,
    width: '48%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: color.primary,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
