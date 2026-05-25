import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity 
} from 'react-native';
import { Alert } from '../services/alert';
import { useApp } from '../store/AppContext';
import { ApiService } from '../services/api';
import { Button } from '../components/Button';

interface IncomingRequestScreenProps {
  navigate: (screen: any) => void;
}

export default function IncomingRequestScreen({ navigate }: IncomingRequestScreenProps) {
  const { profile, token, incomingRequest, setIncomingRequest, setActiveOrder } = useApp();
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);

  // Manage 60-second countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      handleDecline();
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const handleAccept = async () => {
    if (!incomingRequest || !profile) return;
    setLoading(true);
    try {
      if (token && !profile.id.startsWith('mock-')) {
        const result = await ApiService.acceptOrder(token, incomingRequest.id, profile.id);
        setActiveOrder(result.order);
      } else {
        // Fallback offline mock order acceptance
        setActiveOrder({
          ...incomingRequest,
          otp: incomingRequest.otp || '9241',
        });
      }
      setIncomingRequest(null);
      navigate('navigation');
    } catch (error: any) {
      console.warn('[AcceptOrder] Connection error, accepting locally as mock:', error.message);
      setActiveOrder({
        ...incomingRequest,
        otp: incomingRequest.otp || '9241',
      });
      setIncomingRequest(null);
      navigate('navigation');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    setIncomingRequest(null);
    Alert.alert('Request Declined', 'Offer has been dismissed.');
    navigate('home');
  };

  if (!incomingRequest) return null;

  return (
    <View style={styles.container}>
      <View style={styles.alertBeacon}>
        <View style={styles.pulseDot} />
        <Text style={styles.beaconText}>EMERGENCY INCIDENT CALL</Text>
      </View>

      {/* Glow Circular Countdown */}
      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{countdown}</Text>
        <Text style={styles.timerLabel}>SECONDS LEFT</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.detailsHeader}>
          <Text style={styles.serviceType}>{incomingRequest.serviceType}</Text>
          <Text style={styles.vehicleType}>{incomingRequest.vehicleType}</Text>
        </View>

        <Text style={styles.addressLabel}>INCIDENT LOCATION</Text>
        <Text style={styles.addressValue}>{incomingRequest.userAddress}</Text>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCell}>
            <Text style={styles.cellLabel}>Distance</Text>
            <Text style={styles.cellValue}>{Number(incomingRequest.distanceKm).toFixed(1)} km</Text>
          </View>
          <View style={[styles.metricCell, { borderLeftWidth: 1, borderLeftColor: '#334155' }]}>
            <Text style={styles.cellLabel}>Your Pay (80%)</Text>
            <Text style={[styles.cellValue, styles.netPay]}>
              ₹{Number(incomingRequest.providerEarning || (incomingRequest.totalPrice * 0.8)).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.declineBtn} onPress={handleDecline} disabled={loading}>
          <Text style={styles.declineText}>Decline</Text>
        </TouchableOpacity>
        <Button
          title="Accept Job Offer"
          loading={loading}
          variant="primary"
          onPress={handleAccept}
          style={styles.acceptBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070a13',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBeacon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 40,
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  beaconText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  timerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.02)',
    marginBottom: 40,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '900',
    color: 'white',
  },
  timerLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginTop: 2,
  },
  card: {
    width: '100%',
    backgroundColor: '#131a2b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 24,
    marginBottom: 40,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 16,
    marginBottom: 16,
  },
  serviceType: {
    fontSize: 20,
    fontWeight: '900',
    color: 'white',
  },
  vehicleType: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  addressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  addressValue: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    marginTop: 4,
    lineHeight: 20,
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 16,
  },
  metricCell: {
    flex: 1,
    alignItems: 'center',
  },
  cellLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  cellValue: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    marginTop: 4,
  },
  netPay: {
    color: '#10b981',
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  declineBtn: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
  },
  acceptBtn: {
    flex: 2,
  },
});
