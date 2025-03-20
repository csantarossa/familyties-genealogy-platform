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

// Add person to tree
export async function POST(req, { params }) {
  try {
    const { id } = await params;
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
      children: null,
      spouse: null,
      parents: null,
      treeId: id,
      relation: body.relation?.trim() || null,
      relationType: body.relationType?.trim() || null,
    };

    // ✅ Perform SQL Insert
    await sql`
    INSERT INTO person 
    (person_firstname, person_middlename, person_lastname, person_gender, person_dob, person_dod, person_tags, person_main_img, confidence, birth_town, birth_city, birth_state, birth_country, gallery, additional_information, children, spouse, parents, fk_tree_id) 
    VALUES 
    (${newPerson.firstname}, ${newPerson.middlename}, ${newPerson.lastname}, ${newPerson.gender}, ${newPerson.dob}, ${newPerson.dod}, ${newPerson.tags}, ${newPerson.img}, ${newPerson.confidence}, ${newPerson.birthTown}, ${newPerson.birthCity}, ${newPerson.birthState}, ${newPerson.birthCountry}, ${newPerson.gallery}, ${newPerson.additionalInfo}, ${newPerson.children}, ${newPerson.spouse}, ${newPerson.parents}, ${newPerson.treeId})`;

    // ✅ Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Person added successfully",
        person: newPerson,
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
