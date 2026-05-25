import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useHicStore, Categoria } from '../../store';
import { Icon } from '../primitives/Icon';
import { CATEGORY_LABEL, CATEGORY_ICON, CATEGORY_FG } from '../../constants/design';

interface MiDiaCardProps {
  categoria: Categoria;
  titulo: string;
}

export function MiDiaCard({ categoria, titulo }: MiDiaCardProps) {
  const miDiaLog = useHicStore((s) => s.miDiaLog);
  const toggleMiDia = useHicStore((s) => s.toggleMiDia);

  const todayStr = new Date().toISOString().split('T')[0];
  const isDone = miDiaLog.some(
    (l) => l.fecha === todayStr && l.categoria === categoria && l.completado === 1
  );

  const color = CATEGORY_FG[categoria];

  return (
    <TouchableOpacity
      activeOpacity={isDone ? 1 : 0.8}
      onPress={isDone ? undefined : () => toggleMiDia(todayStr, categoria)}
      style={[styles.card, isDone && styles.cardDone]}
    >
      {/* Ícono */}
      <View style={[styles.iconBox, isDone && styles.iconBoxDone]}>
        <Icon name={CATEGORY_ICON[categoria]} size={22} color={isDone ? '#ccc' : '#aaa'} strokeWidth={1.5} />
      </View>

      {/* Texto */}
      <View style={styles.textBlock}>
        <Text style={[styles.catLabel, { color: isDone ? '#ccc' : color }]}>
          {CATEGORY_LABEL[categoria].toUpperCase()}
        </Text>
        <Text style={[styles.titulo, isDone && styles.tituloDone]} numberOfLines={2}>{titulo}</Text>
      </View>

      {/* Checkmark */}
      <View style={[
        styles.checkCircle,
        isDone ? { backgroundColor: color, borderColor: color } : styles.checkEmpty,
      ]}>
        {isDone && <Icon name="check" size={16} color="#fff" strokeWidth={3} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f4f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  catLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  titulo: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#1a1a2e',
    lineHeight: 20,
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkEmpty: {
    borderWidth: 2,
    borderColor: '#d8d8d8',
    backgroundColor: 'transparent',
  },
  cardDone: {
    backgroundColor: '#fafafa',
    shadowOpacity: 0,
    elevation: 0,
  },
  iconBoxDone: {
    backgroundColor: '#f0f0f0',
  },
  tituloDone: {
    color: '#bbb',
    textDecorationLine: 'line-through',
  },
});
