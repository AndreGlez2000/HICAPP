import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useHicStore, Categoria } from '../../store';
import { Button } from '../../components/primitives/Button';
import { Input } from '../../components/primitives/Input';
import { Stepper } from '../../components/primitives/Stepper';
import { ScreenHeader } from '../../components/chrome/ScreenHeader';
import { CATEGORY_LABEL, CATEGORY_TINT, CATEGORY_FG, CATEGORY_ICON } from '../../constants/design';
import { Icon } from '../../components/primitives/Icon';

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>(0);
  const setUserStore = useHicStore((s) => s.setUser);
  const setGoalsStore = useHicStore((s) => s.setGoals);

  // Form Data
  const [nombre, setNombre] = useState('');
  const [nickname, setNickname] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [talla, setTalla] = useState('');
  const [expediente, setExpediente] = useState('');

  // Goals
  const [alimentacionDias, setAlimentacionDias] = useState(5);
  const [actividadDias, setActividadDias] = useState(3);
  const [suenoDias, setSuenoDias] = useState(7);
  
  const [alimentacionTitulo, setAlimentacionTitulo] = useState('');
  const [actividadTitulo, setActividadTitulo] = useState('');
  const [suenoTitulo, setSuenoTitulo] = useState('');

  const [error, setError] = useState('');

  const nextStep = (next: Step) => {
    setError('');
    setStep(next);
  };

  const handleNext = () => {
    if (step === 1 && !nombre.trim()) return setError('Por favor, ingresa tu nombre');
    if (step === 2 && !nickname.trim()) return setError('Por favor, ingresa un apodo');
    if (step === 3) {
      if (!edad.trim() || !peso.trim() || !talla.trim()) return setError('Por favor, completa todos los campos');
      if (isNaN(Number(edad)) || isNaN(Number(peso)) || isNaN(Number(talla))) return setError('Ingresa valores numéricos válidos');
    }

    if (step === 5 && !alimentacionTitulo.trim()) return setError('Ingresa una descripción para la meta');
    if (step === 5 && alimentacionDias === 0) return setError('Selecciona al menos 1 día');
    if (step === 6 && !actividadTitulo.trim()) return setError('Ingresa una descripción para la meta');
    if (step === 6 && actividadDias === 0) return setError('Selecciona al menos 1 día');
    if (step === 7 && !suenoTitulo.trim()) return setError('Ingresa una descripción para la meta');
    if (step === 7 && suenoDias === 0) return setError('Selecciona al menos 1 día');

    if (step < 7) {
      nextStep((step + 1) as Step);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    setStep(8);
    try {
      // 1. User
      await setUserStore({
        nombre: nombre.trim(),
        nickname: nickname.trim(),
        edad: parseInt(edad, 10),
        peso: parseFloat(peso),
        talla: parseFloat(talla),
        expediente: expediente.trim(),
        onboarding_complete: 1,
      });

      // 2. Goals — limpia todo dato previo, luego inserta las 3 nuevas
      const currentMonth = new Date().toISOString().substring(0, 7);
      const { upsertGoal, getGoals } = require('../../db/goals');
      const { getDB } = require('../../db');
      await getDB().runAsync('DELETE FROM goals');
      await getDB().runAsync('DELETE FROM mi_dia_log');
      await getDB().runAsync('DELETE FROM photos');
      await upsertGoal({ categoria: 'alimentacion', titulo: alimentacionTitulo.trim(), dias_target: alimentacionDias, count_mes: 0, mes: currentMonth });
      await upsertGoal({ categoria: 'actividad',    titulo: actividadTitulo.trim(),    dias_target: actividadDias,    count_mes: 0, mes: currentMonth });
      await upsertGoal({ categoria: 'sueno',        titulo: suenoTitulo.trim(),        dias_target: suenoDias,        count_mes: 0, mes: currentMonth });
      const goalsDb = await getGoals();
      setGoalsStore(goalsDb);

      router.replace('/(tabs)/metas');
    } catch (err) {
      Alert.alert('Error al guardar', 'Intenta de nuevo');
      setStep(7);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View
            className="flex-1 items-center"
            style={{ paddingTop: 60 }}
          >
            {/* Logo */}
            <Image
              source={require('../../assets/logo_no_bg_v2.png')}
              style={{ width: 220, height: 220, marginBottom: 32 }}
              resizeMode="contain"
            />

            {/* Título */}
            <Text
              className="font-fredoka text-4xl text-center mb-4"
              style={{ color: '#ffffff' }}
            >
              ¡Bienvenido a HiC!
            </Text>

            {/* Subtítulo */}
            <Text
              className="font-nunito text-base text-center"
              style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 24, paddingHorizontal: 8 }}
            >
              Tu compañero en este viaje hacia un estilo de vida más saludable. Vamos a configurar tu perfil en unos pocos pasos.
            </Text>

            {/* Spacer flexible */}
            <View style={{ flex: 1 }} />
          </View>
        );
      case 1:
        return (
          <View className="flex-1 justify-center">
            <Text className="font-fredoka text-primary text-3xl mb-6">¿Cuál es tu nombre?</Text>
            <Input
              value={nombre}
              onChangeText={(t) => { setNombre(t); setError(''); }}
              placeholder="Escribe tu nombre"
              error={error}
            />
          </View>
        );
      case 2:
        return (
          <View className="flex-1 justify-center">
            <Text className="font-fredoka text-primary text-3xl mb-6">¿Cómo te gusta que te llamen?</Text>
            <Input
              value={nickname}
              onChangeText={(t) => { setNickname(t); setError(''); }}
              placeholder="Escribe tu apodo"
              error={error}
            />
          </View>
        );
      case 3:
        return (
          <View className="flex-1 justify-center gap-4">
            <Text className="font-fredoka text-primary text-3xl mb-2">Tus datos</Text>
            <Input
              label="Edad"
              value={edad}
              onChangeText={(t) => { setEdad(t); setError(''); }}
              placeholder="Ej. 10"
              keyboardType="numeric"
            />
            <Input
              label="Peso (kg)"
              value={peso}
              onChangeText={(t) => { setPeso(t); setError(''); }}
              placeholder="Ej. 38.5"
              keyboardType="numeric"
            />
            <Input
              label="Estatura (cm)"
              value={talla}
              onChangeText={(t) => { setTalla(t); setError(''); }}
              placeholder="Ej. 142"
              keyboardType="numeric"
            />
            {error ? <Text className="font-nunito text-xs text-red-600 mt-1">{error}</Text> : null}
          </View>
        );
      case 4:
        return (
          <View className="flex-1 justify-center">
            <Text className="font-fredoka text-primary text-3xl mb-6">Número de Expediente</Text>
            <Input
              value={expediente}
              onChangeText={(t) => { setExpediente(t); setError(''); }}
              placeholder="Ej. HC-2026-001"
              error={error}
            />
            <TouchableOpacity onPress={handleNext} className="mt-8 items-center">
              <Text className="font-nunito-bold text-[#e87a3f] text-base">Saltear por ahora →</Text>
            </TouchableOpacity>
          </View>
        );
      case 5:
        return <GoalStep cat="alimentacion" dias={alimentacionDias} setDias={setAlimentacionDias} titulo={alimentacionTitulo} setTitulo={setAlimentacionTitulo} error={error} setError={setError} />;
      case 6:
        return <GoalStep cat="actividad" dias={actividadDias} setDias={setActividadDias} titulo={actividadTitulo} setTitulo={setActividadTitulo} error={error} setError={setError} />;
      case 7:
        return <GoalStep cat="sueno" dias={suenoDias} setDias={setSuenoDias} titulo={suenoTitulo} setTitulo={setSuenoTitulo} error={error} setError={setError} />;
      case 8:
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="font-fredoka text-primary text-2xl text-center">Guardando...</Text>
          </View>
        );
    }
  };

  const isWelcome = step === 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: isWelcome ? '#522c45' : undefined }}
      className={isWelcome ? '' : 'bg-bg'}
    >
      <ScreenHeader
        title={step > 0 && step < 5 ? `Paso ${step} de 4` : step >= 5 && step < 8 ? `Meta de ${CATEGORY_LABEL[(step === 5 ? 'alimentacion' : step === 6 ? 'actividad' : 'sueno') as Categoria]}` : ''}
        showBack={step > 0 && step < 8}
        onBack={() => setStep((step - 1) as Step)}
      />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: isWelcome ? 40 : 250 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1">
          {renderStep()}
        </View>

        {step < 8 && (
          <View className="pt-8 mt-auto">
            <Button onPress={handleNext}>
              {step === 0 ? 'Comenzar' : step === 7 ? 'Finalizar' : 'Continuar'}
            </Button>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function GoalStep({ cat, dias, setDias, titulo, setTitulo, error, setError }: { cat: Categoria, dias: number, setDias: (d: number) => void, titulo: string, setTitulo: (t: string) => void, error: string, setError: (e: string) => void }) {
  const placeholders = {
    alimentacion: 'Ej. Comer fruta en el desayuno',
    actividad: 'Ej. Salir a jugar 30 minutos',
    sueno: 'Ej. Apagar pantallas a las 9pm'
  };

  return (
    <View className="flex-1 justify-center items-center">
      <View className="w-20 h-20 rounded-full items-center justify-center mb-6" style={{ backgroundColor: CATEGORY_TINT[cat] }}>
        <Icon name={CATEGORY_ICON[cat]} size={40} color={CATEGORY_FG[cat]} />
      </View>
      <Text className="font-fredoka text-primary text-3xl mb-4 text-center" adjustsFontSizeToFit numberOfLines={2}>
        Meta de {CATEGORY_LABEL[cat]}
      </Text>
      <View className="w-full mb-6">
        <Input
          label="Descripción de la meta"
          value={titulo}
          onChangeText={(t) => { setTitulo(t); setError(''); }}
          placeholder={placeholders[cat]}
        />
      </View>
      <Text className="font-fredoka text-primary text-xl mb-4 text-center">
        ¿Cuántos días a la semana?
      </Text>
      <View className="mb-4">
        <Stepper value={dias} onChange={(v) => { setDias(v); setError(''); }} min={1} max={7} />
      </View>
      {error ? <Text className="font-nunito text-xs text-red-600 mt-1 text-center">{error}</Text> : null}
    </View>
  );
}
