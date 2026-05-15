import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useHicStore } from '../../../store';
import { getDB } from '../../../db';
import { ScreenHeader } from '../../../components/chrome/ScreenHeader';
import { Card } from '../../../components/primitives/Card';
import { Icon } from '../../../components/primitives/Icon';

export default function PerfilScreen() {
  const user = useHicStore((s) => s.user);
  const goals = useHicStore((s) => s.goals);
  const miDiaLog = useHicStore((s) => s.miDiaLog);

  if (!user) {
    return (
      <View className="flex-1 bg-bg items-center justify-center px-8">
        <Text className="font-fredoka text-primary text-2xl text-center">
          Cargando perfil...
        </Text>
      </View>
    );
  }

  // Stats
  const daysLogged = new Set(miDiaLog.filter((l) => l.completado === 1).map((l) => l.fecha)).size;
  const currentMonth = new Date().toISOString().substring(0, 7);
  const daysThisMonth = new Set(
    miDiaLog.filter((l) => l.completado === 1 && l.fecha.startsWith(currentMonth)).map((l) => l.fecha)
  ).size;

  const initial = (user.nombre || user.nickname || '?')[0].toUpperCase();

  const handleReset = () => {
    Alert.alert(
      'Resetear app',
      '¿Seguro? Se borrarán todos los datos y regresarás al inicio.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: async () => {
            const db = getDB();
            await db.runAsync('DELETE FROM mi_dia_log');
            await db.runAsync('DELETE FROM goals');
            await db.runAsync('DELETE FROM photos');
            await db.runAsync('DELETE FROM user');
            useHicStore.setState({ user: null, goals: [], miDiaLog: [], photos: [] });
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title="Mi Perfil"
        subtitle="Datos de tu cuenta"
        right={
          <TouchableOpacity
            onPress={() => router.push('/edit-profile')}
            activeOpacity={0.75}
            className="w-10 h-10 rounded-full bg-[#f5eef2] items-center justify-center"
          >
            <Icon name="pencil" size={18} color="#522c45" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8 }}>
        {/* Avatar + name */}
        <View className="items-center mb-6">
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-3"
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
          <Text className="font-fredoka text-2xl text-primary">{user.nombre}</Text>
          {user.nickname ? (
            <Text className="font-nunito text-sm text-muted mt-0.5">@{user.nickname}</Text>
          ) : null}
        </View>

        {/* Stats cards */}
        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1 p-4 items-center">
            <Text className="font-fredoka text-3xl text-primary">{goals.length}</Text>
            <Text className="font-nunito text-xs text-muted mt-1 text-center">Metas activas</Text>
          </Card>
          <Card className="flex-1 p-4 items-center">
            <Text className="font-fredoka text-3xl text-[#19b78e]">{daysThisMonth}</Text>
            <Text className="font-nunito text-xs text-muted mt-1 text-center">Días este mes</Text>
          </Card>
          <Card className="flex-1 p-4 items-center">
            <Text className="font-fredoka text-3xl text-[#e87a3f]">{daysLogged}</Text>
            <Text className="font-nunito text-xs text-muted mt-1 text-center">Días totales</Text>
          </Card>
        </View>

        {/* Info section */}
        <Text className="font-fredoka text-lg text-ink mb-3 ml-1">Mis datos</Text>
        <Card className="mb-3">
          <View className="gap-0">
            <InfoRow icon="user" label="Nombre" value={user.nombre} />
            <InfoRow icon="hash" label="Apodo" value={user.nickname} />
            {user.edad ? <InfoRow icon="calendar" label="Edad" value={`${user.edad} años`} /> : null}
            {user.peso ? <InfoRow icon="activity" label="Peso" value={`${user.peso} kg`} /> : null}
            {user.talla ? <InfoRow icon="ruler" label="Talla" value={`${user.talla} cm`} /> : null}
            {user.expediente ? <InfoRow icon="file-text" label="Expediente" value={user.expediente} last /> : null}
          </View>
        </Card>

        <NavRow
          label="Reporte del mes"
          icon="bar-chart-2"
          onPress={() => router.push('/reporte-mensual')}
        />

        <TouchableOpacity
          onPress={() => router.push('/edit-profile')}
          activeOpacity={0.8}
          className="mt-3"
        >
          <View className="rounded-pill h-14 bg-[#f5eef2] items-center justify-center flex-row gap-2">
            <Icon name="pencil" size={18} color="#522c45" />
            <Text className="font-nunito-bold text-base text-primary">Editar perfil</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleReset}
          activeOpacity={0.8}
          className="mt-3"
        >
          <View className="rounded-pill h-12 bg-transparent border border-red-200 items-center justify-center flex-row gap-2">
            <Icon name="trash-2" size={16} color="#e57373" />
            <Text className="font-nunito text-sm text-red-400">Resetear app</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: string;
  label: string;
  value: string | number;
  last?: boolean;
}) {
  if (!value) return null;
  return (
    <View
      className={`flex-row items-center px-4 py-3 gap-3 ${!last ? 'border-b border-border' : ''}`}
    >
      <Icon name={icon} size={18} color="#70787c" />
      <Text className="font-nunito-bold text-sm text-muted w-24">{label}</Text>
      <Text className="font-nunito text-sm text-ink flex-1">{value}</Text>
    </View>
  );
}

function NavRow({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: string;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="mt-2">
      <View className="rounded-pill h-14 bg-[#f5eef2] items-center justify-between flex-row px-5">
        <View className="flex-row items-center gap-2">
          <Icon name={icon} size={18} color="#522c45" />
          <Text className="font-nunito-bold text-base text-primary">{label}</Text>
        </View>
        <Icon name="chevron-right" size={18} color="#522c45" />
      </View>
    </TouchableOpacity>
  );
}
