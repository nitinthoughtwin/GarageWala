import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Platform 
} from 'react-native';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  onRightAction?: () => void;
  rightActionText?: string;
}

export const Header = ({
  title,
  onBack,
  onRightAction,
  rightActionText
}: HeaderProps) => {
  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {onRightAction && rightActionText ? (
        <TouchableOpacity style={styles.rightBtn} onPress={onRightAction} activeOpacity={0.7}>
          <Text style={styles.rightText}>{rightActionText}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'ios' ? 56 : 60,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0b0f17',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
  },
  backBtn: {
    padding: 8,
  },
  backIcon: {
    color: '#10b981',
    fontSize: 22,
    fontWeight: '800',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  rightBtn: {
    padding: 8,
  },
  rightText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
});
