import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  TextInputProps, 
  ViewStyle, 
  TextStyle 
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input = ({
  label,
  error,
  containerStyle,
  inputStyle,
  ...props
}: InputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, !!error && styles.errorInput]}>
        <TextInput
          placeholderTextColor="#64748b"
          style={[styles.input, inputStyle]}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inputWrapper: {
    backgroundColor: '#131a2b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  input: {
    color: 'white',
    fontSize: 14,
    height: '100%',
  },
  errorInput: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});
