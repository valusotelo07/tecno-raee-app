import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useEffect, useRef, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '@/components/auth/Logo';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors, fonts } from '@/theme';

export const portalStyles = StyleSheet.create({
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 36, color: colors.text },
  subtitle: { fontFamily: fonts.semiBold, fontSize: 20, lineHeight: 28, color: colors.brandDark },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.brandDark },
  hint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: colors.brandDark },
  section: { gap: 16, paddingVertical: 24, borderTopWidth: 1, borderTopColor: colors.border },
  row: { gap: 8, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  stack: { gap: 16 },
  link: { fontFamily: fonts.semiBold, color: colors.primary, fontSize: 15 },
  error: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.danger },
});
export function PortalPage({
  title,
  subtitle,
  children,
  back,
}: Readonly<{ title: string; subtitle?: string; children: ReactNode; back?: Href }>) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 24,
          width: '100%',
          maxWidth: 960,
          alignSelf: 'center',
          gap: 24,
          flexGrow: 1,
        }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Logo compact />
          {back && <PortalLink title="Volver" onPress={() => router.replace(back)} />}
        </View>
        <View style={{ gap: 8 }}>
          <Text accessibilityRole="header" style={portalStyles.title}>
            {title}
          </Text>
          {subtitle && <Text style={portalStyles.body}>{subtitle}</Text>}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function PortalLink({
  title,
  onPress,
  disabled = false,
}: Readonly<{ title: string; onPress: () => void; disabled?: boolean }>) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        justifyContent: 'center',
        opacity: pressed || disabled ? 0.6 : 1,
      })}
    >
      <Text style={portalStyles.link}>{title}</Text>
    </Pressable>
  );
}
export function PortalField({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={portalStyles.body}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize="none"
        placeholderTextColor={colors.textSecondary}
        {...props}
        style={[
          {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            backgroundColor: colors.surface,
            minHeight: 48,
            padding: 12,
            fontFamily: fonts.regular,
            fontSize: 15,
            color: colors.text,
          },
          props.multiline && { minHeight: 90, textAlignVertical: 'top' },
          props.style,
        ]}
      />
    </View>
  );
}
export function PortalToggle({
  label,
  value,
  onChange,
  disabled = false,
}: Readonly<{
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}>) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        minHeight: 44,
      }}
    >
      <Text style={[portalStyles.body, { flex: 1 }]}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ true: colors.primary }}
      />
    </View>
  );
}
export function PortalChoice({
  label,
  selected,
  onPress,
  disabled = false,
}: Readonly<{ label: string; selected: boolean; onPress: () => void; disabled?: boolean }>) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{ flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 44 }}
    >
      <Ionicons
        name={selected ? 'checkbox-outline' : 'square-outline'}
        size={22}
        color={colors.primary}
      />
      <Text style={portalStyles.body}>{label}</Text>
    </Pressable>
  );
}
export function PortalFeedback({
  error,
  notice,
}: Readonly<{ error?: string | null; notice?: string | null }>) {
  return (
    <>
      {error && (
        <Text accessibilityRole="alert" style={portalStyles.error}>
          {error}
        </Text>
      )}
      {notice && (
        <Text accessibilityLiveRegion="polite" style={portalStyles.body}>
          {notice}
        </Text>
      )}
    </>
  );
}
export function PortalLoading({
  loading,
  error,
  retry,
}: Readonly<{ loading: boolean; error: string | null; retry: () => void }>) {
  return (
    <>
      {loading && <ActivityIndicator color={colors.primary} accessibilityLabel="Cargando datos" />}
      {error && (
        <View style={portalStyles.stack}>
          <PortalFeedback error={error} />
          <ActionButton secondary title="Reintentar" onPress={retry} />
        </View>
      )}
    </>
  );
}
export function PortalNav({
  items,
  selected,
  onSelect,
}: Readonly<{ items: readonly string[]; selected: string; onSelect: (item: string) => void }>) {
  const scroll = useRef<ScrollView>(null);
  const positions = useRef<Record<string, number>>({});
  useEffect(() => {
    scroll.current?.scrollTo({
      x: Math.max(0, (positions.current[selected] ?? 0) - 24),
      animated: false,
    });
  }, [selected]);
  return (
    <ScrollView
      ref={scroll}
      onLayout={() =>
        scroll.current?.scrollTo({
          x: Math.max(0, (positions.current[selected] ?? 0) - 24),
          animated: false,
        })
      }
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, flexShrink: 0 }}
      contentContainerStyle={{ flexGrow: 1 }}
      accessibilityRole="tablist"
    >
      <View
        style={{
          flexDirection: 'row',
          flexGrow: 1,
          gap: 24,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {items.map((item) => (
          <Pressable
            key={item}
            onLayout={(event) => {
              positions.current[item] = event.nativeEvent.layout.x;
              if (item === selected)
                scroll.current?.scrollTo({
                  x: Math.max(0, event.nativeEvent.layout.x - 24),
                  animated: false,
                });
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: item === selected }}
            onPress={() => onSelect(item)}
            style={{
              minHeight: 48,
              justifyContent: 'center',
              borderBottomWidth: item === selected ? 2 : 0,
              borderBottomColor: colors.primary,
            }}
          >
            <Text
              style={[
                portalStyles.link,
                { color: item === selected ? colors.primary : colors.brandDark },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
