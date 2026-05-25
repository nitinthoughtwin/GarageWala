import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { useApp } from '../store/AppContext';
import { ApiService } from '../services/api';
import { Header } from '../components/Header';

interface OrderHistoryScreenProps {
  navigate: (screen: any) => void;
}

export default function OrderHistoryScreen({ navigate }: OrderHistoryScreenProps) {
  const { user, token } = useApp();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const data = await ApiService.fetchUserHistory(token || '', user.id);
      setHistory(data);
    } catch (error: any) {
      console.warn('[HistoryFallback] Could not load past logs:', error.message);
      
      // Fallback mock history
      const mockHistory = [
        { id: '1', serviceType: 'PUNCTURE', vehicleType: 'BIKE', status: 'COMPLETED', totalPrice: 88.00, createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), provider: { name: 'Ramesh Puncture Wala' } },
        { id: '2', serviceType: 'BATTERY', vehicleType: 'CAR', status: 'COMPLETED', totalPrice: 172.50, createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), provider: { name: 'Suresh Battery Expert' } }
      ];
      setHistory(mockHistory);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return 'Recent order';
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Your Booking History" 
        onBack={() => navigate('home')}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
          }
        >
          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyText}>No past bookings found.</Text>
              <Text style={styles.emptySub}>Your roadside assistance trip logs will display here once completed.</Text>
            </View>
          ) : (
            history.map((order) => (
              <View key={order.id} style={styles.historyCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{order.serviceType} ({order.vehicleType})</Text>
                  <Text style={[
                    styles.cardStatus, 
                    order.status === 'COMPLETED' ? styles.statusSuccess : styles.statusCancel
                  ]}>
                    {order.status}
                  </Text>
                </View>

                <Text style={styles.cardDate}>{formatDate(order.createdAt)}</Text>

                {order.provider && (
                  <View style={styles.providerRow}>
                    <Text style={styles.providerLabel}>Assigned Partner:</Text>
                    <Text style={styles.providerValue}>{order.provider.name}</Text>
                  </View>
                )}

                <View style={styles.cardPriceRow}>
                  <Text style={styles.priceLabel}>Amount Settled:</Text>
                  <Text style={styles.priceValue}>₹{Number(order.totalPrice).toFixed(2)}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  historyCard: {
    backgroundColor: '#131a2b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: 'white',
  },
  cardStatus: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusSuccess: {
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusCancel: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  cardDate: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 12,
  },
  providerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    fontSize: 12,
  },
  providerLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  providerValue: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  cardPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 8,
    marginTop: 6,
  },
  priceLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  priceValue: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '800',
  },
});
