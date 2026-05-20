import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import { useHicStore, Categoria } from '../../store';
import { Button } from '../../components/primitives/Button';
import { Input } from '../../components/primitives/Input';
import { DatePickerField } from '../../components/primitives/DatePickerField';
import { WheelPicker } from '../../components/primitives/WheelPicker';
import { Stepper } from '../../components/primitives/Stepper';
import { ScreenHeader } from '../../components/chrome/ScreenHeader';
import { CATEGORY_LABEL, CATEGORY_TINT, CATEGORY_FG, CATEGORY_ICON } from '../../constants/design';
import { Icon } from '../../components/primitives/Icon';
import { requestNotificationPermission } from '../../services/notifications';
import { calculateAge } from '../../utils/age';

const PESO_MIN = 20;
const PESO_ITEMS = Array.from({ length: 181 }, (_, i) => String(i + PESO_MIN)); // '20'..'200'
const PESO_DEFAULT = 60; // kg

const TALLA_MIN = 80;
const TALLA_ITEMS = Array.from({ length: 141 }, (_, i) => String(i + TALLA_MIN)); // '80'..'220'
const TALLA_DEFAULT = 150; // cm

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>(0);
  const setUserStore = useHicStore((s) => s.setUser);
  const setGoalsStore = useHicStore((s) => s.setGoals);

  // Form Data
  const [nombre, setNombre] = useState('');
  const [nickname, setNickname] = useState('');
  const [dob, setDob] = useState('');
  const maxDob = new Date();
  const [peso, setPeso] = useState<number>(PESO_DEFAULT);
  const [talla, setTalla] = useState<number>(TALLA_DEFAULT);
  const [expediente, setExpediente] = useState('');

  // Goals
  const [alimentacionDias, setAlimentacionDias] = useState(5);
  const [actividadDias, setActividadDias] = useState(3);
  const [suenoDias, setSuenoDias] = useState(7);
  
  const [alimentacionTitulo, setAlimentacionTitulo] = useState('');
  const [actividadTitulo, setActividadTitulo] = useState('');
  const [suenoTitulo, setSuenoTitulo] = useState('');

  const [error, setError] = useState('');

  // Permission hooks
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const nextStep = (next: Step) => {
    setError('');
    setStep(next);
  };

  const handleNext = () => {
    if (step === 4 && !nombre.trim()) return setError('Por favor, ingresa tu nombre');
    if (step === 5 && !nickname.trim()) return setError('Por favor, ingresa un apodo');
    if (step === 6) {
      if (!dob.trim()) return setError('Por favor, ingresa tu fecha de nacimiento');
    }

    if (step === 8 && !alimentacionTitulo.trim()) return setError('Ingresa una descripción para la meta');
    if (step === 8 && alimentacionDias === 0) return setError('Selecciona al menos 1 día');
    if (step === 9 && !actividadTitulo.trim()) return setError('Ingresa una descripción para la meta');
    if (step === 9 && actividadDias === 0) return setError('Selecciona al menos 1 día');
    if (step === 10 && !suenoTitulo.trim()) return setError('Ingresa una descripción para la meta');
    if (step === 10 && suenoDias === 0) return setError('Selecciona al menos 1 día');

    if (step < 10) {
      nextStep((step + 1) as Step);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    setStep(11);
    try {
      // 1. User
      const edad = calculateAge(dob);
      await setUserStore({
        nombre: nombre.trim(),
        nickname: nickname.trim(),
        edad,
        peso,
        talla,
        expediente: expediente.trim(),
        onboarding_complete: 1,
        fecha_nacimiento: dob,
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
      setStep(10);
    }
  };

  const handleCameraPermission = async () => {
    const result = await requestCameraPermission();
    // Advance regardless of outcome (granted or denied)
    nextStep(3);
  };

  const handleNotificationPermission = async () => {
    await requestNotificationPermission();
    // Advance regardless of outcome (granted or denied)
    nextStep(4);
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
          <View className="flex-1 justify-center items-center" style={{ paddingHorizontal: 8 }}>
            {/* Ícono principal */}
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-8"
              style={{ backgroundColor: 'rgba(82,44,69,0.12)' }}
            >
              <Icon name="sparkles" size={48} color="#522c45" />
            </View>

            {/* Título */}
            <Text className="font-fredoka text-primary text-3xl text-center mb-4">
              Cómo funciona HiC
            </Text>

            {/* Descripción general */}
            <Text className="font-nunito text-base text-center mb-8" style={{ color: '#555', lineHeight: 24 }}>
              HiC te ayuda a llevar un registro de tus hábitos de alimentación, actividad física y sueño para que puedas alcanzar tus metas de salud.
            </Text>

            {/* Filas de características */}
            <View className="w-full gap-4">
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: CATEGORY_TINT['alimentacion'] }}
                >
                  <Icon name={CATEGORY_ICON['alimentacion']} size={20} color={CATEGORY_FG['alimentacion']} />
                </View>
                <Text className="font-nunito text-sm flex-1" style={{ color: '#333', lineHeight: 20 }}>
                  Registra tus comidas y conoce tu progreso diario.
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: CATEGORY_TINT['actividad'] }}
                >
                  <Icon name={CATEGORY_ICON['actividad']} size={20} color={CATEGORY_FG['actividad']} />
                </View>
                <Text className="font-nunito text-sm flex-1" style={{ color: '#333', lineHeight: 20 }}>
                  Mantén el control de tu actividad física semanal.
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: CATEGORY_TINT['sueno'] }}
                >
                  <Icon name={CATEGORY_ICON['sueno']} size={20} color={CATEGORY_FG['sueno']} />
                </View>
                <Text className="font-nunito text-sm flex-1" style={{ color: '#333', lineHeight: 20 }}>
                  Cuida tu descanso y establece metas de sueño saludables.
                </Text>
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View className="flex-1 justify-center items-center" style={{ paddingHorizontal: 8 }}>
            {/* Ícono de cámara */}
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-8"
              style={{ backgroundColor: 'rgba(82,44,69,0.12)' }}
            >
              <Icon name="camera" size={48} color="#522c45" />
            </View>

            {/* Título */}
            <Text className="font-fredoka text-primary text-3xl text-center mb-4">
              Acceso a la cámara
            </Text>

            {/* Explicación */}
            <Text className="font-nunito text-base text-center mb-10" style={{ color: '#555', lineHeight: 24 }}>
              HiC utiliza la cámara para que puedas tomar fotos de tus comidas y registrar tu progreso visual de forma sencilla.
            </Text>

            {/* Botones */}
            <View className="w-full gap-4">
              <Button onPress={handleCameraPermission}>
                Permitir acceso
              </Button>
              <TouchableOpacity
                onPress={() => nextStep(3)}
                className="items-center py-3"
              >
                <Text className="font-nunito-bold text-[#e87a3f] text-base">Omitir por ahora</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 3:
        return (
          <View className="flex-1 justify-center items-center" style={{ paddingHorizontal: 8 }}>
            {/* Ícono de notificaciones */}
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-8"
              style={{ backgroundColor: 'rgba(82,44,69,0.12)' }}
            >
              <Icon name="bell" size={48} color="#522c45" />
            </View>

            {/* Título */}
            <Text className="font-fredoka text-primary text-3xl text-center mb-4">
              Notificaciones
            </Text>

            {/* Explicación */}
            <Text className="font-nunito text-base text-center mb-10" style={{ color: '#555', lineHeight: 24 }}>
              Activa las notificaciones para que HiC te recuerde tomar agua y registrar tus metas a lo largo del día.
            </Text>

            {/* Botones */}
            <View className="w-full gap-4">
              <Button onPress={handleNotificationPermission}>
                Permitir notificaciones
              </Button>
              <TouchableOpacity
                onPress={() => nextStep(4)}
                className="items-center py-3"
              >
                <Text className="font-nunito-bold text-[#e87a3f] text-base">Omitir por ahora</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 4:
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
      case 5:
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
      case 6:
        return (
          <View className="flex-1 justify-center gap-6">
            <Text className="font-fredoka text-primary text-3xl mb-2">Tus datos</Text>
            <DatePickerField
              label="Fecha de nacimiento"
              value={dob}
              onChange={(iso) => { setDob(iso); setError(''); }}
              maxDate={maxDob}
            />
            <WheelPicker
              label="Peso"
              items={PESO_ITEMS}
              selectedIndex={peso - PESO_MIN}
              onChange={(i) => setPeso(i + PESO_MIN)}
              unit="kg"
            />
            <WheelPicker
              label="Estatura"
              items={TALLA_ITEMS}
              selectedIndex={talla - TALLA_MIN}
              onChange={(i) => setTalla(i + TALLA_MIN)}
              unit="cm"
            />
            {error ? <Text className="font-nunito text-xs text-red-600 mt-1">{error}</Text> : null}
          </View>
        );
      case 7:
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
      case 8:
        return <GoalStep cat="alimentacion" dias={alimentacionDias} setDias={setAlimentacionDias} titulo={alimentacionTitulo} setTitulo={setAlimentacionTitulo} error={error} setError={setError} />;
      case 9:
        return <GoalStep cat="actividad" dias={actividadDias} setDias={setActividadDias} titulo={actividadTitulo} setTitulo={setActividadTitulo} error={error} setError={setError} />;
      case 10:
        return <GoalStep cat="sueno" dias={suenoDias} setDias={setSuenoDias} titulo={suenoTitulo} setTitulo={setSuenoTitulo} error={error} setError={setError} />;
      case 11:
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="font-fredoka text-primary text-2xl text-center">Guardando...</Text>
          </View>
        );
    }
  };

  const isWelcome = step === 0;
  // Steps 2 and 3 render their own action buttons inside the step content
  const hasCustomButtons = step === 2 || step === 3;

  const headerTitle = () => {
    if (step === 1) return 'Cómo funciona HiC';
    if (step === 2) return 'Permisos de cámara';
    if (step === 3) return 'Notificaciones';
    if (step >= 4 && step <= 7) return `Paso ${step - 3} de 4`;
    if (step === 8) return `Meta de ${CATEGORY_LABEL['alimentacion']}`;
    if (step === 9) return `Meta de ${CATEGORY_LABEL['actividad']}`;
    if (step === 10) return `Meta de ${CATEGORY_LABEL['sueno']}`;
    return '';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: isWelcome ? '#522c45' : undefined }}
      className={isWelcome ? '' : 'bg-bg'}
    >
      <ScreenHeader
        title={headerTitle()}
        showBack={step > 0 && step < 11}
        onBack={() => setStep((step - 1) as Step)}
      />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: isWelcome ? 40 : 250 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1">
          {renderStep()}
        </View>

        {step < 11 && !hasCustomButtons && (
          <View className="pt-8 mt-auto">
            <Button onPress={handleNext}>
              {step === 0 ? 'Comenzar' : step === 10 ? 'Finalizar' : 'Continuar'}
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
