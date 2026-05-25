import { Alert as RNAlert, Platform } from 'react-native';

export class Alert {
  static alert(title: string, message?: string, buttons?: any[], options?: any) {
    if (Platform.OS === 'web') {
      const formattedMessage = message ? `\n\n${message}` : '';
      const result = window.confirm(`${title}${formattedMessage}`);
      if (buttons && buttons.length > 0) {
        // If it's a confirmation (e.g. OK / Cancel)
        if (buttons.length === 2) {
          const cancelBtn = buttons.find(b => b.style === 'cancel');
          const okBtn = buttons.find(b => b.style !== 'cancel');
          if (result) {
            if (okBtn && typeof okBtn.onPress === 'function') {
              okBtn.onPress();
            }
          } else {
            if (cancelBtn && typeof cancelBtn.onPress === 'function') {
              cancelBtn.onPress();
            }
          }
        } else {
          // If it is just an alert, run the first onPress if ok
          const confirmBtn = buttons.find(b => b.style !== 'cancel') || buttons[0];
          if (confirmBtn && typeof confirmBtn.onPress === 'function') {
            confirmBtn.onPress();
          }
        }
      }
    } else {
      RNAlert.alert(title, message, buttons, options);
    }
  }
}
