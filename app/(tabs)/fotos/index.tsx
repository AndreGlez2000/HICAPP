import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import { useHicStore } from '../../../store';
import { ScreenHeader } from '../../../components/chrome/ScreenHeader';
import { Button } from '../../../components/primitives/Button';
import { Icon } from '../../../components/primitives/Icon';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48 - 8) / 3; // 3-column grid, 24px padding each side, 8px gap total

export default function FotosScreen() {
  const photos = useHicStore((s) => s.photos);
  const [permission, requestPermission] = useCameraPermissions();

  const handleAddPhoto = async () => {
    if (!permission) {
      // Permission status unknown — request
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Cámara bloqueada',
          'Para tomar fotos, permite el acceso a la cámara en Ajustes > HiC > Cámara.',
          [{ text: 'Entendido', style: 'default' }]
        );
        return;
      }
      router.push('/modals/camera');
      return;
    }

    if (permission.granted) {
      router.push('/modals/camera');
    } else if (permission.canAskAgain) {
      const result = await requestPermission();
      if (result.granted) {
        router.push('/modals/camera');
      } else {
        Alert.alert(
          'Sin permiso de cámara',
          'Para tomar fotos de tus comidas, activa el permiso de cámara en la configuración de tu teléfono.',
          [{ text: 'Aceptar', style: 'default' }]
        );
      }
    } else {
      Alert.alert(
        'Cámara bloqueada',
        'Para tomar fotos, permite el acceso a la cámara en Ajustes > HiC > Cámara.',
        [{ text: 'Entendido', style: 'default' }]
      );
    }
  };

  const isEmpty = photos.length === 0;

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title="Mis Fotos"
        subtitle="Registro de comidas"
        right={
          <TouchableOpacity
            onPress={handleAddPhoto}
            activeOpacity={0.75}
            className="w-10 h-10 rounded-full bg-cta items-center justify-center"
          >
            <Icon name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        }
      />

      {isEmpty ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-3xl bg-[#fdf0e8] items-center justify-center mb-6">
            <Text style={{ fontSize: 48 }}>📷</Text>
          </View>
          <Text className="font-fredoka text-2xl text-primary text-center mb-3">
            Aún no hay fotos
          </Text>
          <Text className="font-nunito text-base text-muted text-center mb-8 leading-6">
            ¡Agrega tu primera foto y empieza a registrar tus comidas!
          </Text>
          <Button onPress={handleAddPhoto}>Agregar foto</Button>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8, paddingBottom: 100 }}>
            <Text className="font-fredoka text-lg text-ink mb-3">
              {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {photos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  activeOpacity={0.85}
                  style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
                  className="rounded-2xl overflow-hidden bg-[#fdf0e8]"
                  onPress={() => router.push(`/modals/photo-detail?id=${photo.id}`)}
                >
                  {photo.uri && !photo.uri.startsWith('demo://') ? (
                    <Image
                      source={{ uri: photo.uri }}
                      style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
                      className="items-center justify-center"
                    >
                      <Text style={{ fontSize: 36 }}>🍽️</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* FAB */}
          <TouchableOpacity
            onPress={handleAddPhoto}
            activeOpacity={0.85}
            style={{
              position: 'absolute',
              bottom: 24,
              right: 24,
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#e87a3f',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#e87a3f',
              shadowOpacity: 0.45,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <Icon name="camera" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
