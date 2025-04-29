import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Alert, Image, Button } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import tw from 'twrnc';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropdownKategori from '@/components/DropdownKategori';
import { Modal } from 'react-native';

// Import logo, pastikan file ada di assets/logo_ai.png
const logo = require('../../assets/images/logo_ai.png');

type IbadahItem = {
  id: string;
  ibadah: string;
  tanggal: string;
  kategori: string;
  isChecked?: boolean;
};

const Index = () => {
  const data = [
    { label: 'Wajib', value: 'Wajib' },
    { label: 'Sunnah', value: 'Sunnah' },
  ];

  const [isFocus, setIsFocus] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  
  const [show, setShow] = useState(false);
  const [ibadah, setIbadah] = useState('');
  const [tanggal, setTanggal] = useState<string>('');
  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [kategori, setKategori] = useState<string>('');
  const [list, setList] = useState<IbadahItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const tanggalRef = useRef<TextInput>(null);
  const ibadahRef = useRef<TextInput>(null);
  const kategoriRef = useRef<TextInput>(null);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  
  const handleChange = (event: any, selectedDate?: Date) => {
    setShow(false);
    if (event.type === 'set' && selectedDate) {
      setDateObj(selectedDate);
      const formatted = selectedDate.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      setTanggal(formatted);
    }
  };
  
  const addTask = () => {
    if (ibadah.trim() === '' || tanggal.trim() === '' || kategori === '') {
      Alert.alert('Alamak', 'Semua field harus diisi!');
      return;
    }
    
    if (ibadah.length < 3){
      Alert.alert('Alamak', 'Minimal 3 huruf field ibadahnya');
      return;
    }
    
    if (!tanggal.length){
      Alert.alert('Alamak', 'Minimal isi tanggalnya');
      return;
    }
    
    const newTask = {
      id: Date.now().toString(),
      ibadah: ibadah.trim(),
      tanggal: tanggal.trim(),
      kategori: kategori.trim(),
    };
    
    setList([...list, newTask]);
    resetForm();
    Alert.alert('Berhasil', 'Data berhasil ditambahkan!');
  };
  
  const saveTask = async () => {
    try {
      await AsyncStorage.setItem('data', JSON.stringify(list));
    } catch (error) {
      console.error('Gagal menyimpan data:', error);
    }
  };

  const loadTask = async () => {
    try {
      const saved = await AsyncStorage.getItem('data');
      if (saved) {
        setList(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Gagal memuat data:', error);
    }
  };

  const deleteTask = (id: string) => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menghapus data ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            const filtered = list.filter((item) => item.id !== id);
            setList(filtered);
            Alert.alert('Berhasil', 'Data berhasil dihapus!');
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    Alert.alert(
      'Konfirmasi',
      'Apakah kamu yakin ingin menyimpan perubahan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Simpan',
          onPress: () => {
            const updated = list.map((item) =>
              item.id === editId
                ? {
                    ...item,
                    ibadah: ibadah.trim(),
                    tanggal: tanggal.trim(),
                    kategori: kategori.trim(),
                  }
                : item
            );
            setList(updated);
            resetForm();
            Alert.alert('Berhasil', 'Perubahan berhasil disimpan!');
          },
        },
      ]
    );
  };

  const startEdit = (item: IbadahItem) => {
    setIbadah(item.ibadah);
    setTanggal(item.tanggal);
    setKategori(item.kategori);
    setIsEditing(true);
    setEditId(item.id);
    setModalVisible(true);
  };

  const resetForm = () => {
    setIbadah('');
    setTanggal('');
    setKategori('');
    setIsEditing(false);
    setEditId(null);
  };

  const toggleChecked = (id: string) => {
    const updatedList = list.map((item) =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    );
    setList(updatedList);
  };

  useEffect(() => {
    loadTask();
  }, []);

  useEffect(() => {
    saveTask();
  }, [list]);

  const isFormValid = ibadah.trim() !== '' && tanggal.trim() !== '' && kategori.trim() !== '';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.headerTitle}>Tracker Ibadah</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <AntDesign name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Total Ibadah Bulan Ini</Text>
        <Text style={styles.statsValue}>{list.length}</Text>
      </View>

      {/* List Ibadah */}
      <Text style={styles.sectionTitle}>Daftar Ibadah</Text>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => toggleChecked(item.id)}
            style={[
              styles.ibadahCard,
              item.kategori === 'Wajib' ? styles.cardWajib : styles.cardSunnah
            ]}
          >
            <Checkbox
              value={item.isChecked}
              color={item.isChecked ? "#4F46E5" : undefined}
            />
            <View style={styles.ibadahInfo}>
              <Text style={[
                styles.ibadahName,
                item.isChecked && { textDecorationLine: 'line-through', color: '#9CA3AF' }
              ]}>{item.ibadah}</Text>
              <Text style={styles.ibadahDate}>{item.tanggal}</Text>
              <Text style={[
                styles.ibadahCategory,
                { backgroundColor: item.kategori === 'Wajib' ? '#4F46E5' : '#F59E0B' }
              ]}>{item.kategori}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: '#F59E0B' }]}
                onPress={(e) => {
                  e.stopPropagation();
                  startEdit(item);
                }}
              >
                <Entypo name="edit" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: '#EF4444' }]}
                onPress={(e) => {
                  e.stopPropagation();
                  deleteTask(item.id);
                }}
              >
                <Entypo name="trash" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Modal Form */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#00000099', justifyContent: 'flex-end' }}>
          <View style={[styles.formContainer, { borderTopLeftRadius: 24, borderTopRightRadius: 24 }]}>
            <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>
              {isEditing ? 'Edit Ibadah' : 'Tambah Ibadah'}
            </Text>
            
            <TextInput
              value={ibadah}
              onChangeText={setIbadah}
              style={styles.input}
              placeholder="Nama Ibadah"
            />
            
            <TouchableOpacity
              onPress={() => setShow(true)}
              style={styles.dateButton}
            >
              <Text style={styles.dateButtonText}>
                {tanggal || 'Pilih Tanggal'}
              </Text>
            </TouchableOpacity>

            <View style={{ marginBottom: 12 }}>
              <DropdownKategori
                data={data}
                value={kategori}
                setValue={setKategori}
                isFocus={isFocus}
                setIsFocus={setIsFocus}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, !isFormValid && { opacity: 0.5 }]}
              onPress={isEditing ? handleEdit : addTask}
              disabled={!isFormValid}
            >
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Simpan Perubahan' : 'Tambah Ibadah'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: '#6B7280', marginTop: 8 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.submitButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {show && (
        <DateTimePicker
          value={dateObj || new Date()}
          mode="date"
          display="default"
          onChange={handleChange}
          locale="id-ID"
        />
      )}
    </SafeAreaView>
  );
};

export default Index;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F3E8',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#FF7F50',
    borderRadius: 12,
    padding: 8,
  },
  statsCard: {
    backgroundColor: '#FF7F50',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  submitButton: {
    backgroundColor: '#FF7F50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ibadahCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardWajib: {
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  cardSunnah: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  ibadahInfo: {
    flex: 1,
    marginLeft: 12,
  },
  ibadahName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  ibadahDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  ibadahCategory: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
});