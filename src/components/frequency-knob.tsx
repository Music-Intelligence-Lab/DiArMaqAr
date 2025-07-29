"use client";

import React, { useEffect, useState, useRef } from "react";
import { KnobHeadless, useKnobKeyboardControls } from "react-knob-headless";

interface FrequencyKnobProps {
  value: number;
  onChange: (value: number) => void;
  onFrequencyRatioChange?: (ratio: number) => void; // Direct ratio updates for all active notes
  min?: number;
  max?: number;
  size?: number;
  label?: string;
}

export default function FrequencyKnob({
  value,
  onChange,
  onFrequencyRatioChange,
  min = 100,
  max = 800,
  size = 60,
  label = "Hz"
}: FrequencyKnobProps) {
  const [initialValue, setInitialValue] = useState<number | null>(null);
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [lastValue, setLastValue] = useState(value); // Track last value for ratio calculation
  const hasCommittedRef = useRef(false); // Track if we've already committed the current drag value
  
  // Set initial value on first render and calculate dynamic range
  useEffect(() => {
    if (initialValue === null && value !== undefined) {
      setInitialValue(value);
    }
  }, [value, initialValue]);

  // Keep local value in sync with prop value when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value);
      setLastValue(value);
      hasCommittedRef.current = false; // Reset the commit flag when not dragging
    }
  }, [value, isDragging]);

  // Detect when dragging ends and commit the value (only once)
  useEffect(() => {
    if (!isDragging && localValue !== value && !hasCommittedRef.current) {
      hasCommittedRef.current = true; // Mark as committed to prevent multiple calls
      onChange(localValue);
    }
  }, [isDragging, localValue, value]);

  // Add global mouse and touch event listeners to detect drag end
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  // Calculate dynamic min/max based on initial value (octave above/below)
  const dynamicMin = initialValue !== null ? Math.max(20, initialValue / 2) : min;
  const dynamicMax = initialValue !== null ? initialValue * 2 : max;
  
  // Ensure value is within bounds
  const clampedValue = Math.max(dynamicMin, Math.min(dynamicMax, localValue || 220));
  
  // Calculate normalized value for visual representation
  const value01 = (clampedValue - dynamicMin) / (dynamicMax - dynamicMin);
  
  // Calculate angle for the indicator
  const angleMin = -135;
  const angleMax = 135;
  const angle = value01 * (angleMax - angleMin) + angleMin;
  
  // Value display formatting
  const valueRawRoundFn = (val: number): number => Math.round(val * 10) / 10;
  const valueRawDisplayFn = (val: number): string => `${valueRawRoundFn(val)} ${label}`;
  
  // Step calculation for keyboard controls
  const stepSize = 0.5;
  const stepLarger = 5.0;

  // Optimized change handler for smooth UI and continuous sound updates
  const handleValueChange = (newValue: number) => {
    const roundedValue = valueRawRoundFn(newValue);
    setLocalValue(roundedValue);
    
    if (!isDragging) {
      setIsDragging(true);
      hasCommittedRef.current = false; // Reset commit flag when starting new drag
    }

    // Calculate frequency ratio and update all active notes during drag
    if (onFrequencyRatioChange && lastValue > 0) {
      const frequencyRatio = roundedValue / lastValue;
      onFrequencyRatioChange(frequencyRatio);
    }
    
    // Update last value for next ratio calculation
    setLastValue(roundedValue);
  };
  
  // Keyboard controls
  const keyboardControls = useKnobKeyboardControls({
    valueRaw: clampedValue,
    valueMin: dynamicMin,
    valueMax: dynamicMax,
    step: stepSize,
    stepLarger: stepLarger,
    onValueRawChange: handleValueChange,
  });

  // Handle double-click to reset to initial value
  const handleDoubleClick = () => {
    if (initialValue !== null) {
      setLocalValue(initialValue);
      setIsDragging(false);

      // Immediately commit double-click changes for visual state only
      onChange(initialValue);
      setLastValue(initialValue);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <KnobHeadless
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #f0f0f0, #cacaca)',
          border: '2px solid #ccc',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        valueRaw={clampedValue}
        valueMin={dynamicMin}
        valueMax={dynamicMax}
        dragSensitivity={0.006}
        valueRawRoundFn={valueRawRoundFn}
        valueRawDisplayFn={valueRawDisplayFn}
        onValueRawChange={handleValueChange}
        aria-label={`Frequency knob, range: ${dynamicMin.toFixed(1)} - ${dynamicMax.toFixed(1)} Hz`}
        onDoubleClick={handleDoubleClick}
        title={`Range: ${dynamicMin.toFixed(1)} - ${dynamicMax.toFixed(1)} Hz | Double-click to reset to initial value`}
        {...keyboardControls}
      >
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            width: '3px',
            height: '30%',
            background: '#666',
            borderRadius: '2px',
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${angle}deg)`,
          }}
        />
      </KnobHeadless>
      <div style={{ fontSize: '12px', color: '#555', fontWeight: '500' }}>
        {valueRawDisplayFn(clampedValue)}
      </div>
    </div>
  );
}
