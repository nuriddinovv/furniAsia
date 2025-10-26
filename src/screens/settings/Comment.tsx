import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from '../../utils/UserContext';
import { FeedbackType } from '../../api/get';
import { SendFeedback } from '../../api/post';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { color } from '../../../color';
import { FeedbackTypeResponse, FeedbackResponse } from '../../../interface';

export default function Comment() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { sessionId, userData } = useUserContext();

  const [type, setType] = useState('');
  const [text, setText] = useState('');

  // yangi state'lar
  const [feedbackType, setFeedbackType] = useState<FeedbackTypeResponse | null>(
    null,
  );
  const [feedbackTypeLoading, setFeedbackTypeLoading] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setText('');
    setType('');
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: t('setting.comment'),
      headerShadowVisible: false,
      headerTitleAlign: 'center',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ paddingHorizontal: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, i18n.language, t]);

  // feedbackType olish (useFetch o‘rniga)
  const fetchFeedbackTypes = async () => {
    setFeedbackTypeLoading(true);
    try {
      const res = await FeedbackType({ sessionId: sessionId });
      setFeedbackType(res);

      if (res.error) {
        Alert.alert(t('cart.error'), res.error.message);
      }
    } catch (err) {
      console.error('Error fetching feedback types:', err);
      Alert.alert(t('cart.error'), t('comment.loadError'));
    } finally {
      setFeedbackTypeLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackTypes();
  }, []);

  const handleSubmit = async () => {
    if (!type.trim() || !text.trim()) {
      return;
    }

    setLoading(true);

    try {
      if (userData && type && text) {
        const response: FeedbackResponse = await SendFeedback({
          cardCode: userData.cardCode,
          phone: userData.phone,
          sessionId: sessionId,
          desc: text,
          feedbackType: type,
        });

        if (response.status === 'success') {
          Toast.show({
            type: 'success',
            text1: t('comment.success'),
            text2: t('comment.successText'),
            text1Style: { fontSize: 18, fontWeight: '500', color: 'green' },
            text2Style: { fontSize: 14, color: color.darkGray },
            topOffset: 60,
          });
          setText('');
          setType('');
        } else if (response.error) {
          Alert.alert(t('cart.error'), String(response.error.message));
        }
      }
    } catch (err) {
      console.error('Error sending feedback:', err);
      Alert.alert(t('cart.error'), t('cart.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <View>
          <View style={styles.box}>
            <TouchableOpacity
              onPress={() => {
                setFeedbackModal(true);
              }}
            >
              {type ? (
                <Text style={{ color: 'black' }}>
                  {type === 'C' ? t('comment.c') : t('comment.s')}
                </Text>
              ) : (
                <Text style={{ color: 'black' }}>{t('comment.type')}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.box, { marginTop: 16 }]}>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={8}
              placeholder={t('comment.textInp')}
              placeholderTextColor={color.darkGray}
              value={text}
              onChangeText={setText}
              textAlignVertical="top"
            />
          </View>
        </View>
        <View>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleSubmit}
          >
            {loading ? (
              <ActivityIndicator size={'small'} color={'white'} />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '500', color: 'white' }}>
                {t('comment.btn')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        statusBarTranslucent
        visible={feedbackModal}
        transparent
        animationType="fade"
      >
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            flex: 1,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              width: '100%',
              borderRadius: 20,
              padding: 12,
            }}
          >
            <ScrollView
              style={{
                backgroundColor: 'white',
              }}
              showsVerticalScrollIndicator={false}
            >
              {feedbackType?.data.map(item => (
                <TouchableOpacity
                  key={item.code}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.18,
                    shadowRadius: 4.59,
                    elevation: 5,
                    borderRadius: 20,
                    backgroundColor: 'white',
                    margin: 8,
                    padding: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => {
                    setType(item.code);
                    setFeedbackModal(false);
                  }}
                  activeOpacity={0.8}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'medium',
                        color: 'black',
                      }}
                    >
                      {item.code === 'C' ? t('comment.c') : t('comment.s')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 8,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  box: {
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    padding: 10,
    elevation: 2,
  },
  textInput: {
    fontSize: 16,
    color: '#000',
    minHeight: 180,
    textAlignVertical: 'top',
    borderRadius: 20,
    marginVertical: 5,
    marginHorizontal: 12,
  },
  button: {
    width: '100%',
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: color.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
  },
});
