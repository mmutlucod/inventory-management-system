import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@providers/theme-provider';
import { useTranslation } from '@localization/use-translation';
import { HomeScreen } from '@screens/home/home-screen';
import { ProductListScreen } from '@screens/products/product-list-screen';
import { ProductDetailScreen } from '@screens/products/product-detail-screen';
import { AddEditProductScreen } from '@screens/products/add-edit-product-screen';
import { StockUpdateScreen } from '@screens/products/stock-update-screen';
import { BarcodeScannerScreen } from '@screens/scanner/barcode-scanner-screen';
import { SyncScreen } from '@screens/sync/sync-screen';
import { SettingsScreen } from '@screens/settings/settings-screen';

import {
  MainTabParamList,
  HomeStackParamList,
  ProductsStackParamList,
  ScannerStackParamList,
  SyncStackParamList,
  SettingsStackParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const ProductsStack = createStackNavigator<ProductsStackParamList>();
const ScannerStack = createStackNavigator<ScannerStackParamList>();
const SyncStack = createStackNavigator<SyncStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();

const HomeStackNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '600', fontSize: 18 },
      }}
    >
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: t('home.title') }}
      />
    </HomeStack.Navigator>
  );
};

const ProductsStackNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <ProductsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '600', fontSize: 18 },
      }}
    >
      <ProductsStack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ title: t('products.title') }}
      />
      <ProductsStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: t('products.productDetail') }}
      />
      <ProductsStack.Screen
        name="AddEditProduct"
        component={AddEditProductScreen}
        options={({ route }) => ({
          title: route.params?.productId ? t('products.editProduct') : t('products.newProduct'),
        })}
      />
      <ProductsStack.Screen
        name="StockUpdate"
        component={StockUpdateScreen}
        options={{ title: t('stock.updateStock') }}
      />
    </ProductsStack.Navigator>
  );
};

const ScannerStackNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <ScannerStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '600', fontSize: 18 },
      }}
    >
      <ScannerStack.Screen
        name="ScannerMain"
        component={BarcodeScannerScreen}
        options={{ title: t('scanner.title') }}
      />
      <ScannerStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: t('products.productDetail') }}
      />
      <ScannerStack.Screen
        name="AddEditProduct"
        component={AddEditProductScreen}
        options={({ route }) => ({
          title: route.params?.productId ? t('products.editProduct') : t('products.newProduct'),
        })}
      />
    </ScannerStack.Navigator>
  );
};

const SyncStackNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <SyncStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '600', fontSize: 18 },
      }}
    >
      <SyncStack.Screen
        name="SyncMain"
        component={SyncScreen}
        options={{ title: t('sync.title') }}
      />
    </SyncStack.Navigator>
  );
};

const SettingsStackNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '600', fontSize: 18 },
      }}
    >
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: t('settings.title') }}
      />
    </SettingsStack.Navigator>
  );
};

export const MainNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: t('navigation.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsStackNavigator}
        options={{
          title: t('navigation.products'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerStackNavigator}
        options={{
          title: t('navigation.scan'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Sync"
        component={SyncStackNavigator}
        options={{
          title: t('navigation.sync'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sync" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          title: t('navigation.settings'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};