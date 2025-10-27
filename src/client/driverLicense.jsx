import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function DriverLicense() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(null);
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResponseData(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError("");
    setResponseData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5003/upload-license", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setResponseData(data);
      setFormData(data.refinedData)
    } catch (err) {
      console.error(err);
      setError("Error uploading file ❌");
    } finally {
      setLoading(false);
    }
  };
  
  const keyMap = {
  ISS: "Date of Issue",
  EXP: "Date of Expiry",
  DD: "Document Discriminator",
  HGT: "Height",
  SEX: "Sex",
  CLASS: "Class",
  REST: "Restrictions",
};

 
  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="flex flex-col w-full ">
      <header className="flex h-[60px] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <h1 className="text-base font-medium">Smart Upload</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              asChild
              size="sm"
              className="hidden sm:flex">
              <a
                href="/client/reminder"
                rel="noopener noreferrer"
                target="_blank"
                className="dark:text-foreground">
                Reminders
              </a>
            </Button>
          </div>
        </div>
      </header>
      <div className="p-4 max-w-lg mx-auto">
        <h1 className="text-xl font-bold mb-4">Upload Driver's License</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="file"
            name="file"
            onChange={handleFileChange}
            required
            className="block w-full text-sm text-gray-600
             file:mr-4 file:py-2 file:px-4
              file:border-1 file:rounded
             file:text-sm file:font-semibold
             file:bg-indigo-50 file:text-indigo-600
             hover:file:bg-indigo-100
             cursor-pointer"
          />

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50">
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : null}
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {error && <p className="mt-3 text-red-500">{error}</p>}

        {responseData && (
          <div className="mt-6 p-4 border rounded bg-gray-50">
            <h2 className="font-semibold mb-2">Refined Data</h2>
            <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
      <tbody>
        {Object.entries(formData).map(([key, value]) => {
          // Special case for Name/Nom (combine into a single editable input)
          if (key === "Name/Nom") {
            const fullName = `${value.First_Name} ${value.Middle_Name} ${value.Last_Name}`.trim();
            return (
              <tr key={key}>
                <td className="border px-3 py-2 font-medium">Name</td>
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    value={fullName}
                    className="border rounded px-2 py-1 w-full"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [key]: {
                          ...prev[key],
                          First_Name: e.target.value, // you can split later if needed
                        },
                      }))
                    }
                  />
                </td>
              </tr>
            );
          }

          // Default: every field has an editable input
          return (
            <tr key={key}>
              <td className="border px-3 py-2 font-medium">
                {keyMap[key] ? keyMap[key] : key}
              </td>
              <td className="border px-3 py-2">
                <input
                  type="text"
                  value={value}
                  className="border rounded px-2 py-1 w-full"
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
          </div>
        )}
      </div>
    </div>
  );
}
