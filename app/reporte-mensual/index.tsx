import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { buildHTMLReport } from '../../utils/pdf-template';
import { DatePickerField } from '../../components/primitives/DatePickerField';
import { useHicStore, type Photo } from '../../store';
import { ScreenHeader } from '../../components/chrome/ScreenHeader';
import { Card } from '../../components/primitives/Card';
import { ProgressBar } from '../../components/primitives/ProgressBar';
import {
  CATEGORY_FG,
  CATEGORY_LABEL,
} from '../../constants/design';
import {
  type AdherenceData,
  type GoalsByMonthRow,
  type PhotosSummary,
  type ReportRange,
  addMonths,
  buildGoalsByMonth,
  buildRangeLabel,
  buildRangeStats,
  formatMonthLabel,
  getLocalMonthKey,
  getMonthsInRange,
  hasLogsInRange,
  isRangeValid,
} from '../../utils/report-range';


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

function RangeChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className={`px-4 h-10 rounded-pill border items-center justify-center ${
        active ? 'bg-primary border-primary' : 'bg-surface border-border'
      }`}
    >
      <Text className={`font-nunito-bold text-sm ${active ? 'text-white' : 'text-muted'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function RangeSelector({
  range,
  onChange,
  invalidMessage,
  onInvalid,
}: {
  range: ReportRange;
  onChange: (range: ReportRange) => void;
  invalidMessage?: string;
  onInvalid: (message: string | null) => void;
}): React.JSX.Element {
  const currentMonth = getLocalMonthKey(new Date());
  const quickRanges = [
    { label: '1 mes', months: 1 },
    { label: '3 meses', months: 3 },
    { label: '6 meses', months: 6 },
    { label: '12 meses', months: 12 },
  ];

  const activeQuick = quickRanges.find((item) => {
    const startMonth = addMonths(currentMonth, -(item.months - 1));
    return range.startMonth === startMonth && range.endMonth === currentMonth;
  });

  const handleQuickSelect = (months: number) => {
    const startMonth = addMonths(currentMonth, -(months - 1));
    const nextRange = {
      startMonth,
      endMonth: currentMonth,
      label: buildRangeLabel(startMonth, currentMonth),
    };
    onInvalid(null);
    onChange(nextRange);
  };

  const handleStartChange = (isoDate: string) => {
    const startMonth = isoDate.substring(0, 7);
    const nextRange = {
      startMonth,
      endMonth: range.endMonth,
      label: buildRangeLabel(startMonth, range.endMonth),
    };
    if (!isRangeValid(startMonth, range.endMonth)) {
      onInvalid('El mes inicial no puede ser después del mes final.');
      return;
    }
    onInvalid(null);
    onChange(nextRange);
  };

  const handleEndChange = (isoDate: string) => {
    const endMonth = isoDate.substring(0, 7);
    const nextRange = {
      startMonth: range.startMonth,
      endMonth,
      label: buildRangeLabel(range.startMonth, endMonth),
    };
    if (!isRangeValid(range.startMonth, endMonth)) {
      onInvalid('El mes final no puede ser antes del mes inicial.');
      return;
    }
    onInvalid(null);
    onChange(nextRange);
  };

  const endDateMax = new Date();
  const minDate = new Date(2020, 0, 1);
  const startDateValue = `${range.startMonth}-01`;
  const endDateValue = `${range.endMonth}-01`;

  return (
    <View className="mb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingBottom: 8 }}
        className="mb-3"
      >
        {quickRanges.map((item) => (
          <RangeChip
            key={item.label}
            label={`Últimos ${item.months}`}
            active={activeQuick?.months === item.months}
            onPress={() => handleQuickSelect(item.months)}
          />
        ))}
      </ScrollView>

      <View className="px-6 gap-3">
        <DatePickerField
          label="Mes inicial"
          value={startDateValue}
          onChange={handleStartChange}
          maxDate={endDateMax}
          minDate={minDate}
        />
        <DatePickerField
          label="Mes final"
          value={endDateValue}
          onChange={handleEndChange}
          maxDate={endDateMax}
          minDate={minDate}
        />
        {invalidMessage ? (
          <Text className="font-nunito text-xs text-red-600">{invalidMessage}</Text>
        ) : null}
      </View>
    </View>
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
      <SectionTitle title="Racha actual" />
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
  rangeLabel,
  goalsByMonth,
  photosSummary,
}: {
  adherence: AdherenceData[];
  streak: number;
  rangeLabel: string;
  goalsByMonth: GoalsByMonthRow[];
  photosSummary: PhotosSummary;
}): React.JSX.Element {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async (): Promise<void> => {
    try {
      setIsGenerating(true);
      const html = buildHTMLReport(adherence, streak, rangeLabel, goalsByMonth, photosSummary);
      
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
  const goals = useHicStore((s) => s.goals);

  const currentMonth = getLocalMonthKey(new Date());
  const [range, setRange] = useState<ReportRange>(() => ({
    startMonth: currentMonth,
    endMonth: currentMonth,
    label: formatMonthLabel(currentMonth),
  }));
  const [rangeError, setRangeError] = useState<string | null>(null);

  const { adherence, streak, photosInRange } = useMemo(() => {
    return buildRangeStats(miDiaLog, photos, range);
  }, [miDiaLog, photos, range]);

  const goalsByMonth = useMemo(() => {
    return buildGoalsByMonth(goals, miDiaLog, range);
  }, [goals, miDiaLog, range]);

  const hasData = useMemo(() => hasLogsInRange(miDiaLog, range), [miDiaLog, range]);
  const photosSummary = useMemo(() => ({ total: photosInRange.length }), [photosInRange.length]);
  const monthsInRange = useMemo(() => getMonthsInRange(range.startMonth, range.endMonth), [range]);
  const invalidRange = !isRangeValid(range.startMonth, range.endMonth);

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title="Reporte del mes"
        showBack
        onBack={() => router.back()}
      />

      <RangeSelector
        range={range}
        onChange={setRange}
        invalidMessage={rangeError}
        onInvalid={setRangeError}
      />

      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8 }}>
        {hasData && !invalidRange ? (
          <>
            <AdherenceSection adherence={adherence} />
            <StreakCard streak={streak} />
            <PhotoMetaSection photos={photosInRange} />
            {goalsByMonth.length > 0 ? (
              <Card padded className="mb-4">
                <SectionTitle title="Metas por mes" />
                {goalsByMonth.map((row) => (
                  <View key={`${row.month}-${row.categoria}`} className="mb-3">
                    <Text className="font-nunito-bold text-sm text-ink">
                      {formatMonthLabel(row.month)} · {CATEGORY_LABEL[row.categoria]}
                    </Text>
                    <Text className="font-nunito text-xs text-muted">
                      {row.titulo}
                    </Text>
                    <Text className="font-nunito text-xs text-muted mt-1">
                      Meta: {row.targetDays} días · Logrados: {row.achievedDays}
                    </Text>
                  </View>
                ))}
              </Card>
            ) : null}
            <ShareButton
              adherence={adherence}
              streak={streak}
              rangeLabel={range.label}
              goalsByMonth={goalsByMonth}
              photosSummary={photosSummary}
            />
          </>
        ) : (
          <EmptyState />
        )}
        {!hasData && monthsInRange.length > 1 && !invalidRange ? (
          <Text className="font-nunito text-xs text-muted text-center mb-6">
            No hay registros en este rango todavía.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
