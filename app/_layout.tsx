import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import React, { useState, useEffect } from 'react';
import 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [initialRoute, setInitialRoute] = useState('index');
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await supabase.auth.session();
        //console.log('Supabase session:', session);
        if (session && session.user && session.user.email_confirmed_at) {
          setInitialRoute('(tabs)');
        } else {
          setInitialRoute('index');
        }
      } catch (e) {
        console.error('Error checking session:', e);
        setInitialRoute('index');
      } finally {
        setIsCheckingSession(false);
      }
    }
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user && session.user.email_confirmed_at) {
        setInitialRoute('(tabs)');
      } else {
        setInitialRoute('index');
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  if (!loaded || isCheckingSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#B71C1C" />
      </View>
    );
  }

  return (
    <GluestackUIProvider mode="light">
      <Stack initialRouteName={initialRoute}>
        <Stack.Screen name="index" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="drawer" options={{ headerShown: false, animation: 'slide_from_left' }} />
        <Stack.Screen name="doctors" options={{ headerShown: true,headerStyle:{backgroundColor:'black'},headerTitle:'Doctors',headerTitleAlign:'center',headerTintColor:'white', animation: 'slide_from_left' }} />
        <Stack.Screen name="hospitals" options={{ headerShown: true, headerStyle:{backgroundColor:'black'},headerTitle:'Hospitals',headerTitleAlign:'center',headerTintColor:'white',animation: 'slide_from_left' }} />
        <Stack.Screen name="doctorsdetails" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="hospitaldetails" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="signin" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="Auth" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="registeration" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </GluestackUIProvider>
  );
}
