import { parseGedcom } from "@/app/lib/gedcomParser";
import { neon } from "@neondatabase/serverless";

export const runtime = "edge";
const sql = neon(process.env.DATABASE_URL);

function toISO(dateString) {
  try {
    const [day, monthStr, year] = dateString.split(" ");
    const months = {
      JAN: "01",
      FEB: "02",
      MAR: "03",
      APR: "04",
      MAY: "05",
      JUN: "06",
      JUL: "07",
      AUG: "08",
      SEP: "09",
      OCT: "10",
      NOV: "11",
      DEC: "12",
    };
    if (!months[monthStr]) return null;
    return `${year}-${months[monthStr]}-${day.padStart(2, "0")}`;
  } catch {
    return null;
  }
}

export async function POST(req, context) {
  const treeId = await parseInt(context.params.id);
  const { gedcomContent } = await req.json();
  const { individuals, families } = parseGedcom(gedcomContent);
  const gedcomToDbId = {};

  // Clear existing data
  await sql`DELETE FROM relationships WHERE person_1 IN (SELECT person_id FROM person WHERE fk_tree_id = ${treeId})`;
  await sql`DELETE FROM person WHERE fk_tree_id = ${treeId}`;

  // Insert individuals
  for (const [gedcomId, person] of Object.entries(individuals)) {
    const nameParts = (person.name || "").split("/").map((s) => s.trim());
    const firstname = nameParts[0]?.split(" ")[0] || null;
    const middlename = nameParts[0]?.split(" ").slice(1).join(" ") || null;
    const lastname = nameParts[1] || null;

    const birthISO = toISO(person.birth);
    const deathISO = toISO(person.death);

    const notes = [];

    if (!birthISO && person.birth)
      notes.push(`Unparsed birth date: ${person.birth}`);
    if (!deathISO && person.death)
      notes.push(`Unparsed death date: ${person.death}`);
    if (person.notes?.length) notes.push("GEDCOM Data:", ...person.notes);
    if (Object.keys(person.extra || {}).length) {
      notes.push("GEDCOM Data:");
      for (const [key, val] of Object.entries(person.extra)) {
        notes.push(`${key}: ${val}`);
      }
    }

    const result = await sql`
    INSERT INTO person (
        person_firstname, person_middlename, person_lastname,
        person_gender, person_dob, person_dod, fk_tree_id, notes
    ) VALUES (
        ${firstname}, ${middlename}, ${lastname},
        ${person.gender || null}, ${birthISO}, ${deathISO},
        ${treeId}, ${JSON.stringify(notes)}
    )
    RETURNING person_id
    `;

    gedcomToDbId[gedcomId] = result[0].person_id;
  }

  // Insert relationships
  for (const fam of Object.values(families)) {
    const husbandId = gedcomToDbId[fam.husb];
    const wifeId = gedcomToDbId[fam.wife];
    const children =
      fam.children?.map((c) => gedcomToDbId[c]).filter(Boolean) || [];

    if (husbandId && wifeId) {
      // Insert spouse relationship both ways
      await sql`
          INSERT INTO relationships (person_1, person_2, fk_type_id)
          VALUES (${husbandId}, ${wifeId}, 3)
        `;
    }

    for (const childId of children) {
      const parentIds = [husbandId, wifeId].filter(Boolean);

      for (const parentId of parentIds) {
        // Parent → Child
        await sql`
        INSERT INTO relationships (person_1, person_2, fk_type_id)
        VALUES (${childId}, ${parentId}, 4)
        `;
      }
    }
  }

  return Response.json({
    message: "GEDCOM import successful",
    individuals: Object.keys(individuals).length,
    families: Object.keys(families).length,
  });
}
