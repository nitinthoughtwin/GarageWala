import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator, 
  SafeAreaView, 
  Platform,
  TouchableOpacity
} from 'react-native';
import { Alert } from './src/services/alert';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/store/AppContext';
import { SocketService } from './src/services/socket';

// Import modular Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ServiceSelectionScreen from './src/screens/ServiceSelectionScreen';
import MapPinScreen from './src/screens/MapPinScreen';
import PricePreviewScreen from './src/screens/PricePreviewScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import OtpVerificationScreen from './src/screens/OtpVerificationScreen';
import RatingScreen from './src/screens/RatingScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';

type Step = 
  | 'login' 
  | 'home' 
  | 'serviceSelection' 
  | 'mapPin' 
  | 'pricePreview' 
  | 'searching' 
  | 'tracking' 
  | 'completed' 
  | 'rating' 
  | 'orderHistory';

function AppContent() {
  const { 
    token, 
    user, 
    activeOrder, 
    assignedProvider,
    setSocketInstance, 
    setActiveOrder, 
    setAssignedProvider 
  } = useApp();

  const [step, setStep] = useState<Step>('login');
  const [notification, setNotification] = useState<{ title: string; body: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Handle route navigation
  const navigate = (nextStep: Step) => {
    setStep(nextStep);
  };

  // Socket Connection logic
  useEffect(() => {
    if (!token || !user) return;

    console.log('[App] Establishing socket gateway connection for user:', user.id);
    const newSocket = SocketService.connect(token);
    setSocketInstance(newSocket);

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to Socket.io backend server.');
      newSocket.emit('user:join', { userId: user.id });
    });

    newSocket.on('order:accepted', (data: any) => {
      console.log('[Socket] Order accepted event:', data);
      setAssignedProvider(data.provider);
      if (data.order) {
        setActiveOrder(data.order);
      }
      setStep('tracking');

      // Trigger Push Notification banner simulation
      setNotification({
        title: 'Emergency Match Dispatched! 🏍️',
        body: `${data.provider.name} accepted your request & is heading to your exact spot.`,
        type: 'success',
      });
    });

    newSocket.on('order:status_update', (data: any) => {
      console.log('[Socket] Order status updated:', data);
      if (data.status === 'ARRIVED') {
        setStep('completed');
        setNotification({
          title: 'Mechanic Arrived! 🟢',
          body: 'Your service partner has arrived at your exact location. Provide the OTP.',
          type: 'success',
        });
      } else if (data.status === 'COMPLETED') {
        setStep('rating');
        setNotification({
          title: 'Emergency Service Resolved! 🏁',
          body: 'Order successfully completed. Please rate your assistance partner.',
          type: 'success',
        });
      } else if (data.status === 'PROVIDER_ON_WAY') {
        setNotification({
          title: 'Mechanic On The Way! ⚡',
          body: 'Your roadside mechanic is currently en-route. Track their location live.',
          type: 'info',
        });
      }
    });

    newSocket.on('order:provider_location', (coords: any) => {
      console.log('[Socket] Provider location ping:', coords);
      setAssignedProvider((prev: any) => 
        prev ? { ...prev, currentLat: coords.lat, currentLng: coords.lng } : null
      );
    });

    newSocket.on('order:completed', () => {
      console.log('[Socket] Order marked completed.');
      setStep('rating');
    });

    newSocket.on('order:cancelled', (data: any) => {
      console.log('[Socket] Order cancelled:', data);
      Alert.alert('Booking Cancelled', data.reason || 'Your booking request was cancelled.');
      setActiveOrder(null);
      setAssignedProvider(null);
      setStep('home');

      setNotification({
        title: 'Booking Cancelled! 🛑',
        body: data.reason || 'Your roadside request was cancelled or could not find mechanics.',
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
  }, [token, user]);

  // Dev bypass offline simulations
  useEffect(() => {
    if (step !== 'searching') return;

    // Simulate match offline after 4.5s if socket connection is slow or missing
    const timeout = setTimeout(() => {
      if (!assignedProvider) {
        console.log('[SimulateMatch] Offline bypass matched provider.');
        const mockP = {
          id: 'mock-provider-1',
          name: 'Ramesh Puncture Wala',
          phone: '9876543222',
          rating: '4.8',
          profilePhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
          currentLat: 19.0758,
          currentLng: 72.8770,
        };
        setAssignedProvider(mockP);

        if (activeOrder) {
          setActiveOrder({
            ...activeOrder,
            status: 'ACCEPTED',
          });
        }
        setStep('tracking');
        
        setNotification({
          title: 'Simulated Emergency Match! 🏍️',
          body: `${mockP.name} accepted your request & is heading to your exact spot.`,
          type: 'success',
        });
      }
    }, 4500);

    return () => clearTimeout(timeout);
  }, [step, activeOrder, assignedProvider]);

  useEffect(() => {
    if (step !== 'tracking') return;

    // Simulate provider arriving after 8s for interactive offline demo
    const timeout = setTimeout(() => {
      if (activeOrder && activeOrder.id.startsWith('mock-')) {
        console.log('[SimulateArrival] Offline bypass provider arrived.');
        setStep('completed');
        setNotification({
          title: 'Simulated Mechanic Arrived! 🟢',
          body: 'Your service partner has arrived at your exact location. Provide the OTP.',
          type: 'success',
        });
      }
    }, 8000);

    return () => clearTimeout(timeout);
  }, [step, activeOrder]);

  // Auto dismiss push notification simulator banner after 4.5s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Sync step with authentication state: if user is logged out, force reset to 'login'
  useEffect(() => {
    if (!token || !user) {
      setStep('login');
    }
  }, [token, user]);

  // Pulse message simulation state
  const [searchStatus, setSearchStatus] = useState('Broadcasting emergency signal...');
  useEffect(() => {
    if (step !== 'searching') return;
    const messages = [
      'Broadcasting emergency signal...',
      'Analyzing verified partners within 10 km...',
      'Routing optimal path coordinates...',
      'Suresh Battery Expert notified...',
      'Ramesh Puncture Wala reviewing request...',
      'Awaiting mechanic confirmation...'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setSearchStatus(messages[idx]);
    }, 1200);
    return () => clearInterval(interval);
  }, [step]);

  // Render current screen
  const renderScreen = () => {
    switch (step) {
      case 'login':
        return <LoginScreen navigate={navigate} />;
      case 'home':
        return <HomeScreen navigate={navigate} />;
      case 'serviceSelection':
        return <ServiceSelectionScreen navigate={navigate} />;
      case 'mapPin':
        return <MapPinScreen navigate={navigate} />;
      case 'pricePreview':
        return <PricePreviewScreen navigate={navigate} />;
      case 'searching':
        return (
          <View style={styles.searchingContainer}>
            <View style={styles.radarContainer}>
              <View style={[styles.radarRing, styles.radarRing3]} />
              <View style={[styles.radarRing, styles.radarRing2]} />
              <View style={[styles.radarRing, styles.radarRing1]} />
              <View style={styles.radarCenter}>
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            </View>
            <Text style={styles.searchingTitle}>Dispatched Emergency Paging</Text>
            <Text style={styles.searchingSubtitle}>{searchStatus}</Text>
          </View>
        );
      case 'tracking':
        return <OrderTrackingScreen navigate={navigate} />;
      case 'completed':
        return <OtpVerificationScreen navigate={navigate} />;
      case 'rating':
        return <RatingScreen navigate={navigate} />;
      case 'orderHistory':
        return <OrderHistoryScreen navigate={navigate} />;
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
            <Text style={styles.notifAppTag}>🔔 ROADASSIST PUSH ALERT</Text>
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
    backgroundColor: '#0b0f19',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    position: 'relative',
  },
  searchingContainer: {
    flex: 1,
    backgroundColor: '#0b0f19',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  radarContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  radarRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    backgroundColor: 'rgba(59, 130, 246, 0.03)',
  },
  radarRing1: {
    width: 100,
    height: 100,
  },
  radarRing2: {
    width: 150,
    height: 150,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  radarRing3: {
    width: 200,
    height: 200,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  radarCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  searchingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  searchingSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
    minHeight: 36,
    paddingHorizontal: 20,
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
