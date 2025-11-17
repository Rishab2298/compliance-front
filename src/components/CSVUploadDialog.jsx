import { useState } from "react";
import Papa from "papaparse";
import { Upload, X, CheckCircle, AlertCircle, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function CSVUploadDialog({ isOpen, onClose, onUpload }) {
  const [csvFile, setCsvFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Success

  const requiredColumns = ["firstName", "lastName", "email", "phone", "location", "employeeId"];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    setCsvFile(file);

    // Parse CSV
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        validateCSV(results.data, results.meta.fields);
      },
      error: (error) => {
        toast.error("Failed to parse CSV file");
        console.error("CSV Parse Error:", error);
      },
    });
  };

  const validateCSV = (data, columns) => {
    const validationErrors = [];

    // Check for required columns
    const missingColumns = requiredColumns.filter(col => !columns.includes(col));
    if (missingColumns.length > 0) {
      validationErrors.push(`Missing required columns: ${missingColumns.join(", ")}`);
    }

    // Validate each row
    const validatedData = data.map((row, index) => {
      const rowErrors = [];

      // Check required fields
      if (!row.firstName?.trim()) rowErrors.push("First name is required");
      if (!row.lastName?.trim()) rowErrors.push("Last name is required");
      if (!row.email?.trim()) {
        rowErrors.push("Email is required");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        rowErrors.push("Invalid email format");
      }
      if (!row.phone?.trim()) rowErrors.push("Phone is required");
      if (!row.location?.trim()) rowErrors.push("Location is required");
      if (!row.employeeId?.trim()) rowErrors.push("Employee ID is required");

      return {
        ...row,
        rowNumber: index + 2, // +2 because index starts at 0 and row 1 is header
        valid: rowErrors.length === 0,
        errors: rowErrors,
      };
    });

    // Add row-level errors to validation errors
    const invalidRows = validatedData.filter(row => !row.valid);
    if (invalidRows.length > 0) {
      invalidRows.forEach(row => {
        validationErrors.push(`Row ${row.rowNumber}: ${row.errors.join(", ")}`);
      });
    }

    setErrors(validationErrors);
    setParsedData(validatedData);

    if (validationErrors.length === 0) {
      setStep(2);
      toast.success(`${validatedData.length} drivers ready to import`);
    } else {
      toast.error(`Found ${validationErrors.length} validation errors`);
    }
  };

  const handleUpload = async () => {
    if (parsedData.length === 0 || errors.length > 0) {
      toast.error("Please fix all errors before uploading");
      return;
    }

    setIsUploading(true);

    try {
      // Call the parent's onUpload function with the validated data
      await onUpload(parsedData);
      setStep(3);
      toast.success(`Successfully imported ${parsedData.length} drivers`);

      // Close dialog after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to import drivers");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setCsvFile(null);
    setParsedData([]);
    setErrors([]);
    setStep(1);
    onClose();
  };

  const downloadTemplate = () => {
    const template = requiredColumns.join(",") + "\n" +
      "John,Doe,john.doe@example.com,+15551234567,New York NY,EMP001\n" +
      "Jane,Smith,jane.smith@example.com,+15559876543,Los Angeles CA,EMP002";

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "driver_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="!w-[70vw] !max-w-[70vw] min-w-[600px] max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Import Drivers from CSV</DialogTitle>
          <DialogDescription className="text-slate-400">
            Upload a CSV file to bulk import drivers. Make sure your CSV includes all required fields.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            {/* Download Template Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="gap-2 text-white bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white"
              >
                <Download className="w-4 h-4" />
                Download Template
              </Button>
            </div>

            {/* Required Fields Info */}
            <div className="p-4 border rounded-lg border-slate-700 bg-slate-800/50">
              <h3 className="mb-2 text-sm font-semibold text-white">Required Columns:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                {requiredColumns.map((col) => (
                  <div key={col} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>
                    <code className="font-mono text-xs text-violet-300">{col}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Example Format - Info state with blue accents */}
            <div className="p-4 border rounded-lg border-blue-500/30 bg-blue-500/10">
              <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-white">
                <FileText className="w-4 h-4 text-blue-400" />
                Example CSV Format:
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-800/50 border-blue-500/20">
                      {requiredColumns.map((col) => (
                        <th key={col} className="px-3 py-2 font-mono font-semibold text-left text-blue-300 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-700">
                      <td className="px-3 py-2 text-slate-300">John</td>
                      <td className="px-3 py-2 text-slate-300">Doe</td>
                      <td className="px-3 py-2 text-slate-300">john.doe@example.com</td>
                      <td className="px-3 py-2 text-slate-300">+15551234567</td>
                      <td className="px-3 py-2 text-slate-300">New York NY</td>
                      <td className="px-3 py-2 text-slate-300">EMP001</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-slate-300">Jane</td>
                      <td className="px-3 py-2 text-slate-300">Smith</td>
                      <td className="px-3 py-2 text-slate-300">jane.smith@example.com</td>
                      <td className="px-3 py-2 text-slate-300">+15559876543</td>
                      <td className="px-3 py-2 text-slate-300">Los Angeles CA</td>
                      <td className="px-3 py-2 text-slate-300">EMP002</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-blue-300">
                💡 Tip: Phone numbers should include country code (e.g., +1 for US/Canada)
              </p>
            </div>

            {/* File Upload Area */}
            <div className="relative">
              <label className="block">
                <div className="flex items-center justify-center p-12 transition-all border-2 border-dashed rounded-lg cursor-pointer border-slate-700 hover:border-violet-500 hover:bg-slate-800/50">
                  <div className="text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="mb-2 text-sm font-medium text-white">
                      {csvFile ? csvFile.name : "Click to upload CSV file"}
                    </p>
                    <p className="text-xs text-slate-400">
                      CSV files only (Max 5MB)
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {/* Errors Display - Error state with red accents */}
            {errors.length > 0 && (
              <div className="p-4 border border-l-4 rounded-r-lg bg-red-500/10 border-red-500/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <div className="flex-1">
                    <h3 className="mb-2 text-sm font-semibold text-red-300">
                      Found {errors.length} validation error{errors.length !== 1 ? 's' : ''}:
                    </h3>
                    <ul className="space-y-1 overflow-y-auto text-xs text-red-200 max-h-40">
                      {errors.slice(0, 10).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {errors.length > 10 && (
                        <li className="font-semibold">... and {errors.length - 10} more errors</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Preview Header - Info state with violet accents */}
            <div className="flex items-center justify-between p-4 border rounded-lg border-violet-500/30 bg-violet-500/10">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-violet-400" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {parsedData.length} driver{parsedData.length !== 1 ? 's' : ''} ready to import
                  </p>
                  <p className="text-xs text-slate-400">Review the data below before importing</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCsvFile(null);
                  setParsedData([]);
                  setErrors([]);
                  setStep(1);
                }}
                className="text-white bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white"
              >
                Upload Different File
              </Button>
            </div>

            {/* Data Preview Table */}
            <div className="overflow-hidden border rounded-lg border-slate-700">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 border-b bg-slate-800 border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-left text-slate-300">#</th>
                      {requiredColumns.map((col) => (
                        <th key={col} className="px-4 py-3 text-xs font-semibold text-left text-slate-300 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {parsedData.map((row, index) => (
                      <tr key={index} className="hover:bg-slate-800/30">
                        <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                        {requiredColumns.map((col) => (
                          <td key={col} className="px-4 py-3 text-white whitespace-nowrap">
                            {row[col] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setCsvFile(null);
                  setParsedData([]);
                  setErrors([]);
                  setStep(1);
                }}
                disabled={isUploading}
                className="text-white bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="text-white border-0 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50"
              >
                {isUploading ? (
                  <>
                    <span className="mr-2">Importing...</span>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  </>
                ) : (
                  `Import ${parsedData.length} Driver${parsedData.length !== 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-12 text-center">
            <div className="inline-block p-4 mb-4 rounded-full bg-green-500/20">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Import Successful!
            </h3>
            <p className="text-sm text-slate-400">
              {parsedData.length} driver{parsedData.length !== 1 ? 's have' : ' has'} been added to your roster.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
