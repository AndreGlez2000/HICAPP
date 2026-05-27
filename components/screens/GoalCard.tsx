import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useHicStore, Categoria, Goal } from '../../store';
import { Card } from '../primitives/Card';
import { Icon } from '../primitives/Icon';
import { SVGRing } from './SVGRing';
import { router } from 'expo-router';
import { CATEGORY_LABEL, CATEGORY_ICON, CATEGORY_TINT, CATEGORY_FG, COLORS } from '../../constants/design';
import { getLocalMonthKey } from '../../utils/date-keys';

const MASCOT_IMAGES = {
  alimentacion: require('../../assets/sonrisas_alimentacion.png'),
  actividad: require('../../assets/sonrisas_actividad.png'),
  sueno: require('../../assets/sonrisas_sueno.png'),
};

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const miDiaLog = useHicStore((s) => s.miDiaLog);
  const { id, categoria, dias_target, titulo } = goal;

  const currentMonth = getLocalMonthKey(new Date());
  const logsForCategory = useMemo(() => {
    return miDiaLog.filter(log => log.categoria === categoria && log.completado === 1 && log.fecha.startsWith(currentMonth));
  }, [miDiaLog, categoria, currentMonth]);

  const targetMensual = dias_target * 4;
  const progress = targetMensual > 0 ? logsForCategory.length / targetMensual : 0;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => router.push(`/goal-detail?goalId=${id}`)}>
      <Card className="mb-3 p-5 bg-white rounded-3xl shadow-sm">
        <View className="flex-row items-center gap-4">
          <View className="relative w-[80px] h-[80px] flex-shrink-0">
            <SVGRing size={80} strokeWidth={8} progress={progress} color={CATEGORY_FG[categoria]} />
            <View className="absolute inset-0 items-center justify-center">
              <Image source={MASCOT_IMAGES[categoria]} style={{ width: 44, height: 44 }} resizeMode="contain" />
            </View>
          </View>

          <View className="flex-1 min-w-0">
            <Text className="font-nunito-bold text-[11px] uppercase tracking-wider" style={{ color: CATEGORY_FG[categoria] }}>
              {CATEGORY_LABEL[categoria]}
            </Text>
            <Text className="font-nunito-bold text-[15px] text-ink mt-0.5 leading-tight">
              {titulo}
            </Text>
            <View className="flex-row items-baseline gap-1 mt-1.5">
              <Text className="font-fredoka text-[22px]" style={{ color: CATEGORY_FG[categoria] }}>
                {logsForCategory.length}
              </Text>
              <Text className="font-nunito text-[12px] text-muted">
                de {targetMensual} veces
              </Text>
            </View>
          </View>

          <Icon name="chevron-right" size={20} color="#c4cbcf" />
        </View>
      </Card>
    </TouchableOpacity>
  );
}
