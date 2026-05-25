import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Alert } from '../services/alert';
import { useApp } from '../store/AppContext';
import { ApiService } from '../services/api';
import { Header } from '../components/Header';
import { Button } from '../components/Button';

interface PricePreviewScreenProps {
  navigate: (screen: any) => void;
}

export default function PricePreviewScreen({ navigate }: PricePreviewScreenProps) {
  const { 
    token, 
    user,
    selectedService, 
    selectedVehicle, 
    coordinates, 
    userAddress, 
    priceEstimate, 
    setActiveOrder 
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE'>('CASH');
  const [loading, setLoading] = useState(false);

  // Promo Code States
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode || promoCode.trim() === '') {
      setPromoError('Please enter a promo code.');
      return;
    }

    setPromoLoading(true);
    setPromoError('');
    setPromoMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/pricing/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promoCode: promoCode.trim(),
          totalPrice: priceEstimate?.totalPrice || 150
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setDiscount(data.discount);
        setPromoApplied(true);
        setPromoMessage(data.message);
      } else {
        setPromoError(data.error || 'Invalid promo code.');
      }
    } catch (err: any) {
      setPromoError('Could not connect to promo server.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleBookAssistance = async () => {
    if (!token || !user) {
      Alert.alert('Session Expired', 'Please log in again to place bookings.');
      navigate('login');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        userId: user.id,
        vehicleType: selectedVehicle,
        serviceType: selectedService,
        userLat: coordinates.latitude,
        userLng: coordinates.longitude,
        userAddress: userAddress,
        distanceKm: priceEstimate?.distanceKm || 2.5,
        paymentMethod: paymentMethod,
        promoCode: promoApplied ? promoCode.trim().toUpperCase() : undefined,
      };

      const result = await ApiService.createOrder(token, orderPayload);
      setActiveOrder(result.order);
      navigate('searching');
    } catch (error: any) {
      console.warn('[BookingFallback] Order creation error:', error.message);
      
      // Development simulated matching fallback
      const mockOrder = {
        id: 'mock-order-id-' + Math.floor(Math.random() * 1000),
        status: 'PENDING' as any,
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        vehicleType: selectedVehicle,
        serviceType: selectedService,
        userAddress: userAddress,
        totalPrice: Math.max(0, (priceEstimate?.totalPrice || 105.00) - discount)
      };
      setActiveOrder(mockOrder);
      navigate('searching');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Assistance Pricing Cost" 
        onBack={() => navigate('mapPin')}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.detailsCard}>
          <Text style={styles.detailsLabel}>Service Required</Text>
          <Text style={styles.detailsValue}>{selectedService} ({selectedVehicle})</Text>

          <Text style={[styles.detailsLabel, { marginTop: 16 }]}>Pickup Coordinate Address</Text>
          <Text style={styles.detailsValue}>{userAddress}</Text>

          {priceEstimate?.durationMins && (
            <View style={styles.etaBadge}>
              <Text style={styles.etaText}>🕒 Mechanic ETA: {priceEstimate.durationMins} mins</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionHeader}>🎟️ Apply Promo Code</Text>
        <View style={styles.promoCard}>
          <View style={styles.promoInputRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="e.g. FREE50, FIRSTOFF"
              placeholderTextColor="#475569"
              autoCapitalize="characters"
              value={promoCode}
              onChangeText={(text) => {
                setPromoCode(text);
                setPromoError('');
                setPromoMessage('');
              }}
              editable={!promoApplied}
            />
            <TouchableOpacity 
              style={[styles.promoApplyBtn, promoApplied && styles.promoAppliedBtn]}
              onPress={promoApplied ? () => {
                setPromoApplied(false);
                setDiscount(0);
                setPromoCode('');
                setPromoMessage('');
              } : handleApplyPromo}
              disabled={promoLoading}
              activeOpacity={0.8}
            >
              {promoLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.promoApplyText}>{promoApplied ? 'Remove' : 'Apply'}</Text>
              )}
            </TouchableOpacity>
          </View>
          {promoError ? <Text style={styles.promoErrorText}>❌ {promoError}</Text> : null}
          {promoMessage ? <Text style={styles.promoSuccessText}>✅ {promoMessage}</Text> : null}
        </View>

        <Text style={styles.sectionHeader}>Fare Summary</Text>
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base Service Fee</Text>
            <Text style={styles.priceVal}>₹{priceEstimate?.basePrice.toFixed(2)}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Distance Charge ({priceEstimate?.distanceKm} km via driving route)
            </Text>
            <Text style={styles.priceVal}>₹{priceEstimate?.distanceCharge.toFixed(2)}</Text>
          </View>

          {promoApplied && discount > 0 ? (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: '#10b981', fontWeight: '600' }]}>
                Discount Code ({promoCode.toUpperCase()})
              </Text>
              <Text style={[styles.priceVal, { color: '#10b981', fontWeight: '700' }]}>
                -₹{discount.toFixed(2)}
              </Text>
            </View>
          ) : null}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalVal}>₹{Math.max(0, (priceEstimate?.totalPrice || 150) - discount).toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Select Payment Mode</Text>
        <View style={styles.paymentRow}>
          <TouchableOpacity
            style={[styles.paymentBtn, paymentMethod === 'CASH' && styles.paymentBtnActive]}
            onPress={() => setPaymentMethod('CASH')}
            activeOpacity={0.8}
          >
            <Text style={[styles.paymentText, paymentMethod === 'CASH' && styles.paymentTextActive]}>
              Cash / Pay Later
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentBtn, paymentMethod === 'ONLINE' && styles.paymentBtnActive]}
            onPress={() => setPaymentMethod('ONLINE')}
            activeOpacity={0.8}
          >
            <Text style={[styles.paymentText, paymentMethod === 'ONLINE' && styles.paymentTextActive]}>
              Online (Razorpay)
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Confirm RoadAssist Booking"
          loading={loading}
          onPress={handleBookAssistance}
          style={styles.bookBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  detailsCard: {
    backgroundColor: '#131a2b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  detailsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    marginTop: 2,
  },
  etaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 14,
  },
  etaText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  priceCard: {
    backgroundColor: '#131a2b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  priceVal: {
    fontSize: 13,
    color: 'white',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3b82f6',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  paymentBtn: {
    width: '48%',
    height: 48,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentBtnActive: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  paymentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  paymentTextActive: {
    color: 'white',
  },
  bookBtn: {
    marginTop: 'auto',
  },
  promoCard: {
    backgroundColor: '#131a2b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  promoInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoInput: {
    flex: 1,
    height: 46,
    backgroundColor: '#0b0f19',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: 'white',
    fontSize: 14,
    marginRight: 12,
  },
  promoApplyBtn: {
    width: 80,
    height: 46,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoAppliedBtn: {
    backgroundColor: '#ef4444',
  },
  promoApplyText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  promoErrorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  promoSuccessText: {
    color: '#10b981',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
});
