import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '@/lib/supabase';

export default function RegistrationScreen() {
  const [name, setName] = useState('');
  const [cnic, setCnic] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [age, setAge] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!cnic.match(/^\d{5}-\d{7}-\d{1}$/))
      newErrors.cnic = 'CNIC must be in format 12345-1234567-1';
    if (!bloodGroup.match(/^(A|B|AB|O)[+-]$/))
      newErrors.bloodGroup = 'Blood group must be A+, A-, B+, B-, AB+, AB-, O+, or O-';
    if (!age || isNaN(age) || age < 18 || age > 100)
      newErrors.age = 'Age must be a number between 18 and 100';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleRegistration() {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Get current user session
      const session = await supabase.auth.session();
      if (!session || !session.user) {
        Alert.alert('Error', 'You must be logged in to register.');
        router.push('/signin');
        return;
      }

      // Insert data into registrations table
      const { data, error } = await supabase.from('registrations').insert([
        {
          user_id: session.user.id,
          name: name.trim(),
          cnic: cnic.trim(),
          blood_group: bloodGroup.trim(),
          age: parseInt(age),
          medical_history: medicalHistory.trim() || null,
        },
      ]);

      if (error) {
        Alert.alert('Registration Error', error.message);
        return;
      }

      // Navigate to MetaMask screen on success
      router.push('/(tabs)');
    } catch (e) {
      console.error('Unexpected error:', e);
      Alert.alert('Unexpected Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <Image
          source={require('../../assets/images/Blood Donation Logo.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.caption}>Complete Your Registration</Text>

        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="Enter your Name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <TextInput
          style={[styles.input, errors.cnic && styles.inputError]}
          placeholder="Enter your CNIC (12345-1234567-1)"
          placeholderTextColor="#999"
          value={cnic}
          onChangeText={setCnic}
          
        />
        {errors.cnic && <Text style={styles.errorText}>{errors.cnic}</Text>}

        <TextInput
          style={[styles.input, errors.bloodGroup && styles.inputError]}
          placeholder="Enter your Blood Group (e.g., A+)"
          placeholderTextColor="#999"
          value={bloodGroup}
          onChangeText={setBloodGroup}
        />
        {errors.bloodGroup && <Text style={styles.errorText}>{errors.bloodGroup}</Text>}

        <TextInput
          style={[styles.input, errors.age && styles.inputError]}
          placeholder="Enter your Age"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />
        {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Enter Your Medical History (Optional)"
          placeholderTextColor="#999"
          value={medicalHistory}
          onChangeText={setMedicalHistory}
        />

        <TouchableOpacity
          style={[styles.button, { marginTop: 10 }, loading && { opacity: 0.7 }]}
          onPress={handleRegistration}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Registering...' : 'Continue to BloodLink'}
          </Text>
        </TouchableOpacity>

        <Pressable onPress={() => router.push('/Auth')}>
          <Text style={styles.loginText}>
            Wanna Go back? <Text style={styles.loginLink}>click here</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B71C1C',
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 10,
  },
  caption: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 10,
    fontSize: 14,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#B71C1C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginText: {
    color: '#fff',
    marginTop: 25,
    fontSize: 14,
  },
  loginLink: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});