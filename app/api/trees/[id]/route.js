import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function DELETE(req, params) {
  const { id } = await params.params;
  try {
    const personIdsResult = await sql`
      SELECT person_id FROM person WHERE fk_tree_id = ${id}
    `;
    const personIds = personIdsResult.map((row) => row.person_id);

    if (personIds.length > 0) {
      await sql`DELETE FROM career WHERE fk_person_id = ANY(${personIds})`;
      await sql`DELETE FROM education WHERE fk_person_id = ANY(${personIds})`;
      await sql`
        DELETE FROM relationships 
        WHERE person_1 = ANY(${personIds}) OR person_2 = ANY(${personIds})
      `;
      await sql`DELETE FROM person WHERE person_id = ANY(${personIds})`;
    }

    await sql`DELETE FROM trees WHERE tree_id = ${id}`;

    return NextResponse.json({
      success: true,
      message: "Tree and related data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tree:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete tree" },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const raw = await req.text();

    let body;
    try {
      body = JSON.parse(raw);
    } catch (err) {
      console.error("❌ Failed to parse body:", err);
      return NextResponse.json(
        { error: "Invalid or empty JSON body" },
        { status: 400 }
      );
    }

    const newPerson = {
      firstname: body.firstname.trim(),
      middlename: body.middlename?.trim() || null,
      lastname: body.lastname.trim(),
      gender: null,
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
      treeId: id,
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

// New editing function
export async function PUT(req, { params }) {
  const { id } = await params;
  const body = await req.json();

  const {
    personId,
    gender,
    dob,
    dod,
    birthTown,
    birthCity,
    birthState,
    birthCountry,
    additionalInfo,
    gallery,
    notes,
  } = body;

  const safeDod = dod?.toLowerCase?.() === "alive" ? null : dod;
  const safeDob = dob?.toLowerCase?.() === "unknown" ? null : dob;

  await sql`
    UPDATE person
    SET
      person_gender = ${gender},
      person_dob = ${safeDob},
      person_dod = ${safeDod},
      birth_town = ${birthTown || null},
      birth_city = ${birthCity || null},
      birth_state = ${birthState || null},
      birth_country = ${birthCountry || null},
      additional_information = ${JSON.stringify(additionalInfo) || null},
      gallery = ${JSON.stringify(gallery) || null},
      notes = ${notes || null} 
    WHERE person_id = ${personId} AND fk_tree_id = ${id};
  `;

  return NextResponse.json({
    success: true,
    message: "Person updated successfully",
  });
}
