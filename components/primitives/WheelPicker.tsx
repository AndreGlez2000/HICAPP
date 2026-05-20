import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import Wheely from 'react-native-wheely';

interface WheelPickerProps {
  /** Display label shown above the field (e.g. "Peso") */
  label?: string;
  /** String values to display in the drum roll (e.g. ['20','21',...,'200']) */
  items: string[];
  /** Currently selected index into items[] */
  selectedIndex: number;
  /** Called with the new index when user confirms */
  onChange: (index: number) => void;
  /** Short unit string rendered next to the value (e.g. "kg", "cm") */
  unit?: string;
}

export function WheelPicker({ label, items, selectedIndex, onChange, unit }: WheelPickerProps) {
  const [open, setOpen] = useState(false);
  const [tempIndex, setTempIndex] = useState(selectedIndex);
  const [renderKey, setRenderKey] = useState(0);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleConfirm = () => {
    onChange(tempIndex);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      setTempIndex(selectedIndex);
      setRenderKey((k) => k + 1);
    });
    return () => cancelAnimationFrame(raf);
  }, [open, selectedIndex]);

  return (
    <>
      {/* Field trigger */}
      <View className="w-full">
        {label && (
          <Text className="font-nunito-bold text-sm text-ink mb-1.5">{label}</Text>
        )}
        <TouchableOpacity
          onPress={handleOpen}
          activeOpacity={0.7}
          className="flex-row items-center bg-surface border border-border px-4"
          style={{ height: 48, borderRadius: 12 }}
        >
          <Text className="font-nunito text-base text-ink flex-1">
            {items[selectedIndex]}
          </Text>
          {unit && (
            <Text className="font-nunito-bold text-muted text-base">{unit}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal with drum-roll — lives outside the ScrollView */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
          onPress={handleCancel}
        />
        <SafeAreaView style={{ backgroundColor: '#fff' }}>
          {/* Header */}
          <View
            className="flex-row items-center justify-between px-5 border-b border-border"
            style={{ height: 52 }}
          >
            <TouchableOpacity onPress={handleCancel}>
              <Text className="font-nunito text-base text-muted">Cancelar</Text>
            </TouchableOpacity>
            {label && (
              <Text className="font-fredoka text-lg text-ink">{label}</Text>
            )}
            <TouchableOpacity onPress={handleConfirm}>
              <Text className="font-nunito-bold text-base text-primary">Listo</Text>
            </TouchableOpacity>
          </View>

          {/* Drum roll — key fuerza re-mount cuando abre para mostrar el valor inicial */}
          <View className="flex-row items-center justify-center py-4">
            <Wheely
              key={`wheel-${items[0]}-${renderKey}`}
              options={items}
              selectedIndex={tempIndex}
              onChange={setTempIndex}
              itemHeight={44}
              visibleRest={2}
              containerStyle={{ width: 120 }}
              selectedIndicatorStyle={{ backgroundColor: '#f5eef2' }}
              itemTextStyle={{ fontFamily: 'Nunito_400Regular', color: '#0f172a', fontSize: 20 }}
            />
            {unit && (
              <Text className="font-nunito-bold text-xl text-ink ml-2">{unit}</Text>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}
