// src/components/FilterModal.tsx
import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { color } from '../../color';

type Option = { code: number; name: string };

export type FilterPayload = {
  categories: number[]; // category code list
  brands: number[]; // brand code list
  priceMin?: number;
  priceMax?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (payload: FilterPayload) => void;
  categories: Option[];
  brands: Option[];
  initial?: Partial<FilterPayload>;
  title?: string;
};

type Screen = 'root' | 'category' | 'brand' | 'sort';
type SortBy = 'price' | 'alphabet';
type SortOrder = 'asc' | 'desc';

export default function FilterModal({
  visible,
  onClose,
  onApply,
  categories,
  brands,
  initial,
  title = 'Фильтр',
}: Props) {
  const [screen, setScreen] = useState<Screen>('root');

  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
    () => new Set(initial?.categories ?? []),
  );
  const [selectedBrands, setSelectedBrands] = useState<Set<number>>(
    () => new Set(initial?.brands ?? []),
  );
  const [min, setMin] = useState<string>(
    initial?.priceMin ? String(initial!.priceMin) : '',
  );
  const [max, setMax] = useState<string>(
    initial?.priceMax ? String(initial!.priceMax) : '',
  );
  const [sortBy, setSortBy] = useState<SortBy | undefined>(initial?.sortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(
    initial?.sortOrder,
  );

  const clearAll = () => {
    setSelectedCategories(new Set());
    setSelectedBrands(new Set());
    setMin('');
    setMax('');
    setSortBy(undefined);
    setSortOrder(undefined);
  };

  const apply = () => {
    onApply({
      categories: [...selectedCategories],
      brands: [...selectedBrands],
      priceMin: min.trim() ? Number(min) : undefined,
      priceMax: max.trim() ? Number(max) : undefined,
      sortBy,
      sortOrder,
    });
    handleClose();
  };

  const Header = ({ showBack }: { showBack?: boolean }) => (
    <View style={s.header}>
      {showBack ? (
        <TouchableOpacity onPress={() => setScreen('root')} style={s.iconBtn}>
          <Text style={s.iconTxt}>‹</Text>
        </TouchableOpacity>
      ) : (
        <View style={s.iconBtn} />
      )}
      <Text style={s.headerTitle}>{title}</Text>

      <TouchableOpacity onPress={handleClose} style={s.iconBtn}>
        <Text style={s.iconTxt}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const Row = ({
    label,
    value,
    onPress,
  }: {
    label: string;
    value?: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity onPress={onPress} style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {value ? (
          <Text style={s.rowValue} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        <Text style={s.chev}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const toggle = (
    set: Set<number>,
    code: number,
    setter: (s: Set<number>) => void,
  ) => {
    const next = new Set(set);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setter(next);
  };

  const renderOptions = (
    data: Option[],
    set: Set<number>,
    setter: (s: Set<number>) => void,
  ) => (
    <FlatList
      data={data}
      keyExtractor={it => String(it.code)}
      ItemSeparatorComponent={() => <View style={s.sep} />}
      renderItem={({ item }) => {
        const on = set.has(item.code);
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggle(set, item.code, setter)}
            style={s.optRow}
          >
            <Text style={s.optName}>{item.name}</Text>
            <View style={[s.checkbox, on && s.checkboxOn]}>
              {on ? <Text style={s.checkmark}>✓</Text> : null}
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );

  const categoryValue = useMemo(
    () => (selectedCategories.size ? `${selectedCategories.size}` : undefined),
    [selectedCategories],
  );

  const brandValue = useMemo(
    () => (selectedBrands.size ? `${selectedBrands.size}` : undefined),
    [selectedBrands],
  );

  const sortValue = useMemo(() => {
    if (sortBy === 'price' && sortOrder === 'desc') return 'Подороже';
    if (sortBy === 'price' && sortOrder === 'asc') return 'Подешевле';
    if (sortBy === 'alphabet' && sortOrder === 'asc') return 'A-Z';
    if (sortBy === 'alphabet' && sortOrder === 'desc') return 'Z-A';
    return undefined;
  }, [sortBy, sortOrder]);

  const handleClose = () => {
    // modal yopilganda har doim root ga qaytaramiz
    setScreen('root');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose} // ⬅️ shu ham yangilandi
      transparent
    >
      <SafeAreaView style={s.wrap}>
        <KeyboardAvoidingView
          enabled={visible}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 72 : 0}
          style={{ flex: 1 }}
        >
          {screen === 'root' ? (
            <>
              <Header />

              <View style={{ justifyContent: 'space-between', height: '90%' }}>
                <View>
                  <View style={s.card}>
                    <Row
                      label="Сортировать"
                      value={sortValue}
                      onPress={() => setScreen('sort')}
                    />

                    <Row
                      label="Категория"
                      value={categoryValue}
                      onPress={() => setScreen('category')}
                    />
                    <Row
                      label="Бренд"
                      value={brandValue}
                      onPress={() => setScreen('brand')}
                    />
                  </View>
                  <View style={s.card}>
                    {/* Price */}
                    <Text style={s.subTitle}>Цена, сум</Text>
                    <View style={s.priceRow}>
                      <TextInput
                        placeholder="от"
                        keyboardType="number-pad"
                        value={min}
                        onChangeText={t => setMin(t.replace(/[^\d]/g, ''))}
                        style={s.priceInput}
                        returnKeyType="done"
                        placeholderTextColor={'#9ca3af'}
                      />
                      <TextInput
                        placeholder="до"
                        keyboardType="number-pad"
                        value={max}
                        onChangeText={t => setMax(t.replace(/[^\d]/g, ''))}
                        style={s.priceInput}
                        returnKeyType="done"
                        placeholderTextColor={'#9ca3af'}
                      />
                    </View>
                  </View>
                </View>
                {/* Bottom bar */}
                <View style={s.bottom}>
                  <TouchableOpacity onPress={clearAll} style={s.clearBtn}>
                    <Text style={s.clearTxt}>Сбросить</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={apply} style={s.applyBtn}>
                    <Text style={s.applyTxt}>Посмотреть товары</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : null}

          {screen === 'category' ? (
            <>
              <Header showBack />

              <View style={s.listWrap}>
                {renderOptions(
                  categories,
                  selectedCategories,
                  setSelectedCategories,
                )}
              </View>
              <View style={s.bottom}>
                <TouchableOpacity
                  onPress={() => setSelectedCategories(new Set())}
                  style={s.clearBtn}
                >
                  <Text style={s.clearTxt}>Очистить</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setScreen('root')}
                  style={s.applyBtn}
                >
                  <Text style={s.applyTxt}>
                    Готово ({selectedCategories.size})
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}

          {screen === 'brand' ? (
            <>
              <Header showBack />
              <View style={s.listWrap}>
                {renderOptions(brands, selectedBrands, setSelectedBrands)}
              </View>
              <View style={s.bottom}>
                <TouchableOpacity
                  onPress={() => setSelectedBrands(new Set())}
                  style={s.clearBtn}
                >
                  <Text style={s.clearTxt}>Очистить</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setScreen('root')}
                  style={s.applyBtn}
                >
                  <Text style={s.applyTxt}>Готово ({selectedBrands.size})</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
          {screen === 'sort' ? (
            <>
              <Header showBack />
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View style={[s.card, { marginTop: 12 }]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={s.optRow}
                    onPress={() => {
                      setSortBy('price');
                      setSortOrder('desc');
                    }}
                  >
                    <Text style={s.optName}>Подороже</Text>
                    <View
                      style={[
                        s.radio,
                        sortBy === 'price' && sortOrder === 'desc' && s.radioOn,
                      ]}
                    />
                  </TouchableOpacity>
                  <View style={s.sep} />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={s.optRow}
                    onPress={() => {
                      setSortBy('price');
                      setSortOrder('asc');
                    }}
                  >
                    <Text style={s.optName}>Подешевле</Text>
                    <View
                      style={[
                        s.radio,
                        sortBy === 'price' && sortOrder === 'asc' && s.radioOn,
                      ]}
                    />
                  </TouchableOpacity>
                  <View style={s.sep} />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={s.optRow}
                    onPress={() => {
                      setSortBy('alphabet');
                      setSortOrder('asc');
                    }}
                  >
                    <Text style={s.optName}>A-Z</Text>
                    <View
                      style={[
                        s.radio,
                        sortBy === 'alphabet' &&
                          sortOrder === 'asc' &&
                          s.radioOn,
                      ]}
                    />
                  </TouchableOpacity>
                  <View style={s.sep} />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={s.optRow}
                    onPress={() => {
                      setSortBy('alphabet');
                      setSortOrder('desc');
                    }}
                  >
                    <Text style={s.optName}>Z-A</Text>
                    <View
                      style={[
                        s.radio,
                        sortBy === 'alphabet' &&
                          sortOrder === 'desc' &&
                          s.radioOn,
                      ]}
                    />
                  </TouchableOpacity>
                </View>

                <View style={s.bottom}>
                  <TouchableOpacity
                    onPress={() => {
                      setSortBy(undefined);
                      setSortOrder(undefined);
                    }}
                    style={s.clearBtn}
                  >
                    <Text style={s.clearTxt}>Сбросить</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setScreen('root')}
                    style={s.applyBtn}
                  >
                    <Text style={s.applyTxt}>Готово</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : null}

          {/* category / brand / sort ekranlari o'zgarishsiz */}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ececec',
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTxt: { fontSize: 22, color: 'black' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: 'black' },

  sectionTitleWrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: 'black' },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  subTitle: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    fontWeight: '500',
    color: 'black',
  },

  priceRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  priceInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: 'black',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  rowLabel: { fontSize: 16, color: 'black' },
  rowValue: {
    fontSize: 14,
    color: '#6b7280',
    maxWidth: 120,
    textAlign: 'right',
  },
  chev: { fontSize: 20, color: '#9ca3af' },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#ececec' },

  listWrap: { flex: 1 },
  optRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optName: { fontSize: 16, color: 'black' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#cfcfcf',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: color.primary, borderColor: color.primary },
  checkmark: { color: 'white', fontSize: 16, fontWeight: '700' },

  bottom: {
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#ececec',
    backgroundColor: '#fff',
  },
  clearBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flex: 1,
  },
  clearTxt: { textAlign: 'center', fontWeight: '600', color: 'black' },
  applyBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: color.primary,
    flex: 2,
  },
  applyTxt: { color: 'white', textAlign: 'center', fontWeight: '700' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#cfcfcf',
  },
  radioOn: {
    borderColor: color.primary,
    shadowColor: color.primary,
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
});
