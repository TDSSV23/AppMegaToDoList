import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showSetCredentials, setShowSetCredentials] = useState(true);

  const handleLogin = () => {
    if (username === newUsername && password === newPassword) {
      navigation.navigate('Lista');
    } else {
      Alert.alert('Erro', 'Nome de usuário ou senha inválidos');
    }
  };

  const handleSetCredentials = () => {
    setUsername(newUsername);
    setPassword(newPassword);
    setShowSetCredentials(false);
    Alert.alert('Sucesso', 'Nome de usuário e senha definidos com sucesso');
  };

  const handleGoToSetCredentials = () => {
    setShowSetCredentials(true);
  };

  return (
    <LinearGradient colors={['black', 'blue']} style={styles.container}>
      {showSetCredentials ? (
        <>
          <TextInput
            style={styles.input}
            onChangeText={setNewUsername}
            value={newUsername}
            placeholder="Novo Username"
            placeholderTextColor="white"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            onChangeText={setNewPassword}
            value={newPassword}
            placeholder="Nova Password"
            placeholderTextColor="white"
            secureTextEntry={true}
          />
          <TouchableOpacity style={styles.button} onPress={handleSetCredentials}>
            <Text style={styles.buttonText}>Definir Nome e Senha</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            onChangeText={setUsername}
            value={username}
            placeholder="Username"
            placeholderTextColor="white"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            placeholder="Password"
            placeholderTextColor="white"
            secureTextEntry={true}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGoToSetCredentials}>
            <Text style={styles.goBackText}>Voltar para definir novo nome e senha</Text>
          </TouchableOpacity>
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 20,
    paddingHorizontal: 10,
    color: 'white',
  },
  button: {
    backgroundColor: 'blue',
    width: '80%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goBackText: {
    color: 'white',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
});
