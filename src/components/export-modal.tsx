"use client";

import React, { useState, useEffect, useRef } from "react";
import useAppContext from "@/contexts/app-context";
import {
  exportTuningSystem,
  exportJins,
  exportMaqam,
} from "@/functions/export";
import {
  exportTuningSystemToScala,
  exportMaqamToScala,
  exportMaqamTo12ToneScala,
  exportMaqamWithTuningSystemOctave,
  exportJinsWithTuningSystemOctave,
} from "@/functions/scala-export";
import { getTuningSystems } from "@/functions/import";
import NoteName from "@/models/NoteName";
import { Jins } from "@/models/Jins";
import { Maqam } from "@/models/Maqam";
import getFirstNoteName from "@/functions/getFirstNoteName";
import { standardizeText } from "@/functions/export";

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
  | "txt"
  | "pdf"
  | "scala";

export interface ExportOptions {
  format: ExportFormat;
  includeTuningSystemDetails: boolean;
  includePitchClasses: boolean;
  includeAjnasDetails?: boolean; // Only for tuning system exports
  includeMaqamatDetails?: boolean; // Only for tuning system exports
  includeTranspositions?: boolean; // For jins and maqam exports
  includeMaqamToMaqamModulations: boolean;
  includeMaqamToJinsModulations: boolean;
  includeModulations8vb: boolean; // Lower Octave modulations
  exportSeparateFilesPerStartingNote?: boolean; // Only for tuning system exports
  scalaVariant?: 'standard' | 'keymap' | '12tone'; // Only used when format is 'scala'
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
    allPitchClasses,
  } = useAppContext();

  // Determine which jins/maqam to use for export - prioritize specific instances
  const jinsToExport = specificJins || selectedJinsData;
  const maqamToExport = specificMaqam || selectedMaqamData;

  const [exportOptions, setExportOptions] = useState<ExportOptions>(() => {
    const baseOptions = {
      format: "json" as ExportFormat,
      includeTuningSystemDetails: true, // Always true by default
      includePitchClasses: true, // Always true by default
      includeMaqamToMaqamModulations: false,
      includeMaqamToJinsModulations: false,
      includeModulations8vb: false, // Lower Octave modulations
      filename: "", // Will be set by useEffect
    };

    if (exportType === "tuning-system") {
      return {
        ...baseOptions,
        includeAjnasDetails: true,
        includeMaqamatDetails: true,
        exportSeparateFilesPerStartingNote: false,
      };
    } else {
      return {
        ...baseOptions,
        includeTranspositions: true,
        scalaVariant: exportType === "maqam" ? 'standard' : undefined,
      };
    }
  });

  // Generate filename based on current options and context
  const generateFilename = (opts: ExportOptions): string => {
    const parts = [];

    if (exportType === "tuning-system") {
      // For tuning systems: always show the tuning system ID and starting note
      if (selectedTuningSystem) {
        const tuningSysId = standardizeText(selectedTuningSystem.getId());
        parts.push(tuningSysId);

        // Add starting note if available
        if (selectedIndices.length > 0) {
          const startingNote = getFirstNoteName(selectedIndices);
          const startingNoteName = standardizeText(startingNote.toString());
          parts.push(`(${startingNoteName})`);
        }
      } else {
        parts.push("maqam-network");
      }

      // Add included data options - only include what's actually exported
      if (opts.includeAjnasDetails) {
        parts.push("ajnas");
      }
      if (opts.includeMaqamatDetails) {
        parts.push("maqamat");
        // Modulations are only included if maqamat details are included
        if (opts.includeMaqamToMaqamModulations) {
          parts.push("maqamat-modulations");
        }
        if (opts.includeMaqamToJinsModulations) {
          parts.push("ajnas-modulations");
        }
        // Lower octave modulations only if at least one modulation type is enabled
        if (opts.includeModulations8vb && (opts.includeMaqamToMaqamModulations || opts.includeMaqamToJinsModulations)) {
          parts.push("lower-octave");
        }
      }
      if (opts.exportSeparateFilesPerStartingNote) {
        parts.push("all-starting-notes");
      }
    } else if (exportType === "jins") {
      // For jins: use jins name instead of ID
      if (specificJins) {
        parts.push(standardizeText(specificJins.name));
      } else {
        parts.push("jins");
      }

      // Add tuning system only if it's actually included in the export
      if (opts.includeTuningSystemDetails && selectedTuningSystem) {
        const tuningSysId = standardizeText(selectedTuningSystem.getId());
        parts.push(tuningSysId);
      }

      // For Scala format, only include Scala-specific options (no transpositions)
      if (opts.format === "scala") {
        // Jins always uses keymap export (generates both .scl and .kbm)
        parts.push("keymap");
      } else {
        // For non-Scala formats, include data options
        // Add included options - only include what's actually exported
        if (opts.includeTranspositions) {
          parts.push("transpositions");
        }
        // Note: jins exports don't have modulations, so no modulation options here
      }
    } else if (exportType === "maqam") {
      // For maqam: use maqam name instead of ID
      if (specificMaqam) {
        parts.push(standardizeText(specificMaqam.name));
      } else {
        parts.push("maqam");
      }

      // Add tuning system only if it's actually included in the export
      if (opts.includeTuningSystemDetails && selectedTuningSystem) {
        const tuningSysId = standardizeText(selectedTuningSystem.getId());
        parts.push(tuningSysId);
      }

      // For Scala format, only include Scala-specific options (no modulations, no transpositions)
      if (opts.format === "scala") {
        // Add Scala variant suffix for maqam
        if (opts.scalaVariant) {
          if (opts.scalaVariant === "keymap") {
            parts.push("keymap");
          } else if (opts.scalaVariant === "12tone") {
            parts.push("12tone");
          }
          // 'standard' variant doesn't add a suffix
        }
      } else {
        // For non-Scala formats, include data options
        // Add included options - only include what's actually exported
        if (opts.includeTranspositions) {
          parts.push("transpositions");
        }
        if (opts.includeMaqamToMaqamModulations) {
          parts.push("maqamat-modulations");
        }
        if (opts.includeMaqamToJinsModulations) {
          parts.push("ajnas-modulations");
        }
        // Lower octave modulations only if at least one modulation type is enabled
        if (opts.includeModulations8vb && (opts.includeMaqamToMaqamModulations || opts.includeMaqamToJinsModulations)) {
          parts.push("lower-octave");
        }
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
    exportOptions.includeMaqamToMaqamModulations,
    exportOptions.includeMaqamToJinsModulations,
    exportOptions.includeModulations8vb,
    exportOptions.exportSeparateFilesPerStartingNote,
    exportOptions.includeTuningSystemDetails,
    exportOptions.format,
    exportOptions.scalaVariant,
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
        exportOptions.includeMaqamatDetails ||
        exportOptions.exportSeparateFilesPerStartingNote
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
      exportOptions.includeMaqamToMaqamModulations ||
      exportOptions.includeMaqamToJinsModulations ||
      exportOptions.includeModulations8vb
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

  // Handle separate files export for tuning systems
  const handleSeparateFilesExport = async (updateProgress: (percentage: number, step: string) => void) => {
    if (!selectedTuningSystem) return;

    // Get all available starting notes
    const noteNameSets = selectedTuningSystem.getNoteNameSets();
    const startingNotes = noteNameSets.map(set => set[0]);

    // Safety check for large number of files
    if (startingNotes.length > 50) {
      const confirmed = window.confirm(
        `This will export ${startingNotes.length} files. This may take a while and use significant bandwidth. Continue?`
      );
      if (!confirmed) {
        setExportProgress({ percentage: 0, currentStep: "", isVisible: false });
        return;
      }
    }

    updateProgress(5, `Preparing to export ${startingNotes.length} files...`);
    
    const exports: Array<{ filename: string; data: any }> = [];
    const baseFilename = exportOptions.filename.replace(/_all-starting-notes$/, '');
    let successCount = 0;

    for (let i = 0; i < startingNotes.length; i++) {
      const startingNote = startingNotes[i];
      const progress = 10 + (i / startingNotes.length) * 80; // Progress from 10% to 90%
      
      updateProgress(progress, `Exporting ${startingNote} (${i + 1}/${startingNotes.length})...`);

      try {
        const exportedData = await exportTuningSystem(
          selectedTuningSystem,
          startingNote,
          {
            includeTuningSystemDetails: exportOptions.includeTuningSystemDetails,
            includePitchClasses: exportOptions.includePitchClasses,
            includeAjnasDetails: exportOptions.includeAjnasDetails || false,
            includeMaqamatDetails: exportOptions.includeMaqamatDetails || false,
            includeMaqamToMaqamModulations: exportOptions.includeMaqamToMaqamModulations,
            includeMaqamToJinsModulations: exportOptions.includeMaqamToJinsModulations,
            includeModulations8vb: exportOptions.includeModulations8vb,
            progressCallback: () => {}, // Disable inner progress for batch export
          }
        );

        const filename = `${baseFilename}_(${startingNote})`;
        exports.push({ filename, data: exportedData });
        successCount++;
      } catch (error) {
        console.error(`Failed to export ${startingNote}:`, error);
        // Continue with other exports
      }

      // Check for cancellation
      if (isCancelledRef.current) {
        throw new Error("Export cancelled by user");
      }
    }

    updateProgress(95, "Preparing downloads...");

    // Download all files
    for (const exportItem of exports) {
      await downloadFile(exportItem.data, { ...exportOptions, filename: exportItem.filename }, () => {});
    }

    updateProgress(100, `Successfully exported ${successCount}/${startingNotes.length} files!`);

    // Brief delay to show completion before closing
    setTimeout(() => {
      setExportProgress({ percentage: 0, currentStep: "", isVisible: false });
      onClose();
    }, 1500);
  };

  const formatDescriptions = {
    json: "JavaScript Object Notation - Best for data interchange and web applications",
    scala: "Scala scale format (.scl) - For music software and hardware that supports custom tunings. Options available for maqam exports.",
  };

  const handleExport = async () => {
    // Validation based on export type
    if (exportType === "tuning-system") {
      if (!selectedTuningSystem) {
        alert("Please select a tuning system first");
        return;
      }
      // For separate files export, we don't need selectedIndices to be set
      if (!exportOptions.exportSeparateFilesPerStartingNote && selectedIndices.length === 0) {
        alert("Please select a starting note first");
        return;
      }
      // Validate dependencies: modulations require maqamatDetails
      if (
        (exportOptions.includeMaqamToMaqamModulations ||
          exportOptions.includeMaqamToJinsModulations) &&
        !exportOptions.includeMaqamatDetails
      ) {
        alert("Modulations require Maqāmat Details to be enabled");
        return;
      }
      // Validate: includeModulations8vb requires at least one modulation option
      if (
        exportOptions.includeModulations8vb &&
        !exportOptions.includeMaqamToMaqamModulations &&
        !exportOptions.includeMaqamToJinsModulations
      ) {
        alert("Lower Octave Modulations require at least one modulation option to be enabled");
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
      // Validate: includeModulations8vb requires at least one modulation option
      if (
        exportOptions.includeModulations8vb &&
        !exportOptions.includeMaqamToMaqamModulations &&
        !exportOptions.includeMaqamToJinsModulations
      ) {
        alert("Lower Octave Modulations require at least one modulation option to be enabled");
        return;
      }
      // Validate: Scala format requires scalaVariant to be set for maqam
      if (exportOptions.format === "scala" && !exportOptions.scalaVariant) {
        alert("Please select a Scala export variant");
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
          exportOptions.includeMaqamToMaqamModulations ||
          exportOptions.includeMaqamToJinsModulations
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
          text: "Processing ascending sequence...",
          delay: 300,
        });
        steps.push({
          percent: 20,
          text: "Processing descending sequence...",
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
          exportOptions.includeMaqamToMaqamModulations ||
          exportOptions.includeMaqamToJinsModulations
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
      // Handle separate files export for tuning systems
      if (exportType === "tuning-system" && exportOptions.exportSeparateFilesPerStartingNote) {
        await handleSeparateFilesExport(updateProgress);
        return;
      }

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
            includeMaqamToMaqamModulations: exportOptions.includeMaqamToMaqamModulations,
            includeMaqamToJinsModulations: exportOptions.includeMaqamToJinsModulations,
            includeModulations8vb: exportOptions.includeModulations8vb,
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
            includeMaqamToMaqamModulations: exportOptions.includeMaqamToMaqamModulations,
            includeMaqamToJinsModulations: exportOptions.includeMaqamToJinsModulations,
            includeModulations8vb: exportOptions.includeModulations8vb,
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
        content = JSON.stringify(data, null, 2);
        mimeType = "application/json";
        fileExtension = "json";
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
          content = exportTuningSystemToScala(
            selectedTuningSystem,
            selectedIndices[0] as unknown as NoteName
          );
          mimeType = "text/plain";
          fileExtension = "scl";
        } else if (exportType === "jins") {
          if (!jinsToExport || !selectedTuningSystem) {
            throw new Error("Scala export requires a jins and tuning system");
          }

          // Get the tuning system's starting note from octave 1
          const octave1StartingPitchClass = allPitchClasses.find(pc => pc.octave === 1);
          const tuningSystemStartingNote = octave1StartingPitchClass?.noteName || null;
          if (!tuningSystemStartingNote || tuningSystemStartingNote === "none") {
            throw new Error("Scala export requires a tuning system starting note");
          }

          // Jins always uses keymap export (generates both .scl and .kbm)
          const exportResult = exportJinsWithTuningSystemOctave(
            jinsToExport,
            selectedTuningSystem,
            tuningSystemStartingNote
          );

          if (!exportResult) {
            throw new Error("Failed to export jins - cannot map jins pitch classes to tuning system");
          }

          updateProgress(98, "Creating file blobs...");
          await new Promise((resolve) => setTimeout(resolve, 50));

          // Download .scl file (tuning system octave 1) - use unified filename
          updateProgress(98.5, "Downloading tuning system scale file...");
          const scalaBlob = new Blob([exportResult.scalaContent], { type: "text/plain" });
          const scalaUrl = URL.createObjectURL(scalaBlob);
          const scalaLink = document.createElement("a");
          scalaLink.href = scalaUrl;
          scalaLink.download = `${options.filename}_scale.scl`;
          document.body.appendChild(scalaLink);
          scalaLink.click();
          document.body.removeChild(scalaLink);
          URL.revokeObjectURL(scalaUrl);

          // Small delay between downloads to prevent browser blocking
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Download .kbm file (jins mapping) - use unified filename
          updateProgress(99, "Downloading jins keymap file...");
          const keymapBlob = new Blob([exportResult.keymapContent], { type: "text/plain" });
          const keymapUrl = URL.createObjectURL(keymapBlob);
          const keymapLink = document.createElement("a");
          keymapLink.href = keymapUrl;
          keymapLink.download = `${options.filename}.kbm`;
          document.body.appendChild(keymapLink);
          keymapLink.click();
          document.body.removeChild(keymapLink);
          URL.revokeObjectURL(keymapUrl);

          return; // Skip the default download logic
        } else if (exportType === "maqam") {
          if (!maqamToExport || !selectedTuningSystem) {
            throw new Error("Scala export requires a maqam and tuning system");
          }

          const startingNote =
            selectedIndices.length > 0
              ? (selectedIndices[0] as unknown as NoteName)
              : undefined;

          // Use scalaVariant to determine which export function to call
          const variant = options.scalaVariant || 'standard';

          if (variant === '12tone') {
            // 12-pitch-class chromatic set export
            updateProgress(97.5, "Generating 12-pitch-class chromatic Scala file...");
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Get al-Kindi (874) tuning system for filler pitches
            const allTuningSystems = getTuningSystems();
            const alKindiTuningSystem = allTuningSystems.find(ts => ts.getId() === "al-Kindi-(874)");

            if (!alKindiTuningSystem) {
              throw new Error("al-Kindi (874) tuning system not found - required for 12-pitch-class chromatic export");
            }

            // Get the starting note name from the tuning system's note name sets
            const firstNoteFromIndices = getFirstNoteName(selectedIndices);
            if (!firstNoteFromIndices || firstNoteFromIndices === "none") {
              throw new Error("12-pitch-class chromatic Scala export requires a starting note");
            }
            
            // Find the matching note name set in the tuning system
            const noteNameSets = selectedTuningSystem.getNoteNameSets();
            const matchingNoteSet = noteNameSets.find(
              (set) => standardizeText(set[0] || "") === standardizeText(firstNoteFromIndices)
            );
            
            // Use the note name from the tuning system's note name set (has proper diacritics)
            const startingNoteName = matchingNoteSet?.[0] || firstNoteFromIndices;

            // Generate .scl file only (no .kbm files)
            const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
            const scalaContent = exportMaqamTo12ToneScala(
              maqamToExport,
              selectedTuningSystem,
              startingNoteName,
              alKindiTuningSystem,
              startingNoteName, // al-Kindi uses same starting note as main tuning system
              undefined, // description is optional
              currentUrl // pass current URL
            );

            if (!scalaContent) {
              throw new Error("Failed to generate 12-pitch-class chromatic Scala file");
            }

            content = scalaContent;
            mimeType = "text/plain";
            fileExtension = "scl";
          } else if (variant === 'keymap') {
            // Keymap export (generates both .scl and .kbm)
            updateProgress(97.5, "Generating Scala scale and keymap...");
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Get the tuning system's starting note from octave 1
            const octave1StartingPitchClass = allPitchClasses.find(pc => pc.octave === 1);
            const tuningSystemStartingNote = octave1StartingPitchClass?.noteName || null;
            if (!tuningSystemStartingNote || tuningSystemStartingNote === "none") {
              throw new Error("Scala keymap export requires a tuning system starting note");
            }

            // Export BOTH .scl and .kbm files for maqam
            const exportResult = exportMaqamWithTuningSystemOctave(
              maqamToExport,
              selectedTuningSystem,
              tuningSystemStartingNote,
              true // use ascending pitch classes
            );

            if (!exportResult) {
              throw new Error("Failed to export maqam - cannot map maqam pitch classes to tuning system");
            }

            updateProgress(98, "Creating file blobs...");
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Download .scl file (tuning system octave 1) - use unified filename
            updateProgress(98.5, "Downloading tuning system scale file...");
            const scalaBlob = new Blob([exportResult.scalaContent], { type: "text/plain" });
            const scalaUrl = URL.createObjectURL(scalaBlob);
            const scalaLink = document.createElement("a");
            scalaLink.href = scalaUrl;
            scalaLink.download = `${options.filename}_scale.scl`;
            document.body.appendChild(scalaLink);
            scalaLink.click();
            document.body.removeChild(scalaLink);
            URL.revokeObjectURL(scalaUrl);

            // Small delay between downloads to prevent browser blocking
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Download .kbm file (maqam mapping) - use unified filename
            updateProgress(99, "Downloading maqam keymap file...");
            const keymapBlob = new Blob([exportResult.keymapContent], { type: "text/plain" });
            const keymapUrl = URL.createObjectURL(keymapBlob);
            const keymapLink = document.createElement("a");
            keymapLink.href = keymapUrl;
            keymapLink.download = `${options.filename}.kbm`;
            document.body.appendChild(keymapLink);
            keymapLink.click();
            document.body.removeChild(keymapLink);
            URL.revokeObjectURL(keymapUrl);

            return; // Skip the default download logic
          } else {
            // Standard scale export (default)
            content = exportMaqamToScala(
              maqamToExport,
              selectedTuningSystem,
              startingNote
            );
            mimeType = "text/plain";
            fileExtension = "scl";
          }
        }
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
                      setExportOptions((prev) => {
                        const newFormat = format as ExportFormat;
                        // Reset scalaVariant when switching away from scala format
                        // Set default scalaVariant for maqam when switching to scala
                        return {
                          ...prev,
                          format: newFormat,
                          scalaVariant:
                            newFormat === 'scala' && exportType === 'maqam'
                              ? (prev.scalaVariant || 'standard')
                              : newFormat !== 'scala'
                              ? undefined
                              : prev.scalaVariant,
                        };
                      })
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

          {/* Only show Include Data section for non-Scala formats */}
          {exportOptions.format !== 'scala' && (
          <div className="export-modal__section">
            <label className="export-modal__label">Include Data</label>
            <div className="export-modal__checkbox-group">
              {/* Tuning System data is always included by default */}

              {/* Tuning System specific options - Details on same line */}
              {exportType === "tuning-system" && (
                <div className="export-modal__inline-options">
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
                          includeMaqamToMaqamModulations: e.target.checked
                            ? prev.includeMaqamToMaqamModulations
                            : false,
                          includeMaqamToJinsModulations: e.target.checked
                            ? prev.includeMaqamToJinsModulations
                            : false,
                        }))
                      }
                    />
                    <span>Maqāmat Details</span>
                  </label>
                </div>
              )}

              {/* Jins and Maqam specific options */}
              {(exportType === "jins" || exportType === "maqam") && (
                <div className="export-modal__inline-options">
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
                </div>
              )}

              {/* Separate files export option - Full width */}
              {exportType === "tuning-system" && (
                <div className="export-modal__option-group">
                  <label className="export-modal__checkbox">
                    <input
                      type="checkbox"
                      checked={exportOptions.exportSeparateFilesPerStartingNote || false}
                      onChange={(e) =>
                        setExportOptions((prev) => ({
                          ...prev,
                          exportSeparateFilesPerStartingNote: e.target.checked,
                        }))
                      }
                    />
                    <span>Export Separate Files for Each Starting Note Name</span>
                  </label>
                  <div className="export-modal__option-description">
                    {exportOptions.exportSeparateFilesPerStartingNote && selectedTuningSystem
                      ? `Will export ${selectedTuningSystem.getNoteNameSets().length} files, one for each available starting note`
                      : "Creates individual export files for each possible starting note in the tuning system"
                    }
                  </div>
                </div>
              )}

              {/* Modulations options - available for tuning system (with maqamat details) and maqam exports */}
              {((exportType === "tuning-system" &&
                exportOptions.includeMaqamatDetails) ||
                exportType === "maqam") && (
                <>
                  <div className="export-modal__inline-options">
                    <label className="export-modal__checkbox">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeMaqamToMaqamModulations}
                        onChange={(e) =>
                          setExportOptions((prev) => ({
                            ...prev,
                            includeMaqamToMaqamModulations: e.target.checked,
                            // Auto-disable 8vb if both modulation options are now unchecked
                            includeModulations8vb: e.target.checked || prev.includeMaqamToJinsModulations
                              ? prev.includeModulations8vb
                              : false,
                          }))
                        }
                      />
                      <span>Maqāmat Modulations</span>
                    </label>
                    <label className="export-modal__checkbox">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeMaqamToJinsModulations}
                        onChange={(e) =>
                          setExportOptions((prev) => ({
                            ...prev,
                            includeMaqamToJinsModulations: e.target.checked,
                            // Auto-disable 8vb if both modulation options are now unchecked
                            includeModulations8vb: e.target.checked || prev.includeMaqamToMaqamModulations
                              ? prev.includeModulations8vb
                              : false,
                          }))
                        }
                      />
                      <span>Ajnās Modulations</span>
                    </label>
                  </div>
                  {/* Lower octave modulations option - only show when at least one modulation is selected */}
                  {(exportOptions.includeMaqamToMaqamModulations ||
                    exportOptions.includeMaqamToJinsModulations) && (
                    <div className="export-modal__inline-options">
                      <label className="export-modal__checkbox">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeModulations8vb}
                          onChange={(e) =>
                            setExportOptions((prev) => ({
                              ...prev,
                              includeModulations8vb: e.target.checked,
                            }))
                          }
                        />
                        <span>Lower Octave Maqāmat & Ajnās</span>
                      </label>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          )}

          {/* Scala format-specific options */}
          {exportOptions.format === 'scala' && exportType === 'maqam' && (
            <div className="export-modal__section">
              <label className="export-modal__label">Scala Export Variant</label>
              <div className="export-modal__checkbox-group">
                <div className="export-modal__inline-options">
                  <label className="export-modal__checkbox">
                    <input
                      type="checkbox"
                      checked={exportOptions.scalaVariant === 'standard'}
                      onChange={(e) =>
                        setExportOptions((prev) => ({
                          ...prev,
                          scalaVariant: e.target.checked ? 'standard' : undefined,
                        }))
                      }
                    />
                    <span>Maqam Data</span>
                  </label>
                  <label className="export-modal__checkbox">
                    <input
                      type="checkbox"
                      checked={exportOptions.scalaVariant === 'keymap'}
                      onChange={(e) =>
                        setExportOptions((prev) => ({
                          ...prev,
                          scalaVariant: e.target.checked ? 'keymap' : undefined,
                        }))
                      }
                    />
                    <span>Tuning System with Maqam Keymap</span>
                  </label>
                  <label className="export-modal__checkbox">
                    <input
                      type="checkbox"
                      checked={exportOptions.scalaVariant === '12tone'}
                      onChange={(e) =>
                        setExportOptions((prev) => ({
                          ...prev,
                          scalaVariant: e.target.checked ? '12tone' : undefined,
                        }))
                      }
                    />
                    <span>12-Pitch-Class Chromatic Set</span>
                  </label>
                </div>
              </div>
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
              placeholder={
                exportType === "tuning-system" && exportOptions.exportSeparateFilesPerStartingNote
                  ? "Base filename (starting note names will be appended)"
                  : "Enter filename (without extension)"
              }
            />
            {exportType === "tuning-system" && exportOptions.exportSeparateFilesPerStartingNote && (
              <div className="export-modal__filename-example">
                Example files: {exportOptions.filename}_(&lt;starting-note&gt;).{exportOptions.format}
              </div>
            )}
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
