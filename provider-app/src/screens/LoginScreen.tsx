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
  const [phone, setPhone] = useState('8888888881');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Registration States
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [serviceBike, setServiceBike] = useState(true);
  const [serviceCar, setServiceCar] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['PUNCTURE']);

  const handleToggleBike = () => {
    const nextVal = !serviceBike;
    if (!nextVal && !serviceCar) {
      Alert.alert('Validation Error', 'You must select at least one vehicle service type.');
      return;
    }
    setServiceBike(nextVal);
    
    if (!nextVal) {
      // Clear bike-only skills: SPARK_PLUG, CHAIN
      const keepSkills = selectedSkills.filter(id => id !== 'SPARK_PLUG' && id !== 'CHAIN');
      setSelectedSkills(keepSkills);
    }
  };

  const handleToggleCar = () => {
    const nextVal = !serviceCar;
    if (!nextVal && !serviceBike) {
      Alert.alert('Validation Error', 'You must select at least one vehicle service type.');
      return;
    }
    setServiceCar(nextVal);
    
    if (!nextVal) {
      // Clear car-only skills: BATTERY, TOWING, COOLANT
      const keepSkills = selectedSkills.filter(id => id !== 'BATTERY' && id !== 'TOWING' && id !== 'COOLANT');
      setSelectedSkills(keepSkills);
    }
  };

  const getSkillsOptions = () => {
    const list: { id: string; label: string }[] = [];
    const addedIds = new Set<string>();

    const addSkill = (id: string, label: string) => {
      if (!addedIds.has(id)) {
        list.push({ id, label });
        addedIds.add(id);
      }
    };

    if (serviceBike) {
      addSkill('PUNCTURE', 'Tyre Puncture');
      addSkill('SPARK_PLUG', 'Spark Plug Repair');
      addSkill('CHAIN', 'Chain Repair');
      addSkill('FUEL', 'Emergency Fuel');
    }

    if (serviceCar) {
      addSkill('PUNCTURE', 'Tyre Puncture');
      addSkill('BATTERY', 'Battery Jumpstart');
      addSkill('TOWING', 'Flatbed Towing');
      addSkill('FUEL', 'Emergency Fuel');
      addSkill('COOLANT', 'Coolant / Oil Topup');
    }

    return list;
  };

  const handleToggleSkill = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const getRegistrationCoords = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise(async (resolve) => {
      const isLocInIndia = (lat: number, lng: number) => {
        return lat >= 5.0 && lat <= 38.0 && lng >= 65.0 && lng <= 100.0;
      };

      const fallback = { latitude: 19.0758, longitude: 72.8770 };

      const fetchIPFallback = async () => {
        try {
          const res = await fetch('https://ipapi.co/json/');
          if (res.ok) {
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
              const lat = data.latitude;
              const lng = data.longitude;
              return isLocInIndia(lat, lng) ? { latitude: lat, longitude: lng } : fallback;
            }
          }
        } catch (e) {}

        try {
          const res = await fetch('https://ipinfo.io/json');
          if (res.ok) {
            const data = await res.json();
            if (data && data.loc) {
              const [latStr, lngStr] = data.loc.split(',');
              const lat = parseFloat(latStr);
              const lng = parseFloat(lngStr);
              return isLocInIndia(lat, lng) ? { latitude: lat, longitude: lng } : fallback;
            }
          }
        } catch (e) {}
        return fallback;
      };

      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            resolve(isLocInIndia(lat, lng) ? { latitude: lat, longitude: lng } : fallback);
          },
          () => {
            navigator.geolocation.getCurrentPosition(
              (lowPos) => {
                const lat = lowPos.coords.latitude;
                const lng = lowPos.coords.longitude;
                resolve(isLocInIndia(lat, lng) ? { latitude: lat, longitude: lng } : fallback);
              },
              async () => {
                const ipCoords = await fetchIPFallback();
                resolve(ipCoords);
              },
              { enableHighAccuracy: false, timeout: 5000 }
            );
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        const ipCoords = await fetchIPFallback();
        resolve(ipCoords);
      }
    });
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Invalid Phone', 'Please provide a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      // Proactively ensure default provider Ramesh is pre-registered in PostgreSQL dev DB
      try {
        await ApiService.registerProvider({
          name: 'Ramesh Puncture Wala',
          phone,
          aadharNumber: '123456789012',
          vehicleType: 'BIKE',
          skills: ['PUNCTURE', 'SPARK_PLUG', 'CHAIN'],
          currentLat: 19.0760,
          currentLng: 72.8777,
        });
      } catch (regErr: any) {
        // Safe to ignore if already exists
        console.log('[Register] Provider registration status check complete.');
      }

      const result = await ApiService.sendOtp(phone);
      setOtpSent(true);
      setOtp(result.otp || '123456');
      Alert.alert(
        'Verification OTP Sent', 
        result.otp ? `[Development Bypass] OTP Code is ${result.otp}` : 'A verification OTP has been sent via SMS.'
      );
    } catch (error: any) {
      console.warn('[LoginSMS] Backend API unreachable. Logging in with offline mock profiles.');
      setOtpSent(true);
      setOtp('123456');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterProvider = async () => {
    if (!name || name.trim().length === 0) {
      Alert.alert('Validation Error', 'Please enter your name.');
      return;
    }
    if (!phone || phone.length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!aadhar || aadhar.length !== 12) {
      Alert.alert('Validation Error', 'Please enter a valid 12-digit Aadhar number.');
      return;
    }
    if (!serviceBike && !serviceCar) {
      Alert.alert('Validation Error', 'Please select at least one vehicle service type (BIKE or CAR).');
      return;
    }
    if (selectedSkills.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one skill badge.');
      return;
    }

    setLoading(true);
    try {
      console.log('[GPS] Acquiring high-accuracy geocoordinates for partner registration...');
      const coords = await getRegistrationCoords();
      console.log('[GPS] GPS Coordinates resolved:', coords.latitude, coords.longitude);

      const apiVehicleType = serviceCar ? 'TRUCK' : 'BIKE';

      await ApiService.registerProvider({
        name: name.trim(),
        phone,
        aadharNumber: aadhar,
        vehicleType: apiVehicleType,
        skills: selectedSkills,
        currentLat: coords.latitude,
        currentLng: coords.longitude,
      });

      console.log('[Register] Successfully created provider profile in DB. Sending OTP verification.');
      const result = await ApiService.sendOtp(phone);
      setOtpSent(true);
      setOtp(result.otp || '123456');
      
      Alert.alert(
        'Registration Successful!',
        `Your partner profile has been registered! ${result.otp ? `[Development Bypass] Verification OTP is ${result.otp}.` : 'An OTP has been dispatched to your mobile.'}`
      );
    } catch (error: any) {
      Alert.alert('Onboarding Failed', error.message || 'Could not register provider. Please verify your details.');
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
      const data = await ApiService.loginProvider(phone, otp);
      setUserData(data.provider, data.token);
      navigate('home');
    } catch (error: any) {
      // Local dev bypass fallback
      if (otp === '123456' || otp === '1234') {
        const mockMech = {
          id: 'mock-provider-id',
          name: name || 'Ramesh Puncture Wala',
          phone,
          walletBalance: 2480.00,
          totalOrders: 42,
          rating: 4.8,
          skills: selectedSkills.length > 0 ? selectedSkills : ['PUNCTURE', 'SPARK_PLUG', 'CHAIN'],
          vehicleType: serviceCar ? 'CAR' as any : 'BIKE' as any,
          isOnline: true,
        };
        setUserData(mockMech, 'mock-jwt-token');
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
          <Text style={styles.role}>MECHANIC PARTNER PORTAL</Text>
          <Text style={styles.tagline}>Get dispatched, navigate, repair vehicles, and grow your earnings.</Text>
        </View>

        {!otpSent ? (
          <View style={styles.card}>
            <View style={styles.tabRow}>
              <TouchableOpacity 
                style={[styles.tabButton, !isRegister && styles.activeTabButton]} 
                onPress={() => setIsRegister(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, !isRegister && styles.activeTabText]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, isRegister && styles.activeTabButton]} 
                onPress={() => setIsRegister(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isRegister && styles.activeTabText]}>Register Partner</Text>
              </TouchableOpacity>
            </View>

            {!isRegister ? (
              <View>
                <Input
                  label="Registered Mobile Number"
                  placeholder="Enter 10-digit mobile number"
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
              <View>
                <Input
                  label="Full Name"
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                />

                <Input
                  label="Mobile Number"
                  placeholder="Enter 10-digit mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />

                <Input
                  label="Aadhar Number"
                  placeholder="Enter 12-digit Aadhar number"
                  keyboardType="number-pad"
                  maxLength={12}
                  value={aadhar}
                  onChangeText={setAadhar}
                />

                <Text style={styles.skillsLabel}>Vehicle Service Capability</Text>
                <View style={styles.vehicleToggleRow}>
                  <TouchableOpacity
                    style={[styles.vehicleBtn, serviceBike && styles.vehicleBtnActive]}
                    onPress={handleToggleBike}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.vehicleBtnText, serviceBike && styles.vehicleBtnTextActive]}>🏍️ BIKE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.vehicleBtn, serviceCar && styles.vehicleBtnActive]}
                    onPress={handleToggleCar}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.vehicleBtnText, serviceCar && styles.vehicleBtnTextActive]}>🚗 CAR</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.skillsLabel}>Select Your Skills / Services</Text>
                <View style={styles.skillsSelectRow}>
                  {getSkillsOptions().map((skill) => {
                    const active = selectedSkills.includes(skill.id);
                    return (
                      <TouchableOpacity
                        key={skill.id}
                        style={[styles.skillSelectBadge, active && styles.skillSelectBadgeActive]}
                        onPress={() => handleToggleSkill(skill.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.skillSelectText, active && styles.skillSelectTextActive]}>{skill.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Button
                  title="Register & Onboard Partner"
                  loading={loading}
                  onPress={handleRegisterProvider}
                  style={styles.submitBtn}
                />
              </View>
            )}
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
    backgroundColor: '#0b0f17',
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
    color: '#10b981',
    letterSpacing: -1,
  },
  role: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 2,
    marginTop: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagline: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
    paddingHorizontal: 15,
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
    color: '#10b981',
    fontSize: 13,
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#131a2b',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#10b981',
  },
  tabText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
  activeTabText: {
    color: 'white',
  },
  vehicleToggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  vehicleBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#131a2b',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleBtnActive: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  vehicleBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
  vehicleBtnTextActive: {
    color: '#10b981',
  },
  skillsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  skillsSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  skillSelectBadge: {
    backgroundColor: '#131a2b',
    borderWidth: 1.5,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  skillSelectBadgeActive: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  skillSelectText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  skillSelectTextActive: {
    color: '#10b981',
  },
});

