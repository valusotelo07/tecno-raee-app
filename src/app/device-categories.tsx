import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ActionButton } from '@/components/ui/ActionButton';
import type { DeviceCategory } from '@/models/DeviceCategory';
import { getDeviceCategories } from '@/services/device-category.service';
import { colors, fonts } from '@/theme';
import { brand } from '@/config/brand';
import { useScrollReset } from '@/hooks/useScrollReset';

export default function DeviceCategoriesScreen() {
  const scroll = useScrollReset();
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    void getDeviceCategories()
      .then((items) => {
        if (!cancelled) setCategories(items);
      })
      .catch(() => {
        if (!cancelled) setError('No pudimos cargar las categorías. Intentá nuevamente.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [revision]);
  return (
    <View style={styles.container}>
      <ScreenHeader title="Qué recibimos" back="/profile" />
      <ScrollView ref={scroll} contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Estas son las categorías de {brand.name}. Cada punto verde define cuáles recibe.
        </Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error ? (
          <View style={styles.error}>
            <Text style={styles.description}>{error}</Text>
            <ActionButton
              title="Reintentar"
              onPress={() => {
                setLoading(true);
                setError(null);
                setRevision(revision + 1);
              }}
            />
          </View>
        ) : categories.length === 0 ? (
          <Text style={styles.description}>Todavía no hay categorías disponibles.</Text>
        ) : (
          categories.map((category) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Buscar puntos que reciben ${category.name}`}
              onPress={() =>
                router.push({ pathname: '/green-points', params: { category: category.id } })
              }
              key={category.id}
              style={styles.row}
            >
              <Text style={styles.name}>{category.name}</Text>
              <Ionicons name="chevron-forward" color={colors.primary} size={20} />
            </Pressable>
          ))
        )}
        <ActionButton title="Volver al inicio" secondary onPress={() => router.replace('/home')} />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    padding: 24,
    gap: 20,
  },
  description: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.text },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text, flex: 1 },
  error: { gap: 16 },
});
