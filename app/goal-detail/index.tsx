import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useHicStore, Categoria } from '../../store';
import { ScreenHeader } from '../../components/chrome/ScreenHeader';
import { Icon } from '../../components/primitives/Icon';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { CATEGORY_LABEL, CATEGORY_ICON, CATEGORY_FG, CATEGORY_TINT } from '../../constants/design';

const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export default function GoalDetailScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const goals = useHicStore((s) => s.goals);
  const allGoals = goals;
  const miDiaLog = useHicStore((s) => s.miDiaLog);
  const user = useHicStore((s) => s.user);
  const renewGoal = useHicStore((s) => s.renewGoal);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitulo, setNewTitulo] = useState('');
  const [newDias, setNewDias] = useState('');

  const goal = goals.find((g) => String(g.id) === goalId);

  if (!goal) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Meta no encontrada</Text>
        <Button onPress={() => router.back()}>Regresar</Button>
      </View>
    );
  }

  const { categoria, dias_target, titulo } = goal;
  const cat = categoria as Categoria;
  const color = CATEGORY_FG[cat];
  const tint = CATEGORY_TINT[cat];

  const currentMonth = new Date().toISOString().substring(0, 7);
  const targetMensual = dias_target * 4;

  // ── Renewal window logic ──
  // Base: day of month from user.created_at (= día de primera consulta)
  // Next consult: same day next month
  // Button visible 3 days before next consult
  const canRenew = useMemo(() => {
    if (!user?.created_at) return false;
    const createdAt = new Date(user.created_at);
    const dayOfMonth = createdAt.getDate();
    const now = new Date();
    const nextConsult = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
    const windowStart = new Date(nextConsult);
    windowStart.setDate(windowStart.getDate() - 3);
    return now >= windowStart;
  }, [user?.created_at]);

  // Already renewed this month = meta de esta categoría con mes === currentMonth existe
  const alreadyRenewed = useMemo(() => {
    return allGoals.some((g) => g.categoria === cat && g.mes === currentMonth);
  }, [allGoals, cat, currentMonth]);

  // Logs this month for this category
  const logsThisMonth = useMemo(() => {
    return miDiaLog.filter(
      (l) => l.categoria === cat && l.completado === 1 && l.fecha.startsWith(currentMonth)
    );
  }, [miDiaLog, cat, currentMonth]);

  const loggedDates = new Set(logsThisMonth.map((l) => l.fecha));
  const countMes = logsThisMonth.length;
  const progressPct = targetMensual > 0 ? Math.round((countMes / targetMensual) * 100) : 0;
  const progressFill = Math.min(progressPct / 100, 1);

  const handleOpenRenew = () => {
    setNewTitulo(titulo);
    setNewDias(String(dias_target));
    setModalVisible(true);
  };

  const handleConfirmRenew = async () => {
    const parsedDias = parseInt(newDias, 10);
    if (!newTitulo.trim()) {
      Alert.alert('Falta el título', 'Escribe un título para la meta.');
      return;
    }
    if (isNaN(parsedDias) || parsedDias < 1 || parsedDias > 7) {
      Alert.alert('Veces inválidas', 'Ingresa un número entre 1 y 7.');
      return;
    }
    await renewGoal(goal.id, newTitulo.trim(), parsedDias, currentMonth);
    setModalVisible(false);
    router.back();
  };

  // Last 7 days (today is index 6)
  const last7 = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dateStr = d.toISOString().substring(0, 10);
      const dayLabel = DAY_LABELS[d.getDay()];
      return { dateStr, dayLabel, done: loggedDates.has(dateStr) };
    });
  }, [loggedDates]);

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Detalle de Meta"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Hero card ── */}
        <Card style={styles.heroCard}>
          <View style={[styles.iconCircle, { backgroundColor: tint }]}>
            <Icon name={CATEGORY_ICON[cat]} size={40} color={color} strokeWidth={2} />
          </View>
          <Text style={styles.heroTitle}>{titulo}</Text>
          <Text style={styles.heroSub}>
            {CATEGORY_LABEL[cat]} · {targetMensual} veces al mes
          </Text>
        </Card>

        {/* ── Este mes ── */}
        <Card style={styles.sectionCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Este mes</Text>
            <Text style={[styles.metCount, { color }]}>{countMes}/{targetMensual}</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${Math.min(progressFill * 100, 100)}%`, backgroundColor: color }]} />
          </View>

          <Text style={styles.pctLabel}>{progressPct}% de cumplimiento mensual</Text>
        </Card>

        {/* ── Últimos 7 días ── */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Últimos 7 días</Text>
          <View style={styles.weekRow}>
            {last7.map(({ dateStr, dayLabel, done }) => (
              <View key={dateStr} style={styles.dayCol}>
                <View style={[
                  styles.dayCell,
                  done
                    ? { borderColor: color, borderWidth: 2, backgroundColor: 'transparent' }
                    : { borderColor: '#e0e0e0', borderWidth: 1.5, backgroundColor: 'transparent' },
                ]}>
                  {done
                    ? <Icon name="check" size={16} color={color} strokeWidth={2.5} />
                    : <View style={[styles.dot, { backgroundColor: '#d0d0d0' }]} />
                  }
                </View>
                <Text style={[styles.dayLabel, done && { color }]}>{dayLabel}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[styles.statNumber, { color }]}>{countMes}</Text>
            <Text style={styles.statLabel}>Veces este mes</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#19b78e' }]}>{progressPct}%</Text>
            <Text style={styles.statLabel}>Cumplimiento</Text>
          </Card>
        </View>

        {/* ── Renovar meta ── */}
        {canRenew && (
          <TouchableOpacity
            style={[styles.renewBtn, alreadyRenewed && styles.renewBtnDisabled]}
            onPress={alreadyRenewed ? undefined : handleOpenRenew}
            activeOpacity={alreadyRenewed ? 1 : 0.8}
          >
            <Icon name="refresh-cw" size={18} color={alreadyRenewed ? '#bbb' : '#fff'} strokeWidth={2} />
            <Text style={[styles.renewBtnText, alreadyRenewed && styles.renewBtnTextDisabled]}>
              {alreadyRenewed ? 'Ya renovada este mes' : 'Renovar meta'}
            </Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* ── Modal de renovación ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Renovar meta</Text>
            <Text style={styles.modalSub}>{CATEGORY_LABEL[cat]}</Text>

            <Text style={styles.inputLabel}>Título</Text>
            <TextInput
              style={styles.input}
              value={newTitulo}
              onChangeText={setNewTitulo}
              placeholder="Describe tu meta..."
              placeholderTextColor="#bbb"
            />

            <Text style={styles.inputLabel}>Veces por semana</Text>
            <TextInput
              style={styles.input}
              value={newDias}
              onChangeText={setNewDias}
              keyboardType="number-pad"
              placeholder="1 – 7"
              placeholderTextColor="#bbb"
              maxLength={1}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: color }]} onPress={handleConfirmRenew}>
                <Text style={styles.confirmBtnText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9f6f8' },
  scroll: { padding: 20, paddingBottom: 48 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  errorText: { fontFamily: 'Nunito_400Regular', fontSize: 16, color: '#555', marginBottom: 12 },

  // Hero
  heroCard: { borderRadius: 24, padding: 24, marginBottom: 16, alignItems: 'center', backgroundColor: '#fff' },
  iconCircle: { width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroTitle: { fontFamily: 'Nunito_700Bold', fontSize: 20, color: '#1a1a2e', textAlign: 'center', marginBottom: 6 },
  heroSub: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#888', textAlign: 'center' },

  // Cards
  sectionCard: { borderRadius: 20, padding: 18, marginBottom: 16, backgroundColor: '#fff' },
  sectionTitle: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#1a1a2e' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  metCount: { fontFamily: 'Fredoka_700Bold', fontSize: 20 },
  barBg: { height: 10, borderRadius: 999, backgroundColor: '#f0ece9', overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 999 },
  pctLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#888', marginTop: 8 },

  // Week
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  dayCol: { alignItems: 'center', gap: 6 },
  dayCell: { width: 38, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dayLabel: { fontFamily: 'Nunito_400Regular', fontSize: 11, color: '#aaa' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 20, padding: 16, alignItems: 'flex-start', backgroundColor: '#fff' },
  statNumber: { fontFamily: 'Fredoka_700Bold', fontSize: 36, lineHeight: 40 },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#888', marginTop: 2 },

  // Renew button
  renewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#e87a3f', borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 24, marginTop: 4, marginBottom: 8,
  },
  renewBtnDisabled: { backgroundColor: '#f0ece9' },
  renewBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#fff' },
  renewBtnTextDisabled: { color: '#bbb' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modalCard: {
    width: '100%', backgroundColor: '#fff',
    borderRadius: 24, padding: 24,
  },
  modalTitle: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: '#1a1a2e', marginBottom: 2 },
  modalSub: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: '#888', marginBottom: 20 },
  inputLabel: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: '#555', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#e8e0e5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    fontFamily: 'Nunito_400Regular', fontSize: 15, color: '#1a1a2e',
    marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#e8e0e5',
    borderRadius: 14, paddingVertical: 12, alignItems: 'center',
  },
  cancelBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#888' },
  confirmBtn: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  confirmBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#fff' },
});
