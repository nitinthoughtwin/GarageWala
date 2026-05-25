import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { useApp } from '../store/AppContext';
import { Header } from '../components/Header';

interface HomeScreenProps {
  navigate: (screen: any) => void;
}

export default function HomeScreen({ navigate }: HomeScreenProps) {
  const { user, setSelectedVehicle, clearUserData } = useApp();

  const handleSelectVehicle = (type: 'BIKE' | 'CAR') => {
    setSelectedVehicle(type);
    navigate('serviceSelection');
  };

  return (
    <View style={styles.container}>
      <Header 
        title="GarageWala RoadAssist" 
        onRightAction={clearUserData}
        rightActionText="Logout"
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.welcomeBanner}>
          <Text style={styles.hi}>Hi, {user?.name || 'Rohan'}</Text>
          <Text style={styles.tagline}>Select your vehicle type to get emergency assistance.</Text>
        </View>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => handleSelectVehicle('BIKE')}
          activeOpacity={0.95}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Two Wheeler (Bike)</Text>
            <Text style={styles.badge}>From ₹80</Text>
          </View>
          <Text style={styles.cardDesc}>Dispatches expert bike mechanics for puncture fix, empty fuel delivery, spark plug snap, derailed chains, or broken brake/clutch wires.</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.carCard]}
          onPress={() => handleSelectVehicle('CAR')}
          activeOpacity={0.95}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, styles.carText]}>Four Wheeler (Car)</Text>
            <Text style={[styles.badge, styles.carBadge]}>From ₹80</Text>
          </View>
          <Text style={styles.cardDesc}>Dispatches verified car mechanics for Stepney flat tyre swap, battery dead jumpstarts, coolant/oil topups, bulb replacement, or flatbed towing trailers.</Text>
        </TouchableOpacity>

        <View style={styles.historyTrigger}>
          <TouchableOpacity style={styles.historyBtn} onPress={() => navigate('orderHistory')}>
            <Text style={styles.historyText}>View Past Bookings History →</Text>
          </TouchableOpacity>
        </View>
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
  welcomeBanner: {
    marginBottom: 28,
  },
  hi: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
  },
  tagline: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 6,
  },
  card: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  carCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    shadowColor: '#10b981',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#60a5fa',
  },
  carText: {
    color: '#34d399',
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  carBadge: {
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  cardDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  historyTrigger: {
    marginTop: 10,
    alignItems: 'center',
  },
  historyBtn: {
    padding: 10,
  },
  historyText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
});
