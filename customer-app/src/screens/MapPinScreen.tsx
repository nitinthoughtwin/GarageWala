import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { Alert } from '../services/alert';
import { useApp } from '../store/AppContext';
import { ApiService } from '../services/api';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

interface MapPinScreenProps {
  navigate: (screen: any) => void;
}

export default function MapPinScreen({ navigate }: MapPinScreenProps) {
  const { 
    selectedService, 
    selectedVehicle, 
    setCoordinatesAndAddress, 
    setPriceEstimate 
  } = useApp();

  const [address, setAddress] = useState('Phoenix Marketcity, Kurla, Mumbai');
  const [loading, setLoading] = useState(false);
  const [gpsLocked, setGpsLocked] = useState(true);

  const [coords, setCoords] = useState({ latitude: 19.0758, longitude: 72.8770 });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<any>(null);

  const fetchCurrentGPSLocation = () => {
    setLoading(true);
    
    const isLocInIndia = (lat: number, lng: number) => {
      return lat >= 5.0 && lat <= 38.0 && lng >= 65.0 && lng <= 100.0;
    };

    const useIPFallback = async (reason: string) => {
      console.warn(`[GPS] Geolocation failed (${reason}). Falling back to IP-based location...`);
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data && data.latitude && data.longitude) {
            let lat = data.latitude;
            let lng = data.longitude;
            
            if (!isLocInIndia(lat, lng)) {
              console.log('[GPS] ipapi IP location is outside India (NL/dev VM). Defaulting to Mumbai.');
              lat = 19.0758;
              lng = 72.8770;
            }
            
            setCoords({ latitude: lat, longitude: lng });
            setGpsLocked(true);
            
            const fallbackAddress = lat === 19.0758 ? 'Phoenix Marketcity, Kurla, Mumbai' : `${data.city || ''}, ${data.region || ''}, ${data.country_name || ''}`;
            setAddress(fallbackAddress);
            console.log('[GPS] IP-based location acquired (ipapi):', lat, lng, fallbackAddress);
            
            if (lat !== 19.0758) {
              try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                if (geoRes.ok) {
                  const geoData = await geoRes.json();
                  if (geoData && geoData.display_name) {
                    setAddress(geoData.display_name);
                  }
                }
              } catch (e) {}
            }
            return;
          }
        }
      } catch (ipErr) {
        console.warn('[GPS] ipapi fallback failed, trying ipinfo...', ipErr);
      }

      try {
        const res = await fetch('https://ipinfo.io/json');
        if (res.ok) {
          const data = await res.json();
          if (data && data.loc) {
            const [latStr, lngStr] = data.loc.split(',');
            let lat = parseFloat(latStr);
            let lng = parseFloat(lngStr);
            
            if (!isLocInIndia(lat, lng)) {
              console.log('[GPS] ipinfo IP location is outside India (NL/dev VM). Defaulting to Mumbai.');
              lat = 19.0758;
              lng = 72.8770;
            }
            
            setCoords({ latitude: lat, longitude: lng });
            setGpsLocked(true);
            
            const fallbackAddress = lat === 19.0758 ? 'Phoenix Marketcity, Kurla, Mumbai' : `${data.city || ''}, ${data.region || ''}, ${data.country || ''}`;
            setAddress(fallbackAddress);
            console.log('[GPS] IP-based location acquired (ipinfo):', lat, lng, fallbackAddress);
            
            if (lat !== 19.0758) {
              try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                if (geoRes.ok) {
                  const geoData = await geoRes.json();
                  if (geoData && geoData.display_name) {
                    setAddress(geoData.display_name);
                  }
                }
              } catch (e) {}
            }
            return;
          }
        }
      } catch (ipinfoErr) {
        console.warn('[GPS] ipinfo fallback failed:', ipinfoErr);
      }

      Alert.alert('GPS Timeout', 'Unable to auto-detect location. Defaulting to Mumbai.');
      setCoords({ latitude: 19.0758, longitude: 72.8770 });
      setAddress('Phoenix Marketcity, Kurla, Mumbai');
    };

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          let lat = position.coords.latitude;
          let lng = position.coords.longitude;
          
          if (!isLocInIndia(lat, lng)) {
            console.log('[GPS] Hardware location is outside India (NL/dev VM). Defaulting to Mumbai.');
            lat = 19.0758;
            lng = 72.8770;
          }
          
          setCoords({ latitude: lat, longitude: lng });
          setGpsLocked(true);
          console.log('[GPS] Real location acquired:', lat, lng);

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.display_name) {
                setAddress(data.display_name);
                console.log('[GPS] Reverse-geocoded address:', data.display_name);
              }
            }
          } catch (geoErr) {
            console.warn('[GPS] Geocoding service error:', geoErr);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.log('[GPS] High accuracy failed, trying low accuracy...', error.message);
          
          navigator.geolocation.getCurrentPosition(
            async (lowPos) => {
              let lat = lowPos.coords.latitude;
              let lng = lowPos.coords.longitude;
              
              if (!isLocInIndia(lat, lng)) {
                console.log('[GPS] Hardware location is outside India (NL/dev VM). Defaulting to Mumbai.');
                lat = 19.0758;
                lng = 72.8770;
              }
              
              setCoords({ latitude: lat, longitude: lng });
              setGpsLocked(true);
              
              try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                if (res.ok) {
                  const data = await res.json();
                  if (data && data.display_name) {
                    setAddress(data.display_name);
                  }
                }
              } catch (e) {} finally {
                setLoading(false);
              }
            },
            async (lowErr) => {
              await useIPFallback(lowErr.message);
              setLoading(false);
            },
            { enableHighAccuracy: false, timeout: 5000 }
          );
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      useIPFallback('Geolocation API unsupported').then(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (gpsLocked) {
      fetchCurrentGPSLocation();
    }
  }, [gpsLocked]);

  const handleTextChange = (text: string) => {
    setAddress(text);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!text.trim() || text.length < 3) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data || []);
        }
      } catch (err) {
        console.warn('[Suggestions] Autocomplete error:', err);
      }
    }, 400);
    setSearchTimeout(timeout);
  };

  const selectSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setCoords({ latitude: lat, longitude: lng });
    setAddress(item.display_name);
    setSuggestions([]);
    setGpsLocked(false);
    console.log('[Suggestions] Selected suggestion:', lat, lng, item.display_name);
  };

  const handleSearchLocation = async () => {
    if (!address.trim()) {
      Alert.alert('Empty Search', 'Please enter a location/address to search.');
      return;
    }

    setLoading(true);
    try {
      console.log('[GPS] Searching for address:', address);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          const displayName = data[0].display_name;

          setCoords({ latitude: lat, longitude: lng });
          setAddress(displayName);
          setGpsLocked(false); // Switch to manual pointer mode since they searched manually
          setSuggestions([]);
          console.log('[GPS] Search location resolved:', lat, lng, displayName);
          Alert.alert('Location Found', `Successfully resolved location: ${data[0].name || 'Selected Place'}`);
        } else {
          Alert.alert('No Results', 'We could not find any locations matching your search. Please be more specific.');
        }
      } else {
        Alert.alert('Search Error', 'Unable to search at the moment. Please try again.');
      }
    } catch (err: any) {
      console.warn('[GPS] Search error:', err.message);
      Alert.alert('Search Failed', 'An error occurred while looking up the address.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLocation = async () => {
    if (!address.trim()) {
      Alert.alert('Address Required', 'Please type in your current address or landmark.');
      return;
    }

    setLoading(true);
    try {
      // 1. Commit coordinates and address text to central AppContext state
      setCoordinatesAndAddress({ latitude: coords.latitude, longitude: coords.longitude }, address);

      // 2. Fetch live dynamically routed pricing estimates using production Google Maps service!
      const estimate = await ApiService.getPriceEstimate(
        selectedService,
        selectedVehicle,
        coords.latitude,
        coords.longitude
      );

      // 3. Save price breakdown to context state
      setPriceEstimate(estimate);

      // 4. Proceed to price review screen
      navigate('pricePreview');
    } catch (error: any) {
      console.warn('[PricingFallback] Pricing estimation error:', error.message);
      
      // Zero-install dev bypass calculations fallback
      const base = selectedService === 'PUNCTURE' ? 80 : (selectedService === 'FUEL' ? 150 : 200);
      const perKm = selectedVehicle === 'BIKE' ? 10 : 15;
      const distanceMock = 2.4;
      const total = base + (distanceMock * perKm);
      
      setPriceEstimate({
        basePrice: base,
        distanceCharge: distanceMock * perKm,
        totalPrice: total,
        platformCommission: total * 0.20,
        providerEarning: total * 0.80,
        distanceKm: distanceMock,
        source: 'fallback'
      });
      navigate('pricePreview');
    } finally {
      setLoading(false);
    }
  };

  const toggleGps = () => {
    setGpsLocked(prev => !prev);
    if (!gpsLocked) {
      setAddress('Phoenix Marketcity, Kurla, Mumbai');
    } else {
      setAddress('');
      Alert.alert('GPS Released', 'Please type your current location landmark manually below.');
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Set Incident Location" 
        onBack={() => navigate('serviceSelection')}
      />

      <View style={styles.mapCanvas}>
        {Platform.OS === 'web' ? (
          <iframe
            key={`${coords.latitude}-${coords.longitude}`}
            src={`https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&z=16&output=embed`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              opacity: 0.7,
            } as any}
            title="Real-Time Incident Map"
          />
        ) : null}

        {/* Beautiful high-end vector art visual mock of GPS locator pin */}
        <View style={styles.locatorRing}>
          <View style={styles.locatorCenter}>
            <Text style={styles.pinIcon}>⊕</Text>
          </View>
        </View>
        
        <View style={styles.mapOverlayDetails}>
          <Text style={styles.overlayTitle}>
            {gpsLocked ? 'GPS Tracker Active' : 'Manual Pointer Active'}
          </Text>
           <Text style={styles.overlaySub}>
            Incident Coords: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.gpsBtn, gpsLocked && styles.gpsBtnActive]} 
          onPress={toggleGps}
          activeOpacity={0.7}
        >
          <Text style={[styles.gpsBtnText, gpsLocked && styles.gpsBtnTextActive]}>
            {gpsLocked ? '⚡ GPS ACTIVE' : '🛰️ AUTO-DETECT GPS'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.locationFab} 
          onPress={fetchCurrentGPSLocation}
          activeOpacity={0.8}
        >
          <Text style={styles.locationFabIcon}>🎯</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlSheet}>
        <View style={styles.searchContainer}>
          <View style={styles.searchRow}>
            <Input
              label="Roadside Pickup Landmark / Address"
              placeholder="e.g. Phoenix Marketcity Mall Gate 2"
              value={address}
              onChangeText={handleTextChange}
              maxLength={120}
              containerStyle={{ flex: 1, marginBottom: 0 }}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearchLocation} activeOpacity={0.8}>
              <Text style={styles.searchBtnText}>🔍 Search</Text>
            </TouchableOpacity>
          </View>

          {suggestions.length > 0 && (
            <View style={styles.suggestionsDropdown}>
              {suggestions.map((item: any, index: number) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.suggestionItem}
                  onPress={() => selectSuggestion(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.suggestionPin}>📍</Text>
                  <View style={styles.suggestionTextContainer}>
                    <Text style={styles.suggestionName} numberOfLines={1}>
                      {item.name || (item.display_name && item.display_name.split(',')[0])}
                    </Text>
                    <Text style={styles.suggestionFull} numberOfLines={1}>
                      {item.display_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Button
          title="Confirm Location Landmark"
          loading={loading}
          onPress={handleConfirmLocation}
          style={styles.confirmBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  locatorRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    zIndex: 5,
  },
  locatorCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  pinIcon: {
    color: 'white',
    fontSize: 28,
    fontWeight: '600',
  },
  mapOverlayDetails: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    zIndex: 10,
  },
  overlayTitle: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  overlaySub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  gpsBtn: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderWidth: 1.5,
    borderColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    zIndex: 10,
  },
  gpsBtnActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e293b',
  },
  gpsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  gpsBtnTextActive: {
    color: '#60a5fa',
  },
  locationFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  locationFabIcon: {
    fontSize: 22,
    color: 'white',
  },
  controlSheet: {
    backgroundColor: '#131a2b',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  searchBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  searchBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmBtn: {
    marginTop: 8,
  },
  searchContainer: {
    width: '100%',
    position: 'relative',
    zIndex: 20,
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: 76, 
    left: 0,
    right: 0,
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  suggestionPin: {
    fontSize: 16,
    marginRight: 10,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionName: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  suggestionFull: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
});
