import { getCareer, getEducation, getGallery } from "../actions";

export const transformPerson = async (person) => {
  const education = await getEducation(person.person_id);
  const career = await getCareer(person.person_id);
  const gallery = await getGallery(person.person_id);

  return {
    id: person.person_id,
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
    gallery: gallery || [],
    confidence: getConfidenceScore(person.confidence),
    additionalInfo: {
      career: career || [], // leave this as-is for now
      education: education || [], // override with real education from DB
      hobbies: person.additional_information?.hobbies || [],
    },
    notes: person.notes || "",
  };
};

const getConfidenceScore = (confidence) => {
  if (confidence === 1) return "Verified";
  if (confidence === 2) return "Unverified";
  return null;
};
