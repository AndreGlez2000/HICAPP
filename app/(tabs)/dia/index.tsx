import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useHicStore, Categoria } from '../../../store';
import { ScreenHeader } from '../../../components/chrome/ScreenHeader';
import { MiDiaCard } from '../../../components/screens/MiDiaCard';
import { Icon } from '../../../components/primitives/Icon';

const CATEGORIES: Categoria[] = ['alimentacion', 'actividad', 'sueno'];

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function formatToday(): string {
  const d = new Date();
  const day = DAY_NAMES[d.getDay()];
  const num = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];
  return `${day.charAt(0).toUpperCase() + day.slice(1)}, ${num} de ${month}`;
}

export default function MiDiaScreen() {
  const miDiaLog = useHicStore((s) => s.miDiaLog);
  const goals = useHicStore((s) => s.goals);
  const setNavigationContext = useHicStore((s) => s.setNavigationContext);

  const todayStr = new Date().toISOString().split('T')[0];

  const doneToday = CATEGORIES.filter((cat) =>
    miDiaLog.some((l) => l.fecha === todayStr && l.categoria === cat && l.completado === 1)
  ).length;

  const allThreeDone = doneToday === 3;

  // Solo navega a celebration cuando el usuario ACABA de completar la 3ra meta
  // (transición false→true), nunca en el mount inicial
  const prevDoneRef = useRef<number | null>(null);

  useEffect(() => {
    // Primera renderización — solo registra el estado inicial, no navega
    if (prevDoneRef.current === null) {
      prevDoneRef.current = doneToday;
      return;
    }
    // Navega solo si se pasó de <3 a 3 (el usuario acaba de completar la última)
    if (prevDoneRef.current < 3 && doneToday === 3) {
      setNavigationContext({ modalMessage: '¡Completaste los 3 hábitos de hoy!' });
      router.push('/modals/celebration');
    }
    prevDoneRef.current = doneToday;
  }, [doneToday]);

  const getTitulo = (cat: Categoria) =>
    goals.find((g) => g.categoria === cat)?.titulo ?? cat;

  return (
    <View style={{ flex: 1, backgroundColor: '#f9f6f8' }}>
      <ScreenHeader
        title="Mi Día"
        subtitle={formatToday()}
        right={
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: 22, color: '#522c45', lineHeight: 26 }}>
              {doneToday}/3
            </Text>
            <Text style={{ fontFamily: 'Nunito_400Regular', fontSize: 11, color: '#aaa' }}>hoy</Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 12 }}>

        {/* Banner de completado — solo visible cuando las 3 están hechas */}
        {allThreeDone && (
          <View
            style={{
              backgroundColor: '#e87a3f',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <Icon name="trophy" size={24} color="#fff" />
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#fff', flex: 1 }}>
              ¡Completaste el día!
            </Text>
          </View>
        )}

        <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 17, color: '#1a1a2e', marginBottom: 16 }}>
          ¿Cumpliste tus metas hoy?
        </Text>

        {CATEGORIES.map((cat) => (
          <MiDiaCard
            key={cat}
            categoria={cat}
            titulo={getTitulo(cat)}
          />
        ))}

        <TouchableOpacity
          style={{ marginTop: 16, alignItems: 'center' }}
          activeOpacity={0.7}
          onPress={() => router.push('/goal-detail')}
        >
          <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#e87a3f' }}>
            Ver historial del mes →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
