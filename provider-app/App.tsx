import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  Platform,
  Text,
  TouchableOpacity
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/store/AppContext';
import { SocketService } from './src/services/socket';

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import IncomingRequestScreen from './src/screens/IncomingRequestScreen';
import NavigationScreen from './src/screens/NavigationScreen';
import CompleteOrderScreen from './src/screens/CompleteOrderScreen';
import EarningsHistoryScreen from './src/screens/EarningsHistoryScreen';

type Step = 
  | 'login' 
  | 'home' 
  | 'incomingRequest' 
  | 'navigation' 
  | 'completeOrder' 
  | 'orderHistory';

function AppContent() {
  const { 
    token, 
    profile, 
    isOnline,
    incomingRequest,
    activeOrder,
    socket,
    setSocketInstance, 
    setIncomingRequest,
    setActiveOrder, 
    setOnlineStatus
  } = useApp();

  const [step, setStep] = useState<Step>('login');
  const [notification, setNotification] = useState<{ title: string; body: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Handle route navigation
  const navigate = (nextStep: Step) => {
    setStep(nextStep);
  };

  // Socket Connection logic
  useEffect(() => {
    if (!token || !profile) return;

    console.log('[App] Establishing socket gateway connection for provider:', profile.id);
    const newSocket = SocketService.connect(token);
    setSocketInstance(newSocket);

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to Socket.io backend server.');
      newSocket.emit('provider:join', { providerId: profile.id });
    });

    newSocket.on('order:new_request', (order: any) => {
      console.log('[Socket] New order request offered:', order);
      setIncomingRequest(order);
      setStep('incomingRequest');

      // Trigger Push Notification simulation banner
      setNotification({
        title: 'New Emergency Request Dispatched! 🚨',
        body: `Urgent ${order.serviceType} roadside assistance needed. Estimated Payout: ₹${Number(order.providerEarning || (order.totalPrice * 0.8)).toFixed(2)}`,
        type: 'warning',
      });
    });

    newSocket.on('order:completed', () => {
      console.log('[Socket] Order marked completed.');
      setStep('home');
      setIncomingRequest(null);
      setActiveOrder(null);

      setNotification({
        title: 'Emergency Service Resolved! 💸',
        body: 'OTP code verified successfully! Client assistance completed and payout has settled.',
        type: 'success',
      });
    });

    newSocket.on('order:cancelled', () => {
      console.log('[Socket] Order cancelled.');
      setStep('home');
      setIncomingRequest(null);
      setActiveOrder(null);

      setNotification({
        title: 'Emergency Request Cancelled 🛑',
        body: 'The active roadside booking has been cancelled by the customer.',
        type: 'warning',
      });
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server.');
    });

    return () => {
      console.log('[App] Cleaning up socket connection.');
      newSocket.disconnect();
      setSocketInstance(null);
    };
  }, [token, profile]);

  // Dev bypass offline simulations
  useEffect(() => {
    if (!isOnline || step !== 'home') return;

    // Check if we are offline or running in mock mode
    const isMockMode = !socket || (profile && profile.id.startsWith('mock-'));
    if (!isMockMode) return;

    console.log('[MockOffer] Provider online offline-mode. Scheduling simulated offer in 5s...');
    const timeout = setTimeout(() => {
      if (!incomingRequest && !activeOrder) {
        const mockO = {
          id: 'mock-order-' + Math.floor(Math.random() * 1000),
          userId: 'mock-user-1',
          userAddress: 'Phoenix Marketcity Mall Gate 2, Kurla, Mumbai',
          userLat: 19.0758,
          userLng: 72.8770,
          serviceType: 'PUNCTURE',
          vehicleType: 'CAR' as const,
          distanceKm: 2.8,
          totalPrice: 122.00,
          platformCommission: 24.40,
          providerEarning: 97.60,
          otp: Math.floor(1000 + Math.random() * 9000).toString(),
        };
        setIncomingRequest(mockO);
        setStep('incomingRequest');

        setNotification({
          title: 'Simulated Emergency Offer! 🚨',
          body: `Urgent ${mockO.serviceType} roadside assistance needed. Estimated Payout: ₹${mockO.providerEarning.toFixed(2)}`,
          type: 'warning',
        });
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isOnline, step, socket, profile, incomingRequest, activeOrder]);

  // Auto dismiss push notification simulator banner after 4.5s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Sync step with authentication state: if logged out, force reset to 'login'
  useEffect(() => {
    if (!token || !profile) {
      setStep('login');
    }
  }, [token, profile]);

  // Render current screen
  const renderScreen = () => {
    switch (step) {
      case 'login':
        return <LoginScreen navigate={navigate} />;
      case 'home':
        return <HomeScreen navigate={navigate} />;
      case 'incomingRequest':
        return <IncomingRequestScreen navigate={navigate} />;
      case 'navigation':
        return <NavigationScreen navigate={navigate} />;
      case 'completeOrder':
        return <CompleteOrderScreen navigate={navigate} />;
      case 'orderHistory':
        return <EarningsHistoryScreen navigate={navigate} />;
      default:
        return <LoginScreen navigate={navigate} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {renderScreen()}

      {/* Slide-Down Push Notification Simulator Banner */}
      {notification && (
        <TouchableOpacity 
          style={[
            styles.notifBanner, 
            notification.type === 'success' && styles.notifSuccess,
            notification.type === 'warning' && styles.notifWarning
          ]}
          onPress={() => setNotification(null)}
          activeOpacity={0.9}
        >
          <View style={styles.notifHeaderRow}>
            <Text style={styles.notifAppTag}>🔔 GARAGEWALA PARTNER ALERT</Text>
            <Text style={styles.notifTimeTag}>now</Text>
          </View>
          <Text style={styles.notifTitle}>{notification.title}</Text>
          <Text style={styles.notifBody}>{notification.body}</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f17',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    position: 'relative',
  },
  notifBanner: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 50,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(19, 26, 43, 0.98)',
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    zIndex: 99999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  notifSuccess: {
    borderColor: '#10b981',
  },
  notifWarning: {
    borderColor: '#ef4444',
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  notifAppTag: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  notifTimeTag: {
    color: '#64748b',
    fontSize: 9,
  },
  notifTitle: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  notifBody: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 15,
  },
});
