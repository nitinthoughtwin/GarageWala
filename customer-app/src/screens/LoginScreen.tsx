import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Alert } from '../services/alert';
import { useApp } from '../store/AppContext';
import { ApiService } from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

interface LoginScreenProps {
  navigate: (screen: any) => void;
}

export default function LoginScreen({ navigate }: LoginScreenProps) {
  const { setUserData } = useApp();
  const [name, setName] = useState('Rohan Sharma');
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Invalid Phone', 'Please provide a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const result = await ApiService.sendOtp(phone);
      setOtpSent(true);
      setOtp(result.otp || '123456');
      Alert.alert(
        'OTP Sent Successfully', 
        result.otp ? `[Development Bypass] OTP Code is ${result.otp}` : 'A verification OTP has been sent via SMS.'
      );
    } catch (error: any) {
      Alert.alert('Connection Offline', 'Backend API is unreachable. Logging in with simulated mock profiles.');
      setOtpSent(true);
      setOtp('123456');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Verification Failed', 'Verification code must be at least 4 digits.');
      return;
    }

    setLoading(true);
    try {
      const data = await ApiService.verifyOtp(phone, otp, name);
      setUserData(data.user, data.token);
      navigate('home');
    } catch (error: any) {
      // Local dev bypass fallback
      if (otp === '123456' || otp === '1234') {
        const mockUser = {
          id: 'mock-user-id',
          name,
          phone,
          profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        };
        setUserData(mockUser, 'mock-jwt-token');
        navigate('home');
      } else {
        Alert.alert('Incorrect Code', error.message || 'OTP verification failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>RoadAssist</Text>
          <Text style={styles.tagline}>Emergency roadside help. At your exact location, in 30 minutes.</Text>
        </View>

        {!otpSent ? (
          <View style={styles.card}>
            <Input
              label="Full Name"
              placeholder="e.g. Rohan Sharma"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Mobile Number"
              placeholder="e.g. 9876543210"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />

            <Button
              title="Get OTP Verification"
              loading={loading}
              onPress={handleSendOtp}
              style={styles.submitBtn}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.otpLabel}>Verification Code Sent</Text>
            <Text style={styles.otpSublabel}>Enter the verification code sent to +91 {phone}</Text>

            <Input
              label="SMS OTP Code"
              placeholder="Enter 6-digit OTP (e.g. 123456)"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
            />

            <Button
              title="Verify & Login"
              loading={loading}
              variant="success"
              onPress={handleVerifyOtp}
              style={styles.submitBtn}
            />

            <TouchableOpacity style={styles.resendBtn} onPress={() => setOtpSent(false)}>
              <Text style={styles.resendText}>Change Mobile Number</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brand: {
    fontSize: 36,
    fontWeight: '900',
    color: '#3b82f6',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(19, 26, 43, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  submitBtn: {
    marginTop: 12,
  },
  otpLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
  },
  otpSublabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: '600',
  },
});
