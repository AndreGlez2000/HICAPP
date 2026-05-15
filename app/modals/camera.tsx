import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useHicStore } from '../../store';
import { Icon } from '../../components/primitives/Icon';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [capturing, setCapturing] = useState(false);
  const setNavigationContext = useHicStore((s) => s.setNavigationContext);

  if (!permission) {
    // Permission loading
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>📷</Text>
          <Text style={styles.placeholderText}>Cargando cámara...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera unavailable / denied
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeBtn}
        >
          <Icon name="x" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>📷</Text>
          <Text style={styles.deniedTitle}>Cámara no disponible</Text>
          <Text style={styles.deniedText}>
            Para tomar fotos de tus comidas, activa el permiso de cámara en{' '}
            <Text style={{ fontWeight: '700' }}>Ajustes {'>'} HiC {'>'} Cámara</Text>.
          </Text>
          {permission.canAskAgain && (
            <TouchableOpacity
              onPress={requestPermission}
              style={styles.permissionBtn}
            >
              <Text style={styles.permissionBtnText}>Permitir cámara</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.permissionBtn, styles.permissionBtnSecondary]}
          >
            <Text style={[styles.permissionBtnText, { color: '#e87a3f' }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleCapture = async () => {
    if (capturing || !cameraRef.current) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) {
        setNavigationContext({ modalMessage: photo.uri });
        router.replace('/modals/photo-confirm');
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta de nuevo.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Icon name="x" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Nueva comida</Text>
        <View style={styles.iconBtn} />
      </View>

      {/* Viewfinder corners */}
      <View style={styles.viewfinderContainer} pointerEvents="none">
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
          style={styles.iconBtn}
        >
          <Icon name="refresh-ccw" size={24} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCapture}
          disabled={capturing}
          style={[styles.shutterBtn, capturing && { opacity: 0.6 }]}
        />

        <View style={styles.iconBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  placeholderEmoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  placeholderText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  deniedTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 26,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  deniedText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  permissionBtn: {
    width: '100%',
    height: 52,
    borderRadius: 999,
    backgroundColor: '#e87a3f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  permissionBtnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  permissionBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#fff',
  },
  topBar: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 5,
  },
  topTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#fff',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderContainer: {
    position: 'absolute',
    top: '20%',
    left: 40,
    right: 40,
    bottom: '20%',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#fff',
    borderRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#fff',
    borderRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#fff',
    borderRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#fff',
    borderRadius: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  shutterBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
});
