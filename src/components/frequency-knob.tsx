"use client";

import React, { useEffect, useState, useRef } from "react";
import useAppContext from "@/contexts/app-context";

interface FrequencyKnobProps {
  value: number;
  onChange: (value: number, shouldRecalculateSound?: boolean) => void;
  onNewReferenceFrequency?: (newReferenceFrequency: number) => void; // Direct reference frequency updates for all active notes
  id?: string; // Add an ID to identify this specific knob
  noteName: string; // The note name to identify which frequency this knob controls
}

export default function FrequencyKnob({
  value,
  onChange,
  onNewReferenceFrequency,
  noteName
}: FrequencyKnobProps) {
  const { originalReferenceFrequencies, setOriginalReferenceFrequencies } = useAppContext();
  
  const [initialValue, setInitialValue] = useState<number | null>(null);
  
  // Check if we have a stored original value for this note
  const originalValue = originalReferenceFrequencies[noteName];
  const [localValue, setLocalValue] = useState(value);
  
  const [isDragging, setIsDragging] = useState(false);
  const [lastValue, setLastValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [hasBeenModified, setHasBeenModified] = useState(false); // Initialize as false, will be set properly in useEffect
  const knobRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; startValue: number } | null>(null);
  const prevValueRef = useRef<number>(value);
  
  // Set initial value ONLY on first render and store original if not already stored
  useEffect(() => {
    console.log("BEFORE CHECK")
    if (initialValue === null && value !== undefined) {
      console.log(`[FrequencyKnob ${noteName}] Render:`, { propValue: value, originalReferenceFrequencies });
      setInitialValue(value);
      prevValueRef.current = value;
      
      // Store original value if not already stored
      if (originalValue === undefined) {
        setOriginalReferenceFrequencies(prev => ({
          ...prev,
          [noteName]: value
        }));
        // Since we're storing the current value as original, it hasn't been modified
        setHasBeenModified(false);
      } else {
        // Original value exists, check if current value is different
        setHasBeenModified(Math.abs(originalValue - value) > 0.1); // Allow small tolerance for floating point
      }
    }
    // Always set localValue to the current prop value on mount
      setLocalValue(value);
      setLastValue(value);
  }, [value, initialValue, noteName, originalValue, originalReferenceFrequencies, setOriginalReferenceFrequencies]);

  // Keep local value in sync with prop value when not dragging and when the prop changes from external sources
  useEffect(() => {
    if (!isDragging && value !== prevValueRef.current) {
      // If we don't have an original value yet, or if this is a legitimate external change, update local value
      if (originalValue === undefined || !hasBeenModified) {
        setLocalValue(value);
        setLastValue(value);
      }
      prevValueRef.current = value;
    }
  }, [value, isDragging, hasBeenModified, originalValue]);

  // Calculate dynamic min/max based on original value (octave above/below)
  const originalFrequency = originalValue || initialValue;
  const dynamicMin = originalFrequency !== null ? Math.max(20, originalFrequency / 2) : 110; // Default fallback
  const dynamicMax = originalFrequency !== null ? originalFrequency * 2 : 440; // Default fallback
  
  // Ensure value is within bounds
  const clampedValue = Math.max(dynamicMin, Math.min(dynamicMax, localValue || 110));
  
  // Calculate normalized value for visual representation using logarithmic scaling
  // This provides better musical perception since frequency perception is logarithmic
  const logMin = Math.log(dynamicMin);
  const logMax = Math.log(dynamicMax);
  const logValue = Math.log(clampedValue);
  const value01 = (logValue - logMin) / (logMax - logMin);
  
  // Calculate angle for the indicator
  const angleMin = -135;
  const angleMax = 135;
  const angle = value01 * (angleMax - angleMin) + angleMin;
  
  // Value display formatting
  const valueRawRoundFn = (val: number): number => Math.round(val * 10) / 10;
  const valueRawDisplayFn = (val: number): string => `${valueRawRoundFn(val)} Hz`;

  // Handle mouse/touch start
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      startValue: clampedValue
    };
    
    setIsDragging(true);
  };

  // Handle mouse/touch move
  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    
    e.preventDefault();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaY = dragStartRef.current.y - clientY; // Inverted: up = positive
    
    // Use logarithmic scaling for drag movement
    const logRange = Math.log(dynamicMax) - Math.log(dynamicMin);
    const currentLogValue = Math.log(dragStartRef.current.startValue);
    const newLogValue = currentLogValue + (deltaY / 100) * logRange;
    const newValue = Math.exp(newLogValue);
    
    const clampedNewValue = Math.max(dynamicMin, Math.min(dynamicMax, newValue));
    const roundedValue = valueRawRoundFn(clampedNewValue);
    
    setLocalValue(roundedValue);

    // Update all active notes with the new reference frequency during drag
    if (onNewReferenceFrequency) {
      onNewReferenceFrequency(roundedValue);
    }
    
    setLastValue(roundedValue);
  };

  // Handle mouse/touch end
  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      setHasBeenModified(true); // Mark as modified when user drags
      // Update the underlying data (allPitchClasses) but don't recalculate sound
      onChange(localValue, false);
    }
  };

  // Add global event listeners for mouse/touch move and end
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => handlePointerMove(e);
      const handleTouchMove = (e: TouchEvent) => handlePointerMove(e);
      const handleMouseUp = () => handlePointerUp();
      const handleTouchEnd = () => handlePointerUp();

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, lastValue, onNewReferenceFrequency, dynamicMin, dynamicMax]);

  // Handle double-click to reset to original value
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const resetValue = originalValue || initialValue;
    if (resetValue !== null) {
      setLocalValue(resetValue);
      setIsDragging(false);
      setLastValue(resetValue);
      setHasBeenModified(false); // Mark as not modified since we're resetting
      
      // Immediately update the sound to the reset frequency
      if (onNewReferenceFrequency) {
        onNewReferenceFrequency(resetValue);
      }
      
      // Update the underlying data after a brief moment to ensure sound update happens first
      setTimeout(() => {
        onChange(resetValue, true); // DO recalculate sound for reset
      }, 10);
    }
  };

  // Handle keyboard controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newValue: number | null = null;
    
    // Use logarithmic steps for more musical behavior
    const currentLogValue = Math.log(clampedValue);
    const logRange = Math.log(dynamicMax) - Math.log(dynamicMin);
    const smallStep = logRange * 0.01; // 1% of the log range
    const largeStep = logRange * 0.05; // 5% of the log range

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault();
        newValue = Math.exp(currentLogValue + (e.shiftKey ? largeStep : smallStep));
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault();
        newValue = Math.exp(currentLogValue - (e.shiftKey ? largeStep : smallStep));
        break;
      case 'Home':
        e.preventDefault();
        newValue = dynamicMin;
        break;
      case 'End':
        e.preventDefault();
        newValue = dynamicMax;
        break;
    }

    if (newValue !== null) {
      const roundedValue = valueRawRoundFn(newValue);
      setLocalValue(roundedValue);
      setLastValue(roundedValue);
      setHasBeenModified(true); // Mark as modified when user uses keyboard
      
      // Immediately update the sound
      if (onNewReferenceFrequency) {
        onNewReferenceFrequency(roundedValue);
      }
      
      onChange(roundedValue, true); // DO recalculate sound for keyboard controls
    }
  };

  // Handle label click to start editing
  const handleLabelClick = () => {
    setIsEditing(true);
    setEditValue(clampedValue.toFixed(1));
    // Focus the input after a brief delay to ensure it's rendered
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 10);
  };

  // Handle input value change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  // Handle input submit (Enter key or blur)
  const handleInputSubmit = () => {
    const newValue = parseFloat(editValue);
    if (!isNaN(newValue) && newValue >= dynamicMin && newValue <= dynamicMax) {
      const roundedValue = valueRawRoundFn(newValue);
      setLocalValue(roundedValue);
      setLastValue(roundedValue);
      setHasBeenModified(true); // Mark as modified when user types in input
      
      // Immediately update the sound
      if (onNewReferenceFrequency) {
        onNewReferenceFrequency(roundedValue);
      }
      
      onChange(roundedValue, true); // DO recalculate sound for direct input
    }
    setIsEditing(false);
  };

  // Handle input key down
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    handleInputSubmit();
  };

  return (
    <div className="frequency-knob-wrapper">
      <div
        ref={knobRef}
        className={`frequency-knob-dial ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label={`Frequency knob, range: ${dynamicMin.toFixed(1)} - ${dynamicMax.toFixed(1)} Hz`}
        aria-valuemin={dynamicMin}
        aria-valuemax={dynamicMax}
        aria-valuenow={clampedValue}
        title={`Range: ${dynamicMin.toFixed(1)} - ${dynamicMax.toFixed(1)} Hz | Double-click to reset to initial value`}
      >
        <div
          className="frequency-knob-dial-indicator"
          style={{
            transform: `translateX(-50%) rotate(${angle}deg)`
          }}
        />
      </div>
      {isEditing ? (
        <div className="frequency-input-container">
          <input
            ref={inputRef}
            type="number"
            value={editValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            min={dynamicMin}
            max={dynamicMax}
            step="0.1"
            className="frequency-input-field frequency-input-no-spinner"
          />
          <span className="frequency-unit-label">Hz</span>
        </div>
      ) : (
        <div 
          className="frequency-display-field"
          onClick={handleLabelClick}
          title="Click to edit frequency directly"
        >
          {valueRawDisplayFn(clampedValue)}
        </div>
      )}
    </div>
  );
}
