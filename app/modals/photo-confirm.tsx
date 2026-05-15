import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useHicStore } from '../../store';
import { ScreenHeader } from '../../components/chrome/ScreenHeader';
import { Button } from '../../components/primitives/Button';
import { Input } from '../../components/primitives/Input';

const MEALS = ['Desayuno', 'Snack', 'Comida', 'Cena'];
const MOODS = ['😋', '🙂', '😐', '😕'];
const PORTIONS = ['Poco', 'Normal', 'Mucho'];

export default function PhotoConfirmScreen() {
  const navigationContext = useHicStore((s) => s.navigationContext);
  const addPhoto = useHicStore((s) => s.addPhoto);
  const clearNavigationContext = useHicStore((s) => s.clearNavigationContext);

  // The photo URI is passed via navigationContext.modalMessage
  const photoUri = navigationContext.modalMessage ?? null;

  const [meal, setMeal] = useState('Comida');
  const [mood, setMood] = useState(0);
  const [portion, setPortion] = useState('Normal');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await addPhoto({
        uri: photoUri ?? '',
        meal,
        mood: MOODS[mood],
        portion,
        note,
        created_at: new Date().toISOString(),
      });
      clearNavigationContext();
      router.replace('/(tabs)/fotos');
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar la foto. Intenta de nuevo.');
      setSaving(false);
    }
  };

  const handleRetake = () => {
    clearNavigationContext();
    router.replace('/modals/camera');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Tu comida"
        subtitle="Confirma los detalles"
        showBack
        onBack={handleRetake}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo preview */}
        <View style={styles.preview}>
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Text style={{ fontSize: 72 }}>🍽️</Text>
            </View>
          )}
        </View>

        {/* Meal type */}
        <Text style={styles.sectionLabel}>¿Qué comida es?</Text>
        <View style={styles.row}>
          {MEALS.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMeal(m)}
              style={[styles.chip, meal === m && styles.chipActive]}
            >
              <Text style={[styles.chipText, meal === m && styles.chipTextActive]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mood */}
        <Text style={styles.sectionLabel}>¿Cómo te sentiste?</Text>
        <View style={styles.row}>
          {MOODS.map((e, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setMood(i)}
              style={[styles.moodBtn, mood === i && styles.moodBtnActive]}
            >
              <Text style={{ fontSize: 28 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Portion */}
        <Text style={styles.sectionLabel}>Porción</Text>
        <View style={styles.row}>
          {PORTIONS.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPortion(p)}
              style={[styles.chip, { flex: 1 }, portion === p && styles.chipActive]}
            >
              <Text style={[styles.chipText, portion === p && styles.chipTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <View style={{ marginBottom: 24 }}>
          <Input
            label="Nota (opcional)"
            value={note}
            onChangeText={setNote}
            placeholder="Ej. Comí con mamá, ¡estaba rico!"
          />
        </View>

        <Button onPress={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar comida'}
        </Button>
        <View style={{ height: 10 }} />
        <Button variant="ghost" onPress={handleRetake}>
          Volver a tomar
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4f6',
  },
  scroll: {
    padding: 24,
    paddingBottom: 48,
  },
  preview: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#e8f8f4',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f8f4',
  },
  sectionLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#fdf0e8',
    borderColor: '#e87a3f',
  },
  chipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#70787c',
  },
  chipTextActive: {
    color: '#e87a3f',
  },
  moodBtn: {
    flex: 1,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodBtnActive: {
    backgroundColor: '#fdf0e8',
    borderColor: '#e87a3f',
  },
});
