import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Image } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../components/primitives/Button';
import { useHicStore } from '../../store';
import { buildCompletedMaps, getCompletedSetForLocalDate } from '../../utils/report-range';
import { getLocalDateKey } from '../../utils/date-keys';

const { width, height } = Dimensions.get('window');

const CONFETTI_DOTS = [
  { x: 0.1,  y: 0.12, size: 14, color: '#e87a3f', delay: 100 },
  { x: 0.85, y: 0.15, size: 10, color: '#19b78e', delay: 200 },
  { x: 0.15, y: 0.72, size: 16, color: '#522c45', delay: 150 },
  { x: 0.78, y: 0.78, size: 8,  color: '#3560a0', delay: 300 },
  { x: 0.50, y: 0.08, size: 12, color: '#69bd45', delay: 50  },
  { x: 0.05, y: 0.45, size: 10, color: '#e87a3f', delay: 250 },
  { x: 0.90, y: 0.48, size: 14, color: '#19b78e', delay: 180 },
  { x: 0.40, y: 0.88, size: 12, color: '#522c45', delay: 220 },
  { x: 0.65, y: 0.25, size: 9,  color: '#f5c542', delay: 130 },
  { x: 0.30, y: 0.55, size: 11, color: '#e87a3f', delay: 80  },
];

const MASCOT_MESSAGES = [
  "¡Sigue así, campeón!",
  "¡Eres imparable!",
  "¡Qué gran esfuerzo!",
  "¡Excelente trabajo!",
  "¡Vas por muy buen camino!",
  "¡Esa es la actitud!",
  "¡Lo estás haciendo genial!",
];

export default function CelebrationModal() {
  const clearNavigationContext = useHicStore((s) => s.clearNavigationContext);
  const modalMessage = useHicStore((s) => s.navigationContext.modalMessage);
  const miDiaLog = useHicStore((s) => s.miDiaLog);

  // Random message
  const [randomMessage, setRandomMessage] = useState(MASCOT_MESSAGES[0]);

  // Streak logic
  const streak = useMemo(() => {
    const { completedByDate } = buildCompletedMaps(miDiaLog);
    const today = new Date();
    const todayKey = getLocalDateKey(today);
    const todaySet = getCompletedSetForLocalDate(completedByDate, todayKey);
    const todayComplete = (['alimentacion', 'actividad', 'sueno'] as const).every((cat) => todaySet.has(cat));
    if (!todayComplete) return 0;

    let count = 0;
    const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    while (true) {
      const dateKey = getLocalDateKey(cursor);
      const completedSet = getCompletedSetForLocalDate(completedByDate, dateKey);
      const isComplete = (['alimentacion', 'actividad', 'sueno'] as const).every((cat) => completedSet.has(cat));
      if (!isComplete) break;
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [miDiaLog]);

  const oldStreak = Math.max(0, streak - 1);

  // Animations
  const trophyScale = useRef(new Animated.Value(0)).current;
  const trophyOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(30)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(0.8)).current;
  const tickerAnim = useRef(new Animated.Value(0)).current;

  const confettiAnims = useRef(
    CONFETTI_DOTS.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    setRandomMessage(MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)]);

    // Trophy pop
    Animated.parallel([
      Animated.timing(trophyOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(trophyScale, { toValue: 1, damping: 8, stiffness: 200, mass: 0.7, useNativeDriver: true }),
    ]).start();

    // Content after 350ms
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 450, delay: 350, useNativeDriver: true }),
      Animated.spring(contentTranslate, { toValue: 0, damping: 14, delay: 350, useNativeDriver: true } as any),
    ]).start();

    // CTA after 600ms
    Animated.parallel([
      Animated.timing(ctaOpacity, { toValue: 1, duration: 400, delay: 600, useNativeDriver: true }),
      Animated.spring(ctaScale, { toValue: 1, damping: 12, delay: 600, useNativeDriver: true } as any),
    ]).start();

    // Confetti
    confettiAnims.forEach((anim, i) => {
      const dot = CONFETTI_DOTS[i];
      Animated.parallel([
        Animated.timing(anim.opacity, { toValue: 1, duration: 400, delay: dot.delay, useNativeDriver: true }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim.translateY, { toValue: -12, duration: 800, delay: dot.delay, useNativeDriver: true }),
            Animated.timing(anim.translateY, { toValue: 12, duration: 800, useNativeDriver: true }),
          ])
        ),
      ]).start();
    });

    // Streak increment animation (odometer effect)
    if (streak > 0 && oldStreak !== streak) {
      const timer = setTimeout(() => {
        Animated.spring(tickerAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [streak]);

  const handleClose = () => {
    clearNavigationContext();
    router.replace('/(tabs)/metas');
  };

  const tickerTranslateY = tickerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -32], // Adjust to exactly the height of the number
  });

  return (
    <View style={styles.container}>
      {/* Confetti dots */}
      {CONFETTI_DOTS.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: dot.x * width,
            top: dot.y * height,
            width: dot.size,
            height: dot.size,
            borderRadius: dot.size / 2,
            backgroundColor: dot.color,
            opacity: confettiAnims[i].opacity,
            transform: [{ translateY: confettiAnims[i].translateY }],
          }}
        />
      ))}

      {/* Mascot (Sonrisas) Celebration with Bubble */}
      <View style={styles.mascotContainer}>
        <Animated.View style={[styles.speechBubble, { opacity: trophyOpacity, transform: [{ scale: trophyScale }] }]}>
          <Text style={styles.speechText}>{randomMessage}</Text>
          <View style={styles.speechPointer} />
        </Animated.View>

        <Animated.View style={[styles.trophyCircle, { opacity: trophyOpacity, transform: [{ scale: trophyScale }] }]}>
          <Image source={require('../../assets/sonrisas.png')} style={{ width: 150, height: 150 }} resizeMode="contain" />
        </Animated.View>
      </View>

      {/* Content */}
      <Animated.View style={[styles.contentBlock, { opacity: contentOpacity, transform: [{ translateY: contentTranslate }] }]}>
        <Text style={styles.title}>¡Meta alcanzada!</Text>

        {modalMessage ? (
          <View style={styles.messageChip}>
            <Text style={styles.messageText}>{modalMessage}</Text>
          </View>
        ) : (
          <Text style={styles.subtitle}>Completaste los 3 hábitos del día. ¡Increíble!</Text>
        )}

        {streak > 0 && (
          <View style={styles.streakChip}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakLabel}>Racha actual:</Text>
            
            {/* Odometer Animation */}
            <View style={styles.tickerContainer}>
              <Animated.View style={{ transform: [{ translateY: tickerTranslateY }] }}>
                <Text style={styles.tickerNumber}>{oldStreak}</Text>
                <Text style={styles.tickerNumber}>{streak}</Text>
              </Animated.View>
            </View>

            <Text style={styles.streakSuffix}>{streak === 1 ? 'día' : 'días'}</Text>
          </View>
        )}
      </Animated.View>

      {/* CTA */}
      <Animated.View style={[styles.ctaContainer, { opacity: ctaOpacity, transform: [{ scale: ctaScale }] }]}>
        <Button onPress={handleClose}>¡Genial!</Button>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -40,
  },
  speechBubble: {
    backgroundColor: '#e87a3f',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 12,
    position: 'relative',
    shadowColor: '#e87a3f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 250,
  },
  speechText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  speechPointer: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#e87a3f',
  },
  trophyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  contentBlock: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 40,
    color: '#522c45',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: '#70787c',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  messageChip: {
    backgroundColor: '#f5eef2',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
    maxWidth: 300,
  },
  messageText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#522c45',
    textAlign: 'center',
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#fde8d6',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  streakEmoji: {
    fontSize: 26,
    marginRight: 4,
  },
  streakLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: '#70787c',
  },
  tickerContainer: {
    height: 32,
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  tickerNumber: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    color: '#e87a3f',
    height: 32,
    lineHeight: 32,
    textAlign: 'center',
  },
  streakSuffix: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: '#e87a3f',
    marginTop: 2, // Slight alignment tweak for Nunito vs Fredoka
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 48,
    left: 32,
    right: 32,
  },
});