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

interface ServiceSelectionScreenProps {
  navigate: (screen: any) => void;
}

const BIKE_SERVICES = [
  { id: 'PUNCTURE', title: 'Puncture Fix', desc: 'Fix flat tube/tubeless tyre', price: '₹80' },
  { id: 'FUEL', title: 'Fuel Empty', desc: 'Get container fuel delivered', price: '₹150' },
  { id: 'BATTERY', title: 'Battery Jump', desc: 'Jump-start dead battery', price: '₹150' },
  { id: 'SPARK_PLUG', title: 'Spark Plug Change', desc: 'Replace snapped spark plug', price: '₹120' },
  { id: 'CHAIN', title: 'Chain Repair', desc: 'Derailed or broken chain fix', price: '₹150' },
  { id: 'BRAKE_WIRE', title: 'Brake/Clutch Wire', desc: 'Replace snapped wire on-site', price: '₹120' },
  { id: 'NOT_STARTING', title: 'Electrical Fix', desc: 'Electrical start-up troubleshooting', price: '₹200' },
];

const CAR_SERVICES = [
  { id: 'PUNCTURE', title: 'Puncture / Stepney', desc: 'Flat tyre stepney swap', price: '₹80' },
  { id: 'BATTERY', title: 'Battery Jumpstart', desc: 'Portable battery jumpstart', price: '₹150' },
  { id: 'FUEL', title: 'Emergency Fuel', desc: 'Container petrol/diesel delivery', price: '₹150' },
  { id: 'TOWING', title: 'Flatbed Towing', desc: 'Flatbed truck to nearest garage', price: '₹300' },
  { id: 'COOLANT', title: 'Coolant Top-up', desc: 'Emergency coolant topups', price: '₹150' },
  { id: 'OIL', title: 'Engine Oil Top-up', desc: 'Emergency engine oil topups', price: '₹150' },
  { id: 'BULB', title: 'Bulb Replacement', desc: 'Headlight or taillight change', price: '₹100' },
  { id: 'NOT_STARTING', title: 'Car Not Starting', desc: 'Diagnose and fix minor issues', price: '₹200' },
];

export default function ServiceSelectionScreen({ navigate }: ServiceSelectionScreenProps) {
  const { selectedVehicle, setSelectedService } = useApp();
  const servicesList = selectedVehicle === 'BIKE' ? BIKE_SERVICES : CAR_SERVICES;

  const handleSelectService = (serviceId: string) => {
    setSelectedService(serviceId);
    navigate('mapPin');
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Select Assistance Service" 
        onBack={() => navigate('home')}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionHeader}>
          {selectedVehicle === 'BIKE' ? 'Bike (Two Wheeler)' : 'Car (Four Wheeler)'} Assistance
        </Text>
        <Text style={styles.tagline}>Select the exact roadside problem you are facing:</Text>

        <View style={styles.grid}>
          {servicesList.map((srv) => (
            <TouchableOpacity
              key={srv.id}
              style={styles.gridBtn}
              onPress={() => handleSelectService(srv.id)}
              activeOpacity={0.85}
            >
              <View style={styles.gridBtnHeader}>
                <Text style={styles.gridBtnTitle}>{srv.title}</Text>
                <Text style={styles.gridBtnPrice}>{srv.price}</Text>
              </View>
              <Text style={styles.gridBtnDesc}>{srv.desc}</Text>
            </TouchableOpacity>
          ))}
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
  sectionHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
  },
  tagline: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridBtn: {
    width: '100%',
    backgroundColor: '#131a2b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  gridBtnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  gridBtnTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  gridBtnPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3b82f6',
  },
  gridBtnDesc: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
  },
});
