import { Tabs } from 'expo-router'
import { Text, type ColorValue } from 'react-native'
import { useApp } from '@/context/app-context'
import { t } from '@/i18n'
import { colors } from '@/theme'

const TabIcon = ({ symbol, color }: { symbol: string; color: ColorValue }) => (
  <Text style={{ color, fontSize: 18 }}>{symbol}</Text>
)

export default function TabLayout() {
  const app = useApp()

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: 'SpaceGrotesk_700Bold' },
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 78,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: 'SpaceGrotesk_500Medium',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t(app.language, 'home'),
          tabBarIcon: ({ color }) => <TabIcon symbol="⌂" color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: t(app.language, 'plan'),
          tabBarIcon: ({ color }) => <TabIcon symbol="≡" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t(app.language, 'scan'),
          tabBarIcon: ({ color }) => <TabIcon symbol="⌗" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t(app.language, 'progress'),
          tabBarIcon: ({ color }) => <TabIcon symbol="↗" color={color} />,
        }}
      />
    </Tabs>
  )
}
