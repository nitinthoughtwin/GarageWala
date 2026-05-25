import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
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

interface OrderTrackingScreenProps {
  navigate: (screen: any) => void;
}

export default function OrderTrackingScreen({ navigate }: OrderTrackingScreenProps) {
  const { token, activeOrder, assignedProvider, coordinates, user, socket, setActiveOrder, setAssignedProvider } = useApp();

  // Chat Messenger States
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  const mechanicLat = assignedProvider?.currentLat;
  const mechanicLng = assignedProvider?.currentLng;
  const customerLat = coordinates.latitude;
  const customerLng = coordinates.longitude;

  let distanceKm = 1.2;
  let etaMins = 6;

  if (mechanicLat && mechanicLng && customerLat && customerLng) {
    const dist = calculateDistance(mechanicLat, mechanicLng, customerLat, customerLng);
    distanceKm = parseFloat(dist.toFixed(2));
    etaMins = Math.max(1, Math.ceil(dist * 2.5)); 
  }

  // Socket chat listening hooks
  useEffect(() => {
    if (!socket || !activeOrder) return;

    console.log('[Socket-Chat] Hooked receive_message listener in OrderTrackingScreen');

    const handleIncomingMessage = (msg: any) => {
      if (msg.orderId === activeOrder.id) {
        console.log('[Socket-Chat] Received text message:', msg.text);
        setChatMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('chat:receive_message', handleIncomingMessage);

    return () => {
      socket.off('chat:receive_message', handleIncomingMessage);
    };
  }, [socket, activeOrder]);

  const handleSendMessage = () => {
    if (!chatMessage || chatMessage.trim() === '' || !socket || !activeOrder || !assignedProvider) return;

    const msgPayload = {
      orderId: activeOrder.id,
      senderId: user?.id || 'mock-user-id',
      recipientId: assignedProvider.id,
      senderRole: 'user' as const,
      text: chatMessage.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    console.log('[Socket-Chat] Sending chat message payload:', msgPayload.text);
    socket.emit('chat:send_message', msgPayload);
    setChatMessages((prev) => [...prev, msgPayload]);
    setChatMessage('');
  };

  const handleCancelBooking = async () => {
    if (!activeOrder) return;
    
    Alert.alert(
      'Cancel Emergency Assistance?',
      'Are you sure you want to cancel this booking? This will notify the en-route mechanic.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        { 
          text: 'Cancel Request', 
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.cancelOrder(token || '', activeOrder.id);
            } catch (e) {}
            setActiveOrder(null);
            setAssignedProvider(null);
            navigate('home');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Live Mechanic Progress" 
      />

      <View style={styles.mapMockCanvas}>
        {Platform.OS === 'web' ? (
          <iframe
            key={`${mechanicLat || customerLat}-${mechanicLng || customerLng}`}
            src={mechanicLat && mechanicLng ? `https://maps.google.com/maps?saddr=${mechanicLat},${mechanicLng}&daddr=${customerLat},${customerLng}&output=embed` : `https://maps.google.com/maps?q=${customerLat},${customerLng}&z=16&output=embed`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              opacity: 0.7,
            } as any}
            title="Mechanic Tracking Map"
          />
        ) : null}
        <View style={styles.statusIndicator}>
          <Text style={styles.pulseDot}>•</Text>
          <Text style={styles.statusText}>EN-ROUTE: {assignedProvider?.name || 'Ramesh Puncture Wala'}</Text>
        </View>

        <View style={styles.trackingRadar}>
          <View style={styles.pulseCircle} />
          <View style={styles.carSymbol}>
            <Text style={styles.directionArrow}>↑</Text>
          </View>
        </View>

        <View style={styles.etaCard}>
          <Text style={styles.etaLabel}>DISTANCE REMAINING</Text>
          <Text style={styles.etaValue}>{distanceKm === 0 ? 'Arrived!' : `${distanceKm} km`}</Text>
          <Text style={[styles.etaLabel, { marginTop: 8, fontSize: 10, color: '#64748b', fontWeight: '700' }]}>ESTIMATED ARRIVAL</Text>
          <Text style={styles.etaSubValue}>{distanceKm === 0 ? 'Mechanic at gate' : `${etaMins} mins`}</Text>
        </View>
      </View>

      <View style={styles.bottomDrawer}>
        <View style={styles.providerCard}>
          <Image 
            source={{ uri: assignedProvider?.profilePhotoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150' }} 
            style={styles.avatar} 
          />
          <View style={styles.providerDetails}>
            <Text style={styles.providerName}>{assignedProvider?.name || 'Ramesh Puncture Wala'}</Text>
            <Text style={styles.providerPhone}>{assignedProvider?.phone || '8888888881'}</Text>
            <Text style={styles.providerVehicle}>Verified Bike Mechanic</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.ratingScore}>{assignedProvider?.rating || '4.8'}</Text>
          </View>
        </View>

        <View style={styles.otpSection}>
          <View style={styles.otpDetails}>
            <Text style={styles.otpLabel}>Give this OTP code on arrival:</Text>
            <Text style={styles.otpSubtitle}>Verifies completion and authorizes payouts</Text>
          </View>
          <Text style={styles.otpCode}>{activeOrder?.otp || '4892'}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.chatFab} 
            onPress={() => setChatVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.chatFabText}>💬 Live Chat</Text>
          </TouchableOpacity>

          <Button
            title="Cancel Booking Request"
            variant="danger"
            onPress={handleCancelBooking}
            style={styles.cancelBtn}
          />
        </View>
      </View>

      {/* Chat Messenger Overlay */}
      {chatVisible && (
        <View style={styles.chatOverlay}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>💬 Chat with {assignedProvider?.name || 'Mechanic'}</Text>
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
                <Text style={styles.chatEmptyText}>No messages yet. Send a text to coordinate emergency arrival details!</Text>
              </View>
            ) : (
              chatMessages.map((msg, idx) => {
                const isMe = msg.senderRole === 'user';
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
              placeholder="Type your message..."
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
    backgroundColor: '#0b0f19',
  },
  mapMockCanvas: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
    top: 20,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  pulseDot: {
    color: '#3b82f6',
    fontSize: 20,
    fontWeight: '900',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  trackingRadar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  carSymbol: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  directionArrow: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  etaCard: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 10,
  },
  etaLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
  },
  etaValue: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  bottomDrawer: {
    backgroundColor: '#131a2b',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  providerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  providerPhone: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  providerVehicle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  starIcon: {
    color: '#f59e0b',
    fontSize: 12,
  },
  ratingScore: {
    color: '#f59e0b',
    fontWeight: '700',
    fontSize: 12,
  },
  otpSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0b0f19',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
  },
  otpDetails: {
    flex: 1,
  },
  otpLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  otpSubtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  otpCode: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
  },
  etaSubValue: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  chatFab: {
    width: 120,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  chatFabText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  chatOverlay: {
    position: 'absolute',
    top: 60,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0b0f19',
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
    backgroundColor: '#3b82f6',
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
    backgroundColor: '#0b0f19',
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
