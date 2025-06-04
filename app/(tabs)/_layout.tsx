import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { Home, Search, MailOpen, User } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#EF4444",       // accent red
        tabBarInactiveTintColor: "#9CA3AF",     // neutral gray
        tabBarStyle: [
          styles.tabBar,
         
        ],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <IconWithIndicator focused={focused}>
              <Home size={24} color={color} />
            </IconWithIndicator>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <IconWithIndicator focused={focused}>
              <Search size={24} color={color} />
            </IconWithIndicator>
          ),
        }}
      />
      <Tabs.Screen
        name="donor"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <IconWithIndicator focused={focused}>
              <MailOpen size={24} color={color} />
            </IconWithIndicator>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <IconWithIndicator focused={focused}>
              <User size={24} color={color} />
            </IconWithIndicator>
          ),
        }}
      />
    </Tabs>
  );
}

const IconWithIndicator = ({
  children,
  focused,
}: {
  children: React.ReactNode;
  focused: boolean;
}) => (
  <View style={{ alignItems: "center" }}>
    {children}
    {focused && <View style={styles.activeIndicator} />}
  </View>
);

const styles = {
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    elevation: 12,                // Android shadow
    height: 64,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  iosTabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 30,
  },
  activeIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#EF4444",
    marginTop: 4,
  },
};
