import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useHicStore } from '../../store';
import { deletePhoto } from '../../db/photos';
import { Icon } from '../../components/primitives/Icon';

const { width } = Dimensions.get('window');

const MEAL_EMOJI: Record<string, string> = {
  Desayuno: '🌅',
  Snack: '🍎',
  Comida: '🍽️',
  Cena: '🌙',
};

const PORTION_LABEL: Record<string, { color: string; label: string }> = {
  Poco:   { color: '#19b78e', label: 'Porción pequeña' },
  Normal: { color: '#e87a3f', label: 'Porción normal' },
  Mucho:  { color: '#e05252', label: 'Porción grande' },
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function PhotoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const photos = useHicStore((s) => s.photos);
  const setPhotos = useHicStore((s) => s.setPhotos);
  const [deleting, setDeleting] = useState(false);

  const photo = photos.find((p) => String(p.id) === id);

  if (!photo) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Icon name="x" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Foto no encontrada</Text>
        </View>
      </View>
    );
  }

  const portion = PORTION_LABEL[photo.portion] ?? { color: '#70787c', label: photo.portion };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar foto',
      '¿Seguro que quieres eliminar esta foto? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deletePhoto(photo.id);
              const updated = photos.filter((p) => p.id !== photo.id);
              setPhotos(updated);
              router.back();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la foto.');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Full-width photo */}
      <View style={styles.photoContainer}>
        {photo.uri ? (
          <Image
            source={{ uri: photo.uri }}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={{ fontSize: 72 }}>🍽️</Text>
          </View>
        )}

        {/* Overlay buttons */}
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          disabled={deleting}
          style={styles.deleteBtn}
        >
          <Icon name="trash-2" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Details card */}
      <ScrollView
        style={styles.detailsScroll}
        contentContainerStyle={styles.detailsContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Meal + time row */}
        <View style={styles.headerRow}>
          <View style={styles.mealBadge}>
            <Text style={{ fontSize: 20 }}>{MEAL_EMOJI[photo.meal] ?? '🍽️'}</Text>
            <Text style={styles.mealText}>{photo.meal}</Text>
          </View>
          <Text style={styles.timeText}>{formatTime(photo.created_at)}</Text>
        </View>

        {/* Date */}
        <Text style={styles.dateText}>{formatDate(photo.created_at)}</Text>

        <View style={styles.divider} />

        {/* Mood + Portion */}
        <View style={styles.tagsRow}>
          {/* Mood */}
          <View style={styles.tag}>
            <Text style={styles.tagLabel}>Estado de ánimo</Text>
            <Text style={styles.moodEmoji}>{photo.mood}</Text>
          </View>

          {/* Portion */}
          <View style={[styles.tag, { flex: 1 }]}>
            <Text style={styles.tagLabel}>Porción</Text>
            <View style={[styles.portionChip, { backgroundColor: portion.color + '20', borderColor: portion.color }]}>
              <Text style={[styles.portionText, { color: portion.color }]}>{portion.label}</Text>
            </View>
          </View>
        </View>

        {/* Note */}
        {!!photo.note && (
          <View style={styles.noteBox}>
            <View style={styles.noteHeader}>
              <Icon name="message-circle" size={16} color="#70787c" />
              <Text style={styles.noteLabel}>Nota</Text>
            </View>
            <Text style={styles.noteText}>{photo.note}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4f6',
  },
  photoContainer: {
    width,
    height: width, // square photo
    backgroundColor: '#1a1a2e',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdf0e8',
  },
  closeBtn: {
    position: 'absolute',
    top: 52,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  deleteBtn: {
    position: 'absolute',
    top: 52,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(200,50,50,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: '#70787c',
  },
  detailsScroll: {
    flex: 1,
  },
  detailsContent: {
    padding: 24,
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  mealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 24,
    color: '#0f172a',
  },
  timeText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: '#70787c',
  },
  dateText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: '#70787c',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  tag: {
    gap: 8,
  },
  tagLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#70787c',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moodEmoji: {
    fontSize: 32,
  },
  portionChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  portionText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
  },
  noteBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  noteLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#70787c',
  },
  noteText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: '#0f172a',
    lineHeight: 22,
  },
});
