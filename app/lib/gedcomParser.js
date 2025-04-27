export function parseGedcom(gedcom) {
  const lines = gedcom.split(/\r?\n/);
  const individuals = {};
  const families = {};

  let currentIndi = null;
  let currentFam = null;
  let context = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const [level, ...rest] = line.split(" ");
    const tag = rest[0];
    const value = rest.slice(1).join(" ");

    if (level === "0") {
      context = null;
      if (tag.startsWith("@") && value === "INDI") {
        currentIndi = tag.replace(/@/g, "");
        context = individuals[currentIndi] = { notes: [], extra: {} };
      } else if (tag.startsWith("@") && value === "FAM") {
        currentFam = tag.replace(/@/g, "");
        context = families[currentFam] = {};
      } else {
        currentIndi = null;
        currentFam = null;
      }
    } else if (level === "1") {
      if (context === individuals[currentIndi]) {
        switch (tag) {
          case "NAME":
            context.name = value;
            break;
          case "SEX":
            context.gender = value;
            break;
          case "BIRT":
            context._nextTag = "birth";
            break;
          case "DEAT":
            context._nextTag = "death";
            break;
          case "NOTE":
            context.notes.push(value);
            break;
          default:
            context.extra[tag] = value;
        }
      } else if (context === families[currentFam]) {
        if (["HUSB", "WIFE", "CHIL"].includes(tag)) {
          const id = value.replace(/@/g, "");
          if (tag === "CHIL") {
            context.children = context.children || [];
            context.children.push(id);
          } else {
            context[tag.toLowerCase()] = id;
          }
        }
      }
    } else if (level === "2" && tag === "DATE") {
      if (context?._nextTag === "birth") {
        context.birth = value;
      } else if (context?._nextTag === "death") {
        context.death = value;
      }
      delete context._nextTag;
    }
  }

  // ✅ Link spouses
  for (const famId in families) {
    const family = families[famId];

    if (family.husb && family.wife) {
      individuals[family.husb].spouses = individuals[family.husb].spouses || [];
      individuals[family.wife].spouses = individuals[family.wife].spouses || [];

      individuals[family.husb].spouses.push(family.wife);
      individuals[family.wife].spouses.push(family.husb);
    }
  }

  return { individuals, families };
}
