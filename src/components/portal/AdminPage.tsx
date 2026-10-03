import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import type { Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { PortalNav, portalStyles } from './PortalUI';
import { colors } from '@/theme';
import { useScrollReset } from '@/hooks/useScrollReset';

export function AdminPage({
  title = 'Administración',
  back = '/',
  name,
  sections,
  selected,
  onSelect,
  refresh,
  logout,
  busy,
  children,
}: Readonly<{
  title?: string;
  back?: Href;
  name: string;
  sections: readonly string[];
  selected: string;
  onSelect: (section: string) => void;
  refresh: () => void;
  logout: () => void;
  busy: boolean;
  children: ReactNode;
}>) {
  const scroll = useScrollReset();
  return (
    <View style={styles.page}>
      <ScreenHeader title={title} back={back} />
      <View style={styles.header}>
        <View style={styles.frame}>
          <View style={styles.toolbar}>
            <Text numberOfLines={2} style={[portalStyles.body, { flex: 1 }]}>
              {name}
            </Text>
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
          <PortalNav items={sections} selected={selected} onSelect={onSelect} />
        </View>
      </View>
      <ScrollView
        ref={scroll}
        key={selected}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.panel}>
          <View style={styles.sectionHeading}>
            <Text accessibilityRole="header" style={portalStyles.subtitle}>
              {selected}
            </Text>
          </View>
          {children}
        </View>
      </ScrollView>
    </View>
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
  frame: { width: '100%', maxWidth: 960, alignSelf: 'center', paddingHorizontal: 20 },
  toolbar: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  tools: { flexDirection: 'row', gap: 8 },
  iconButton: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' },
  content: { width: '100%', maxWidth: 960, alignSelf: 'center', padding: 16, paddingBottom: 32 },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 20,
    gap: 20,
  },
  sectionHeading: { paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  empty: { gap: 12, paddingVertical: 32, maxWidth: 560 },
});
