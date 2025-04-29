// app/components/DropdownKategori.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { AntDesign } from '@expo/vector-icons';

type DropdownKategoriProps = {
  data: { label: string; value: string }[];
  value: string;
  setValue: (val: string) => void;
  isFocus: boolean;
  setIsFocus: (val: boolean) => void;
};

export default function DropdownKategori({
  data,
  value,
  setValue,
  isFocus,
  setIsFocus,
}: DropdownKategoriProps) {
  const renderLabel = () => {
    if (value || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: 'blue' }]}>
          Kategori
        </Text>
      );
    }
    return null;
  };

  return (
    <View style={{ width: '100%', position: 'relative' }}>
      {renderLabel()}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Pilih kategori' : '...'}
        searchPlaceholder="Cari..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setValue(item.value);
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={isFocus ? 'blue' : 'black'}
            name="Safety"
            size={20}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    marginTop: 8,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 16,
    top: -10,
    zIndex: 999,
    paddingHorizontal: 4,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#888',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#222',
  },
  iconStyle: {
    width: 24,
    height: 24,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
});