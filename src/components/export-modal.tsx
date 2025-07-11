"use client";

import React, { useState } from "react";
import useAppContext from "@/contexts/app-context";
import { exportTuningSystem } from "@/functions/export";
import NoteName from "@/models/NoteName";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ExportFormat = "json" | "csv" | "txt" | "pdf" | "xml" | "yaml";

export interface ExportOptions {
  format: ExportFormat;
  includeTuningSystemDetails: boolean;
  includePitchClasses: boolean;
  includeAjnasDetails: boolean;
  includeMaqamatDetails: boolean;
  includeModulations: boolean;
  modulationType: 'maqamat' | 'ajnas';
  prettifyJson: boolean;
  csvDelimiter: "," | ";" | "\t";
  filename: string;
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { selectedTuningSystem, selectedIndices } = useAppContext();

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "json",
    includeTuningSystemDetails: true,
    includePitchClasses: true,
    includeAjnasDetails: true,
    includeMaqamatDetails: true,
    includeModulations: false,
    modulationType: 'maqamat',
    prettifyJson: true,
    csvDelimiter: ",",
    filename: "maqam-network-export",
  });

  const [isExporting, setIsExporting] = useState(false);

  const formatDescriptions = {
    json: "JavaScript Object Notation - Best for data interchange and web applications",
    csv: "Comma Separated Values - Great for spreadsheets and data analysis",
    txt: "Plain text format - Human-readable and universal",
    pdf: "Portable Document Format - Professional presentation and printing",
    xml: "Extensible Markup Language - Structured data with metadata",
    yaml: "YAML Ain't Markup Language - Human-readable data serialization",
  };

  const handleExport = async () => {
    if (!selectedTuningSystem || selectedIndices.length === 0) {
      alert("Please select a tuning system first");
      return;
    }

    setIsExporting(true);

    try {
      const startingNote = selectedIndices[0] as unknown as NoteName;
      const exportedData = exportTuningSystem(selectedTuningSystem, startingNote, {
        includeTuningSystemDetails: exportOptions.includeTuningSystemDetails,
        includePitchClasses: exportOptions.includePitchClasses,
        includeAjnasDetails: exportOptions.includeAjnasDetails,
        includeMaqamatDetails: exportOptions.includeMaqamatDetails,
        includeModulations: exportOptions.includeModulations,
        modulationType: exportOptions.modulationType,
      });

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

    // Helper function to convert array of objects to CSV with proper flattening
    const arrayToCSV = (items: any[], title: string): string => {
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
      
      const headers = Array.from(allKeys).sort(); // Sort for consistency
      const csvRows = [
        `${title}`,
        headers.map(escapeCSV).join(delimiter),
        ...flattenedItems.map(item => 
          headers.map(header => escapeCSV(item[header] || '')).join(delimiter)
        )
      ];
      
      return csvRows.join('\n') + '\n';
    };

    // Tuning System Information
    if (data.tuningSystem) {
      const ts = data.tuningSystem;
      const tuningSystemInfo = [
        'Tuning System Information',
        `Title (English)${delimiter}${escapeCSV(ts.titleEnglish || ts.getTitleEnglish?.())}`,
        `Title (Arabic)${delimiter}${escapeCSV(ts.titleArabic || ts.getTitleArabic?.())}`,
        `Creator (English)${delimiter}${escapeCSV(ts.creatorEnglish || ts.getCreatorEnglish?.())}`,
        `Creator (Arabic)${delimiter}${escapeCSV(ts.creatorArabic || ts.getCreatorArabic?.())}`,
        `Year${delimiter}${escapeCSV(ts.year || ts.getYear?.())}`,
        `Starting Note${delimiter}${escapeCSV(data.startingNote)}`,
        `String Length${delimiter}${escapeCSV(ts.stringLength || ts.getStringLength?.())}`,
        `Default Reference Frequency${delimiter}${escapeCSV(ts.defaultReferenceFrequency || ts.getDefaultReferenceFrequency?.())}`,
        ''
      ].join('\n');
      sections.push(tuningSystemInfo);
    }

    // Pitch Classes
    if (data.fullRangeTuningSystemPitchClasses) {
      sections.push(arrayToCSV(data.fullRangeTuningSystemPitchClasses, 'Pitch Classes'));
    }

    // Ajnas Overview
    if (data.possibleAjnasOverview) {
      sections.push(arrayToCSV(data.possibleAjnasOverview, 'Possible Ajnas Overview'));
    }

    // Ajnas Details
    if (data.possibleAjnasDetails) {
      sections.push(arrayToCSV(data.possibleAjnasDetails, 'Possible Ajnas Details'));
    }

    // Maqamat Overview
    if (data.possibleMaqamatOverview) {
      sections.push(arrayToCSV(data.possibleMaqamatOverview, 'Possible Maqamat Overview'));
    }

    // Maqamat Details
    if (data.possibleMaqamatDetails) {
      sections.push(arrayToCSV(data.possibleMaqamatDetails, 'Possible Maqamat Details'));
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
    const formatValue = (value: any, indent = 0): string => {
      const spaces = "  ".repeat(indent);
      if (Array.isArray(value)) {
        return value.map((item) => `${spaces}- ${formatValue(item, indent + 1)}`).join("\n");
      } else if (value && typeof value === "object") {
        return Object.entries(value)
          .map(([key, val]) => `${spaces}${key}: ${formatValue(val, indent + 1)}`)
          .join("\n");
      }
      return String(value);
    };

    return formatValue(data);
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
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Maqam Network Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2c3e50; }
          h2 { color: #34495e; margin-top: 30px; }
          pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-wrap: break-word; }
          .section { margin-bottom: 30px; }
        </style>
      </head>
      <body>
        <h1>Arabic Maqam Network Export</h1>
        <div class="section">
          <h2>Export Data</h2>
          <pre>${JSON.stringify(data, null, 2)}</pre>
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
          <h2 className="export-modal__title">Export Data</h2>
          <button className="export-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="export-modal__content">
          <div className="export-modal__section">
            <label className="export-modal__label">Export Format</label>
            <div className="export-modal__format-grid">
              {Object.entries(formatDescriptions).map(([format, description]) => (
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
              <label className="export-modal__checkbox">
                <input 
                  type="checkbox" 
                  checked={exportOptions.includeAjnasDetails} 
                  onChange={(e) => setExportOptions((prev) => ({ ...prev, includeAjnasDetails: e.target.checked }))} 
                />
                <span>Ajnas Details</span>
              </label>
              <label className="export-modal__checkbox">
                <input 
                  type="checkbox" 
                  checked={exportOptions.includeMaqamatDetails} 
                  onChange={(e) => setExportOptions((prev) => ({ 
                    ...prev, 
                    includeMaqamatDetails: e.target.checked,
                    // Auto-disable modulations if maqamat details is unchecked
                    includeModulations: e.target.checked ? prev.includeModulations : false
                  }))} 
                />
                <span>Maqamat Details</span>
              </label>
              <label className="export-modal__checkbox">
                <input 
                  type="checkbox" 
                  checked={exportOptions.includeModulations} 
                  disabled={!exportOptions.includeMaqamatDetails}
                  onChange={(e) => setExportOptions((prev) => ({ ...prev, includeModulations: e.target.checked }))} 
                />
                <span>Modulations</span>
              </label>
            </div>
          </div>

          {exportOptions.includeModulations && exportOptions.includeMaqamatDetails && (
            <div className="export-modal__section">
              <label className="export-modal__label">Modulation Type</label>
              <div className="export-modal__checkbox-group">
                <label className="export-modal__checkbox">
                  <input 
                    type="radio" 
                    name="modulationType"
                    checked={exportOptions.modulationType === 'maqamat'} 
                    onChange={() => setExportOptions((prev) => ({ ...prev, modulationType: 'maqamat' }))} 
                  />
                  <span>Maqamat Modulations</span>
                </label>
                <label className="export-modal__checkbox">
                  <input 
                    type="radio" 
                    name="modulationType"
                    checked={exportOptions.modulationType === 'ajnas'} 
                    onChange={() => setExportOptions((prev) => ({ ...prev, modulationType: 'ajnas' }))} 
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
