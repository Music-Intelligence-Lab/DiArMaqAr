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
  includeAjnas: boolean;
  includeMaqamat: boolean;
  includeTuningSystem: boolean;
  includeModulations: boolean;
  prettifyJson: boolean;
  csvDelimiter: "," | ";" | "\t";
  filename: string;
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { selectedTuningSystem, selectedIndices } = useAppContext();

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "json",
    includeAjnas: true,
    includeMaqamat: true,
    includeTuningSystem: true,
    includeModulations: false,
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
      const exportedData = exportTuningSystem(selectedTuningSystem, startingNote);

      // Filter data based on options
      const filteredData = {
        ...(exportOptions.includeTuningSystem && {
          tuningSystem: exportedData.tuningSystem,
          startingNote: exportedData.startingNote,
          fullRangeTuningSystemPitchClasses: exportedData.fullRangeTuningSystemPitchClasses,
        }),
        ...(exportOptions.includeAjnas && {
          numberOfPossibleAjnas: exportedData.numberOfPossibleAjnas,
          numberOfAjnas: exportedData.numberOfAjnas,
          possibleAjnasOverview: exportedData.possibleAjnasOverview,
          possibleAjnasDetails: exportedData.possibleAjnasDetails,
        }),
        ...(exportOptions.includeMaqamat && {
          numberOfPossibleMaqamat: exportedData.numberOfPossibleMaqamat,
          numberOfMaqamat: exportedData.numberOfMaqamat,
          possibleMaqamatOverview: exportedData.possibleMaqamatOverview,
          possibleMaqamatDetails: exportedData.possibleMaqamatDetails,
        }),
      };

      await downloadFile(filteredData, exportOptions);
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
    const flatten = (obj: any, prefix = ""): any => {
      const flattened: any = {};
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
          Object.assign(flattened, flatten(obj[key], `${prefix}${key}.`));
        } else {
          flattened[`${prefix}${key}`] = Array.isArray(obj[key]) ? obj[key].join(";") : obj[key];
        }
      }
      return flattened;
    };

    const flatData = flatten(data);
    const headers = Object.keys(flatData);
    const values = Object.values(flatData);

    return [headers.join(delimiter), values.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(delimiter)].join("\n");
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
                <input type="checkbox" checked={exportOptions.includeTuningSystem} onChange={(e) => setExportOptions((prev) => ({ ...prev, includeTuningSystem: e.target.checked }))} />
                <span>Tuning System</span>
              </label>
              <label className="export-modal__checkbox">
                <input type="checkbox" checked={exportOptions.includeAjnas} onChange={(e) => setExportOptions((prev) => ({ ...prev, includeAjnas: e.target.checked }))} />
                <span>Ajnas</span>
              </label>
              <label className="export-modal__checkbox">
                <input type="checkbox" checked={exportOptions.includeMaqamat} onChange={(e) => setExportOptions((prev) => ({ ...prev, includeMaqamat: e.target.checked }))} />
                <span>Maqamat</span>
              </label>
              <label className="export-modal__checkbox">
                <input type="checkbox" checked={exportOptions.includeModulations} onChange={(e) => setExportOptions((prev) => ({ ...prev, includeModulations: e.target.checked }))} />
                <span>Modulations</span>
              </label>
            </div>
          </div>

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
