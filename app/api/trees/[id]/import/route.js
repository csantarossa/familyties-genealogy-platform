import { parseGedcom } from "@/lib/gedcomParser";
import pool from "@/lib/db";

export async function POST(req, context) {
    const treeId = await parseInt(context.params.id); // ?????????
    const { gedcomContent } = await req.json();

    console.log("🌳 Importing GEDCOM for tree ID:", treeId); //Debug Line

function isValidDate(dateString) {
    // Parse and check format
    const d = new Date(dateString);
    return !isNaN(d.getTime()) && /^\d{4}(-\d{2}){0,2}$/.test(dateString);
}

try {
    const client = await pool.connect();
    const { individuals, families } = parseGedcom(gedcomContent);
    console.log("📦 GEDCOM individuals parsed:", Object.keys(individuals).length);
    console.log("👨‍👩‍👧‍👦 GEDCOM families parsed:", Object.keys(families).length);
    const gedcomToDbIdMap = {};

    // 1. Wipe all people in the tree
    await client.query("DELETE FROM person WHERE fk_tree_id = $1", [treeId]);

    // 2. Insert all individuals
    for (const [gedcomId, data] of Object.entries(individuals)) {
    const [first = null, last = null] = (data.name || "").split("/").map(s => s.trim());

    const birth = isValidDate(data.birth) ? data.birth : null;
    const death = isValidDate(data.death) ? data.death : null;
        console.log(`➡️ Inserting person ${gedcomId}: ${first} ${last}`);//debug line

const res = await client.query(
`INSERT INTO person (person_firstname, person_lastname, person_gender, person_dob, person_dod, fk_tree_id)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING person_id`,
[first, last, data.gender || null, birth, death, treeId]
    );

    gedcomToDbIdMap[gedcomId] = res.rows[0].person_id;
    }

    // 3. Handle relationships
    for (const fam of Object.values(families)) {
    const husbandId = gedcomToDbIdMap[fam.husband];
    const wifeId = gedcomToDbIdMap[fam.wife];
    const childIds = fam.children?.map(id => gedcomToDbIdMap[id]) || [];

      // Spouse
    if (husbandId && wifeId) {
        await client.query(`UPDATE person SET spouse = $1 WHERE person_id = $2`, [JSON.stringify([wifeId]), husbandId]);
        await client.query(`UPDATE person SET spouse = $1 WHERE person_id = $2`, [JSON.stringify([husbandId]), wifeId]);
    }

      // Parents & Children
    for (const childId of childIds) {
        const parentIds = [husbandId, wifeId].filter(Boolean);
        await client.query(`UPDATE person SET parents = $1 WHERE person_id = $2`, [JSON.stringify(parentIds), childId]);

        for (const parentId of parentIds) {
        const res = await client.query(`SELECT children FROM person WHERE person_id = $1`, [parentId]);
        const children = res.rows[0].children || [];
        children.push(childId);
        await client.query(`UPDATE person SET children = $1 WHERE person_id = $2`, [JSON.stringify(children), parentId]);
        }
    }
    }

    client.release();
    return Response.json({ message: "GEDCOM import successful", count: Object.keys(individuals).length });

} catch (error) {
    console.error("GEDCOM import failed:", error);
    return Response.json({ error: "Import failed", details: error.message }, { status: 500 });
}
}


