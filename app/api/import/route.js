// app/api/import/route.js
import { parseGedcom } from "@/lib/gedcomParser";

export async function POST(req) {
const body = await req.json();
const gedcomContent = body.gedcomContent;

try {
    const parsed = parseGedcom(gedcomContent);
    return Response.json({ message: "Parsed GEDCOM", parsed });
} catch (error) {
    return Response.json(
    { error: "Failed to parse GEDCOM", details: error.message },
    { status: 500 }
    );
}
}
