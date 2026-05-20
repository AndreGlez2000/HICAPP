import React, { useMemo } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useHicStore } from '../../../store';
import { ScreenHeader } from '../../../components/chrome/ScreenHeader';
import { GoalCard } from '../../../components/screens/GoalCard';
import { Card } from '../../../components/primitives/Card';
import { Icon } from '../../../components/primitives/Icon';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export default function DashboardScreen() {
  const allGoals = useHicStore((s) => s.goals);
  const user = useHicStore((s) => s.user);
  const resetApp = useHicStore((s) => s.resetApp);
  const miDiaLog = useHicStore((s) => s.miDiaLog);
  const currentMonth = new Date().toISOString().substring(0, 7);

  // Only show goals for the current month — past months are historical
  const goals = allGoals.filter((g) => g.mes === currentMonth);

  const handleReset = () => {
    Alert.alert(
      'Resetear aplicación',
      '¿Estás seguro de que quieres borrar todos los datos? Esto reiniciará el onboarding.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar todo', style: 'destructive', onPress: async () => {
          await resetApp();
          router.replace('/onboarding');
        } },
      ]
    );
  };
  
  const needsRenewal = goals.length > 0 && goals[0].mes !== currentMonth;

  const streak = useMemo(() => {
    // Use local date to avoid UTC midnight mismatch (e.g. 11pm MX = next day UTC)
    const toLocal = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    // A day counts only when ALL 3 categories are marked complete (like Duolingo's full lesson)
    const isComplete = (dateStr: string): boolean => {
      const cats = new Set(
        miDiaLog.filter(l => l.fecha === dateStr && l.completado === 1).map(l => l.categoria)
      );
      return cats.has('alimentacion') && cats.has('actividad') && cats.has('sueno');
    };

    const today = new Date();
    const todayStr = toLocal(today);

    // Grace period: if today isn't complete yet, check from yesterday (same as Duolingo)
    const checkDate = new Date(today);
    if (!isComplete(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      if (!isComplete(toLocal(checkDate))) return 0;
    }

    let count = 0;
    while (isComplete(toLocal(checkDate))) {
      count++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return count;
  }, [miDiaLog]);

  const uniqueDays = new Set(miDiaLog.filter(l => l.completado === 1 && l.fecha.startsWith(currentMonth)).map(l => l.fecha)).size;

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader 
        title={`¡Hola, ${user?.nickname || 'Usuario'}!`} 
        subtitle="Así va el mes" 
        right={
          <View className="bg-[#e87a3f] px-3.5 py-2 rounded-full flex-row items-center gap-1.5">
            <Icon name="flame" size={18} color="#fff" />
            <Text className="font-nunito-bold text-sm text-white">{streak} días</Text>
          </View>
        }
      />
      
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8 }}>
        {needsRenewal && (
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/goal-renewal')}>
            <View className="rounded-[18px] mb-4 p-4 flex-row items-center gap-3" style={{ backgroundColor: '#522c45' }}>
              <Icon name="refresh-cw" size={22} color="#fff" />
              <View className="flex-1">
                <Text className="font-nunito-bold text-sm text-white">¡Es hora de renovar las metas!</Text>
                <Text className="font-nunito text-xs text-white/80 mt-0.5">El nutriólogo tiene nuevas metas para este mes.</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

        <Text className="font-fredoka text-lg text-ink ml-1 mb-3">Metas del mes</Text>

        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}

        <Text className="font-fredoka text-base text-ink ml-1 mt-3.5 mb-2.5">Actividad del mes</Text>
        <Card className="p-4 mb-3.5">
          <View className="flex-row items-center justify-between mb-3">
             <Text className="font-nunito-bold text-sm text-ink">Días registrados</Text>
             <Text className="font-fredoka text-xl text-primary">{uniqueDays} <Text className="text-sm text-muted">/ 30</Text></Text>
          </View>
          <View className="h-2 w-full bg-[#f5eef2] rounded-full overflow-hidden">
             <View className="h-full bg-[#e87a3f] rounded-full" style={{ width: `${Math.min((uniqueDays / 30) * 100, 100)}%` }} />
          </View>
        </Card>

        {__DEV__ && (
          <TouchableOpacity 
            onPress={handleReset}
            className="mt-8 p-4 bg-red-100 rounded-2xl flex-row items-center justify-center gap-2 border border-red-200"
          >
            <Icon name="trash-2" size={20} color="#ef4444" />
            <Text className="font-nunito-bold text-red-500">Resetear App (Dev Only)</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
