import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useHicStore } from '../../store';
import { ScreenHeader } from '../../components/chrome/ScreenHeader';
import { Button } from '../../components/primitives/Button';
import { Input } from '../../components/primitives/Input';
import { Stepper } from '../../components/primitives/Stepper';
import { Card } from '../../components/primitives/Card';
import { Icon } from '../../components/primitives/Icon';
import {
  CATEGORY_LABEL,
  CATEGORY_TINT,
  CATEGORY_FG,
  CATEGORY_ICON,
} from '../../constants/design';
import type { Categoria } from '../../store';

type RenewalStep = 0 | 1 | 2;

const STEPS: Categoria[] = ['alimentacion', 'actividad', 'sueno'];
const PLACEHOLDERS: Record<Categoria, string> = {
  alimentacion: 'Ej. Comer fruta en el desayuno',
  actividad: 'Ej. Salir a jugar 30 minutos',
  sueno: 'Ej. Apagar pantallas a las 9pm',
};

export default function GoalRenewalScreen() {
  const goals = useHicStore((s) => s.goals);
  const renewGoal = useHicStore((s) => s.renewGoal);
  const loadFromDB = useHicStore((s) => s.loadFromDB);

  const [renewalData, setRenewalData] = useState(() =>
    STEPS.map((cat) => {
      const existing = goals.find((g) => g.categoria === cat);
      return {
        goalId: existing?.id ?? 0,
        titulo: existing?.titulo ?? '',
        diasTarget: existing?.dias_target ?? 5,
      };
    })
  );

  const [step, setStep] = useState<RenewalStep>(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const cat = STEPS[step];
  const prevGoal = goals.find((g) => g.categoria === cat);
  const current = renewalData[step];

  const setField = (field: 'titulo' | 'diasTarget', value: string | number) => {
    setError('');
    setRenewalData((prev) =>
      prev.map((item, idx) =>
        idx === step ? { ...item, [field]: value } : item
      )
    );
  };

  const handleNext = async () => {
    if (!current.titulo.trim()) {
      setError('Por favor, ingresa una descripción para la meta');
      return;
    }
    if (current.diasTarget < 1) {
      setError('Selecciona al menos 1 día');
      return;
    }
    setError('');

    if (step < 2) {
      setStep((step + 1) as RenewalStep);
    } else {
      // Last step — save all
      setSaving(true);
      try {
        const currentMonth = new Date().toISOString().substring(0, 7);
        for (const item of renewalData) {
          await renewGoal(item.goalId, item.titulo.trim(), item.diasTarget, currentMonth);
        }
        await loadFromDB();
        router.replace('/(tabs)/metas');
      } catch (err) {
        console.error('[GoalRenewal] Error saving:', err);
        setError('Error al guardar. Intenta de nuevo.');
        setSaving(false);
      }
    }
  };

  if (saving) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <Text className="font-fredoka text-primary text-2xl text-center">Guardando metas...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-bg"
    >
      <ScreenHeader
        title="Renovar metas"
        subtitle={`Paso ${step + 1} de 3 · ${CATEGORY_LABEL[cat]}`}
        showBack
        onBack={() => {
          setError('');
          if (step === 0) {
            router.back();
          } else {
            setStep((step - 1) as RenewalStep);
          }
        }}
      />

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category card — previous goal */}
        <Card className="mb-6" style={{ backgroundColor: CATEGORY_TINT[cat] }}>
          <View className="flex-row items-center gap-3 mb-3">
            <View
              className="w-11 h-11 rounded-xl items-center justify-center"
              style={{ backgroundColor: CATEGORY_FG[cat] + '22' }}
            >
              <Icon name={CATEGORY_ICON[cat]} size={22} color={CATEGORY_FG[cat]} />
            </View>
            <Text className="font-fredoka text-xl" style={{ color: CATEGORY_FG[cat] }}>
              {CATEGORY_LABEL[cat]}
            </Text>
          </View>
          {prevGoal && (
            <>
              <Text className="font-nunito-bold text-xs text-muted mb-1">Meta anterior:</Text>
              <Text className="font-nunito text-sm text-ink italic">"{prevGoal.titulo}"</Text>
            </>
          )}
        </Card>

        {/* New goal input */}
        <View className="mb-6">
          <Input
            label="¿Cuál es la nueva meta?"
            value={current.titulo}
            onChangeText={(t) => setField('titulo', t)}
            placeholder={PLACEHOLDERS[cat]}
            error={error.includes('descripción') ? error : undefined}
          />
        </View>

        {/* Days stepper */}
        <View className="mb-6">
          <Text className="font-nunito-bold text-sm text-ink mb-3">¿Cuántos días a la semana?</Text>
          <View className="items-center">
            <Stepper
              value={current.diasTarget}
              onChange={(v) => setField('diasTarget', v)}
              min={1}
              max={7}
            />
          </View>
          <Text className="font-nunito text-xs text-muted text-center mt-2">
            {current.diasTarget} {current.diasTarget === 1 ? 'día' : 'días'} a la semana
          </Text>
        </View>

        {error && !error.includes('descripción') && (
          <Text className="font-nunito text-xs text-red-600 mb-4 text-center">{error}</Text>
        )}

        <Button onPress={handleNext} disabled={saving}>
          {step < 2 ? 'Siguiente →' : 'Guardar metas'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
