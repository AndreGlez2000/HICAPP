import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useHicStore } from '../../store';
import { ScreenHeader } from '../../components/chrome/ScreenHeader';
import { Button } from '../../components/primitives/Button';
import { Input } from '../../components/primitives/Input';
import { DatePickerField } from '../../components/primitives/DatePickerField';
import { calculateAge } from '../../utils/age';

export default function EditProfileScreen() {
  const user = useHicStore((s) => s.user);
  const setUser = useHicStore((s) => s.setUser);

  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [dob, setDob] = useState(user?.fecha_nacimiento ?? '');
  const [peso, setPeso] = useState(user?.peso ? String(user.peso) : '');
  const [talla, setTalla] = useState(user?.talla ? String(user.talla) : '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const maxDob = new Date();

  const handleSave = async () => {
    if (!nombre.trim()) {
      setError('Por favor, ingresa tu nombre');
      return;
    }
    if (peso && isNaN(Number(peso))) {
      setError('El peso debe ser un número válido');
      return;
    }
    if (talla && isNaN(Number(talla))) {
      setError('La talla debe ser un número válido');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const edad = calculateAge(dob);
      await setUser({
        nombre: nombre.trim(),
        nickname: nickname.trim(),
        edad,
        peso: peso ? parseFloat(peso) : user?.peso ?? 0,
        talla: talla ? parseFloat(talla) : user?.talla ?? 0,
        fecha_nacimiento: dob,
      });
      router.back();
    } catch (err) {
      Alert.alert('Error al guardar', 'Intenta de nuevo.');
      setSaving(false);
    }
  };

  const initial = (nombre || user?.nickname || '?')[0].toUpperCase();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-bg"
    >
      <ScreenHeader
        title="Editar perfil"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar preview */}
        <View className="items-center mb-8">
          <View
            className="w-24 h-24 rounded-full items-center justify-center"
            style={{ backgroundColor: '#522c45' }}
          >
            <Text
              style={{
                fontFamily: 'Fredoka_700Bold',
                fontSize: 40,
                color: '#fff',
              }}
            >
              {initial}
            </Text>
          </View>
        </View>

        <View className="gap-4 mb-6">
          <Input
            label="Nombre completo"
            value={nombre}
            onChangeText={(t) => { setNombre(t); setError(''); }}
            placeholder="Ej. Carlos Ramírez"
            error={error.includes('nombre') ? error : undefined}
          />

          <Input
            label="Apodo"
            value={nickname}
            onChangeText={(t) => { setNickname(t); setError(''); }}
            placeholder="Ej. Carlitos"
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <DatePickerField
                label="Fecha de nacimiento"
                value={dob}
                onChange={(iso) => { setDob(iso); setError(''); }}
                maxDate={maxDob}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Peso (kg)"
                value={peso}
                onChangeText={(t) => { setPeso(t); setError(''); }}
                placeholder="Ej. 38.5"
                keyboardType="numeric"
                suffix="kg"
                error={error.includes('peso') ? error : undefined}
              />
            </View>
          </View>

          <Input
            label="Estatura (cm)"
            value={talla}
            onChangeText={(t) => { setTalla(t); setError(''); }}
            placeholder="Ej. 142"
            keyboardType="numeric"
            suffix="cm"
            error={error.includes('talla') ? error : undefined}
          />
        </View>

        {error && !error.includes('nombre') && !error.includes('peso') && !error.includes('talla') && (
          <Text className="font-nunito text-xs text-red-600 mb-4">{error}</Text>
        )}

        <Button onPress={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
