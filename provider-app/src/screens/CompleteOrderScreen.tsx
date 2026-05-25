import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput 
} from 'react-native';
import { Alert } from '../services/alert';
import { useApp } from '../store/AppContext';
import { ApiService } from '../services/api';
import { Header } from '../components/Header';
import { Button } from '../components/Button';

interface CompleteOrderScreenProps {
  navigate: (screen: any) => void;
}

export default function CompleteOrderScreen({ navigate }: CompleteOrderScreenProps) {
  const { activeOrder, token, profile, updateWalletStats, setActiveOrder } = useApp();
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCompleteOrder = async () => {
    if (!activeOrder) return;
    if (otpInput.length < 4) {
      Alert.alert('Incomplete OTP', 'Verification code must be 4 digits.');
      return;
    }

    setLoading(true);
    try {
      if (token && !activeOrder.id.startsWith('mock-') && profile) {
        // 1. Submit verified OTP settlement request to backend database
        await ApiService.completeOrder(token, activeOrder.id, otpInput);
        
        // 2. Fetch updated wallet earnings statistics
        try {
          const stats = await ApiService.fetchEarningsMetrics(token, profile.id);
          updateWalletStats(Number(stats.walletBalance), stats.totalOrders);
        } catch (err) {
          console.warn('[CompleteSyncStats] Failed to reload latest wallet numbers.');
        }
        
        Alert.alert('Service Settle Complete', 'Atomic order completed! Funds successfully credited to your wallet.');
        setActiveOrder(null);
        navigate('home');
      } else {
        // 2. Simulated local bypass offline logic
        if (otpInput === activeOrder.otp || otpInput === '1234') {
          Alert.alert('Service Settle Complete', '[Mock Bypass] Atomic order completed! Mock funds credited to your wallet.');
          
          // Increment mock wallet balance in global state
          if (profile) {
            const currentBal = Number(profile.walletBalance) + Number(activeOrder.providerEarning || (activeOrder.totalPrice * 0.8));
            const currentCount = Number(profile.totalOrders) + 1;
            updateWalletStats(currentBal, currentCount);
          }
          
          setActiveOrder(null);
          navigate('home');
        } else {
          Alert.alert('Incorrect OTP', 'Verification code is invalid.');
        }
      }
    } catch (error: any) {
      Alert.alert('Verification Error', error.message || 'Verification rejected.');
    } finally {
      setLoading(false);
      setOtpInput('');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Settle Repair Payment" />

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Customer Repair Complete!</Text>
          <Text style={styles.subtitle}>
            Please request the 4-digit completion code from the customer to verify the service and authorize payout settlements.
          </Text>
        </View>

        <View style={styles.otpWrapper}>
          <Text style={styles.otpLabel}>ENTER CUSTOMER COMPLETION OTP</Text>
          
          <TextInput
            placeholder="e.g. 7891"
            placeholderTextColor="#475569"
            keyboardType="number-pad"
            maxLength={4}
            value={otpInput}
            onChangeText={setOtpInput}
            secureTextEntry={false}
            style={styles.otpInput}
          />
          
          <Text style={styles.warningText}>
            ⚠️ Verify that the customer has approved the repair quality before verifying the OTP.
          </Text>
        </View>

        <Button
          title="Verify OTP & Settle Funds"
          loading={loading}
          variant="primary"
          onPress={handleCompleteOrder}
          style={styles.verifyBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f17',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10b981',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  otpWrapper: {
    backgroundColor: '#131a2b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  otpLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  otpInput: {
    width: '100%',
    backgroundColor: '#0b0f17',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 14,
    fontSize: 26,
    color: 'white',
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 11,
    color: '#ef4444',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16,
  },
  verifyBtn: {
    width: '100%',
  },
});
