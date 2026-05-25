import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ViewStyle 
} from 'react-native';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  onRightAction?: () => void;
  rightActionText?: string;
  style?: ViewStyle;
}

export const Header = ({
  title,
  onBack,
  onRightAction,
  rightActionText,
  style
}: HeaderProps) => {
  return (
    <View style={[styles.container, style]}>
      {onBack ? (
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {onRightAction && rightActionText ? (
        <TouchableOpacity style={styles.rightBtn} onPress={onRightAction} activeOpacity={0.7}>
          <Text style={styles.rightBtnText}>{rightActionText}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#0b0f19',
    marginTop: 20, // offset status bar
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
  },
  backArrow: {
    color: '#3b82f6',
    fontSize: 20,
    fontWeight: '700',
  },
  backText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  rightBtn: {
    width: 70,
    alignItems: 'flex-end',
  },
  rightBtnText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  placeholder: {
    width: 70,
  },
});
