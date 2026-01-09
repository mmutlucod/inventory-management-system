import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@providers/theme-provider';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text,
  size = 'large',
  fullScreen = false,
}) => {
  const { theme } = useTheme();

  const content = (
    <>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {text && (
        <Text
          style={[
            styles.text,
            { color: theme.colors.textSecondary, marginTop: 16 },
          ]}
        >
          {text}
        </Text>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <View
        style={[
          styles.fullScreenContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {content}
      </View>
    );
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
  },
});