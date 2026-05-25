import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TextInputProps 
} from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
}

export const Input = ({ label, ...props }: InputProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input, 
          focused && styles.inputFocused
        ]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor="#475569"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#131a2b',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: 'white',
    fontSize: 14,
  },
  inputFocused: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.02)',
  },
});
