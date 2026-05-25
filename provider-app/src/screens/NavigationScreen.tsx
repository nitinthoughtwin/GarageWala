import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  Platform,
  ScrollView,
  TextInput
} from 'react-native';
import { Alert } from '../services/alert';
import { useApp } from '../store/AppContext';
import { ApiService } from '../services/api';
import { Header } from '../components/Header';
import { Button } from '../components/Button';

interface NavigationScreenProps {
  navigate: (screen: any) => void;
}

export default function NavigationScreen({ navigate }: NavigationScreenProps) {
  const { activeOrder, profile, socket, token } = useApp();
  const [providerCoords, setProviderCoords] = useState({ latitude: 19.0765, longitude: 72.8785 });
  const [navProgress, setNavProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  // Chat Messenger States
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const isLocInIndia = lat >= 5.0 && lat <= 38.0 && lng >= 65.0 && lng <= 100.0;
          if (isLocInIndia) {
            setProviderCoords({ latitude: lat, longitude: lng });
          }
        },
        () => {
          fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
              if (data && data.latitude && data.longitude) {
                const isLocInIndia = data.latitude >= 5.0 && data.latitude <= 38.0 && data.longitude >= 65.0 && data.longitude <= 100.0;
                if (isLocInIndia) {
                  setProviderCoords({ latitude: data.latitude, longitude: data.longitude });
                }
              }
            })
            .catch(() => {});
        }
      );
    }
  }, []);

  // Socket chat listening hooks
  useEffect(() => {
    if (!socket || !activeOrder) return;

    console.log('[Socket-Chat] Hooked receive_message listener in NavigationScreen');

    const handleIncomingMessage = (msg: any) => {
      if (msg.orderId === activeOrder.id) {
        console.log('[Socket-Chat] Received text message from customer:', msg.text);
        setChatMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('chat:receive_message', handleIncomingMessage);

    return () => {
      socket.off('chat:receive_message', handleIncomingMessage);
    };
  }, [socket, activeOrder]);

  const handleSendMessage = () => {
    if (!chatMessage || chatMessage.trim() === '' || !socket || !activeOrder || !profile) return;

    const msgPayload = {
      orderId: activeOrder.id,
      senderId: profile.id,
      recipientId: activeOrder.userId,
      senderRole: 'provider' as const,
      text: chatMessage.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    console.log('[Socket-Chat] Sending chat message payload:', msgPayload.text);
    socket.emit('chat:send_message', msgPayload);
    setChatMessages((prev) => [...prev, msgPayload]);
    setChatMessage('');
  };

  const pLat = providerCoords.latitude;
  const pLng = providerCoords.longitude;
  const cLat = activeOrder?.userLat || 19.0758;
  const cLng = activeOrder?.userLng || 72.8770;

  const routeCheckpoints = [
    { name: 'Departure point', lat: pLat, lng: pLng },
    { name: 'Passing Link Road crossing', lat: pLat + (cLat - pLat) * 0.33, lng: pLng + (cLng - pLng) * 0.33 },
    { name: 'Turning onto LBS Marg crossing', lat: pLat + (cLat - pLat) * 0.66, lng: pLng + (cLng - pLng) * 0.66 },
    { name: 'Arrived at gate destination', lat: cLat, lng: cLng }
  ];

  const handleSimulateGPSMove = async () => {
    const nextProgress = navProgress + 1;
    if (nextProgress > routeCheckpoints.length) return;

    setNavProgress(nextProgress);
    const coords = routeCheckpoints[nextProgress - 1];

    // 1. Emit live coordinate updates to socket to update the customer app map!
    if (socket && profile && activeOrder) {
      console.log(`[Socket] Broadcasting coordinate: ${coords.lat}, ${coords.lng}`);
      socket.emit('provider:location_update', {
        providerId: profile.id,
        lat: coords.lat,
        lng: coords.lng,
        orderId: activeOrder.id,
      });
    }

    // 2. If reached destination, mark as ARRIVED in DB and navigate to CompleteOrder
    if (nextProgress === routeCheckpoints.length) {
      setLoading(true);
      try {
        if (activeOrder && !activeOrder.id.startsWith('mock-')) {
          await ApiService.updateOrderStatus(token || '', activeOrder.id, 'ARRIVED');
        }
        Alert.alert('Arrived at Destination', 'You have successfully arrived at the client landmark address! Provide repair service and request their completion OTP.');
        navigate('completeOrder');
      } catch (e: any) {
        console.warn('[NavigateStatus] Connection offline. Progressing locally.');
        Alert.alert('Arrived at Destination', 'You have successfully arrived at the client landmark address! Provide repair service and request their completion OTP.');
        navigate('completeOrder');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenExternalGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${pLat},${pLng}&destination=${cLat},${cLng}&travelmode=driving`;
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Alert.alert('External Navigation', 'Opening Google Maps navigation...');
      try {
        const { Linking } = require('react-native');
        Linking.openURL(url);
      } catch (e) {}
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Turn-by-Turn Route Guidance" />

      {/* Map visual canvas mock */}
      <View style={styles.mapMock}>
        {Platform.OS === 'web' ? (
          <iframe
            key={`${routeCheckpoints[navProgress === 0 ? 0 : Math.min(navProgress - 1, routeCheckpoints.length - 1)].lat}-${routeCheckpoints[navProgress === 0 ? 0 : Math.min(navProgress - 1, routeCheckpoints.length - 1)].lng}`}
            src={`https://maps.google.com/maps?saddr=${routeCheckpoints[navProgress === 0 ? 0 : Math.min(navProgress - 1, routeCheckpoints.length - 1)].lat},${routeCheckpoints[navProgress === 0 ? 0 : Math.min(navProgress - 1, routeCheckpoints.length - 1)].lng}&daddr=${cLat},${cLng}&output=embed`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              opacity: 0.7,
            } as any}
            title="Route Guidance Map"
          />
        ) : null}
        <View style={styles.gpsBanner}>
          <Text style={styles.gpsIcon}>🧭</Text>
          <View style={styles.gpsMeta}>
            <Text style={styles.directionText}>
              {navProgress === 0 && 'Head North on Link Road toward Kurla'}
              {navProgress === 1 && 'Keep left for LBS Marg lane flyover'}
              {navProgress === 2 && 'In 200m, turn right near Phoenix gate'}
              {navProgress === 3 && 'Arrived! Flat incident on your left'}
              {navProgress > 3 && 'Arrived! Flat incident on your left'}
            </Text>
            <Text style={styles.subDirections}>
              {navProgress < 3 ? 'Distance Remaining: ' + (1.2 - navProgress * 0.4).toFixed(1) + ' km' : 'Destination Arrived'}
            </Text>
          </View>
        </View>

        {/* Pulse beacon indicators */}
        <View style={styles.radarRadar}>
          <View style={styles.pulsingHalo} />
          <View style={styles.directionArrow}>
            <Text style={styles.arrowIcon}>↑</Text>
          </View>
        </View>
      </View>

      {/* Control navigation panel */}
      <View style={styles.drawerSheet}>
        <Text style={styles.addressTitle}>CUSTOMER PICKUP ADDRESS</Text>
        <Text style={styles.addressVal}>{activeOrder?.userAddress || 'Phoenix Marketcity, Kurla, Mumbai'}</Text>

        <View style={styles.progressCard}>
          <Text style={styles.cardHeader}>Driving Progress Tracker</Text>
          <View style={styles.barContainer}>
            {routeCheckpoints.map((_, idx) => (
              <View 
                key={idx}
                style={[
                  styles.progressBarCell,
                  idx < navProgress && styles.progressBarActive
                ]}
              />
            ))}
          </View>
          <Text style={styles.statusDescription}>
            {navProgress === 0 && 'GPS Ready: Start Driving'}
            {navProgress === 1 && 'Checkpoint 1: Linking Road'}
            {navProgress === 2 && 'Checkpoint 2: Passing LBS crossing'}
            {navProgress === 3 && 'Checkpoint 3: Near mall sector'}
            {navProgress === 4 && 'Arrived! Dispatch verified'}
          </Text>
        </View>

        <View style={styles.btnRow}>
          <Button
            title={navProgress === 0 ? 'Start Drive' : (navProgress >= 3 ? 'Confirm Arrival' : 'Simulate GPS')}
            loading={loading}
            onPress={handleSimulateGPSMove}
            disabled={navProgress >= 4}
            style={{ flex: 1 }}
          />
          <TouchableOpacity style={styles.chatFab} onPress={() => setChatVisible(true)} activeOpacity={0.8}>
            <Text style={styles.chatFabText}>💬 Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapsExternalBtn} onPress={handleOpenExternalGoogleMaps} activeOpacity={0.8}>
            <Text style={styles.mapsExternalText}>🧭 NAV</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messenger Overlay */}
      {chatVisible && (
        <View style={styles.chatOverlay}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>💬 Chat with Client</Text>
            <TouchableOpacity onPress={() => setChatVisible(false)}>
              <Text style={styles.chatCloseIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.chatMessagesList}
            contentContainerStyle={styles.chatMessagesContent}
            ref={(ref) => ref?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
          >
            {chatMessages.length === 0 ? (
              <View style={styles.chatEmptyState}>
                <Text style={styles.chatEmptyText}>No messages yet. Send a message to coordinate arrival or service details!</Text>
              </View>
            ) : (
              chatMessages.map((msg, idx) => {
                const isMe = msg.senderRole === 'provider';
                return (
                  <View 
                    key={idx} 
                    style={[
                      styles.chatBubbleContainer, 
                      isMe ? styles.chatBubbleContainerMe : styles.chatBubbleContainerThem
                    ]}
                  >
                    <View style={[styles.chatBubble, isMe ? styles.chatBubbleMe : styles.chatBubbleThem]}>
                      <Text style={styles.chatText}>{msg.text}</Text>
                    </View>
                    <Text style={styles.chatTime}>{msg.createdAt}</Text>
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type message..."
              placeholderTextColor="#475569"
              value={chatMessage}
              onChangeText={setChatMessage}
            />
            <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendMessage} activeOpacity={0.8}>
              <Text style={styles.chatSendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f17',
  },
  mapMock: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gpsBanner: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  gpsIcon: {
    fontSize: 24,
  },
  gpsMeta: {
    flex: 1,
  },
  directionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
  },
  subDirections: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  radarRadar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulsingHalo: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  directionArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  arrowIcon: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  drawerSheet: {
    backgroundColor: '#131a2b',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  addressTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  addressVal: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    marginTop: 4,
    lineHeight: 18,
    marginBottom: 20,
  },
  progressCard: {
    backgroundColor: '#0b0f17',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  barContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
  },
  progressBarCell: {
    width: 56,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressBarActive: {
    backgroundColor: '#10b981',
  },
  statusDescription: {
    fontSize: 12,
    color: '#94a3b8',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  mapsExternalBtn: {
    backgroundColor: '#059669',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mapsExternalText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
  },
  chatFab: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  chatFabText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
  },
  chatOverlay: {
    position: 'absolute',
    top: 60,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0b0f17',
    zIndex: 1000,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#131a2b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  chatTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
  chatCloseIcon: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: '800',
  },
  chatMessagesList: {
    flex: 1,
    padding: 16,
  },
  chatMessagesContent: {
    paddingBottom: 24,
  },
  chatEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  chatEmptyText: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  chatBubbleContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  chatBubbleContainerMe: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  chatBubbleContainerThem: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  chatBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  chatBubbleMe: {
    backgroundColor: '#10b981',
    borderTopRightRadius: 2,
  },
  chatBubbleThem: {
    backgroundColor: '#131a2b',
    borderWidth: 1,
    borderColor: '#334155',
    borderTopLeftRadius: 2,
  },
  chatText: {
    color: 'white',
    fontSize: 13,
    lineHeight: 18,
  },
  chatTime: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#131a2b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  chatInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#0b0f17',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 22,
    paddingHorizontal: 16,
    color: 'white',
    fontSize: 13,
    marginRight: 10,
  },
  chatSendBtn: {
    backgroundColor: '#3b82f6',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatSendText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
});
