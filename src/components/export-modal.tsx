"use client";

import React, { useState } from "react";
import useAppContext from "@/contexts/app-context";
import { exportTuningSystem, exportJins, exportMaqam } from "@/functions/export";
import { exportToScala, exportToScalaKeymap, exportJinsToScala, exportJinsToScalaKeymap, exportMaqamToScala, exportMaqamToScalaKeymap } from "@/functions/scala-export";
import NoteName from "@/models/NoteName";
import { Jins } from "@/models/Jins";
import { Maqam } from "@/models/Maqam";

export type ExportType = "tuning-system" | "jins" | "maqam";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: ExportType;
  specificJins?: Jins; // Optional specific jins to export
  specificMaqam?: Maqam; // Optional specific maqam to export
}

export type ExportFormat = "json" | "csv" | "txt" | "pdf" | "scala" | "scala-keymap";

export interface ExportOptions {
  format: ExportFormat;
  includeTuningSystemDetails: boolean;
  includePitchClasses: boolean;
  includeAjnasDetails?: boolean; // Only for tuning system exports
  includeMaqamatDetails?: boolean; // Only for tuning system exports
  includeTranspositions?: boolean; // For jins and maqam exports
  includeModulations: boolean;
  modulationType: 'maqamat' | 'ajnas';
  prettifyJson: boolean;
  csvDelimiter: "," | ";" | "\t";
  filename: string;
}

export default function ExportModal({ isOpen, onClose, exportType, specificJins, specificMaqam }: ExportModalProps) {
  const { selectedTuningSystem, selectedIndices, selectedJinsData, selectedMaqamData } = useAppContext();

  // Determine which jins/maqam to use for export - prioritize specific instances
  const jinsToExport = specificJins || selectedJinsData;
  const maqamToExport = specificMaqam || selectedMaqamData;

  const [exportOptions, setExportOptions] = useState<ExportOptions>(() => {
    const baseOptions = {
      format: "json" as ExportFormat,
      includeTuningSystemDetails: true,
      includePitchClasses: true,
      includeModulations: false,
      modulationType: 'maqamat' as 'maqamat' | 'ajnas',
      prettifyJson: true,
      csvDelimiter: "," as "," | ";" | "\t",
      filename: '', // Will be set after we define the options
    };

    let finalOptions;
    if (exportType === 'tuning-system') {
      finalOptions = {
        ...baseOptions,
        includeAjnasDetails: true,
        includeMaqamatDetails: true,
      };
    } else {
      finalOptions = {
        ...baseOptions,
        includeTranspositions: true,
      };
    }

    // Generate filename based on the final options
    const generateInitialFilename = (opts: ExportOptions): string => {
      const baseFilename = selectedTuningSystem ? 
        selectedTuningSystem.getTitleEnglish().replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 
        'maqam-network';
      
      const parts = [baseFilename];
      
      // Add export type
      parts.push(exportType);
      
      // Add specific instance name if available
      if (exportType === 'jins' && specificJins) {
        const instanceName = specificJins.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        parts.push(instanceName);
      } else if (exportType === 'maqam' && specificMaqam) {
        const instanceName = specificMaqam.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        parts.push(instanceName);
      }
      
      // Add included data options
      const includedOptions = [];
      
      if (opts.includeTuningSystemDetails && opts.includePitchClasses) {
        includedOptions.push('tuning-system');
      }
      
      if (exportType === 'tuning-system') {
        if (opts.includeAjnasDetails) {
          includedOptions.push('ajnas');
        }
        if (opts.includeMaqamatDetails) {
          includedOptions.push('maqamat');
        }
      }
      
      if ((exportType === 'jins' || exportType === 'maqam') && opts.includeTranspositions) {
        includedOptions.push('transpositions');
      }
      
      if (opts.includeModulations) {
        includedOptions.push(`modulations-${opts.modulationType}`);
      }
      
      if (includedOptions.length > 0) {
        parts.push('with');
        parts.push(...includedOptions);
      }
      
      return parts.join('-');
    };

    finalOptions.filename = generateInitialFilename(finalOptions);
    return finalOptions;
  });

  const [isExporting, setIsExporting] = useState(false);

  // Helper function to generate filename based on current options
  const generateCurrentFilename = (options: ExportOptions): string => {
    const baseFilename = selectedTuningSystem ? 
      selectedTuningSystem.getTitleEnglish().replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 
      'maqam-network';
    
    const parts = [baseFilename];
    
    // Add export type
    parts.push(exportType);
    
    // Add specific instance name if available
    if (exportType === 'jins' && specificJins) {
      const instanceName = specificJins.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      parts.push(instanceName);
    } else if (exportType === 'maqam' && specificMaqam) {
      const instanceName = specificMaqam.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      parts.push(instanceName);
    }
    
    // Add included data options
    const includedOptions = [];
    
    if (options.includeTuningSystemDetails && options.includePitchClasses) {
      includedOptions.push('tuning-system');
    }
    
    if (exportType === 'tuning-system') {
      if (options.includeAjnasDetails) {
        includedOptions.push('ajnas');
      }
      if (options.includeMaqamatDetails) {
        includedOptions.push('maqamat');
      }
    }
    
    if ((exportType === 'jins' || exportType === 'maqam') && options.includeTranspositions) {
      includedOptions.push('transpositions');
    }
    
    if (options.includeModulations) {
      includedOptions.push(`modulations-${options.modulationType}`);
    }
    
    if (includedOptions.length > 0) {
      parts.push('with');
      parts.push(...includedOptions);
    }
    
    return parts.join('-');
  };

  const formatDescriptions = {
    json: "JavaScript Object Notation - Best for data interchange and web applications",
    csv: "Comma Separated Values - Great for spreadsheets and data analysis",
    txt: "Plain text format - Human-readable and universal",
    pdf: "Portable Document Format - Professional presentation and printing",
    scala: "Scala scale format (.scl) - For microtonal music software",
    "scala-keymap": "Scala keymap format (.kbm) - MIDI key mapping for Scala scales",
  };

  const handleExport = async () => {
    // Validation based on export type
    if (exportType === 'tuning-system') {
      if (!selectedTuningSystem || selectedIndices.length === 0) {
        alert("Please select a tuning system first");
        return;
      }
    } else if (exportType === 'jins') {
      if (!jinsToExport || !selectedTuningSystem || selectedIndices.length === 0) {
        alert("Please select a jins and tuning system first");
        return;
      }
    } else if (exportType === 'maqam') {
      if (!maqamToExport || !selectedTuningSystem || selectedIndices.length === 0) {
        alert("Please select a maqam and tuning system first");
        return;
      }
    }

    setIsExporting(true);

    try {
      const startingNote = selectedIndices[0] as unknown as NoteName;
      let exportedData: any;

      if (exportType === 'tuning-system') {
        exportedData = exportTuningSystem(selectedTuningSystem!, startingNote, {
          includeTuningSystemDetails: exportOptions.includeTuningSystemDetails,
          includePitchClasses: exportOptions.includePitchClasses,
          includeAjnasDetails: exportOptions.includeAjnasDetails || false,
          includeMaqamatDetails: exportOptions.includeMaqamatDetails || false,
          includeModulations: exportOptions.includeModulations,
          modulationType: exportOptions.modulationType,
        });
      } else if (exportType === 'jins') {
        exportedData = exportJins(jinsToExport!, selectedTuningSystem!, startingNote, {
          includeTuningSystemDetails: exportOptions.includeTuningSystemDetails,
          includePitchClasses: exportOptions.includePitchClasses,
          includeTranspositions: exportOptions.includeTranspositions || false,
        });
      } else if (exportType === 'maqam') {
        exportedData = exportMaqam(maqamToExport!, selectedTuningSystem!, startingNote, {
          includeTuningSystemDetails: exportOptions.includeTuningSystemDetails,
          includePitchClasses: exportOptions.includePitchClasses,
          includeTranspositions: exportOptions.includeTranspositions || false,
          includeModulations: exportOptions.includeModulations,
          modulationType: exportOptions.modulationType,
        });
      }

      await downloadFile(exportedData, exportOptions);
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = async (data: any, options: ExportOptions) => {
    let content: string = '';
    let mimeType: string;
    let fileExtension: string;

    switch (options.format) {
      case "json":
        content = options.prettifyJson ? JSON.stringify(data, null, 2) : JSON.stringify(data);
        mimeType = "application/json";
        fileExtension = "json";
        break;

      case "csv":
        content = convertToCSV(data, options.csvDelimiter);
        mimeType = "text/csv";
        fileExtension = "csv";
        break;

      case "txt":
        content = convertToText(data);
        mimeType = "text/plain";
        fileExtension = "txt";
        break;

      case "scala":
        if (exportType === 'tuning-system') {
          if (!selectedTuningSystem || selectedIndices.length === 0) {
            throw new Error("Scala export requires a tuning system and starting note");
          }
          content = exportToScala(selectedTuningSystem, selectedIndices[0] as unknown as NoteName);
        } else if (exportType === 'jins') {
          if (!jinsToExport || !selectedTuningSystem) {
            throw new Error("Scala export requires a jins and tuning system");
          }
          const startingNote = selectedIndices.length > 0 ? selectedIndices[0] as unknown as NoteName : undefined;
          content = exportJinsToScala(jinsToExport, selectedTuningSystem, startingNote);
        } else if (exportType === 'maqam') {
          if (!maqamToExport || !selectedTuningSystem) {
            throw new Error("Scala export requires a maqam and tuning system");
          }
          const startingNote = selectedIndices.length > 0 ? selectedIndices[0] as unknown as NoteName : undefined;
          content = exportMaqamToScala(maqamToExport, selectedTuningSystem, startingNote);
        }
        mimeType = "text/plain";
        fileExtension = "scl";
        break;

      case "scala-keymap":
        if (exportType === 'tuning-system') {
          if (!selectedTuningSystem || selectedIndices.length === 0) {
            throw new Error("Scala keymap export requires a tuning system and starting note");
          }
          content = exportToScalaKeymap(selectedTuningSystem, selectedIndices[0] as unknown as NoteName);
        } else if (exportType === 'jins') {
          if (!jinsToExport || !selectedTuningSystem) {
            throw new Error("Scala keymap export requires a jins and tuning system");
          }
          const startingNote = selectedIndices.length > 0 ? selectedIndices[0] as unknown as NoteName : undefined;
          content = exportJinsToScalaKeymap(jinsToExport, selectedTuningSystem, startingNote);
        } else if (exportType === 'maqam') {
          if (!maqamToExport || !selectedTuningSystem) {
            throw new Error("Scala keymap export requires a maqam and tuning system");
          }
          const startingNote = selectedIndices.length > 0 ? selectedIndices[0] as unknown as NoteName : undefined;
          content = exportMaqamToScalaKeymap(maqamToExport, selectedTuningSystem, startingNote);
        }
        mimeType = "text/plain";
        fileExtension = "kbm";
        break;

      case "pdf":
        await downloadPDF(data);
        return;

      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${options.filename}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any, delimiter: string): string => {
    const sections: string[] = [];
    
    // Helper function to escape CSV values
    const escapeCSV = (value: any): string => {
      const str = String(value || '');
      if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Helper function to flatten nested objects and convert values to strings
    const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
      const flattened: Record<string, string> = {};
      
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          const newKey = prefix ? `${prefix}.${key}` : key;
          
          // Skip functions and private properties
          if (typeof value === 'function' || key.startsWith('_')) {
            continue;
          }
          
          if (value === null || value === undefined || value === '') {
            flattened[newKey] = '';
          } else if (Array.isArray(value)) {
            // Convert arrays to semicolon-separated strings
            if (value.length === 0) {
              flattened[newKey] = '';
            } else {
              flattened[newKey] = value.map(item => {
                if (typeof item === 'object' && item !== null) {
                  // For complex objects in arrays, try to get a meaningful string representation
                  const title = item.titleEnglish || item.name || item.title || 
                               (typeof item.getTitleEnglish === 'function' ? item.getTitleEnglish() : null);
                  return title || JSON.stringify(item);
                } else {
                  return String(item);
                }
              }).join('; ');
            }
          } else if (typeof value === 'object') {
            // For objects, try to flatten them recursively, but limit depth to avoid infinite recursion
            const depth = (prefix.match(/\./g) || []).length;
            if (depth < 3) { // Limit to 3 levels deep
              try {
                const nested = flattenObject(value, newKey);
                Object.assign(flattened, nested);
              } catch {
                // If flattening fails, convert to JSON string
                flattened[newKey] = JSON.stringify(value);
              }
            } else {
              // Too deep, just convert to string
              const title = value.titleEnglish || value.name || value.title || 
                           (typeof value.getTitleEnglish === 'function' ? value.getTitleEnglish() : null);
              flattened[newKey] = title || JSON.stringify(value);
            }
          } else {
            flattened[newKey] = String(value);
          }
        }
      }
      
      return flattened;
    };

    // Helper function to convert array of objects to CSV with proper flattening and column ordering
    const arrayToCSV = (items: any[], title: string, preferredOrder: string[] = []): string => {
      if (!items || items.length === 0) return `${title}\nNo data available\n`;
      
      // Flatten all objects and collect all unique keys
      const flattenedItems = items.map(item => {
        if (typeof item === 'object' && item !== null) {
          return flattenObject(item);
        } else {
          return { value: String(item) };
        }
      });
      
      // Get all unique keys from all flattened objects
      const allKeys = new Set<string>();
      flattenedItems.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
      });
      
      // Order headers based on preferred order first, then alphabetically
      const headers = Array.from(allKeys).sort((a, b) => {
        const aIndex = preferredOrder.indexOf(a);
        const bIndex = preferredOrder.indexOf(b);
        
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        } else if (aIndex !== -1) {
          return -1;
        } else if (bIndex !== -1) {
          return 1;
        }
        return a.localeCompare(b);
      });
      
      const csvRows = [
        `${title}`,
        headers.map(escapeCSV).join(delimiter),
        ...flattenedItems.map(item => 
          headers.map(header => escapeCSV(item[header] || '')).join(delimiter)
        )
      ];
      
      return csvRows.join('\n') + '\n';
    };

    // Combine Tuning System Information with Pitch Classes
    if (data.tuningSystem) {
      const ts = data.tuningSystem;
      const tuningSystemInfo = [
        'Tuning System Information',
        `Title (English)${delimiter}${escapeCSV(ts.titleEnglish || ts.getTitleEnglish?.())}`,
        `Title (Arabic)${delimiter}${escapeCSV(ts.titleArabic || ts.getTitleArabic?.())}`,
        `Creator (English)${delimiter}${escapeCSV(ts.creatorEnglish || ts.getCreatorEnglish?.())}`,
        `Creator (Arabic)${delimiter}${escapeCSV(ts.creatorArabic || ts.getCreatorArabic?.())}`,
        `Year${delimiter}${escapeCSV(ts.year || ts.getYear?.())}`,
        `Starting Note Name${delimiter}${escapeCSV(data.startingNote)}`,
        `Source (English)${delimiter}${escapeCSV(ts.sourceEnglish || ts.getSourceEnglish?.())}`,
        `Source (Arabic)${delimiter}${escapeCSV(ts.sourceArabic || ts.getSourceArabic?.())}`,
        `Comments (English)${delimiter}${escapeCSV(ts.commentsEnglish || ts.getCommentsEnglish?.())}`,
        `Comments (Arabic)${delimiter}${escapeCSV(ts.commentsArabic || ts.getCommentsArabic?.())}`,
        `String Length${delimiter}${escapeCSV(ts.stringLength || ts.getStringLength?.())}`,
        `Default Reference Frequency${delimiter}${escapeCSV(ts.defaultReferenceFrequency || ts.getDefaultReferenceFrequency?.())}`,
        ''
      ].join('\n');
      sections.push(tuningSystemInfo);
      
      // Add pitch classes as part of tuning system info
      if (data.fullRangeTuningSystemPitchClasses) {
        // Create a more organized pitch class table with logical column order
        const pitchClasses = data.fullRangeTuningSystemPitchClasses.map((pc: any) => ({
          'Note Name': pc.noteName,
          'Octave': pc.octave,
          'Cents': pc.cents,
          'Frequency (Hz)': pc.frequency,
          'Pitch Class': pc.pitchClass,
          'Semitones': pc.semitones,
        }));
        const pitchClassOrder = ['Note Name', 'Octave', 'Cents', 'Frequency (Hz)', 'Pitch Class', 'Semitones'];
        sections.push(arrayToCSV(pitchClasses, 'Pitch Classes', pitchClassOrder));
      }
    }

    // Ajnas Overview
    if (data.possibleAjnasOverview) {
      const ajnasOverviewOrder = ['titleEnglish', 'titleArabic', 'root', 'intonation', 'SourcePageReferences', 'numberOfTranspositions'];
      sections.push(arrayToCSV(data.possibleAjnasOverview, 'Possible Ajnas Overview', ajnasOverviewOrder));
    }

    // Ajnas Details
    if (data.possibleAjnasDetails) {
      const ajnasDetailsOrder = ['titleEnglish', 'titleArabic', 'root', 'intonation', 'family', 'SourcePageReferences', 'commentsEnglish', 'commentsArabic', 'numberOfTranspositions'];
      sections.push(arrayToCSV(data.possibleAjnasDetails, 'Possible Ajnas Details', ajnasDetailsOrder));
    }

    // Maqamat Overview
    if (data.possibleMaqamatOverview) {
      const maqamatOverviewOrder = ['titleEnglish', 'titleArabic', 'root', 'family', 'SourcePageReferences', 'numberOfTranspositions'];
      sections.push(arrayToCSV(data.possibleMaqamatOverview, 'Possible Maqamat Overview', maqamatOverviewOrder));
    }

    // Maqamat Details
    if (data.possibleMaqamatDetails) {
      const maqamatDetailsOrder = ['titleEnglish', 'titleArabic', 'root', 'family', 'suyur', 'SourcePageReferences', 'commentsEnglish', 'commentsArabic', 'numberOfTranspositions'];
      sections.push(arrayToCSV(data.possibleMaqamatDetails, 'Possible Maqamat Details', maqamatDetailsOrder));
    }

    // Modulations
    if (data.modulations) {
      // Convert modulations object to an array for CSV export
      const flatModulations: any[] = [];
      if (typeof data.modulations === 'object' && data.modulations !== null) {
        Object.entries(data.modulations).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((mod: any) => {
              flatModulations.push({
                ModulationType: key,
                ...mod
              });
            });
          } else {
            flatModulations.push({
              ModulationType: key,
              Value: value
            });
          }
        });
      }
      const modulationsOrder = ['ModulationType', 'titleEnglish', 'titleArabic', 'root', 'family'];
      sections.push(arrayToCSV(flatModulations, 'Modulations', modulationsOrder));
    }

    // Transpositions
    if (data.transpositions) {
      const transpositionsOrder = ['titleEnglish', 'titleArabic', 'root', 'family'];
      sections.push(arrayToCSV(data.transpositions, 'Transpositions', transpositionsOrder));
    }

    // Summary statistics
    const summary = [
      'Summary Statistics',
      `Total Possible Ajnas${delimiter}${escapeCSV(data.numberOfPossibleAjnas || 0)}`,
      `Total Ajnas in Database${delimiter}${escapeCSV(data.numberOfAjnas || 0)}`,
      `Total Possible Maqamat${delimiter}${escapeCSV(data.numberOfPossibleMaqamat || 0)}`,
      `Total Maqamat in Database${delimiter}${escapeCSV(data.numberOfMaqamat || 0)}`,
      ''
    ].join('\n');
    
    sections.push(summary);

    return sections.join('\n');
  };

  const convertToText = (data: any): string => {
    const sections: string[] = [];
    
    // Helper function to format any value, recursively breaking down objects
    const formatValue = (value: any, indentLevel: number = 0): string => {
      const indent = '  '.repeat(indentLevel);
      
      if (value === null || value === undefined || value === '') {
        return 'N/A';
      }
      
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        const str = String(value).trim();
        return str || 'N/A';
      }
      
      if (Array.isArray(value)) {
        if (value.length === 0) return 'None';
        return value.map((item, index) => {
          const itemStr = formatValue(item, indentLevel + 1);
          if (itemStr.includes('\n')) {
            return `${indent}  ${index + 1}.\n${itemStr}`;
          } else {
            return `${indent}  ${index + 1}. ${itemStr}`;
          }
        }).join('\n');
      }
      
      if (typeof value === 'object' && value !== null) {
        // Handle objects by breaking them down into their properties
        const entries = Object.entries(value).filter(([key, val]) => {
          // Filter out functions, internal properties, and empty values
          return typeof val !== 'function' && 
                 !key.startsWith('_') && 
                 val !== null && 
                 val !== undefined && 
                 val !== '';
        });
        
        if (entries.length === 0) return 'N/A';
        
        return entries.map(([key, val]) => {
          // Convert camelCase to readable format
          const formattedKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/\s+/g, ' ')
            .trim();
          
          const formattedValue = formatValue(val, indentLevel + 1);
          if (formattedValue.includes('\n')) {
            return `${indent}  ${formattedKey}:\n${formattedValue}`;
          } else {
            return `${indent}  ${formattedKey}: ${formattedValue}`;
          }
        }).join('\n');
      }
      
      return String(value);
    };
    
    // Title Section
    sections.push('='.repeat(60));
    sections.push('ARABIC MAQAM NETWORK - EXPORT DATA');
    sections.push('='.repeat(60));
    sections.push('');
    
    // Export timestamp
    const now = new Date();
    sections.push(`Export Date: ${now.toLocaleDateString()}`);
    sections.push(`Export Time: ${now.toLocaleTimeString()}`);
    sections.push('');
    
    // Tuning System Information
    if (data.tuningSystem) {
      const ts = data.tuningSystem;
      sections.push('TUNING SYSTEM INFORMATION');
      sections.push('-'.repeat(40));
      sections.push(`Title (English): ${formatValue(ts.titleEnglish || ts.getTitleEnglish?.())}`);
      sections.push(`Title (Arabic): ${formatValue(ts.titleArabic || ts.getTitleArabic?.())}`);
      sections.push(`Creator (English): ${formatValue(ts.creatorEnglish || ts.getCreatorEnglish?.())}`);
      sections.push(`Creator (Arabic): ${formatValue(ts.creatorArabic || ts.getCreatorArabic?.())}`);
      sections.push(`Year: ${formatValue(ts.year || ts.getYear?.())}`);
      sections.push(`Starting Note: ${formatValue(data.startingNote)}`);
      sections.push(`Source (English): ${formatValue(ts.sourceEnglish || ts.getSourceEnglish?.())}`);
      sections.push(`Source (Arabic): ${formatValue(ts.sourceArabic || ts.getSourceArabic?.())}`);
      sections.push(`Comments (English): ${formatValue(ts.commentsEnglish || ts.getCommentsEnglish?.())}`);
      sections.push(`Comments (Arabic): ${formatValue(ts.commentsArabic || ts.getCommentsArabic?.())}`);
      sections.push(`String Length: ${formatValue(ts.stringLength || ts.getStringLength?.())}`);
      sections.push(`Default Reference Frequency: ${formatValue(ts.defaultReferenceFrequency || ts.getDefaultReferenceFrequency?.())} Hz`);
      sections.push('');
    }
    
    // Pitch Classes
    if (data.fullRangeTuningSystemPitchClasses) {
      sections.push('PITCH CLASSES');
      sections.push('-'.repeat(40));
      data.fullRangeTuningSystemPitchClasses.forEach((pc: any, index: number) => {
        sections.push(`${index + 1}. ${formatValue(pc.noteName)} (Octave ${formatValue(pc.octave)})`);
        sections.push(`   Cents: ${formatValue(pc.cents)}`);
        sections.push(`   Frequency: ${formatValue(pc.frequency)} Hz`);
        sections.push(`   Pitch Class: ${formatValue(pc.pitchClass)}`);
        if (pc.semitones !== undefined) {
          sections.push(`   Semitones: ${formatValue(pc.semitones)}`);
        }
        sections.push('');
      });
    }
    
    // Ajnas Details
    if (data.possibleAjnasDetails) {
      sections.push('AJNAS DETAILS');
      sections.push('-'.repeat(40));
      data.possibleAjnasDetails.forEach((jins: any, index: number) => {
        sections.push(`${index + 1}. ${formatValue(jins.titleEnglish || jins.getTitleEnglish?.())}`);
        
        // Use the helper function to display all properties properly
        const jinsFormatted = formatValue(jins, 1);
        if (jinsFormatted !== 'N/A') {
          sections.push(jinsFormatted);
        }
        sections.push('');
      });
    }
    
    // Maqamat Details
    if (data.possibleMaqamatDetails) {
      sections.push('MAQAMAT DETAILS');
      sections.push('-'.repeat(40));
      data.possibleMaqamatDetails.forEach((maqam: any, index: number) => {
        sections.push(`${index + 1}. ${formatValue(maqam.titleEnglish || maqam.getTitleEnglish?.())}`);
        
        // Use the helper function to display all properties properly
        const maqamFormatted = formatValue(maqam, 1);
        if (maqamFormatted !== 'N/A') {
          sections.push(maqamFormatted);
        }
        sections.push('');
      });
    }
    
    // Transpositions (for jins and maqam exports)
    if (data.transpositions) {
      sections.push('TRANSPOSITIONS');
      sections.push('-'.repeat(40));
      data.transpositions.forEach((transposition: any, index: number) => {
        sections.push(`${index + 1}. ${formatValue(transposition.titleEnglish || transposition.getTitleEnglish?.())}`);
        
        const transpositionFormatted = formatValue(transposition, 1);
        if (transpositionFormatted !== 'N/A') {
          sections.push(transpositionFormatted);
        }
        sections.push('');
      });
    }
    
    // Modulations
    if (data.modulations) {
      sections.push('MODULATIONS');
      sections.push('-'.repeat(40));
      const modulationsFormatted = formatValue(data.modulations);
      sections.push(modulationsFormatted);
      sections.push('');
    }
    
    // Summary Statistics
    if (data.numberOfPossibleAjnas !== undefined || data.numberOfPossibleMaqamat !== undefined || 
        data.numberOfAjnas !== undefined || data.numberOfMaqamat !== undefined) {
      sections.push('SUMMARY STATISTICS');
      sections.push('-'.repeat(40));
      sections.push(`Total Possible Ajnas: ${data.numberOfPossibleAjnas ?? 0}`);
      sections.push(`Total Ajnas in Database: ${data.numberOfAjnas ?? 0}`);
      sections.push(`Total Possible Maqamat: ${data.numberOfPossibleMaqamat ?? 0}`);
      sections.push(`Total Maqamat in Database: ${data.numberOfMaqamat ?? 0}`);
      sections.push('');
    }
    
    sections.push('='.repeat(60));
    sections.push('End of Export');
    sections.push('='.repeat(60));
    
    return sections.join('\n');
  };

  const downloadPDF = async (data: any) => {
    // Convert data to formatted text first
    const formattedText = convertToText(data);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Arabic Maqam Network Export</title>
        <style>
          body { 
            font-family: 'Times New Roman', serif; 
            margin: 30px; 
            line-height: 1.6;
            color: #333;
          }
          h1 { 
            color: #2c3e50; 
            text-align: center; 
            border-bottom: 3px solid #3498db; 
            padding-bottom: 10px; 
            margin-bottom: 30px;
          }
          h2 { 
            color: #34495e; 
            margin-top: 30px; 
            margin-bottom: 15px;
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 5px;
          }
          .export-info {
            background: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
            text-align: center;
            font-style: italic;
          }
          .content {
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.4;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            border: 1px solid #dee2e6;
          }
          .section { 
            margin-bottom: 30px; 
            page-break-inside: avoid;
          }
          @media print {
            body { margin: 20mm; }
            h1 { font-size: 18pt; }
            h2 { font-size: 14pt; }
            .content { font-size: 10pt; }
          }
        </style>
      </head>
      <body>
        <h1>Arabic Maqam Network Export</h1>
        <div class="export-info">
          Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </div>
        <div class="section">
          <div class="content">${formattedText}</div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="export-modal-overlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal__header">
          <h2 className="export-modal__title">
            Export {exportType === 'tuning-system' ? 'Tuning System' : exportType === 'jins' ? 'Jins' : 'Maqam'} Data
          </h2>
          <button className="export-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="export-modal__content">
          <div className="export-modal__section">
            <label className="export-modal__label">Export Format</label>
            <div className="export-modal__format-grid">
              {Object.entries(formatDescriptions)
                .map(([format, description]) => (
                  <div
                    key={format}
                    className={`export-modal__format-card ${exportOptions.format === format ? "export-modal__format-card--selected" : ""}`}
                    onClick={() => setExportOptions((prev) => ({ ...prev, format: format as ExportFormat }))}
                  >
                    <div className="export-modal__format-name">{format.toUpperCase()}</div>
                    <div className="export-modal__format-description">{description}</div>
                  </div>
                ))}
            </div>
          </div>

          <div className="export-modal__section">
            <label className="export-modal__label">Include Data</label>
            <div className="export-modal__checkbox-group">
              <label className="export-modal__checkbox">
                <input 
                  type="checkbox" 
                  checked={exportOptions.includeTuningSystemDetails && exportOptions.includePitchClasses} 
                  onChange={(e) => setExportOptions((prev) => {
                    const newOptions = { 
                      ...prev, 
                      includeTuningSystemDetails: e.target.checked,
                      includePitchClasses: e.target.checked 
                    };
                    return { ...newOptions, filename: generateCurrentFilename(newOptions) };
                  })} 
                />
                <span>Tuning System & Pitch Classes</span>
              </label>
              
              {/* Tuning System specific options */}
              {exportType === 'tuning-system' && (
                <>
                  <label className="export-modal__checkbox">
                    <input 
                      type="checkbox" 
                      checked={exportOptions.includeAjnasDetails || false} 
                      onChange={(e) => setExportOptions((prev) => {
                        const newOptions = { ...prev, includeAjnasDetails: e.target.checked };
                        return { ...newOptions, filename: generateCurrentFilename(newOptions) };
                      })} 
                    />
                    <span>Ajnas Details</span>
                  </label>
                  <label className="export-modal__checkbox">
                    <input 
                      type="checkbox" 
                      checked={exportOptions.includeMaqamatDetails || false} 
                      onChange={(e) => setExportOptions((prev) => {
                        const newOptions = { 
                          ...prev, 
                          includeMaqamatDetails: e.target.checked,
                          // Auto-disable modulations if maqamat details is unchecked
                          includeModulations: e.target.checked ? prev.includeModulations : false
                        };
                        return { ...newOptions, filename: generateCurrentFilename(newOptions) };
                      })} 
                    />
                    <span>Maqamat Details</span>
                  </label>
                </>
              )}
              
              {/* Jins and Maqam specific options */}
              {(exportType === 'jins' || exportType === 'maqam') && (
                <label className="export-modal__checkbox">
                  <input 
                    type="checkbox" 
                    checked={exportOptions.includeTranspositions || false} 
                    onChange={(e) => setExportOptions((prev) => {
                      const newOptions = { ...prev, includeTranspositions: e.target.checked };
                      return { ...newOptions, filename: generateCurrentFilename(newOptions) };
                    })} 
                  />
                  <span>All Transpositions</span>
                </label>
              )}
              
              {/* Modulations option - available for tuning system (with maqamat details) and maqam exports */}
              {((exportType === 'tuning-system' && exportOptions.includeMaqamatDetails) || exportType === 'maqam') && (
                <label className="export-modal__checkbox">
                  <input 
                    type="checkbox" 
                    checked={exportOptions.includeModulations} 
                    onChange={(e) => setExportOptions((prev) => {
                      const newOptions = { ...prev, includeModulations: e.target.checked };
                      return { ...newOptions, filename: generateCurrentFilename(newOptions) };
                    })} 
                  />
                  <span>Modulations</span>
                </label>
              )}
            </div>
          </div>

          {/* Modulation Type selection - show when modulations are enabled */}
          {exportOptions.includeModulations && ((exportType === 'tuning-system' && exportOptions.includeMaqamatDetails) || exportType === 'maqam') && (
            <div className="export-modal__section">
              <label className="export-modal__label">Modulation Type</label>
              <div className="export-modal__checkbox-group">
                <label className="export-modal__checkbox">
                  <input 
                    type="radio" 
                    name="modulationType"
                    checked={exportOptions.modulationType === 'maqamat'} 
                    onChange={() => setExportOptions((prev) => {
                      const newOptions = { ...prev, modulationType: 'maqamat' as 'maqamat' | 'ajnas' };
                      return { ...newOptions, filename: generateCurrentFilename(newOptions) };
                    })} 
                  />
                  <span>Maqamat Modulations</span>
                </label>
                <label className="export-modal__checkbox">
                  <input 
                    type="radio" 
                    name="modulationType"
                    checked={exportOptions.modulationType === 'ajnas'} 
                    onChange={() => setExportOptions((prev) => {
                      const newOptions = { ...prev, modulationType: 'ajnas' as 'maqamat' | 'ajnas' };
                      return { ...newOptions, filename: generateCurrentFilename(newOptions) };
                    })} 
                  />
                  <span>Ajnas Modulations</span>
                </label>
              </div>
            </div>
          )}

          {exportOptions.format === "json" && (
            <div className="export-modal__section">
              <label className="export-modal__checkbox">
                <input type="checkbox" checked={exportOptions.prettifyJson} onChange={(e) => setExportOptions((prev) => ({ ...prev, prettifyJson: e.target.checked }))} />
                <span>Prettify JSON (formatted with indentation)</span>
              </label>
            </div>
          )}

          {exportOptions.format === "csv" && (
            <div className="export-modal__section">
              <label className="export-modal__label">CSV Delimiter</label>
              <select className="export-modal__select" value={exportOptions.csvDelimiter} onChange={(e) => setExportOptions((prev) => ({ ...prev, csvDelimiter: e.target.value as "," | ";" | "\t" }))}>
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
              </select>
            </div>
          )}

          <div className="export-modal__section">
            <label className="export-modal__label">Filename</label>
            <input
              type="text"
              className="export-modal__input"
              value={exportOptions.filename}
              onChange={(e) => setExportOptions((prev) => ({ ...prev, filename: e.target.value }))}
              placeholder="Enter filename (without extension)"
            />
          </div>
        </div>

        <div className="export-modal__footer">
          <button className="export-modal__button export-modal__button--secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="export-modal__button export-modal__button--primary" onClick={handleExport} disabled={isExporting || !selectedTuningSystem}>
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
