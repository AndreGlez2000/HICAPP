import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { buildHTMLReport } from '../../utils/pdf-template';
import { useHicStore, type MiDiaEntry, type Photo } from '../../store';
import { ScreenHeader } from '../../components/chrome/ScreenHeader';
import { Card } from '../../components/primitives/Card';
import { ProgressBar } from '../../components/primitives/ProgressBar';
import {
  CATEGORY_FG,
  CATEGORY_LABEL,
  type Categoria,
} from '../../constants/design';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdherenceData {
  categoria: Categoria;
  completed: number;
  total: number;
  pct: number;
}

// ─── Pure Functions ────────────────────────────────────────────────────────────

/**
 * Returns available months (YYYY-MM) sorted descending.
 * Always includes the current calendar month even if no logs exist for it.
 */
function getAvailableMonths(logs: MiDiaEntry[]): string[] {
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthsFromLogs = new Set(logs.map((l) => l.fecha.substring(0, 7)));
  monthsFromLogs.add(currentMonth);
  return Array.from(monthsFromLogs).sort((a, b) => b.localeCompare(a));
}

/**
 * Returns adherence data (completed days, total days, %) for each category
 * within the given month. For the current month, caps total at today's date.
 */
function getAdherence(logs: MiDiaEntry[], month: string): AdherenceData[] {
  const today = new Date();
  const currentMonth = today.toISOString().substring(0, 7);
  const [year, monthNum] = month.split('-').map(Number);

  let totalDays: number;
  if (month === currentMonth) {
    totalDays = today.getDate();
  } else {
    // Last day of month: new Date(year, monthNum, 0) gives last day of monthNum-1... 
    // Actually new Date(year, monthNum, 0) gives last day of month monthNum (1-indexed).
    totalDays = new Date(year, monthNum, 0).getDate();
  }

  const categorias: Categoria[] = ['alimentacion', 'actividad', 'sueno'];
  return categorias.map((categoria) => {
    const logsForCat = logs.filter(
      (l) =>
        l.fecha.substring(0, 7) === month &&
        l.categoria === categoria &&
        l.completado === 1
    );
    const completed = logsForCat.length;
    const pct = totalDays > 0 ? Math.round((completed / totalDays) * 100) : 0;
    return { categoria, completed, total: totalDays, pct };
  });
}

/**
 * Returns the maximum consecutive-days streak in the given month where
 * ALL 3 categories have completado=1 on that day. For the current month,
 * only counts days up to and including today.
 */
function getMaxStreak(logs: MiDiaEntry[], month: string): number {
  const today = new Date();
  const currentMonth = today.toISOString().substring(0, 7);
  const [year, monthNum] = month.split('-').map(Number);

  const lastDay =
    month === currentMonth
      ? today.getDate()
      : new Date(year, monthNum, 0).getDate();

  // Build a set of "complete days" — days where all 3 categories are done
  const completeDays = new Set<string>();
  for (let day = 1; day <= lastDay; day++) {
    const dateStr = `${month}-${String(day).padStart(2, '0')}`;
    const dayLogs = logs.filter((l) => l.fecha === dateStr && l.completado === 1);
    const categorias = new Set(dayLogs.map((l) => l.categoria));
    if (
      categorias.has('alimentacion') &&
      categorias.has('actividad') &&
      categorias.has('sueno')
    ) {
      completeDays.add(dateStr);
    }
  }

  let maxStreak = 0;
  let currentStreak = 0;
  for (let day = 1; day <= lastDay; day++) {
    const dateStr = `${month}-${String(day).padStart(2, '0')}`;
    if (completeDays.has(dateStr)) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
}

/**
 * Filters photos to those taken in the given month (YYYY-MM), sorted newest first.
 */
function getMonthPhotos(photos: Photo[], month: string): Photo[] {
  return photos
    .filter((p) => p.created_at.substring(0, 7) === month)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/**
 * Builds a plain-text share message summarizing the report.
 */
function buildShareMessage(
  adherence: AdherenceData[],
  streak: number,
  month: string
): string {
  const monthLabel = formatMonthLabel(month);
  const lines: string[] = [`Reporte HiC — ${monthLabel}`, ''];
  for (const item of adherence) {
    const label = CATEGORY_LABEL[item.categoria];
    lines.push(`${label}: ${item.completed}/${item.total} días (${item.pct}%)`);
  }
  lines.push('');
  lines.push(`Racha del mes: ${streak} ${streak === 1 ? 'día seguido' : 'días seguidos'}`);
  return lines.join('\n');
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  return `${MONTH_NAMES_ES[monthNum - 1]} ${year}`;
}

const DAY_MONTH_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

function formatPhotoDate(isoDate: string): string {
  // isoDate is ISO 8601 UTC, e.g. "2026-05-12T10:30:00.000Z"
  const d = new Date(isoDate);
  const day = d.getUTCDate();
  const month = DAY_MONTH_ES[d.getUTCMonth()];
  return `${day} ${month}`;
}

const MOOD_EMOJI: Record<string, string> = {
  feliz: '😄',
  bien: '🙂',
  regular: '😐',
  cansado: '😴',
  mal: '😞',
};

function getMoodEmoji(mood: string): string {
  return MOOD_EMOJI[mood.toLowerCase()] ?? mood;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ title }: { title: string }): React.JSX.Element {
  return (
    <Text className="font-fredoka text-xl text-ink mb-3">{title}</Text>
  );
}

function AdherenceRow({ data }: { data: AdherenceData }): React.JSX.Element {
  const color = CATEGORY_FG[data.categoria];
  const label = CATEGORY_LABEL[data.categoria];
  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-1.5">
        <Text className="font-nunito-bold text-sm text-ink">{label}</Text>
        <Text className="font-nunito text-xs" style={{ color }}>
          {data.completed} de {data.total} días ({data.pct}%)
        </Text>
      </View>
      <ProgressBar value={data.completed} max={data.total} color={color} />
    </View>
  );
}

function PhotoMetaRow({ photo, last = false }: { photo: Photo; last?: boolean }): React.JSX.Element {
  return (
    <View
      className={`flex-row items-center py-3 gap-3 ${!last ? 'border-b border-border' : ''}`}
    >
      <Text className="font-nunito text-sm text-muted w-14">{formatPhotoDate(photo.created_at)}</Text>
      <Text className="font-nunito text-sm text-ink flex-1">{photo.meal}</Text>
      <Text className="text-base">{getMoodEmoji(photo.mood)}</Text>
    </View>
  );
}

function PeriodSelector({
  months,
  selectedMonth,
  onSelect,
}: {
  months: string[];
  selectedMonth: string;
  onSelect: (month: string) => void;
}): React.JSX.Element | null {
  if (months.length <= 1) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingBottom: 8 }}
      className="mb-4"
    >
      {months.map((month) => {
        const isSelected = month === selectedMonth;
        return (
          <TouchableOpacity
            key={month}
            onPress={() => onSelect(month)}
            activeOpacity={0.75}
            className={`px-4 h-10 rounded-pill border items-center justify-center ${
              isSelected
                ? 'bg-primary border-primary'
                : 'bg-surface border-border'
            }`}
          >
            <Text
              className={`font-nunito-bold text-sm ${
                isSelected ? 'text-white' : 'text-muted'
              }`}
            >
              {formatMonthLabel(month)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function AdherenceSection({ adherence }: { adherence: AdherenceData[] }): React.JSX.Element {
  return (
    <Card padded className="mb-4">
      <SectionTitle title="Adherencia" />
      {adherence.map((item) => (
        <AdherenceRow key={item.categoria} data={item} />
      ))}
    </Card>
  );
}

function StreakCard({ streak }: { streak: number }): React.JSX.Element {
  return (
    <Card padded className="mb-4 items-center">
      <SectionTitle title="Racha del mes" />
      <Text
        className="font-fredoka"
        style={{ fontSize: 72, color: '#e87a3f', lineHeight: 80 }}
      >
        {streak}
      </Text>
      <Text className="font-nunito text-sm text-muted mt-1">
        {streak === 1 ? 'día seguido' : 'días seguidos'}
      </Text>
    </Card>
  );
}

function PhotoMetaSection({ photos }: { photos: Photo[] }): React.JSX.Element {
  if (photos.length === 0) {
    return (
      <Card padded className="mb-4">
        <SectionTitle title="Fotos del período" />
        <Text className="font-nunito text-sm text-muted text-center py-4">
          Aún no hay fotos este período. ¡Cada registro cuenta — la próxima puede ser la tuya! 📸
        </Text>
      </Card>
    );
  }

  return (
    <Card padded={false} className="mb-4">
      <View className="px-4 pt-4 pb-2">
        <SectionTitle title="Fotos del período" />
      </View>
      <View className="px-4 pb-4">
        {photos.map((photo, idx) => (
          <PhotoMetaRow key={photo.id} photo={photo} last={idx === photos.length - 1} />
        ))}
      </View>
    </Card>
  );
}

function EmptyState(): React.JSX.Element {
  return (
    <Card padded className="mb-4 items-center">
      <Text className="text-4xl mb-3">🌱</Text>
      <Text className="font-fredoka text-xl text-primary text-center mb-2">
        ¡Este período está esperando por ti!
      </Text>
      <Text className="font-nunito text-sm text-muted text-center leading-relaxed">
        Aún no hay registros para este mes. Cada día que registras es un paso hacia tus metas. ¡Tú puedes!
      </Text>
    </Card>
  );
}

function ShareButton({
  adherence,
  streak,
  selectedMonth,
}: {
  adherence: AdherenceData[];
  streak: number;
  selectedMonth: string;
}): React.JSX.Element {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async (): Promise<void> => {
    try {
      setIsGenerating(true);
      const monthLabel = formatMonthLabel(selectedMonth);
      const html = buildHTMLReport(adherence, streak, monthLabel);
      
      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir reporte',
        });
      } else {
        Alert.alert('Error', 'No se puede compartir en este dispositivo');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Ocurrió un problema al generar el reporte.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleShare}
      activeOpacity={0.85}
      className="mb-6"
      disabled={isGenerating}
    >
      <View className="rounded-pill h-14 bg-[#e87a3f] items-center justify-center flex-row gap-2">
        {isGenerating && <ActivityIndicator color="#fff" />}
        <Text className="font-nunito-bold text-base text-white">
          {isGenerating ? 'Generando reporte...' : 'Compartir reporte'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function MonthlyReportScreen(): React.JSX.Element {
  const miDiaLog = useHicStore((s) => s.miDiaLog);
  const photos = useHicStore((s) => s.photos);

  const currentMonth = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  const months = getAvailableMonths(miDiaLog);
  const adherence = getAdherence(miDiaLog, selectedMonth);
  const streak = getMaxStreak(miDiaLog, selectedMonth);
  const monthPhotos = getMonthPhotos(photos, selectedMonth);

  const logsForMonth = miDiaLog.filter((l) => l.fecha.substring(0, 7) === selectedMonth);
  const hasData = logsForMonth.length > 0;

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title="Reporte del mes"
        showBack
        onBack={() => router.back()}
      />

      <PeriodSelector
        months={months}
        selectedMonth={selectedMonth}
        onSelect={setSelectedMonth}
      />

      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8 }}>
        {hasData ? (
          <>
            <AdherenceSection adherence={adherence} />
            <StreakCard streak={streak} />
            <PhotoMetaSection photos={monthPhotos} />
            <ShareButton
              adherence={adherence}
              streak={streak}
              selectedMonth={selectedMonth}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </ScrollView>
    </View>
  );
}
