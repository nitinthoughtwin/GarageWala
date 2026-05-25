import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View 
} from 'react-native';
import { Alert } from '../services/alert';
import { useApp } from '../store/AppContext';
import { ApiService } from '../services/api';
import { Header } from '../components/Header';
import { Button } from '../components/Button';

interface OtpVerificationScreenProps {
  navigate: (screen: any) => void;
}

export default function OtpVerificationScreen({ navigate }: OtpVerificationScreenProps) {
  const { activeOrder, assignedProvider, userAddress, setActiveOrder, setAssignedProvider } = useApp();

  const handleSimulateComplete = async () => {
    if (!activeOrder) return;
    
    Alert.alert(
      'Simulate Job Done?',
      'This simulates the provider typing in the correct OTP in their app. The backend will complete the order atomically.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate OTP Verify',
          onPress: async () => {
            try {
              // Trigger REST status complete call with bypass code
              await fetch(`http://localhost:5000/api/orders/${activeOrder.id}/complete`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp: activeOrder.otp })
              });
              
              navigate('rating');
            } catch (e) {
              console.warn('[SimulateComplete] Offline complete mock.');
              navigate('rating');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Mechanic Arrived!" />

      <View style={styles.content}>
        <View style={styles.arrivalCard}>
          <Text style={styles.arrivalBell}>🔔</Text>
          <Text style={styles.arrivalTitle}>Your Mechanic is Here!</Text>
          <Text style={styles.arrivalSub}>
            {assignedProvider?.name || 'Ramesh Puncture Wala'} has successfully arrived at {userAddress || 'Phoenix Marketcity, Kurla, Mumbai'}.
          </Text>
        </View>

        <View style={styles.otpGateCard}>
          <Text style={styles.otpInstruction}>
            Provide this completion OTP to the mechanic to verify the repair:
          </Text>
          
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{activeOrder?.otp || '4892'}</Text>
          </View>

          <Text style={styles.otpWarning}>
            ⚠️ Do NOT share this OTP until the repair is fully done to your satisfaction.
          </Text>
        </View>

        <Button
          title="Simulate Mechanic Verification Complete"
          variant="success"
          onPress={handleSimulateComplete}
          style={styles.simulateBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  arrivalCard: {
    alignItems: 'center',
    marginBottom: 32,
  },
  arrivalBell: {
    fontSize: 48,
  },
  arrivalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10b981',
    marginTop: 16,
    textAlign: 'center',
  },
  arrivalSub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  otpGateCard: {
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
  otpInstruction: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  codeContainer: {
    backgroundColor: '#0b0f19',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginBottom: 16,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#10b981',
    letterSpacing: 4,
  },
  otpWarning: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  simulateBtn: {
    width: '100%',
  },
});
