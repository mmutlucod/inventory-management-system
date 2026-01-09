import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { useTheme } from '@providers/theme-provider';
import { useTranslation } from '@localization/use-translation';
import { AuthStackParamList } from './types';
import { WelcomeScreen } from '@screens/auth/welcome-screen';
import { LoginScreen } from '@screens/auth/login-screen';
import { RegisterScreen } from '@screens/auth/register-screen';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: t('auth.login') }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: t('auth.register') }}
      />
    </Stack.Navigator>
  );
};