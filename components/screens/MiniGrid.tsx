import React from 'react';
import { View } from 'react-native';
import { useHicStore, Categoria } from '../../store';

interface MiniGridProps {
  categoria: Categoria;
  currentMonth: string; // YYYY-MM format
}

export function MiniGrid({ categoria, currentMonth }: MiniGridProps) {
  const miDiaLog = useHicStore((s) => s.miDiaLog);

  // Filter logs for the given category and month
  const monthLogs = miDiaLog.filter((log) => 
    log.categoria === categoria && 
    log.fecha.startsWith(currentMonth)
  );

  // Determine current day for future/past checking
  const today = new Date();
  const currentMonthDate = new Date(currentMonth + '-01');
  const isCurrentMonth = today.getFullYear() === currentMonthDate.getFullYear() && 
                         today.getMonth() === currentMonthDate.getMonth();
  const todayDay = isCurrentMonth ? today.getDate() : (today > currentMonthDate ? 31 : 0);

  return (
    <View className="flex-row flex-wrap gap-1 max-w-full mt-3">
      {Array.from({ length: 30 }).map((_, index) => {
        const day = index + 1;
        const dateStr = `${currentMonth}-${day.toString().padStart(2, '0')}`;
        
        const isLogged = monthLogs.some((log) => log.fecha === dateStr && log.completado === 1);
        const isFuture = day > todayDay;

        let bgClass = 'bg-surface border border-border'; // future/empty
        
        if (isLogged) {
          bgClass = 'bg-success border border-success'; // logged
        } else if (!isFuture && !isLogged) {
          bgClass = 'bg-[#f5eef2] border border-transparent'; // missed/past
        }

        return (
          <View
            key={day}
            className={`w-2.5 h-2.5 rounded-[2px] ${bgClass}`}
          />
        );
      })}
    </View>
  );
}
