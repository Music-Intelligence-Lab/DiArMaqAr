"use client";

import React, { useState } from "react";
import useAppContext from "@/contexts/app-context";
import { exportTuningSystem, exportJins, exportMaqam } from "@/functions/export";
import { exportToScala, exportToScalaKeymap, generateExportFilename } from "@/functions/scala-export";
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

export type ExportFormat = "json" | "csv" | "txt" | "pdf" | "xml" | "yaml" | "scala" | "scala-keymap";

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
  const { selectedTuningSystem, selectedIndices, selectedJinsDetails, selectedMaqamDetails } = useAppContext();

  // Determine which jins/maqam to use for export - prioritize specific instances
  const jinsToExport = specificJins || selectedJinsDetails;
  const maqamToExport = specificMaqam || selectedMaqamDetails;

  const [exportOptions, setExportOptions] = useState<ExportOptions>(() => {
    // Generate dynamic filename
    const getExportTypeForFilename = () => {
      if (exportType === 'tuning-system') return 'tuning-details';
      if (exportType === 'jins') return 'jins';
      if (exportType === 'maqam') return 'maqam';
      return 'export';
    };

    const dynamicFilename = selectedTuningSystem 
      ? generateExportFilename(selectedTuningSystem, getExportTypeForFilename() as any, '')
      : `maqam-network-${exportType}-export`;

    // Add specific instance name to filename if available
    let finalFilename = dynamicFilename;
    if (exportType === 'jins' && specificJins) {
      const instanceName = specificJins.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      finalFilename = selectedTuningSystem 
        ? generateExportFilename(selectedTuningSystem, 'jins' as any, instanceName)
        : `jins-${instanceName}-export`;
    } else if (exportType === 'maqam' && specificMaqam) {
      const instanceName = specificMaqam.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      finalFilename = selectedTuningSystem 
        ? generateExportFilename(selectedTuningSystem, 'maqam' as any, instanceName)
        : `maqam-${instanceName}-export`;
    }

    const baseOptions = {
      format: "json" as ExportFormat,
      includeTuningSystemDetails: true,
      includePitchClasses: true,
      includeModulations: false,
      modulationType: 'maqamat' as 'maqamat' | 'ajnas',
      prettifyJson: true,
      csvDelimiter: "," as "," | ";" | "\t",
      filename: finalFilename,
    };

    if (exportType === 'tuning-system') {
      return {
        ...baseOptions,
        includeAjnasDetails: true,
        includeMaqamatDetails: true,
      };
    } else {
      return {
        ...baseOptions,
        includeTranspositions: true,
      };
    }
  });

  const [isExporting, setIsExporting] = useState(false);

  // Helper function to generate filename based on current options
  const generateCurrentFilename = (options: ExportOptions): string => {
    if (!selectedTuningSystem) return `maqam-network-${exportType}-export`;
    
    let exportTypeForFilename: any;
    let instanceName = '';
    
    if (exportType === 'tuning-system') {
      if (options.includeModulations) {
        exportTypeForFilename = options.modulationType === 'maqamat' ? 'modulations-maqamat' : 'modulations-ajnas';
      } else if (options.includeMaqamatDetails) {
        exportTypeForFilename = 'maqamat-details';
      } else {
        exportTypeForFilename = 'tuning-details';
      }
    } else if (exportType === 'jins') {
      exportTypeForFilename = 'jins';
      if (specificJins) {
        instanceName = specificJins.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      }
    } else if (exportType === 'maqam') {
      if (options.includeModulations) {
        exportTypeForFilename = options.modulationType === 'maqamat' ? 'modulations-maqamat' : 'modulations-ajnas';
      } else {
        exportTypeForFilename = 'maqam';
      }
      if (specificMaqam) {
        instanceName = specificMaqam.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      }
    } else {
      exportTypeForFilename = 'export';
    }
    
    return generateExportFilename(selectedTuningSystem, exportTypeForFilename, instanceName);
  };

  const formatDescriptions = {
    json: "JavaScript Object Notation - Best for data interchange and web applications",
    csv: "Comma Separated Values - Great for spreadsheets and data analysis",
    txt: "Plain text format - Human-readable and universal",
    pdf: "Portable Document Format - Professional presentation and printing",
    xml: "Extensible Markup Language - Structured data with metadata",
    yaml: "YAML Ain't Markup Language - Human-readable data serialization",
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
    let content: string;
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

      case "xml":
        content = convertToXML(data);
        mimeType = "application/xml";
        fileExtension = "xml";
        break;

      case "yaml":
        content = convertToYAML(data);
        mimeType = "application/x-yaml";
        fileExtension = "yaml";
        break;

      case "scala":
        if (!selectedTuningSystem || selectedIndices.length === 0) {
          throw new Error("Scala export requires a tuning system and starting note");
        }
        content = exportToScala(selectedTuningSystem, selectedIndices[0] as unknown as NoteName);
        mimeType = "text/plain";
        fileExtension = "scl";
        break;

      case "scala-keymap":
        if (!selectedTuningSystem || selectedIndices.length === 0) {
          throw new Error("Scala keymap export requires a tuning system and starting note");
        }
        content = exportToScalaKeymap(selectedTuningSystem, selectedIndices[0] as unknown as NoteName);
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
          
          if (value === null || value === undefined) {
            flattened[newKey] = '';
          } else if (Array.isArray(value)) {
            // Convert arrays to semicolon-separated strings
            flattened[newKey] = value.map(item => 
              typeof item === 'object' ? JSON.stringify(item) : String(item)
            ).join(';');
          } else if (typeof value === 'object') {
            // For objects, either flatten them or convert to JSON string if too complex
            try {
              const nested = flattenObject(value, newKey);
              Object.assign(flattened, nested);
            } catch {
              flattened[newKey] = JSON.stringify(value);
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
      sections.push(`Title (English): ${ts.titleEnglish || ts.getTitleEnglish?.() || 'N/A'}`);
      sections.push(`Title (Arabic): ${ts.titleArabic || ts.getTitleArabic?.() || 'N/A'}`);
      sections.push(`Creator (English): ${ts.creatorEnglish || ts.getCreatorEnglish?.() || 'N/A'}`);
      sections.push(`Creator (Arabic): ${ts.creatorArabic || ts.getCreatorArabic?.() || 'N/A'}`);
      sections.push(`Year: ${ts.year || ts.getYear?.() || 'N/A'}`);
      sections.push(`Starting Note: ${data.startingNote || 'N/A'}`);
      sections.push(`Source (English): ${ts.sourceEnglish || ts.getSourceEnglish?.() || 'N/A'}`);
      sections.push(`Source (Arabic): ${ts.sourceArabic || ts.getSourceArabic?.() || 'N/A'}`);
      sections.push(`Comments (English): ${ts.commentsEnglish || ts.getCommentsEnglish?.() || 'N/A'}`);
      sections.push(`Comments (Arabic): ${ts.commentsArabic || ts.getCommentsArabic?.() || 'N/A'}`);
      sections.push(`String Length: ${ts.stringLength || ts.getStringLength?.() || 'N/A'}`);
      sections.push(`Default Reference Frequency: ${ts.defaultReferenceFrequency || ts.getDefaultReferenceFrequency?.() || 'N/A'} Hz`);
      sections.push('');
    }
    
    // Pitch Classes
    if (data.fullRangeTuningSystemPitchClasses) {
      sections.push('PITCH CLASSES');
      sections.push('-'.repeat(40));
      data.fullRangeTuningSystemPitchClasses.forEach((pc: any, index: number) => {
        sections.push(`${index + 1}. ${pc.noteName} (Octave ${pc.octave})`);
        sections.push(`   Cents: ${pc.cents || 'N/A'}`);
        sections.push(`   Frequency: ${pc.frequency || 'N/A'} Hz`);
        sections.push(`   Pitch Class: ${pc.pitchClass || 'N/A'}`);
        sections.push('');
      });
    }
    
    // Ajnas Details
    if (data.possibleAjnasDetails) {
      sections.push('AJNAS DETAILS');
      sections.push('-'.repeat(40));
      data.possibleAjnasDetails.forEach((jins: any, index: number) => {
        sections.push(`${index + 1}. ${jins.titleEnglish || jins.getTitleEnglish?.() || 'N/A'}`);
        sections.push(`   Arabic Title: ${jins.titleArabic || jins.getTitleArabic?.() || 'N/A'}`);
        sections.push(`   Root: ${jins.root || 'N/A'}`);
        sections.push(`   Intonation: ${jins.intonation || 'N/A'}`);
        sections.push(`   Number of Transpositions: ${jins.numberOfTranspositions || 'N/A'}`);
        sections.push('');
      });
    }
    
    // Maqamat Details
    if (data.possibleMaqamatDetails) {
      sections.push('MAQAMAT DETAILS');
      sections.push('-'.repeat(40));
      data.possibleMaqamatDetails.forEach((maqam: any, index: number) => {
        sections.push(`${index + 1}. ${maqam.titleEnglish || maqam.getTitleEnglish?.() || 'N/A'}`);
        sections.push(`   Arabic Title: ${maqam.titleArabic || maqam.getTitleArabic?.() || 'N/A'}`);
        sections.push(`   Root: ${maqam.root || 'N/A'}`);
        sections.push(`   Family: ${maqam.family || 'N/A'}`);
        sections.push(`   Number of Transpositions: ${maqam.numberOfTranspositions || 'N/A'}`);
        sections.push('');
      });
    }
    
    // Modulations
    if (data.modulations) {
      sections.push('MODULATIONS');
      sections.push('-'.repeat(40));
      const formatModulations = (modulations: any): string => {
        if (typeof modulations === 'object' && modulations !== null) {
          const result: string[] = [];
          Object.entries(modulations).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              result.push(`${key}: ${value.length} modulations`);
              value.forEach((mod: any, idx: number) => {
                result.push(`  ${idx + 1}. ${mod.titleEnglish || mod.getTitleEnglish?.() || 'N/A'}`);
              });
            } else {
              result.push(`${key}: ${value}`);
            }
          });
          return result.join('\n');
        }
        return String(modulations);
      };
      sections.push(formatModulations(data.modulations));
      sections.push('');
    }
    
    // Summary Statistics
    if (data.numberOfPossibleAjnas !== undefined || data.numberOfPossibleMaqamat !== undefined) {
      sections.push('SUMMARY STATISTICS');
      sections.push('-'.repeat(40));
      sections.push(`Total Possible Ajnas: ${data.numberOfPossibleAjnas || 0}`);
      sections.push(`Total Ajnas in Database: ${data.numberOfAjnas || 0}`);
      sections.push(`Total Possible Maqamat: ${data.numberOfPossibleMaqamat || 0}`);
      sections.push(`Total Maqamat in Database: ${data.numberOfMaqamat || 0}`);
      sections.push('');
    }
    
    sections.push('='.repeat(60));
    sections.push('End of Export');
    sections.push('='.repeat(60));
    
    return sections.join('\n');
  };

  const convertToXML = (data: any): string => {
    const toXML = (obj: any): string => {
      if (Array.isArray(obj)) {
        return obj.map((item) => `<item>${toXML(item)}</item>`).join("");
      } else if (obj && typeof obj === "object") {
        return Object.entries(obj)
          .map(([key, value]) => `<${key}>${toXML(value)}</${key}>`)
          .join("");
      }
      return String(obj);
    };

    return `<?xml version="1.0" encoding="UTF-8"?>\n<root>${toXML(data)}</root>`;
  };

  const convertToYAML = (data: any): string => {
    const toYAML = (obj: any, indent = 0): string => {
      const spaces = "  ".repeat(indent);
      if (Array.isArray(obj)) {
        return obj.map((item) => `${spaces}- ${toYAML(item, indent + 1)}`).join("\n");
      } else if (obj && typeof obj === "object") {
        return Object.entries(obj)
          .map(([key, value]) => `${spaces}${key}: ${toYAML(value, indent + 1)}`)
          .join("\n");
      }
      return String(obj);
    };

    return toYAML(data);
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
                .filter(([format]) => {
                  // Scala formats only available for tuning-system exports
                  if (format === 'scala' || format === 'scala-keymap') {
                    return exportType === 'tuning-system';
                  }
                  return true;
                })
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
                  checked={exportOptions.includeTuningSystemDetails} 
                  onChange={(e) => setExportOptions((prev) => ({ ...prev, includeTuningSystemDetails: e.target.checked }))} 
                />
                <span>Tuning System Details</span>
              </label>
              <label className="export-modal__checkbox">
                <input 
                  type="checkbox" 
                  checked={exportOptions.includePitchClasses} 
                  onChange={(e) => setExportOptions((prev) => ({ ...prev, includePitchClasses: e.target.checked }))} 
                />
                <span>Pitch Classes</span>
              </label>
              
              {/* Tuning System specific options */}
              {exportType === 'tuning-system' && (
                <>
                  <label className="export-modal__checkbox">
                    <input 
                      type="checkbox" 
                      checked={exportOptions.includeAjnasDetails || false} 
                      onChange={(e) => setExportOptions((prev) => ({ ...prev, includeAjnasDetails: e.target.checked }))} 
                    />
                    <span>Ajnas Details</span>
                  </label>
                  <label className="export-modal__checkbox">
                    <input 
                      type="checkbox" 
                      checked={exportOptions.includeMaqamatDetails || false} 
                      onChange={(e) => setExportOptions((prev) => ({ 
                        ...prev, 
                        includeMaqamatDetails: e.target.checked,
                        // Auto-disable modulations if maqamat details is unchecked
                        includeModulations: e.target.checked ? prev.includeModulations : false
                      }))} 
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
                    onChange={(e) => setExportOptions((prev) => ({ ...prev, includeTranspositions: e.target.checked }))} 
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
