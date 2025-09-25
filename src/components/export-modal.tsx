"use client";

import React, { useState, useEffect, useRef } from "react";
import useAppContext from "@/contexts/app-context";
import {
  exportTuningSystem,
  exportJins,
  exportMaqam,
} from "@/functions/export";
import {
  exportToScala,
  exportToScalaKeymap,
  exportJinsToScala,
  exportJinsToScalaKeymap,
  exportMaqamToScala,
  exportMaqamToScalaKeymap,
} from "@/functions/scala-export";
import NoteName from "@/models/NoteName";
import { Jins } from "@/models/Jins";
import { Maqam } from "@/models/Maqam";
import getFirstNoteName from "@/functions/getFirstNoteName";

export type ExportType = "tuning-system" | "jins" | "maqam";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: ExportType;
  specificJins?: Jins; // Optional specific jins to export
  specificMaqam?: Maqam; // Optional specific maqam to export
}

export type ExportFormat =
  | "json"
  | "csv"
  | "txt"
  | "pdf"
  | "scala"
  | "scala-keymap";

export interface ExportOptions {
  format: ExportFormat;
  includeTuningSystemDetails: boolean;
  includePitchClasses: boolean;
  includeAjnasDetails?: boolean; // Only for tuning system exports
  includeMaqamatDetails?: boolean; // Only for tuning system exports
  includeTranspositions?: boolean; // For jins and maqam exports
  includeMaqamatModulations: boolean;
  includeAjnasModulations: boolean;
  csvDelimiter: "," | ";" | "\t";
  filename: string;
}

export default function ExportModal({
  isOpen,
  onClose,
  exportType,
  specificJins,
  specificMaqam,
}: ExportModalProps) {
  const {
    selectedTuningSystem,
    selectedIndices,
    selectedJinsData,
    selectedMaqamData,
  } = useAppContext();

  // Determine which jins/maqam to use for export - prioritize specific instances
  const jinsToExport = specificJins || selectedJinsData;
  const maqamToExport = specificMaqam || selectedMaqamData;

  const [exportOptions, setExportOptions] = useState<ExportOptions>(() => {
    const baseOptions = {
      format: "json" as ExportFormat,
      includeTuningSystemDetails: true, // Always true by default
      includePitchClasses: true, // Always true by default
      includeMaqamatModulations: false,
      includeAjnasModulations: false,
      csvDelimiter: "," as "," | ";" | "\t",
      filename: "", // Will be set by useEffect
    };

    if (exportType === "tuning-system") {
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

  // Generate filename based on current options and context
  const generateFilename = (opts: ExportOptions): string => {
    const parts = [];

    if (exportType === "tuning-system") {
      // For tuning systems: always show the tuning system ID and starting note
      if (selectedTuningSystem) {
        const tuningSysId = selectedTuningSystem.getId();
        parts.push(tuningSysId);

        // Add starting note if available
        if (selectedIndices.length > 0) {
          const startingNote = getFirstNoteName(selectedIndices);
          const startingNoteName = startingNote.toString();
          parts.push(`(${startingNoteName})`);
        }
      } else {
        parts.push("maqam-network");
      }

      // Add included data options
      if (opts.includeAjnasDetails) {
        parts.push("ajnās");
      }
      if (opts.includeMaqamatDetails) {
        parts.push("maqāmāt");
      }
      if (opts.includeMaqamatModulations) {
        parts.push("maqāmāt-modulations");
      }
      if (opts.includeAjnasModulations) {
        parts.push("ajnās-modulations");
      }
    } else if (exportType === "jins") {
      // For jins: use jins name instead of ID
      if (specificJins) {
        parts.push(specificJins.name);
      } else {
        parts.push("jins");
      }

      // Add tuning system
      if (opts.includeTuningSystemDetails && selectedTuningSystem) {
        const tuningSysId = selectedTuningSystem.getId();
        parts.push(tuningSysId);
      }

      // Add included options
      if (opts.includeTranspositions) {
        parts.push("transpositions");
      }
    } else if (exportType === "maqam") {
      // For maqam: use maqam name instead of ID
      if (specificMaqam) {
        parts.push(specificMaqam.name);
      } else {
        parts.push("maqam");
      }

      // Add tuning system
      if (opts.includeTuningSystemDetails && selectedTuningSystem) {
        const tuningSysId = selectedTuningSystem.getId();
        parts.push(tuningSysId);
      }

      // Add included options
      if (opts.includeTranspositions) {
        parts.push("transpositions");
      }
      if (opts.includeMaqamatModulations) {
        parts.push("maqāmāt-modulations");
      }
      if (opts.includeAjnasModulations) {
        parts.push("ajnās-modulations");
      }
    }

    return parts.join("_");
  };

  // Update filename whenever relevant dependencies change
  useEffect(() => {
    const newFilename = generateFilename(exportOptions);
    if (newFilename !== exportOptions.filename) {
      setExportOptions((prev) => ({ ...prev, filename: newFilename }));
    }
  }, [
    exportType,
    selectedTuningSystem?.getId(),
    selectedIndices,
    specificJins?.name,
    specificMaqam?.name,
    exportOptions.includeAjnasDetails,
    exportOptions.includeMaqamatDetails,
    exportOptions.includeTranspositions,
    exportOptions.includeMaqamatModulations,
    exportOptions.includeAjnasModulations,
    exportOptions.includeTuningSystemDetails,
  ]);

  const [isExporting, setIsExporting] = useState(false);
  const isCancelledRef = useRef(false);
  const [exportProgress, setExportProgress] = useState({
    percentage: 0,
    currentStep: "",
    isVisible: false,
  });

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      isCancelledRef.current = false;
      setIsExporting(false);
      setExportProgress({
        percentage: 0,
        currentStep: "",
        isVisible: false,
      });
    }
  }, [isOpen]);

  // Helper function to determine if any export options are selected
  const hasAnyOptionsSelected = (): boolean => {
    // Tuning system details are always included, so we always have some content

    // Check tuning system specific options
    if (exportType === "tuning-system") {
      if (
        exportOptions.includeAjnasDetails ||
        exportOptions.includeMaqamatDetails
      ) {
        return true;
      }
    }

    // Check jins and maqam specific options
    if (
      (exportType === "jins" || exportType === "maqam") &&
      exportOptions.includeTranspositions
    ) {
      return true;
    }

    // Check modulation options
    if (
      exportOptions.includeMaqamatModulations ||
      exportOptions.includeAjnasModulations
    ) {
      return true;
    }

    // Always return true since tuning system data is always included
    return true;
  };

  // Cancel export function
  const handleCancelExport = () => {
    isCancelledRef.current = true;
    setExportProgress((prev) => ({
      ...prev,
      currentStep: "Cancelling export...",
    }));
  };

  const formatDescriptions = {
    json: "JavaScript Object Notation - Best for data interchange and web applications",
    csv: "Comma Separated Values - Great for spreadsheets and data analysis",
    // txt: "Plain text format - Human-readable and universal",
    // pdf: "Portable Document Format - Professional presentation and printing",
    scala: "Scala scale format (.scl) - For microtonal music software",
    "scala-keymap":
      "Scala keymap format (.kbm) - MIDI key mapping for Scala scales",
  };

  const handleExport = async () => {
    // Validation based on export type
    if (exportType === "tuning-system") {
      if (!selectedTuningSystem || selectedIndices.length === 0) {
        alert("Please select a tuning system first");
        return;
      }
    } else if (exportType === "jins") {
      if (
        !jinsToExport ||
        !selectedTuningSystem ||
        selectedIndices.length === 0
      ) {
        alert("Please select a jins and tuning system first");
        return;
      }
    } else if (exportType === "maqam") {
      if (
        !maqamToExport ||
        !selectedTuningSystem ||
        selectedIndices.length === 0
      ) {
        alert("Please select a maqam and tuning system first");
        return;
      }
    }

    setIsExporting(true);
    setExportProgress({
      percentage: 0,
      currentStep: "Initializing export...",
      isVisible: true,
    });

    // Progress tracking utility
    const updateProgress = (percentage: number, step: string) => {
      // Check if export was cancelled using ref for immediate detection
      if (isCancelledRef.current) {
        throw new Error("Export cancelled by user");
      }

      setExportProgress({
        percentage: Math.min(100, Math.max(0, percentage)),
        currentStep: step,
        isVisible: true,
      });
    };

    // Define progress steps based on export type and options
    const getProgressSteps = () => {
      const steps = [];

      if (exportType === "tuning-system") {
        steps.push({ percent: 5, text: "Initializing export...", delay: 200 });
        steps.push({
          percent: 10,
          text: "Loading tuning system...",
          delay: 300,
        });
        steps.push({
          percent: 15,
          text: "Processing pitch classes...",
          delay: 400,
        });

        if (exportOptions.includeAjnasDetails) {
          steps.push({
            percent: 25,
            text: "Analyzing available ajnas...",
            delay: 600,
          });
          steps.push({
            percent: 40,
            text: "Computing ajnas transpositions...",
            delay: 800,
          });
        }

        if (exportOptions.includeMaqamatDetails) {
          steps.push({
            percent: 55,
            text: "Analyzing available maqamat...",
            delay: 600,
          });
          steps.push({
            percent: 70,
            text: "Computing maqamat transpositions...",
            delay: 800,
          });
        }

        if (
          exportOptions.includeMaqamatModulations ||
          exportOptions.includeAjnasModulations
        ) {
          steps.push({
            percent: 80,
            text: "Computing modulations...",
            delay: 500,
          });
        }

        // The actual export call happens here - break it into smaller perceived steps
        steps.push({
          percent: 80,
          text: "Preparing export computation...",
          delay: 200,
        });
        steps.push({
          percent: 82,
          text: "Ready to process data...",
          delay: 150,
        });
      } else if (exportType === "jins") {
        steps.push({ percent: 5, text: "Initializing export...", delay: 200 });
        steps.push({ percent: 15, text: "Loading jins data...", delay: 400 });
        steps.push({
          percent: 30,
          text: "Processing jins pitch classes...",
          delay: 500,
        });

        if (exportOptions.includeTranspositions) {
          steps.push({
            percent: 50,
            text: "Computing jins transpositions...",
            delay: 600,
          });
        }

        if (exportOptions.includeTuningSystemDetails) {
          steps.push({
            percent: 70,
            text: "Processing tuning system details...",
            delay: 400,
          });
        }

        steps.push({
          percent: 80,
          text: "Computing pitch relationships...",
          delay: 400,
        });
        steps.push({
          percent: 82,
          text: "Preparing export computation...",
          delay: 200,
        });
        steps.push({
          percent: 84,
          text: "Ready to process data...",
          delay: 150,
        });
      } else if (exportType === "maqam") {
        steps.push({ percent: 5, text: "Initializing export...", delay: 200 });
        steps.push({ percent: 10, text: "Loading maqam data...", delay: 300 });
        steps.push({
          percent: 15,
          text: "Processing ascending scale...",
          delay: 300,
        });
        steps.push({
          percent: 20,
          text: "Processing descending scale...",
          delay: 300,
        });

        if (exportOptions.includeTranspositions) {
          steps.push({
            percent: 30,
            text: "Computing maqam transpositions...",
            delay: 400,
          });
        }

        if (
          exportOptions.includeMaqamatModulations ||
          exportOptions.includeAjnasModulations
        ) {
          steps.push({
            percent: 40,
            text: "Analyzing modulations...",
            delay: 400,
          });
        }

        if (exportOptions.includeTuningSystemDetails) {
          steps.push({
            percent: 50,
            text: "Processing tuning system details...",
            delay: 300,
          });
        }

        steps.push({
          percent: 55,
          text: "Preparing export computation...",
          delay: 200,
        });
        steps.push({
          percent: 60,
          text: "Ready to process data...",
          delay: 150,
        });
      }

      return steps;
    };

    try {
      const startingNote = getFirstNoteName(selectedIndices);
      let exportedData: any;

      const progressSteps = getProgressSteps();

      // Execute progress steps with their specified delays
      for (let i = 0; i < progressSteps.length; i++) {
        const step = progressSteps[i];
        updateProgress(step.percent, step.text);
        
        // Break the delay into smaller chunks to allow more responsive cancellation
        const delayChunks = Math.ceil(step.delay / 50); // 50ms chunks
        for (let j = 0; j < delayChunks; j++) {
          if (isCancelledRef.current) {
            throw new Error("Export cancelled by user");
          }
          await new Promise((resolve) => setTimeout(resolve, Math.min(50, step.delay - j * 50)));
        }
      }

      // Now do the actual export with progress feedback (function will start at 83%)
      if (exportType === "tuning-system") {
        exportedData = await exportTuningSystem(
          selectedTuningSystem!,
          startingNote,
          {
            includeTuningSystemDetails:
              exportOptions.includeTuningSystemDetails,
            includePitchClasses: exportOptions.includePitchClasses,
            includeAjnasDetails: exportOptions.includeAjnasDetails || false,
            includeMaqamatDetails: exportOptions.includeMaqamatDetails || false,
            includeMaqamatModulations: exportOptions.includeMaqamatModulations,
            includeAjnasModulations: exportOptions.includeAjnasModulations,
            includeModulations8vb: false, // TODO: Add UI control for this option
            progressCallback: updateProgress,
          }
        );
      } else if (exportType === "jins") {
        exportedData = await exportJins(
          jinsToExport!,
          selectedTuningSystem!,
          startingNote,
          {
            includeTuningSystemDetails:
              exportOptions.includeTuningSystemDetails,
            includePitchClasses: exportOptions.includePitchClasses,
            includeTranspositions: exportOptions.includeTranspositions || false,
            progressCallback: updateProgress,
          }
        );
      } else if (exportType === "maqam") {
        exportedData = await exportMaqam(
          maqamToExport!,
          selectedTuningSystem!,
          startingNote,
          {
            includeTuningSystemDetails:
              exportOptions.includeTuningSystemDetails,
            includePitchClasses: exportOptions.includePitchClasses,
            includeTranspositions: exportOptions.includeTranspositions || false,
            includeMaqamatModulations: exportOptions.includeMaqamatModulations,
            includeAjnasModulations: exportOptions.includeAjnasModulations,
            includeModulations8vb: false, // TODO: Add UI control for this option
            progressCallback: updateProgress,
          }
        );
      }

      updateProgress(99.5, "Preparing file download...");
      await new Promise((resolve) => setTimeout(resolve, 100));

      updateProgress(
        99.8,
        `Converting to ${exportOptions.format.toUpperCase()} format...`
      );
      await downloadFile(exportedData, exportOptions, updateProgress);

      updateProgress(100, "Export completed successfully!");

      // Brief delay to show completion before closing
      setTimeout(() => {
        setExportProgress({ percentage: 0, currentStep: "", isVisible: false });
        onClose();
      }, 800);
    } catch (error: any) {
      if (error.message === "Export cancelled by user") {
        // Handle cancellation silently - don't log as error or show alert
        setExportProgress({
          percentage: 0,
          currentStep: "Export cancelled",
          isVisible: true,
        });
        setTimeout(() => {
          setExportProgress((prev) => ({ ...prev, isVisible: false }));
        }, 1500);
      } else {
        // Handle actual errors
        console.error("Export failed:", error);
        setExportProgress({
          percentage: 0,
          currentStep: "Export failed - please try again",
          isVisible: true,
        });
        setTimeout(() => {
          setExportProgress((prev) => ({ ...prev, isVisible: false }));
        }, 3000);
        alert("Export failed. Please try again.");
      }
    } finally {
      setIsExporting(false);
      isCancelledRef.current = false; // Reset ref as well
    }
  };

  const downloadFile = async (
    data: any,
    options: ExportOptions,
    progressCallback?: (percentage: number, step: string) => void
  ) => {
    let content: string = "";
    let mimeType: string;
    let fileExtension: string;

    // Progress tracking helper
    const updateProgress = progressCallback || (() => {});

    switch (options.format) {
      case "json":
        updateProgress(97.5, "Serializing to JSON...");
        await new Promise((resolve) => setTimeout(resolve, 50));
        console.log("Exported JSON data:", data); // For debugging
        content = JSON.stringify(data, null, 2);
        mimeType = "application/json";
        fileExtension = "json";
        break;

      case "csv":
        updateProgress(97.5, "Converting to CSV format...");
        await new Promise((resolve) => setTimeout(resolve, 100));
        content = convertToCSV(data, options.csvDelimiter);
        mimeType = "text/csv";
        fileExtension = "csv";
        break;

      case "txt":
        updateProgress(97.5, "Formatting as text...");
        await new Promise((resolve) => setTimeout(resolve, 75));
        content = convertToText(data);
        mimeType = "text/plain";
        fileExtension = "txt";
        break;

      case "scala":
        updateProgress(97.5, "Generating Scala scale...");
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (exportType === "tuning-system") {
          if (!selectedTuningSystem || selectedIndices.length === 0) {
            throw new Error(
              "Scala export requires a tuning system and starting note"
            );
          }
          content = exportToScala(
            selectedTuningSystem,
            selectedIndices[0] as unknown as NoteName
          );
        } else if (exportType === "jins") {
          if (!jinsToExport || !selectedTuningSystem) {
            throw new Error("Scala export requires a jins and tuning system");
          }
          const startingNote =
            selectedIndices.length > 0
              ? (selectedIndices[0] as unknown as NoteName)
              : undefined;
          content = exportJinsToScala(
            jinsToExport,
            selectedTuningSystem,
            startingNote
          );
        } else if (exportType === "maqam") {
          if (!maqamToExport || !selectedTuningSystem) {
            throw new Error("Scala export requires a maqam and tuning system");
          }
          const startingNote =
            selectedIndices.length > 0
              ? (selectedIndices[0] as unknown as NoteName)
              : undefined;
          content = exportMaqamToScala(
            maqamToExport,
            selectedTuningSystem,
            startingNote
          );
        }
        mimeType = "text/plain";
        fileExtension = "scl";
        break;

      case "scala-keymap":
        updateProgress(97.5, "Generating Scala keymap...");
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (exportType === "tuning-system") {
          if (!selectedTuningSystem || selectedIndices.length === 0) {
            throw new Error(
              "Scala keymap export requires a tuning system and starting note"
            );
          }
          content = exportToScalaKeymap(
            selectedTuningSystem,
            selectedIndices[0] as unknown as NoteName
          );
        } else if (exportType === "jins") {
          if (!jinsToExport || !selectedTuningSystem) {
            throw new Error(
              "Scala keymap export requires a jins and tuning system"
            );
          }
          const startingNote =
            selectedIndices.length > 0
              ? (selectedIndices[0] as unknown as NoteName)
              : undefined;
          content = exportJinsToScalaKeymap(
            jinsToExport,
            selectedTuningSystem,
            startingNote
          );
        } else if (exportType === "maqam") {
          if (!maqamToExport || !selectedTuningSystem) {
            throw new Error(
              "Scala keymap export requires a maqam and tuning system"
            );
          }
          const startingNote =
            selectedIndices.length > 0
              ? (selectedIndices[0] as unknown as NoteName)
              : undefined;
          content = exportMaqamToScalaKeymap(
            maqamToExport,
            selectedTuningSystem,
            startingNote
          );
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

    updateProgress(98, "Creating file blob...");
    await new Promise((resolve) => setTimeout(resolve, 50));

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${options.filename}.${fileExtension}`;

    updateProgress(99, "Initiating download...");
    await new Promise((resolve) => setTimeout(resolve, 50));

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any, delimiter: string): string => {
    const sections: string[] = [];

    // Helper function to escape CSV values
    const escapeCSV = (value: any): string => {
      const str = String(value || "");
      if (str.includes(delimiter) || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Helper function to flatten nested objects and convert values to strings
    const flattenObject = (obj: any, prefix = ""): Record<string, string> => {
      const flattened: Record<string, string> = {};

      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          const newKey = prefix ? `${prefix}.${key}` : key;

          // Skip functions and private properties
          if (typeof value === "function" || key.startsWith("_")) {
            continue;
          }

          if (value === null || value === undefined || value === "") {
            flattened[newKey] = "";
          } else if (Array.isArray(value)) {
            // Convert arrays to semicolon-separated strings
            if (value.length === 0) {
              flattened[newKey] = "";
            } else {
              flattened[newKey] = value
                .map((item) => {
                  if (typeof item === "object" && item !== null) {
                    // For complex objects in arrays, try to get a meaningful string representation
                    const title =
                      item.titleEnglish ||
                      item.name ||
                      item.title ||
                      (typeof item.getTitleEnglish === "function"
                        ? item.getTitleEnglish()
                        : null);
                    return title || JSON.stringify(item);
                  } else {
                    return String(item);
                  }
                })
                .join("; ");
            }
          } else if (typeof value === "object") {
            // For objects, try to flatten them recursively, but limit depth to avoid infinite recursion
            const depth = (prefix.match(/\./g) || []).length;
            if (depth < 3) {
              // Limit to 3 levels deep
              try {
                const nested = flattenObject(value, newKey);
                Object.assign(flattened, nested);
              } catch {
                // If flattening fails, convert to JSON string
                flattened[newKey] = JSON.stringify(value);
              }
            } else {
              // Too deep, just convert to string
              const title =
                value.titleEnglish ||
                value.name ||
                value.title ||
                (typeof value.getTitleEnglish === "function"
                  ? value.getTitleEnglish()
                  : null);
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
    const arrayToCSV = (
      items: any[],
      title: string,
      preferredOrder: string[] = []
    ): string => {
      if (!items || items.length === 0) return `${title}\nNo data available\n`;

      // Flatten all objects and collect all unique keys
      const flattenedItems = items.map((item) => {
        if (typeof item === "object" && item !== null) {
          return flattenObject(item);
        } else {
          return { value: String(item) };
        }
      });

      // Get all unique keys from all flattened objects
      const allKeys = new Set<string>();
      flattenedItems.forEach((item) => {
        Object.keys(item).forEach((key) => allKeys.add(key));
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
        ...flattenedItems.map((item) =>
          headers.map((header) => escapeCSV(item[header] || "")).join(delimiter)
        ),
      ];

      return csvRows.join("\n") + "\n";
    };

    // Combine Tuning System Information with Pitch Classes
    if (data.tuningSystem) {
      const ts = data.tuningSystem;
      const tuningSystemInfo = [
        "Tuning System Information",
        `Title (English)${delimiter}${escapeCSV(
          ts.titleEnglish || ts.getTitleEnglish?.()
        )}`,
        `Title (Arabic)${delimiter}${escapeCSV(
          ts.titleArabic || ts.getTitleArabic?.()
        )}`,
        `Creator (English)${delimiter}${escapeCSV(
          ts.creatorEnglish || ts.getCreatorEnglish?.()
        )}`,
        `Creator (Arabic)${delimiter}${escapeCSV(
          ts.creatorArabic || ts.getCreatorArabic?.()
        )}`,
        `Year${delimiter}${escapeCSV(ts.year || ts.getYear?.())}`,
        `Starting Note Name${delimiter}${escapeCSV(data.startingNote)}`,
        `Source (English)${delimiter}${escapeCSV(
          ts.sourceEnglish || ts.getSourceEnglish?.()
        )}`,
        `Source (Arabic)${delimiter}${escapeCSV(
          ts.sourceArabic || ts.getSourceArabic?.()
        )}`,
        `Comments (English)${delimiter}${escapeCSV(
          ts.commentsEnglish || ts.getCommentsEnglish?.()
        )}`,
        `Comments (Arabic)${delimiter}${escapeCSV(
          ts.commentsArabic || ts.getCommentsArabic?.()
        )}`,
        `String Length${delimiter}${escapeCSV(
          ts.stringLength || ts.getStringLength?.()
        )}`,
        `Default Reference Frequency${delimiter}${escapeCSV(
          ts.defaultReferenceFrequency || ts.getDefaultReferenceFrequency?.()
        )}`,
        "",
      ].join("\n");
      sections.push(tuningSystemInfo);

      // Add pitch classes as part of tuning system info
      if (data.fullRangeTuningSystemPitchClasses) {
        // Create a more organized pitch class table with logical column order
        const pitchClasses = data.fullRangeTuningSystemPitchClasses.map(
          (pc: any) => ({
            "Note Name": pc.noteName,
            Octave: pc.octave,
            Cents: pc.cents,
            "Frequency (Hz)": pc.frequency,
            "Pitch Class": pc.pitchClass,
            Semitones: pc.semitones,
          })
        );
        const pitchClassOrder = [
          "Note Name",
          "Octave",
          "Cents",
          "Frequency (Hz)",
          "Pitch Class",
          "Semitones",
        ];
        sections.push(
          arrayToCSV(pitchClasses, "Pitch Classes", pitchClassOrder)
        );
      }
    }

    // Ajnas Overview
    if (data.possibleAjnasOverview) {
      const ajnasOverviewOrder = [
        "titleEnglish",
        "titleArabic",
        "root",
        "intonation",
        "SourcePageReferences",
        "numberOfTranspositions",
      ];
      sections.push(
        arrayToCSV(
          data.possibleAjnasOverview,
          "Possible Ajnas Overview",
          ajnasOverviewOrder
        )
      );
    }

    // Ajnas Details
    if (data.possibleAjnasDetails) {
      const ajnasDetailsOrder = [
        "titleEnglish",
        "titleArabic",
        "root",
        "intonation",
        "family",
        "SourcePageReferences",
        "commentsEnglish",
        "commentsArabic",
        "numberOfTranspositions",
      ];
      sections.push(
        arrayToCSV(
          data.possibleAjnasDetails,
          "Possible Ajnas Details",
          ajnasDetailsOrder
        )
      );
    }

    // Maqamat Overview
    if (data.possibleMaqamatOverview) {
      const maqamatOverviewOrder = [
        "titleEnglish",
        "titleArabic",
        "root",
        "family",
        "SourcePageReferences",
        "numberOfTranspositions",
      ];
      sections.push(
        arrayToCSV(
          data.possibleMaqamatOverview,
          "Possible Maqamat Overview",
          maqamatOverviewOrder
        )
      );
    }

    // Maqamat Details
    if (data.possibleMaqamatDetails) {
      const maqamatDetailsOrder = [
        "titleEnglish",
        "titleArabic",
        "root",
        "family",
        "suyur",
        "SourcePageReferences",
        "commentsEnglish",
        "commentsArabic",
        "numberOfTranspositions",
      ];
      sections.push(
        arrayToCSV(
          data.possibleMaqamatDetails,
          "Possible Maqamat Details",
          maqamatDetailsOrder
        )
      );
    }

    // Modulations
    const hasModulations = data.maqamatModulations || data.ajnasModulations;
    if (hasModulations) {
      // Convert modulations objects to arrays for CSV export
      const flatModulations: any[] = [];

      // Handle Maqamat modulations
      if (
        data.maqamatModulations &&
        typeof data.maqamatModulations === "object"
      ) {
        Object.entries(data.maqamatModulations).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((mod: any) => {
              flatModulations.push({
                ModulationCategory: "Maqamat",
                ModulationType: key,
                ...mod,
              });
            });
          } else {
            flatModulations.push({
              ModulationCategory: "Maqamat",
              ModulationType: key,
              Value: value,
            });
          }
        });
      }

      // Handle Ajnas modulations
      if (data.ajnasModulations && typeof data.ajnasModulations === "object") {
        Object.entries(data.ajnasModulations).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((mod: any) => {
              flatModulations.push({
                ModulationCategory: "Ajnas",
                ModulationType: key,
                ...mod,
              });
            });
          } else {
            flatModulations.push({
              ModulationCategory: "Ajnas",
              ModulationType: key,
              Value: value,
            });
          }
        });
      }

      const modulationsOrder = [
        "ModulationCategory",
        "ModulationType",
        "titleEnglish",
        "titleArabic",
        "root",
        "family",
      ];
      sections.push(
        arrayToCSV(flatModulations, "Modulations", modulationsOrder)
      );
    }

    // Transpositions
    if (data.transpositions) {
      const transpositionsOrder = [
        "titleEnglish",
        "titleArabic",
        "root",
        "family",
      ];
      sections.push(
        arrayToCSV(data.transpositions, "Transpositions", transpositionsOrder)
      );
    }

    // Summary statistics
    if (data.summaryStats) {
      const summary = [
        "Summary Statistics",
        `Total Ajnas in Database${delimiter}${escapeCSV(
          data.summaryStats.totalAjnasInDatabase || 0
        )}`,
        `Total Maqamat in Database${delimiter}${escapeCSV(
          data.summaryStats.totalMaqamatInDatabase || 0
        )}`,
        `Tuning Pitch Classes in Single Octave${delimiter}${escapeCSV(
          data.summaryStats.tuningPitchClassesInSingleOctave || 0
        )}`,
        `Tuning Pitch Classes in All Octaves${delimiter}${escapeCSV(
          data.summaryStats.tuningPitchClassesInAllOctaves || 0
        )}`,
        `Ajnas Available in Tuning${delimiter}${escapeCSV(
          data.summaryStats.ajnasAvailableInTuning || 0
        )}`,
        `Maqamat Available in Tuning${delimiter}${escapeCSV(
          data.summaryStats.maqamatAvailableInTuning || 0
        )}`,
        `Total Ajnas Transpositions${delimiter}${escapeCSV(
          data.summaryStats.totalAjnasTranspositions || 0
        )}`,
        `Total Maqamat Transpositions${delimiter}${escapeCSV(
          data.summaryStats.totalMaqamatTranspositions || 0
        )}`,
        `Total Maqam Modulations${delimiter}${escapeCSV(
          data.summaryStats.totalMaqamModulations || 0
        )}`,
        `Total Ajnas Modulations${delimiter}${escapeCSV(
          data.summaryStats.totalAjnasModulations || 0
        )}`,
        "",
      ].join("\n");

      sections.push(summary);
    }

    return sections.join("\n");
  };

  const convertToText = (data: any): string => {
    const sections: string[] = [];

    // Helper function to format any value, recursively breaking down objects
    const formatValue = (value: any, indentLevel: number = 0): string => {
      const indent = "  ".repeat(indentLevel);

      if (value === null || value === undefined || value === "") {
        return "N/A";
      }

      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        const str = String(value).trim();
        return str || "N/A";
      }

      if (Array.isArray(value)) {
        if (value.length === 0) return "None";
        return value
          .map((item, index) => {
            const itemStr = formatValue(item, indentLevel + 1);
            if (itemStr.includes("\n")) {
              return `${indent}  ${index + 1}.\n${itemStr}`;
            } else {
              return `${indent}  ${index + 1}. ${itemStr}`;
            }
          })
          .join("\n");
      }

      if (typeof value === "object" && value !== null) {
        // Handle objects by breaking them down into their properties
        const entries = Object.entries(value).filter(([key, val]) => {
          // Filter out functions, internal properties, and empty values
          return (
            typeof val !== "function" &&
            !key.startsWith("_") &&
            val !== null &&
            val !== undefined &&
            val !== ""
          );
        });

        if (entries.length === 0) return "N/A";

        return entries
          .map(([key, val]) => {
            // Convert camelCase to readable format
            const formattedKey = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())
              .replace(/\s+/g, " ")
              .trim();

            const formattedValue = formatValue(val, indentLevel + 1);
            if (formattedValue.includes("\n")) {
              return `${indent}  ${formattedKey}:\n${formattedValue}`;
            } else {
              return `${indent}  ${formattedKey}: ${formattedValue}`;
            }
          })
          .join("\n");
      }

      return String(value);
    };

    // Title Section
    sections.push("=".repeat(60));
    sections.push("ARABIC MAQAM NETWORK - EXPORT DATA");
    sections.push("=".repeat(60));
    sections.push("");

    // Export timestamp
    const now = new Date();
    sections.push(`Export Date: ${now.toLocaleDateString()}`);
    sections.push(`Export Time: ${now.toLocaleTimeString()}`);
    sections.push("");

    // Tuning System Information
    if (data.tuningSystem) {
      const ts = data.tuningSystem;
      sections.push("TUNING SYSTEM INFORMATION");
      sections.push("-".repeat(40));
      sections.push(
        `Title (English): ${formatValue(
          ts.titleEnglish || ts.getTitleEnglish?.()
        )}`
      );
      sections.push(
        `Title (Arabic): ${formatValue(
          ts.titleArabic || ts.getTitleArabic?.()
        )}`
      );
      sections.push(
        `Creator (English): ${formatValue(
          ts.creatorEnglish || ts.getCreatorEnglish?.()
        )}`
      );
      sections.push(
        `Creator (Arabic): ${formatValue(
          ts.creatorArabic || ts.getCreatorArabic?.()
        )}`
      );
      sections.push(`Year: ${formatValue(ts.year || ts.getYear?.())}`);
      sections.push(`Starting Note: ${formatValue(data.startingNote)}`);
      sections.push(
        `Source (English): ${formatValue(
          ts.sourceEnglish || ts.getSourceEnglish?.()
        )}`
      );
      sections.push(
        `Source (Arabic): ${formatValue(
          ts.sourceArabic || ts.getSourceArabic?.()
        )}`
      );
      sections.push(
        `Comments (English): ${formatValue(
          ts.commentsEnglish || ts.getCommentsEnglish?.()
        )}`
      );
      sections.push(
        `Comments (Arabic): ${formatValue(
          ts.commentsArabic || ts.getCommentsArabic?.()
        )}`
      );
      sections.push(
        `String Length: ${formatValue(
          ts.stringLength || ts.getStringLength?.()
        )}`
      );
      sections.push(
        `Default Reference Frequency: ${formatValue(
          ts.defaultReferenceFrequency || ts.getDefaultReferenceFrequency?.()
        )} Hz`
      );
      sections.push("");
    }

    // Pitch Classes
    if (data.fullRangeTuningSystemPitchClasses) {
      sections.push("PITCH CLASSES");
      sections.push("-".repeat(40));
      data.fullRangeTuningSystemPitchClasses.forEach(
        (pc: any, index: number) => {
          sections.push(
            `${index + 1}. ${formatValue(pc.noteName)} (Octave ${formatValue(
              pc.octave
            )})`
          );
          sections.push(`   Cents: ${formatValue(pc.cents)}`);
          sections.push(`   Frequency: ${formatValue(pc.frequency)} Hz`);
          sections.push(`   Pitch Class: ${formatValue(pc.pitchClass)}`);
          if (pc.semitones !== undefined) {
            sections.push(`   Semitones: ${formatValue(pc.semitones)}`);
          }
          sections.push("");
        }
      );
    }

    // Ajnas Details
    if (data.possibleAjnasDetails) {
      sections.push("AJNAS DETAILS");
      sections.push("-".repeat(40));
      data.possibleAjnasDetails.forEach((jins: any, index: number) => {
        sections.push(
          `${index + 1}. ${formatValue(
            jins.titleEnglish || jins.getTitleEnglish?.()
          )}`
        );

        // Use the helper function to display all properties properly
        const jinsFormatted = formatValue(jins, 1);
        if (jinsFormatted !== "N/A") {
          sections.push(jinsFormatted);
        }
        sections.push("");
      });
    }

    // Maqamat Details
    if (data.possibleMaqamatDetails) {
      sections.push("MAQAMAT DETAILS");
      sections.push("-".repeat(40));
      data.possibleMaqamatDetails.forEach((maqam: any, index: number) => {
        sections.push(
          `${index + 1}. ${formatValue(
            maqam.titleEnglish || maqam.getTitleEnglish?.()
          )}`
        );

        // Use the helper function to display all properties properly
        const maqamFormatted = formatValue(maqam, 1);
        if (maqamFormatted !== "N/A") {
          sections.push(maqamFormatted);
        }
        sections.push("");
      });
    }

    // Transpositions (for jins and maqam exports)
    if (data.transpositions) {
      sections.push("TRANSPOSITIONS");
      sections.push("-".repeat(40));
      data.transpositions.forEach((transposition: any, index: number) => {
        sections.push(
          `${index + 1}. ${formatValue(
            transposition.titleEnglish || transposition.getTitleEnglish?.()
          )}`
        );

        const transpositionFormatted = formatValue(transposition, 1);
        if (transpositionFormatted !== "N/A") {
          sections.push(transpositionFormatted);
        }
        sections.push("");
      });
    }

    // Modulations
    const hasModulations = data.maqamatModulations || data.ajnasModulations;
    if (hasModulations) {
      sections.push("MODULATIONS");
      sections.push("-".repeat(40));

      if (data.maqamatModulations) {
        sections.push("Maqamat Modulations:");
        const maqamatModulationsFormatted = formatValue(
          data.maqamatModulations,
          1
        );
        sections.push(maqamatModulationsFormatted);
        if (data.numberOfMaqamModulationHops !== undefined) {
          sections.push(
            `Number of Maqam Modulation Hops: ${data.numberOfMaqamModulationHops}`
          );
        }
        sections.push("");
      }

      if (data.ajnasModulations) {
        sections.push("Ajnas Modulations:");
        const ajnasModulationsFormatted = formatValue(data.ajnasModulations, 1);
        sections.push(ajnasModulationsFormatted);
        if (data.numberOfJinsModulationHops !== undefined) {
          sections.push(
            `Number of Jins Modulation Hops: ${data.numberOfJinsModulationHops}`
          );
        }
        sections.push("");
      }
    }

    // Summary Statistics
    if (data.summaryStats) {
      sections.push("SUMMARY STATISTICS");
      sections.push("-".repeat(40));
      sections.push(
        `Total Ajnas in Database: ${
          data.summaryStats.totalAjnasInDatabase ?? 0
        }`
      );
      sections.push(
        `Total Maqamat in Database: ${
          data.summaryStats.totalMaqamatInDatabase ?? 0
        }`
      );
      sections.push(
        `Tuning Pitch Classes in Single Octave: ${
          data.summaryStats.tuningPitchClassesInSingleOctave ?? 0
        }`
      );
      sections.push(
        `Tuning Pitch Classes in All Octaves: ${
          data.summaryStats.tuningPitchClassesInAllOctaves ?? 0
        }`
      );
      sections.push(
        `Ajnas Available in Tuning: ${
          data.summaryStats.ajnasAvailableInTuning ?? 0
        }`
      );
      sections.push(
        `Maqamat Available in Tuning: ${
          data.summaryStats.maqamatAvailableInTuning ?? 0
        }`
      );
      sections.push(
        `Total Ajnas Transpositions: ${
          data.summaryStats.totalAjnasTranspositions ?? 0
        }`
      );
      sections.push(
        `Total Maqamat Transpositions: ${
          data.summaryStats.totalMaqamatTranspositions ?? 0
        }`
      );
      sections.push(
        `Total Maqam Modulations: ${
          data.summaryStats.totalMaqamModulations ?? 0
        }`
      );
      sections.push(
        `Total Ajnas Modulations: ${
          data.summaryStats.totalAjnasModulations ?? 0
        }`
      );
      sections.push("");
    }

    sections.push("=".repeat(60));
    sections.push("End of Export");
    sections.push("=".repeat(60));

    return sections.join("\n");
  };

  const downloadPDF = async (data: any) => {
    // Convert data to formatted text first
    const formattedText = convertToText(data);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Digital Arabic Maqām Archive Export</title>
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
        <h1>Digital Arabic Maqām Archive Export</h1>
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
    <div
      className="export-modal-overlay"
      onClick={isExporting ? undefined : onClose}
    >
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal__header">
          <h2 className="export-modal__title">
            Export{" "}
            {exportType === "tuning-system"
              ? "Tuning System"
              : exportType === "jins"
              ? "Jins"
              : "Maqam"}{" "}
            Data
          </h2>
          <button
            className="export-modal__close"
            onClick={isExporting ? undefined : onClose}
            disabled={isExporting}
          >
            ×
          </button>
        </div>

        {/* Progress Indicator */}
        {exportProgress.isVisible && (
          <div className="export-modal__progress-section">
            <div className="export-modal__progress-container">
              <div className="export-modal__progress-text">
                <span className="export-modal__progress-step">
                  {exportProgress.currentStep}
                </span>
                <span className="export-modal__progress-percentage">
                  {Math.round(exportProgress.percentage)}%
                </span>
              </div>
              <div className="export-modal__progress-bar">
                <div
                  className="export-modal__progress-fill"
                  style={{ width: `${exportProgress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div
          className={`export-modal__content ${
            isExporting ? "export-modal__content--disabled" : ""
          }`}
        >
          <div className="export-modal__section">
            <label className="export-modal__label">Export Format</label>
            <div className="export-modal__format-grid">
              {Object.entries(formatDescriptions).map(
                ([format, description]) => (
                  <div
                    key={format}
                    className={`export-modal__format-card ${
                      exportOptions.format === format
                        ? "export-modal__format-card--selected"
                        : ""
                    }`}
                    onClick={() =>
                      setExportOptions((prev) => ({
                        ...prev,
                        format: format as ExportFormat,
                      }))
                    }
                  >
                    <div className="export-modal__format-name">
                      {format.toUpperCase()}
                    </div>
                    <div className="export-modal__format-description">
                      {description}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="export-modal__section">
            <label className="export-modal__label">Include Data</label>
            <div className="export-modal__checkbox-group">
              {/* Tuning System data is always included by default */}

              {/* Tuning System specific options */}
              {exportType === "tuning-system" && (
                <>
                  <label className="export-modal__checkbox">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeAjnasDetails || false}
                      onChange={(e) =>
                        setExportOptions((prev) => ({
                          ...prev,
                          includeAjnasDetails: e.target.checked,
                        }))
                      }
                    />
                    <span>Ajnās Details</span>
                  </label>
                  <label className="export-modal__checkbox">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMaqamatDetails || false}
                      onChange={(e) =>
                        setExportOptions((prev) => ({
                          ...prev,
                          includeMaqamatDetails: e.target.checked,
                          // Auto-disable both modulations if maqamat details is unchecked
                          includeMaqamatModulations: e.target.checked
                            ? prev.includeMaqamatModulations
                            : false,
                          includeAjnasModulations: e.target.checked
                            ? prev.includeAjnasModulations
                            : false,
                        }))
                      }
                    />
                    <span>Maqāmat Details</span>
                  </label>
                </>
              )}

              {/* Jins and Maqam specific options */}
              {(exportType === "jins" || exportType === "maqam") && (
                <label className="export-modal__checkbox">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeTranspositions || false}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includeTranspositions: e.target.checked,
                      }))
                    }
                  />
                  <span>All Transpositions</span>
                </label>
              )}

              {/* Modulations options - available for tuning system (with maqamat details) and maqam exports */}
              {((exportType === "tuning-system" &&
                exportOptions.includeMaqamatDetails) ||
                exportType === "maqam") && (
                <>
                  <label className="export-modal__checkbox">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeAjnasModulations}
                      onChange={(e) =>
                        setExportOptions((prev) => ({
                          ...prev,
                          includeAjnasModulations: e.target.checked,
                        }))
                      }
                    />
                    <span>Ajnās Modulations</span>
                  </label>
                  <label className="export-modal__checkbox">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMaqamatModulations}
                      onChange={(e) =>
                        setExportOptions((prev) => ({
                          ...prev,
                          includeMaqamatModulations: e.target.checked,
                        }))
                      }
                    />
                    <span>Maqāmat Modulations</span>
                  </label>
                </>
              )}
            </div>
          </div>

          {exportOptions.format === "csv" && (
            <div className="export-modal__section">
              <label className="export-modal__label">CSV Delimiter</label>
              <select
                className="export-modal__select"
                value={exportOptions.csvDelimiter}
                onChange={(e) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    csvDelimiter: e.target.value as "," | ";" | "\t",
                  }))
                }
              >
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
              onChange={(e) =>
                setExportOptions((prev) => ({
                  ...prev,
                  filename: e.target.value,
                }))
              }
              placeholder="Enter filename (without extension)"
            />
          </div>
        </div>

        <div className="export-modal__footer">
          <button
            className="export-modal__button export-modal__button--secondary"
            onClick={isExporting ? handleCancelExport : onClose}
          >
            {isExporting ? "Cancel Export" : "Cancel"}
          </button>
          <button
            className="export-modal__button export-modal__button--primary"
            onClick={handleExport}
            disabled={
              isExporting || !selectedTuningSystem || !hasAnyOptionsSelected()
            }
          >
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
