export const transformPerson = (person) => {
  return {
    id: person.person_id,
    firstname: person.person_firstname || "",
    middlename: person.person_middlename || "",
    lastname: person.person_lastname || "",
    dob: person.person_dob
      ? new Date(person.person_dob).toLocaleDateString()
      : "Unknown",
    dod: person.person_dod
      ? new Date(person.person_dod).toLocaleDateString()
      : "Alive",
    gender: person.person_gender || "",
    img: person.person_main_img || "/person_placeholder.png",
    tags: person.person_tags || [],
    birthTown: person.birth_town || "",
    birthCity: person.birth_city || "",
    birthState: person.birth_state || "",
    birthCountry: person.birth_country || "",
    gallery: Array.isArray(person.gallery)
      ? person.gallery
      : typeof person.gallery === "string"
      ? JSON.parse(person.gallery)
      : [],
    confidence: getConfidenceScore(person.confidence),
    additionalInfo: {
      career: person.additional_information?.career || [],
      education: person.additional_information?.education || [],
      hobbies: person.additional_information?.hobbies || [],
    },
  };
};

const getConfidenceScore = (confidence) => {
  if (confidence === 1) return "Verified";
  if (confidence === 2) return "Unverified";
  return null;
};
