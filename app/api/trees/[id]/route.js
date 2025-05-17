import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { parseDate } from "@/app/utils/parseDate";

const sql = neon(process.env.DATABASE_URL);

export async function DELETE(req, params) {
  const { id } = await params.params;
  try {
    const personIdsResult = await sql`
      SELECT person_id FROM person WHERE fk_tree_id = ${id}
    `;
    const personIds = personIdsResult.map((row) => row.person_id);

    if (personIds.length > 0) {
      await sql`DELETE FROM images WHERE fk_person_id = ANY(${personIds})`;
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
      gender: body.gender || null,
      dob: body.dob,
      dod: body.dod,
      tags: null,
      img: body.img || null,
      birthTown: null,
      birthCity: null,
      birthState: null,
      birthCountry: null,
      deathTown: null,
      deathCity: null,
      deathState: null,
      deathCountry: null,
      gallery: null,
      additionalInfo: null,
      notes: body.notes || null,
      treeId: id,
    };

    const result = await sql`
      INSERT INTO person (
        person_firstname, 
          person_middlename, 
          person_lastname, 
          person_gender,
          person_dob, 
          person_dod, 
          person_tags, 
          person_main_img, 
          birth_town, 
          birth_city, 
          birth_state, 
          birth_country, 
          death_town, 
          death_city, 
          death_state, 
          death_country,
          gallery, 
          notes, 
          additional_information, 
          fk_tree_id
      ) VALUES (
        ${newPerson.firstname}, 
        ${newPerson.middlename}, 
        ${newPerson.lastname}, 
        ${newPerson.gender},
        ${newPerson.dob}, 
        ${newPerson.dod}, 
        ${newPerson.tags}, 
        ${newPerson.img}, 
        ${newPerson.birthTown}, 
        ${newPerson.birthCity},
        ${newPerson.birthState}, 
        ${newPerson.birthCountry},
        ${newPerson.deathTown}, 
        ${newPerson.deathCity},
        ${newPerson.deathState}, 
        ${newPerson.deathCountry},  
        ${newPerson.gallery}, 
        ${newPerson.notes},
        ${newPerson.additionalInfo}, 
        ${newPerson.treeId}
      )
      RETURNING person_id
    `;

    const newPersonId = result[0].person_id;

    await sql`INSERT INTO images (fk_person_id, image_url) VALUES (${newPersonId}, ${newPerson.img});`;

    if (body.relation && body.relationType) {
      const isChildRelation = Number(body.relationType) === 1;
      const isParentRelation = Number(body.relationType) === 4;
      let person1 = body.relation;
      let person2 = newPersonId;
      let type;

      if (isChildRelation) {
        person2 = body.relation;
        person1 = newPersonId;
        type = 4;
      } else if (isParentRelation) {
        person2 = newPersonId;
        person1 = body.relation;
      }

      await sql`
      INSERT INTO relationships (
        person_1,
        person_2,
        fk_type_id
      ) VALUES (
        ${person1},
        ${person2},
        ${type || body.relationType}
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
    firstname,
    middlename,
    lastname,
    gender,
    dob,
    dod,
    birthTown,
    birthCity,
    birthState,
    birthCountry,
    deathTown,
    deathCity,
    deathState,
    deathCountry,
    additionalInfo,
    gallery,
    notes,
    confidence,
    tags,
  } = body;

  const safeDob = typeof dob === "string" ? dob : null;
  const safeDod = typeof dod === "string" ? dod : null;

  console.log("📥 Received DOB:", dob);
  console.log("🛠 Final safeDob:", safeDob);

  await sql`
  UPDATE person
  SET
    person_firstname = ${firstname},
    person_middlename = ${middlename},
    person_lastname = ${lastname},
    person_gender = ${gender},
    person_dob = ${safeDob},
    person_dod = ${safeDod},
    birth_town = ${birthTown || null},
    birth_city = ${birthCity || null},
    birth_state = ${birthState || null},
    birth_country = ${birthCountry || null},
    death_town = ${deathTown || null},
    death_city = ${deathCity || null},
    death_state = ${deathState || null},
    death_country = ${deathCountry || null},
    additional_information = ${JSON.stringify(additionalInfo) || null},
    gallery = ${JSON.stringify(gallery) || null},
    notes = ${notes || null},
    confidence = ${confidence || null},
    person_tags = ${JSON.stringify(tags) || "[]"}
  WHERE person_id = ${personId} AND fk_tree_id = ${id};
`;

  return NextResponse.json({
    success: true,
    message: "Person updated successfully",
  });
}
export async function GET(req, { params }) {
  const { id } = params;

  try {
    const rows = await sql`
      SELECT
        person_id,
        person_firstname,
        person_middlename,
        person_lastname,
        person_gender,
        person_dob,
        person_dod,
        person_main_img,
        person_tags,
        birth_town,
        birth_city,
        birth_state,
        birth_country,
        death_town,
        death_city,
        death_state,
        death_country,
        notes,
        additional_information,
        gallery,
        confidence
      FROM person
      WHERE fk_tree_id = ${id};
    `;

    const people = rows.map((row) => ({
      id: row.person_id,
      firstname: row.person_firstname,
      middlename: row.person_middlename,
      lastname: row.person_lastname,
      gender: row.person_gender,
      dob: row.person_dob,
      dod: row.person_dod,
      profileImage: row.person_main_img, // ✅ critical
      person_tags: row.person_tags,
      birthTown: row.birth_town,
      birthCity: row.birth_city,
      birthState: row.birth_state,
      birthCountry: row.birth_country,
      deathTown: row.death_town,
      deathCity: row.death_city,
      deathState: row.death_state,
      deathCountry: row.death_country,
      notes: row.notes,
      additionalInfo: row.additional_information,
      gallery: row.gallery,
      confidence: row.confidence,
    }));

    return NextResponse.json({ success: true, people });
  } catch (error) {
    console.error("Failed to fetch people:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch people" },
      { status: 500 }
    );
  }
}
