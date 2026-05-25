import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Platform 
} from 'react-native';
import { Alert } from '../services/alert';
import { useApp } from '../store/AppContext';
import { ApiService } from '../services/api';
import { Header } from '../components/Header';

interface HomeScreenProps {
  navigate: (screen: any) => void;
}

export default function HomeScreen({ navigate }: HomeScreenProps) {
  const { profile, token, isOnline, setOnlineStatus, clearUserData, updateWalletStats } = useApp();
  const [syncing, setSyncing] = useState(false);

  const [providerCoords, setProviderCoords] = useState({ latitude: 19.0758, longitude: 72.8770 });
  const [providerAddress, setProviderAddress] = useState('Phoenix Marketcity, Kurla, Mumbai');

  const acquireProviderLocation = () => {
    const isLocInIndia = (lat: number, lng: number) => {
      return lat >= 5.0 && lat <= 38.0 && lng >= 65.0 && lng <= 100.0;
    };

    const useIPFallback = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data && data.latitude && data.longitude) {
            let lat = data.latitude;
            let lng = data.longitude;
            if (!isLocInIndia(lat, lng)) {
              lat = 19.0758;
              lng = 72.8770;
            }
            setProviderCoords({ latitude: lat, longitude: lng });
            setProviderAddress(lat === 19.0758 ? 'Phoenix Marketcity, Kurla, Mumbai' : `${data.city || ''}, ${data.region || ''}, ${data.country_name || ''}`);
            
            // Sync coordinates with DB
            if (profile && token && !profile.id.startsWith('mock-')) {
              try {
                await ApiService.updateLocation(token, profile.id, lat, lng);
                console.log('[GPS] Synced ipapi coordinates to database:', lat, lng);
              } catch (err: any) {
                console.warn('[GPS] Database sync failed:', err.message);
              }
            }

            if (lat !== 19.0758) {
              try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                if (geoRes.ok) {
                  const geoData = await geoRes.json();
                  if (geoData && geoData.display_name) {
                    setProviderAddress(geoData.display_name);
                  }
                }
              } catch (e) {}
            }
            return;
          }
        }
      } catch (e) {}

      try {
        const res = await fetch('https://ipinfo.io/json');
        if (res.ok) {
          const data = await res.json();
          if (data && data.loc) {
            const [latStr, lngStr] = data.loc.split(',');
            let lat = parseFloat(latStr);
            let lng = parseFloat(lngStr);
            if (!isLocInIndia(lat, lng)) {
              lat = 19.0758;
              lng = 72.8770;
            }
            setProviderCoords({ latitude: lat, longitude: lng });
            setProviderAddress(lat === 19.0758 ? 'Phoenix Marketcity, Kurla, Mumbai' : `${data.city || ''}, ${data.region || ''}, ${data.country || ''}`);
            
            // Sync coordinates with DB
            if (profile && token && !profile.id.startsWith('mock-')) {
              try {
                await ApiService.updateLocation(token, profile.id, lat, lng);
                console.log('[GPS] Synced ipinfo coordinates to database:', lat, lng);
              } catch (err: any) {
                console.warn('[GPS] Database sync failed:', err.message);
              }
            }
            return;
          }
        }
      } catch (e) {}
    };

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          let lat = position.coords.latitude;
          let lng = position.coords.longitude;
          if (!isLocInIndia(lat, lng)) {
            lat = 19.0758;
            lng = 72.8770;
          }
          setProviderCoords({ latitude: lat, longitude: lng });
          
          // Sync coordinates with DB
          if (profile && token && !profile.id.startsWith('mock-')) {
            try {
              await ApiService.updateLocation(token, profile.id, lat, lng);
              console.log('[GPS] Synced real GPS coordinates to database:', lat, lng);
            } catch (err: any) {
              console.warn('[GPS] Database sync failed:', err.message);
            }
          }

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.display_name) {
                setProviderAddress(data.display_name);
              }
            }
          } catch (e) {}
        },
        () => {
          navigator.geolocation.getCurrentPosition(
            async (lowPos) => {
              let lat = lowPos.coords.latitude;
              let lng = lowPos.coords.longitude;
              if (!isLocInIndia(lat, lng)) {
                lat = 19.0758;
                lng = 72.8770;
              }
              setProviderCoords({ latitude: lat, longitude: lng });

              // Sync coordinates with DB
              if (profile && token && !profile.id.startsWith('mock-')) {
                try {
                  await ApiService.updateLocation(token, profile.id, lat, lng);
                  console.log('[GPS] Synced low-accuracy coordinates to database:', lat, lng);
                } catch (err: any) {
                  console.warn('[GPS] Database sync failed:', err.message);
                }
              }
            },
            async () => {
              await useIPFallback();
            },
            { enableHighAccuracy: false, timeout: 5000 }
          );
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      useIPFallback();
    }
  };

  useEffect(() => {
    if (isOnline) {
      acquireProviderLocation();
    }
  }, [isOnline]);

  // Sync latest stats/earnings from DB on load
  const syncLatestStats = async () => {
    if (!profile || !token || profile.id.startsWith('mock-')) return;
    try {
      const stats = await ApiService.fetchEarningsMetrics(token || '', profile.id);
      updateWalletStats(Number(stats.walletBalance), stats.totalOrders);
    } catch (e) {
      console.warn('[SyncStats] Could not sync latest wallet numbers:', e);
    }
  };

  useEffect(() => {
    syncLatestStats();
  }, []);

  const handleToggleOnline = async (value: boolean) => {
    setSyncing(true);
    try {
      if (profile && token && !profile.id.startsWith('mock-')) {
        await ApiService.toggleOnlineStatus(token || '', profile.id, value);
      }
      setOnlineStatus(value);
      
      if (value) {
        Alert.alert('System Online', 'You are now online! Roadside emergency dispatches will sweep coordinates dynamically.');
      } else {
        Alert.alert('System Offline', 'You are now offline. No new requests will be received.');
      }
    } catch (error: any) {
      console.warn('[ToggleAvailability] Failed to sync with API. Defaulting to local offline toggle.');
      setOnlineStatus(value);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="GarageWala Partner" 
        onRightAction={clearUserData}
        rightActionText="Logout"
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Card & Toggle */}
        <View style={styles.profileSection}>
          <View style={styles.providerMeta}>
            <Text style={styles.hi}>Hi, {profile?.name || 'Ramesh'}</Text>
            <Text style={styles.statusLabel}>
              Availability Status: {isOnline ? '🟢 ONLINE' : '⚪ OFFLINE'}
            </Text>
          </View>

          <View style={styles.toggleWrapper}>
            <Switch
              trackColor={{ false: '#334155', true: '#059669' }}
              thumbColor={isOnline ? '#10b981' : '#64748b'}
              ios_backgroundColor="#334155"
              onValueChange={handleToggleOnline}
              value={isOnline}
              disabled={syncing}
            />
          </View>
        </View>

        {isOnline && (
          <View style={styles.mapCard}>
            <Text style={styles.mapHeader}>📍 YOUR LIVE SERVICE LOCATION</Text>
            <View style={styles.mapContainer}>
              {Platform.OS === 'web' ? (
                <iframe
                  key={`${providerCoords.latitude}-${providerCoords.longitude}`}
                  src={`https://maps.google.com/maps?q=${providerCoords.latitude},${providerCoords.longitude}&z=16&output=embed`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: 12,
                    opacity: 0.85,
                  } as any}
                  title="Mechanic Current Location Map"
                />
              ) : null}
            </View>
            <Text style={styles.mapAddress} numberOfLines={2}>
              🏢 {providerAddress || 'Fetching your street landmark...'}
            </Text>
            <Text style={styles.mapCoords}>
              Coordinates: {providerCoords.latitude.toFixed(4)}, {providerCoords.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        {/* Payout/Earnings Dashboard Card */}
        <View style={[styles.card, styles.walletCard]}>
          <Text style={styles.walletLabel}>TODAY'S NET EARNINGS (80%)</Text>
          <Text style={styles.walletVal}>₹{Number(profile?.walletBalance || 0).toFixed(2)}</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Jobs Finished</Text>
              <Text style={styles.metricVal}>{profile?.totalOrders || 0}</Text>
            </View>
            <View style={[styles.metricItem, { borderLeftWidth: 1, borderLeftColor: '#334155' }]}>
              <Text style={styles.metricLabel}>Provider Rating</Text>
              <Text style={[styles.metricVal, { color: '#f59e0b' }]}>
                ★ {profile?.rating || '4.8'}
              </Text>
            </View>
          </View>
        </View>

        {/* Registered Skill Badges */}
        <Text style={styles.sectionTitle}>Registered Skills / Services</Text>
        <View style={styles.skillsGrid}>
          {profile?.skills && profile.skills.length > 0 ? (
            profile.skills.map((skill) => (
              <View key={skill} style={styles.skillBadge}>
                <Text style={styles.skillText}>🛠️ {skill}</Text>
              </View>
            ))
          ) : (
            <View style={styles.skillBadge}>
              <Text style={styles.skillText}>🛠️ GENERAL_REPAIR</Text>
            </View>
          )}
        </View>

        {/* History Redirect */}
        <View style={styles.historySection}>
          <TouchableOpacity 
            style={styles.historyBtn}
            onPress={() => navigate('orderHistory')}
            activeOpacity={0.8}
          >
            <Text style={styles.historyText}>View Wallet & Completed Order Logs →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f17',
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#131a2b',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  providerMeta: {
    flex: 1,
  },
  hi: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
  },
  statusLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '600',
  },
  toggleWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarBeacon: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  radarText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#131a2b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  walletCard: {
    alignItems: 'center',
    marginBottom: 28,
  },
  walletLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  walletVal: {
    fontSize: 40,
    fontWeight: '900',
    color: 'white',
    marginTop: 8,
    marginBottom: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
  },
  skillBadge: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  skillText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  historySection: {
    alignItems: 'center',
    marginTop: 10,
  },
  historyBtn: {
    padding: 10,
  },
  historyText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  mapCard: {
    backgroundColor: '#131a2b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  mapHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  mapContainer: {
    height: 160,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111827',
    marginBottom: 12,
  },
  mapAddress: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  mapCoords: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
});
