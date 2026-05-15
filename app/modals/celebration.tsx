import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../components/primitives/Button';
import { useHicStore } from '../../store';

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

export default function CelebrationModal() {
  const clearNavigationContext = useHicStore((s) => s.clearNavigationContext);
  const modalMessage = useHicStore((s) => s.navigationContext.modalMessage);

  // Trophy animation
  const trophyScale = useRef(new Animated.Value(0)).current;
  const trophyOpacity = useRef(new Animated.Value(0)).current;

  // Content animation
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(30)).current;

  // CTA animation
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(0.8)).current;

  // Confetti animations
  const confettiAnims = useRef(
    CONFETTI_DOTS.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
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
  }, []);

  const handleClose = () => {
    clearNavigationContext();
    router.replace('/(tabs)/metas');
  };

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

      {/* Trophy */}
      <Animated.View style={[styles.trophyCircle, { opacity: trophyOpacity, transform: [{ scale: trophyScale }] }]}>
        <Text style={styles.trophyEmoji}>🏆</Text>
      </Animated.View>

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

        <View style={styles.streakChip}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>¡Sigue así, campeón!</Text>
        </View>
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
  trophyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fdf0e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#e87a3f',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  trophyEmoji: {
    fontSize: 56,
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
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    fontSize: 20,
  },
  streakText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#e87a3f',
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 48,
    left: 32,
    right: 32,
  },
});
