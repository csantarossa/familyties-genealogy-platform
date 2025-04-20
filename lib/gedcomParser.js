// lib/gedcomParser.js

export function parseGedcom(content) {
    const lines = content.split(/\r?\n/);
    const individuals = {};
    const families = {};

    let current = null;
    let currentId = null;

    for (let line of lines) {
    const [level, tag, ...rest] = line.trim().split(" ");
    const value = rest.join(" ");

      // Check if it's a new individual or family
    if (level === "0" && value === "INDI") {
        current = "INDI";
        currentId = tag.replace(/@/g, "");
        individuals[currentId] = { id: currentId };
    } else if (level === "0" && value === "FAM") {
        current = "FAM";
        currentId = tag.replace(/@/g, "");
        families[currentId] = { id: currentId };
    } else if (current === "INDI" && individuals[currentId]) {
        if (tag === "NAME") individuals[currentId].name = value;
        if (tag === "SEX") individuals[currentId].gender = value;
        if (tag === "BIRT") individuals[currentId]._next = "BIRT";
        if (tag === "DEAT") individuals[currentId]._next = "DEAT";
        if (tag === "DATE" && individuals[currentId]._next === "BIRT") {
        individuals[currentId].birth = value;
        delete individuals[currentId]._next;
        }
        if (tag === "DATE" && individuals[currentId]._next === "DEAT") {
        individuals[currentId].death = value;
        delete individuals[currentId]._next;
        }
    } else if (current === "FAM" && families[currentId]) {
        if (tag === "HUSB") families[currentId].husband = value.replace(/@/g, "");
        if (tag === "WIFE") families[currentId].wife = value.replace(/@/g, "");
        if (tag === "CHIL") {
        if (!families[currentId].children) families[currentId].children = [];
        families[currentId].children.push(value.replace(/@/g, ""));
        }
    }
    }

    return { individuals, families };
}