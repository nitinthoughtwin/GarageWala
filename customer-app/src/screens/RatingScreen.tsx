import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Alert } from '../services/alert';
import { useApp } from '../store/AppContext';
import { ApiService } from '../services/api';
import { Header } from '../components/Header';
import { Button } from '../components/Button';

interface RatingScreenProps {
  navigate: (screen: any) => void;
}

export default function RatingScreen({ navigate }: RatingScreenProps) {
  const { token, activeOrder, user, assignedProvider, setActiveOrder, setAssignedProvider } = useApp();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitRating = async () => {
    if (!token || !activeOrder || !user) {
      Alert.alert('Session Expired', 'Invalid rating payload.');
      navigate('home');
      return;
    }

    setLoading(true);
    try {
      const ratingDetails = {
        orderId: activeOrder.id,
        userId: user.id,
        rating: rating,
        review: review,
      };

      await ApiService.submitRating(token, ratingDetails);
      Alert.alert('Feedback Submitted', 'Thank you for your rating! Helping keep mechanics verified.');
      
      // Clear active states
      setActiveOrder(null);
      setAssignedProvider(null);
      navigate('home');
    } catch (error: any) {
      console.warn('[RatingFallback] Rating submission error:', error.message);
      
      // Fallback reset
      setActiveOrder(null);
      setAssignedProvider(null);
      navigate('home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <Header title="Feedback & Review" />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rate {assignedProvider?.name || 'Ramesh Puncture Wala'}</Text>
          <Text style={styles.cardSub}>How was your emergency assistance service today?</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((starIdx) => (
              <TouchableOpacity 
                key={starIdx} 
                onPress={() => setRating(starIdx)}
                activeOpacity={0.7}
              >
                <Text style={[styles.starIcon, starIdx <= rating && styles.starIconActive]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.reviewWrapper}>
            <TextInput
              placeholder="Write a quick comment about the mechanic's response time or repair quality..."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={4}
              value={review}
              onChangeText={setReview}
              style={styles.reviewInput}
              maxLength={200}
            />
          </View>

          <Button
            title="Submit Feedback & Settle"
            loading={loading}
            onPress={handleSubmitRating}
            style={styles.submitBtn}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#131a2b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
  },
  cardSub: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  starIcon: {
    fontSize: 40,
    color: '#1e293b',
  },
  starIconActive: {
    color: '#f59e0b',
  },
  reviewWrapper: {
    width: '100%',
    backgroundColor: '#0b0f19',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    height: 120,
    marginBottom: 28,
  },
  reviewInput: {
    color: 'white',
    fontSize: 13,
    height: '100%',
    textAlignVertical: 'top',
  },
  submitBtn: {
    width: '100%',
  },
});
