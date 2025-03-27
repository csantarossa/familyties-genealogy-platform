import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    await sql`DELETE FROM person WHERE fk_tree_id = ${id}`;
    await sql`DELETE FROM trees WHERE tree_id = ${id}`;

    return NextResponse.json({
      success: true,
      message: "Tree deleted successfully",
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
    const { id } = params;
    const body = await req.json();

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

    // 1. Insert person and get their ID
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
    console.log(body.relation, body.relationType);
    // 2. If a relationship was selected, insert into the relationships table
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
