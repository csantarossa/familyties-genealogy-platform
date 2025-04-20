"use client";

import { useState } from "react";

export default function ImportPage() {
const [output, setOutput] = useState(null);

const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();

    const res = await fetch("/api/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gedcomContent: text }),
    });

    const json = await res.json();
    setOutput(json);
};

return (
    <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Import GEDCOM File</h1>
<input type="file" accept=".ged" onChange={handleFileChange} />
    {output && (
        <pre className="mt-4 p-4 bg-gray-100 rounded max-h-[500px] overflow-y-scroll text-sm">
        {JSON.stringify(output, null, 2)}
        </pre>
    )}
    </div>
);
}
