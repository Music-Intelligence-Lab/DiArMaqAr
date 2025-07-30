"use client";

import React, { useEffect, useState, useRef } from "react";

// Global counter for unique IDs when no ID is provided
let globalKnobCounter = 0;

// Helper functions for localStorage persistence
const getStoredValue = (key: string): number | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(`frequency-knob-${key}`);
    return stored ? parseFloat(stored) : null;
  } catch {
    return null;
  }
};

const setStoredValue = (key: string, value: number): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`frequency-knob-${key}`, value.toString());
  } catch {
    // Ignore localStorage errors
  }
};

interface FrequencyKnobProps {
  value: number;
  onChange: (value: number, shouldRecalculateSound?: boolean) => void;
  onNewReferenceFrequency?: (newReferenceFrequency: number) => void; // Direct reference frequency updates for all active notes
  id?: string; // Add an ID to identify this specific knob
}

export default function FrequencyKnob({
  value,
  onChange,
  onNewReferenceFrequency,
  id
}: FrequencyKnobProps) {
  // Use provided ID directly, or generate a stable fallback
  const knobIdRef = useRef<string>(
    id || `frequency-knob-fallback-${globalKnobCounter++}`
  );
  const knobId = knobIdRef.current;
  
  const [initialValue, setInitialValue] = useState<number | null>(null);
  
  // Check if we have a stored modified value for this knob
  const storedValue = getStoredValue(knobId);
  const [localValue, setLocalValue] = useState(storedValue || value);
  
  const [isDragging, setIsDragging] = useState(false);
  const [lastValue, setLastValue] = useState(storedValue || value);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [hasBeenModified, setHasBeenModified] = useState(storedValue !== null);
  const knobRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; startValue: number } | null>(null);
  const prevValueRef = useRef<number>(value);
  
  // Set initial value ONLY on first render
  useEffect(() => {
    if (initialValue === null && value !== undefined) {
      setInitialValue(value);
      prevValueRef.current = value;
      // Only set localValue if it hasn't been modified by user
      if (!hasBeenModified) {
        setLocalValue(value);
        setLastValue(value);
      }
    }
  }, [value, initialValue, hasBeenModified]);

  // Keep local value in sync with prop value ONLY if user hasn't modified it
  useEffect(() => {
    if (!isDragging && !hasBeenModified && value !== prevValueRef.current) {
      setLocalValue(value);
      setLastValue(value);
      prevValueRef.current = value;
    }
  }, [value, isDragging, hasBeenModified]);

  // Calculate dynamic min/max based on initial value (octave above/below)
  const dynamicMin = initialValue !== null ? Math.max(20, initialValue / 2) : 110; // Default fallback
  const dynamicMax = initialValue !== null ? initialValue * 2 : 440; // Default fallback
  
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
    const sensitivity = 0.5; // Adjust for desired sensitivity
    const valueRange = dynamicMax - dynamicMin;
    const deltaValue = (deltaY * sensitivity * valueRange) / 100;
    
    const newValue = Math.max(dynamicMin, Math.min(dynamicMax, dragStartRef.current.startValue + deltaValue));
    const roundedValue = valueRawRoundFn(newValue);
    
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
      setStoredValue(knobId, localValue); // Store modified value in localStorage
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

  // Handle double-click to reset to initial value
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (initialValue !== null) {
      setLocalValue(initialValue);
      setIsDragging(false);
      setLastValue(initialValue);
      
      // Immediately update the sound to the reset frequency
      if (onNewReferenceFrequency) {
        onNewReferenceFrequency(initialValue);
      }
      
      // Update the underlying data after a brief moment to ensure sound update happens first
      setTimeout(() => {
        onChange(initialValue, true); // DO recalculate sound for reset
      }, 10);
    }
  };

  // Handle keyboard controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newValue: number | null = null;
    const stepSize = 0.5;
    const stepLarger = 5.0;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault();
        newValue = Math.min(dynamicMax, clampedValue + (e.shiftKey ? stepLarger : stepSize));
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault();
        newValue = Math.max(dynamicMin, clampedValue - (e.shiftKey ? stepLarger : stepSize));
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
      setStoredValue(knobId, roundedValue); // Store modified value in localStorage
      
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
      setStoredValue(knobId, roundedValue); // Store modified value in localStorage
      
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
