import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import {  Home, MailOpen, Search, User } from 'lucide-react-native';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarActiveBackgroundColor: 'black',
        headerShown: false,
        tabBarStyle: [styles.tabBar,Platform.select({
          
          ios: { position: 'absolute' },
          default: { backgroundColor: 'black' },
        }),]
      }}
    >
    
      <Tabs.Screen
        name="index"
        
        options={{
          
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Home fill={focused ? 'white' : ''} color={'white'} size={24} />
              {focused && <View style={styles.activeIndicator} />}
              
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Search fill={focused ? 'white' : ''} color={'white'} size={24} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="donor"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <MailOpen strokeWidth={focused ? 3 : 2} color={'white'} size={24} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <User fill={focused ? 'white' : ''} color={'white'} size={24} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = {
  activeIndicator: {
    width: 70,
    height: 1,
    backgroundColor: 'white',
    marginTop: 2,
    borderRadius: 3,
  },
  tabBar: {
    backgroundColor: 'black',
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    height: 60,
    paddingBottom: Platform.OS === 'ios' ? 20 : 5,
    paddingTop: 5,
  },
};
