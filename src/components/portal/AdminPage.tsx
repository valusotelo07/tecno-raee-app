import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '@/components/auth/Logo';
import { PortalNav, portalStyles } from './PortalUI';
import { colors, fonts } from '@/theme';

export function AdminPage({
  name,
  sections,
  selected,
  onSelect,
  refresh,
  logout,
  busy,
  children,
}: Readonly<{
  name: string;
  sections: readonly string[];
  selected: string;
  onSelect: (section: string) => void;
  refresh: () => void;
  logout: () => void;
  busy: boolean;
  children: ReactNode;
}>) {
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <View style={styles.frame}>
          <View style={styles.toolbar}>
            <Logo compact />
            <View style={styles.tools}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Actualizar datos"
                disabled={busy}
                onPress={refresh}
                style={styles.iconButton}
              >
                <Ionicons name="refresh-outline" size={20} color={colors.primary} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar sesión"
                disabled={busy}
                onPress={logout}
                style={styles.iconButton}
              >
                <Ionicons name="log-out-outline" size={20} color={colors.primary} />
              </Pressable>
            </View>
          </View>
          <View style={styles.heading}>
            <Text accessibilityRole="header" style={styles.title}>
              Administración
            </Text>
            <Text style={portalStyles.body}>{name}</Text>
          </View>
          <PortalNav items={sections} selected={selected} onSelect={onSelect} />
        </View>
      </View>
      <ScrollView
        key={selected}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.sectionHeading}>
          <Text accessibilityRole="header" style={portalStyles.subtitle}>
            {selected}
          </Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function AdminEmpty({
  title,
  description,
}: Readonly<{ title: string; description: string }>) {
  return (
    <View style={styles.empty}>
      <Ionicons name="checkmark-circle-outline" color={colors.primary} size={28} />
      <Text style={portalStyles.subtitle}>{title}</Text>
      <Text style={portalStyles.body}>{description}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  frame: { width: '100%', maxWidth: 1008, alignSelf: 'center', paddingHorizontal: 24 },
  toolbar: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tools: { flexDirection: 'row', gap: 8 },
  iconButton: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' },
  heading: { gap: 4, paddingBottom: 16 },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 36, color: colors.text },
  content: { width: '100%', maxWidth: 1008, alignSelf: 'center', padding: 24, gap: 24 },
  sectionHeading: { paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  empty: { gap: 12, paddingVertical: 32, maxWidth: 560 },
});
