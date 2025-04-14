import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// DELETE a person node from the tree
export async function DELETE(req, context) {
  const params = await context.params;
  const personId = parseInt(params.nodeId);
  try {
    await sql`DELETE FROM images WHERE fk_person_id = ${personId}`;
    await sql`DELETE FROM career WHERE fk_person_id = ${personId}`;
    await sql`DELETE FROM education WHERE fk_person_id = ${personId}`;

    await sql`
        DELETE FROM relationships 
        WHERE person_1 = ${personId} OR person_2 = ${personId}
    `;

    await sql`
        DELETE FROM person 
        WHERE person_id = ${personId}
    `;
    return NextResponse.json({
      success: true,
      message: "Person deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting person:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete person" },
      { status: 500 }
    );
  }
}

// POST a new person node to the tree
export async function POST(req, context) {
  const { id: treeId } = context.params;

  try {
    const body = await req.json();

    const newPerson = {
      firstname: body.firstname.trim(),
      middlename: body.middlename?.trim() || null,
      lastname: body.lastname.trim(),
      gender: body.gender || null,
      dob: body.dob,
      dod: body.dod,
      tags: null,
      img: body.img || null,
      confidence: null,
      birthTown: null,
      birthCity: null,
      birthState: null,
      birthCountry: null,
      gallery: null,
      additionalInfo: null,
      treeId: treeId,
    };

    const result = await sql`
    INSERT INTO person (
        person_firstname, person_middlename, person_lastname, person_gender,
        person_dob, person_dod, person_tags, person_main_img,
        confidence, birth_town, birth_city, birth_state, birth_country,
        gallery, additional_information, fk_tree_id
    ) VALUES (
        ${newPerson.firstname}, ${newPerson.middlename}, ${newPerson.lastname}, ${newPerson.gender},
        ${newPerson.dob}, ${newPerson.dod}, ${newPerson.tags}, ${newPerson.img},
        ${newPerson.confidence}, ${newPerson.birthTown}, ${newPerson.birthCity},
        ${newPerson.birthState}, ${newPerson.birthCountry}, ${newPerson.gallery},
        ${newPerson.additionalInfo}, ${newPerson.treeId}
    )
    RETURNING person_id
    `;

    const newPersonId = result[0].person_id;

    if (body.relation && body.relationType) {
      await sql`
        INSERT INTO relationships (
        person_1,
        person_2,
        fk_type_id
        ) VALUES (
        ${newPersonId},
        ${body.relation},
    ${body.relationType}
    )
    `;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Person added successfully",
        personId: newPersonId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding person:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create person" },
      { status: 500 }
    );
  }
}

export async function GET(req, context) {
  const { nodeId } = await context.params;
  console.log("✅ nodeId received:", nodeId);

  try {
    const result = await sql`
      SELECT * FROM person WHERE person_id = ${nodeId}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    const person = result[0];

    return NextResponse.json({
      person: {
        ...person,
        person_tags: person.person_tags ?? [],
        additionalInfo:
          typeof person.additional_information === "string"
            ? JSON.parse(person.additional_information || "{}")
            : person.additional_information || {},
        gallery:
          typeof person.gallery === "string"
            ? JSON.parse(person.gallery || "[]")
            : person.gallery || [],
      },
    });
  } catch (err) {
    console.error("❌ Failed to fetch person:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
