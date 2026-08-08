import { useState } from "react";
import { Upload } from "lucide-react";

export default function EvidenceUpload() {

  const [file, setFile] = useState(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

      <h2 className="text-xl font-bold mb-6">
        Upload Evidence
      </h2>

      <label className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center cursor-pointer hover:border-blue-500 transition">

        <Upload
          size={40}
          className="text-blue-600 mb-4"
        />

        <p className="font-medium">
          Click to upload PDF / Image
        </p>

        <p className="text-sm text-slate-500 mt-2">
          Supported: PDF, JPG, PNG
        </p>

        <input
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files[0])}
        />

      </label>

      {file && (

        <div className="mt-6 bg-blue-50 rounded-xl p-4">

          <p className="text-sm text-slate-500">
            Selected File
          </p>

          <h3 className="font-semibold mt-1">
            {file.name}
          </h3>

        </div>

      )}

    </div>
  );
}