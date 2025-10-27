import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Passport() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState("");

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
      const res = await fetch("http://localhost:5003/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setResponseData(data);
    } catch (err) {
      console.error(err);
      setError("Error uploading file ❌");
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-xl font-bold mb-4">Upload Passport</h1>

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
                {Object.entries(responseData.refinedData).map(
                  ([key, value]) => {
                    // Handle nested Name/Nom object separately
                    if (key === "Name/Nom") {
                      return (
                        <React.Fragment key={key}>
                          <tr>
                            <td className="border px-3 py-2 font-medium">
                              First Name
                            </td>
                            <td className="border px-3 py-2">
                              {value.First_Name}
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-3 py-2 font-medium">
                              Middle Name
                            </td>
                            <td className="border px-3 py-2">
                              {value.Middle_Name}
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-3 py-2 font-medium">
                              Last Name
                            </td>
                            <td className="border px-3 py-2">
                              {value.Last_Name}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    }

                    // Make DOB editable
                    if (key === "DOB") {
                      return (
                        <tr key={key}>
                          <td className="border px-3 py-2 font-medium">
                            Date of Birth
                          </td>
                          <td className="border px-3 py-2">
                            <input
                              type="text"
                              defaultValue={value}
                              className="border rounded px-2 py-1 w-full"
                              onChange={(e) => {
                                // optional: update responseData state if needed
                                console.log("DOB updated to:", e.target.value);
                              }}
                            />
                          </td>
                        </tr>
                      );
                    }

                    // Default rendering
                    return (
                      <tr key={key}>
                        <td className="border px-3 py-2 font-medium">{key}</td>
                        <td className="border px-3 py-2">{value}</td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
