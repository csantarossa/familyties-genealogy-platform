import { getAllCareer, getAllEducation, getAllGallery } from "../actions";

export const transformPeople = async (peopleList) => {
  // Get all person IDs
  const personIds = peopleList.map((person) => person.person_id);

  // Fetch all data in parallel
  const [educationByPerson, careerByPerson, galleryByPerson] =
    await Promise.all([
      getAllEducation(personIds),
      getAllCareer(personIds),
      getAllGallery(personIds),
    ]);

  // Transform each person with their associated data
  return peopleList.map((person) => {
    const personId = person.person_id;

    return {
      id: personId,
      firstname: person.person_firstname || "",
      middlename: person.person_middlename || "",
      lastname: person.person_lastname || "",
      dob: person.person_dob ?? null,
      dod: person.person_dod || null,
      gender: person.person_gender || "",
      img: person.person_main_img || "/person_placeholder.png",
      tags: person.person_tags || [],
      birthTown: person.birth_town || "",
      birthCity: person.birth_city || "",
      birthState: person.birth_state || "",
      birthCountry: person.birth_country || "",
      gallery: galleryByPerson[personId] || [],
      confidence: person.confidence,
      additionalInfo: {
        career: careerByPerson[personId] || [],
        education: educationByPerson[personId] || [],
        hobbies: person.additional_information?.hobbies || [],
      },
      notes: person.notes || "",
    };
  });
};
