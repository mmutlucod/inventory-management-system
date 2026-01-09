import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@providers/theme-provider';
import { useTranslation } from '@localization/use-translation';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  translationKey?: string; // 'products.noProducts' gibi
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'folder-open-outline',
  title,
  description,
  actionLabel,
  onAction,
  translationKey,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const displayTitle = translationKey ? t(translationKey) : title || t('common.error');

  return (
    <View style={styles.container}>
      <Ionicons
        name={icon}
        size={64}
        color={theme.colors.textDisabled}
        style={styles.icon}
      />
      
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {displayTitle}
      </Text>
      
      {description && (
        <Text
          style={[
            styles.description,
            { color: theme.colors.textSecondary },
          ]}
        >
          {description}
        </Text>
      )}
      
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
});