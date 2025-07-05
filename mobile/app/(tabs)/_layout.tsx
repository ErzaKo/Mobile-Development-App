import { Tabs } from 'expo-router';
import React from 'react';
import { Text, Image } from 'react-native';
import BurgerMenu from '../../components/BurgerMenu';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerLeft: () => (
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={{ width: 150, height: 40, marginLeft: -40 }}
            resizeMode="contain"
          />
        ),
        headerRight: () => <BurgerMenu />,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="createEvent"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>➕</Text>,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            const { router } = require('expo-router');
            router.push('/createEvent');
          },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: 'Contact',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text>,
        }}
      />
    </Tabs>
  );
}
