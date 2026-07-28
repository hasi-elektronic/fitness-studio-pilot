import * as Haptics from 'expo-haptics'
import type { ReactNode } from 'react'
import {
  Pressable,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native'
import { colors, radii } from '../theme'

export function ScreenTitle({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string
  title: string
  body?: string
}) {
  return (
    <View style={{ gap: 8 }}>
      {eyebrow ? (
        <Text
          selectable
          style={{
            color: colors.primary,
            fontFamily: 'SpaceGrotesk_700Bold',
            fontSize: 12,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </Text>
      ) : null}
      <Text
        selectable
        style={{
          color: colors.text,
          fontFamily: 'SpaceGrotesk_700Bold',
          fontSize: 34,
          lineHeight: 38,
        }}
      >
        {title}
      </Text>
      {body ? (
        <Text
          selectable
          style={{
            color: colors.muted,
            fontFamily: 'SpaceGrotesk_400Regular',
            fontSize: 16,
            lineHeight: 23,
          }}
        >
          {body}
        </Text>
      ) : null}
    </View>
  )
}

export function Card({
  children,
  style,
}: {
  children: ReactNode
  style?: ViewStyle
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radii.lg,
        borderCurve: 'continuous',
        borderWidth: 1,
        padding: 18,
        gap: 12,
        ...style,
      }}
    >
      {children}
    </View>
  )
}

export function ActionButton({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string
  onPress: () => void
  secondary?: boolean
  disabled?: boolean
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        if (process.env.EXPO_OS === 'ios') void Haptics.selectionAsync()
        onPress()
      }}
      style={({ pressed }) => ({
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        borderCurve: 'continuous',
        backgroundColor: secondary ? colors.surfaceRaised : colors.primary,
        borderColor: secondary ? colors.border : colors.primary,
        borderWidth: 1,
        opacity: disabled ? 0.4 : pressed ? 0.78 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
        paddingHorizontal: 18,
      })}
    >
      <Text
        style={{
          color: secondary ? colors.text : colors.background,
          fontFamily: 'SpaceGrotesk_700Bold',
          fontSize: 15,
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

export function Choice({
  title,
  body,
  selected,
  onPress,
}: {
  title: string
  body?: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={body ? `${title}. ${body}` : title}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 58,
        padding: 16,
        gap: 4,
        borderRadius: radii.md,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primaryDark : colors.surface,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text
        selectable
        style={{
          color: colors.text,
          fontFamily: 'SpaceGrotesk_700Bold',
          fontSize: 16,
        }}
      >
        {title}
      </Text>
      {body ? (
        <Text
          selectable
          style={{
            color: colors.muted,
            fontFamily: 'SpaceGrotesk_400Regular',
            fontSize: 13,
          }}
        >
          {body}
        </Text>
      ) : null}
    </Pressable>
  )
}

export const labelStyle: TextStyle = {
  color: colors.muted,
  fontFamily: 'SpaceGrotesk_500Medium',
  fontSize: 13,
}
