import React, { useState, useEffect } from 'react';
import { Image, TextInput, StyleSheet, Text, View, TouchableOpacity, Modal, FlatList, Button, Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker'; 
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Sensors from 'expo-sensors';
import * as WebBrowser from 'expo-web-browser';
import { Audio } from 'expo-av';

export default function App() {
  const navigation = useNavigation();
  const [contacts, setContacts] = useState([]);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactDesc, setContactDesc] = useState('');
  const [editingContactId, setEditingContactId] = useState(null);
  const [editingContactName, setEditingContactName] = useState('');
  const [editingContactEmail, setEditingContactEmail] = useState('');
  const [editingContactDesc, setEditingContactDesc] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [selectedTaskDesc, setSelectedTaskDesc] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [image, setImage] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [result, setResult] = useState(null);
  const [sound, setSound] = useState();

  async function playSound() {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(require('./assets/not.mp3'));
    setSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  }

  useEffect(() => {
    playSound(); // Chama a função para tocar o som ao abrir o app
  }, []); // Usando um array de dependências vazio para garantir que só toque uma vez


  const _handlePressButtonAsync = async () => {
    let result = await WebBrowser.openBrowserAsync('https://www.figma.com/file/r2Y2QCWHwlTC18KG2fzDyk/Lista-de-Tarefas?type=design&node-id=0%3A1&mode=design&t=upYANw7mYMh7NVES-1');
    setResult(result);
  };
  const _handlePressButtonAsyncD = async () => {
    let result = await WebBrowser.openBrowserAsync('https://marcellavizona.github.io/App_mega_ToDo_list/');
    setResult(result);
  };

  // Função para abrir o modal de edição com os detalhes do contato
  const handleOpenEditModal = (contact) => {
    setEditingContactId(contact.id);
    setEditingContactName(contact.name);
    setEditingContactEmail(contact.email);
    setEditingContactDesc(contact.desc);
    setShowDatePicker(true); // Adicionando a seleção de data ao abrir o modal
    setShowTimePicker(true); // Adicionando a seleção de horário ao abrir o modal
    setSelectedDate(contact.date || new Date()); // Definindo a data selecionada ou a data atual
    setSelectedTime(contact.time || new Date()); // Definindo o horário selecionado ou o horário atual
    setSelectedCategory(contact.category); // Definindo a categoria selecionada
    setModalVisible(true);
  };

  // Função para marcar/desmarcar uma tarefa como concluída
  const handleToggleTask = (id) => {
    const updatedContacts = contacts.map((contact) =>
      contact.id === id
        ? {
            ...contact,
            completed: !contact.completed,
          }
        : contact
    );

    setContacts(updatedContacts);
  };

  // Função para excluir um contato da lista
  const handleDeleteContact = (id) => {
    const updatedContacts = contacts.filter((contact) => contact.id !== id);
    setContacts(updatedContacts);
  };

  // Função para lidar com a edição de um contato
  const handleEditContact = () => {
    if (editingContactName.trim() === '') {
      return;
    }

    const updatedContacts = contacts.map((contact) =>
      contact.id === editingContactId
        ? {
            ...contact,
            name: editingContactName,
            email: editingContactEmail,
            desc: editingContactDesc, // Atualiza a descrição da tarefa
            date: selectedDate,
            time: selectedTime,
            category: selectedCategory,
          }
        : contact
    );

    setContacts(updatedContacts);
    setEditingContactId(null);
    setEditingContactName('');
    setEditingContactEmail('');
    setEditingContactDesc(''); // Limpa o estado de edição após a edição
    setSelectedCategory(null);
    setSelectedTime(new Date());
    setModalVisible(false);
  };

  const sortContacts = () => {
    setContacts(
      contacts.sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  useEffect(() => {
    // Define o manipulador para lidar com as notificações recebidas
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    sortContacts();
  }, []);

  // Função para enviar notificação push
  const sendPushNotification = async () => {
    const message = {
      to: '<expo-push-token>', // Substitua '<expo-push-token>' pelo token do destinatário
      sound: 'default',
      title: 'Nova Tarefa:',
      body: contactName,
      data: { data: 'goes here' },
    };

    await Notifications.scheduleNotificationAsync({
      content: message,
      trigger: null,
    });
  };
  // Function to handle Accelerometer data
  const handleAccelerometerData = ({ x, y, z }) => {
    const accelerationThreshold = 5; // Adjust this value based on your requirement

    if (Math.abs(x) > accelerationThreshold || Math.abs(y) > accelerationThreshold || Math.abs(z) > accelerationThreshold) {
      Alert.alert(
        'Adicionar Tarefa',
        'Você quer adicionar uma nova Tarefa?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'OK', onPress: () => setModalVisible(true) },
        ],
        { cancelable: false }
      );
    }
  };

  // Function to subscribe to Accelerometer data
  const _subscribe = () => {
    setSubscription(Sensors.Accelerometer.addListener(handleAccelerometerData));
  };

  // Function to unsubscribe from Accelerometer data
  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);


  const handleAddContact = async () => {
    if (contactName.trim() === '' || selectedCategory === null) {
      return;
    }

    const newContact = {
      id: Date.now(),
      name: contactName,
      email: contactEmail,
      desc: contactDesc,
      completed: false,
      date: selectedDate,
      time: selectedTime,
      category: selectedCategory,
    };

    setContacts([newContact, ...contacts].sort((a, b) => a.name.localeCompare(b.name)));
    setContactName('');
    setContactEmail('');
    setContactDesc('');
    setModalVisible(false);
    setSelectedDate(null);
    setSelectedCategory(null);
    setSelectedTime(new Date());

    // Envia notificação push ao adicionar uma mensagem
    await sendPushNotification();
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    setSelectedDate(currentDate);
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || selectedTime;
    setShowTimePicker(false);
    setSelectedTime(currentTime);
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <LinearGradient colors={['#0000FF', '#000000']} style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar..."
        placeholderTextColor="gray"
        onChangeText={text => setSearchText(text)}
        value={searchText}
      />
      
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Todas as Listas</Text>
      </View>
      <FlatList
        data={filteredContacts.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return a.date - b.date;
        })}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedTaskDesc(item.desc);
              setShowDescription(!showDescription);
            }}
          >
            <View style={[styles.contactContainer, item.completed && { backgroundColor: 'lightgreen' }]}>
              <Text style={styles.contactName}>{item.name}</Text>
              <View style={styles.ordem}>
                <Text style={styles.dateText}>
                  {item.date ? ` ${item.date.toLocaleDateString()}` : 'Nenhuma data selecionada'}
                  {item.time ? ` ${item.time.toLocaleTimeString()}` : ''}
                </Text>
                <Text style={styles.categoryText}>
                  {item.category ? ` ${item.category}` : 'Nenhuma categoria selecionada'}
                </Text>
              </View>
              {!item.completed && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleOpenEditModal(item)}
                >
                  <Text style={styles.editButtonText}>✎</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.concluirButton}
                onPress={() => handleToggleTask(item.id)}
              >
                <Text style={styles.deleteButtonText}>✔️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteContact(item.id)}
              >
                <Text style={styles.deleteButtonText}>🗑</Text>
              </TouchableOpacity>
              <Button title="📷" onPress={pickImage} />
            </View>
          </TouchableOpacity>
        )}
        style={styles.list}
      />

      {showDescription && (
        <Modal visible={showDescription} animationType="slide">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Descrição da Tarefa</Text>
            <Text style={styles.descriptionText}>{selectedTaskDesc}</Text>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
            </View>
            {selectedImageUri && (
              <Image source={{ uri: selectedImageUri }} style={styles.selectedImage} />
            )}
            <Button title="Fechar" onPress={() => setShowDescription(false)} />
          </View>
        </Modal>
      )}
      
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingContactId ? 'Editar Tarefa' : 'Adicionar Tarefa'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={editingContactName || contactName}
            onChangeText={
              editingContactName ? setEditingContactName : setContactName
            }
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={editingContactEmail || contactEmail}
            onChangeText={
              editingContactEmail
                ? setEditingContactEmail
                : setContactEmail
            }
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Descrição"
            value={editingContactDesc || contactDesc}
            onChangeText={
              editingContactDesc
                ? setEditingContactDesc
                : setContactDesc
            }
          />
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Selecionar Data</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Selecionar Horário</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onChangeDate}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              testID="timePicker"
              value={selectedTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onChangeTime}
            />
          )}
          <TouchableOpacity onPress={() => setShowCategoryModal(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Selecionar Categoria</Text>
          </TouchableOpacity>
          <View style={styles.buttonContainer}>
            {editingContactId && (
              <Button title="Salvar" onPress={handleEditContact} color="#00ff00"/>
            )}
            {!editingContactId && (
              <Button title="Adicionar" onPress={handleAddContact} color="#08a608"/>
            )}
            <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#d40816" />
          </View>
        </View>
      </Modal>
      
      <Modal visible={showCategoryModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selecione a Categoria</Text>
          <TouchableOpacity onPress={() => {setSelectedCategory('Pessoal'); setShowCategoryModal(false)}} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Pessoal</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {setSelectedCategory('Tarefas'); setShowCategoryModal(false)}} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Tarefas</Text>
          </TouchableOpacity>
          <Button title="Cancelar" onPress={() => setShowCategoryModal(false)} />
        </View>
      </Modal>
      
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#000000',
        paddingTop: 10,
      }}>
       
       <View style={{
  flexDirection: 'row',
  justifyContent: 'space-around',
  backgroundColor: '#000000',
  paddingTop: 10,
}}>

 

  {/* Novos botões adicionados */}
  <View style={{
  flexDirection: 'row',
  justifyContent: 'space-between',
  backgroundColor: '#000000',
  paddingTop: 10,
}}>
  <TouchableOpacity style={styles.bottomButtonContainerB} onPress={_handlePressButtonAsync}>
    <Text style={styles.buttonText}>Figma</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.bottomButtonContainer} onPress={() => setModalVisible(true)}>
    <Text style={styles.addButtonText}>+</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.bottomButtonContainerB} onPress={_handlePressButtonAsyncD}>
    <Text style={styles.buttonText}>Desc</Text>
  </TouchableOpacity>
</View>

</View>
        
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  headerContainer: {
    marginBottom: 20,
    marginLeft: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    color: 'rgb(255, 255, 255)',
    paddingTop: 20,
  },
  editButton: {
    backgroundColor: 'rgb(0, 255, 0,)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  imageButton: {
    backgroundColor: 'rgb(0, 0, 255)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  contactContainer: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    backgroundColor: '#A09D9E',
    marginLeft: 9,
    marginRight: 9,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  deleteButton: {
    backgroundColor: 'rgb(255, 0,0)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  concluirButton: {
    backgroundColor: 'rgb(0, 255, 0,)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  list: {
    flex: 1,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1,
  },
  bottomButtonContainerB: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    zIndex: 1,
  },
  addButton: {
    backgroundColor: 'rgb(25, 122, 207)',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#000000',
    fontSize: 32,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'black',
    marginLeft: 20,
    marginRight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgb(0, 0, 0)',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'rgb(255, 255, 255)',
  },
  input: {
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  dateButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgb(116, 120, 116)',
  },
  categoryText: {
    fontSize: 14,
    color: 'rgb(116, 120, 116)',
  },
  descriptionText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 20,
  },
  ordem: {
    flexDirection: 'column',
  },
  selectedImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    paddingHorizontal: 20,
  },
  bottomButtonContainer: {
    backgroundColor: 'rgb(25, 122, 207)',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 50,
  },
  bottomButtonContainerB: {
    backgroundColor: 'rgb(25, 122, 207)',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 50,
    marginRight: 30,
    marginLeft: 30,
  },
  
  
});