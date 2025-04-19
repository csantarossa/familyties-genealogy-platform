"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getPeople, getRelationshipTypes } from "@/app/actions";

export default function RelationshipSelector({
  treeId,
  excludeId = null, // person to filter out (e.g. self)
  value, // { otherPersonId, typeId }
  onChange, // newValue => …
}) {
  const [people, setPeople] = useState([]);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    async function load() {
      setPeople(await getPeople(treeId));
      setTypes(await getRelationshipTypes());
    }
    load();
  }, [treeId]);

  return (
    <div className="flex gap-2">
      {/* Person dropdown */}
      <Select
        value={value.otherPersonId?.toString() || ""}
        onValueChange={(v) => onChange({ ...value, otherPersonId: Number(v) })}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select person" />
        </SelectTrigger>
        <SelectContent>
          {people
            .filter((p) => p.person_id !== excludeId)
            .map((p) => (
              <SelectItem key={p.person_id} value={p.person_id.toString()}>
                {p.person_firstname} {p.person_lastname}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* Relationship‑type dropdown */}
      <Select
        value={value.typeId?.toString() || ""}
        onValueChange={(v) => onChange({ ...value, typeId: Number(v) })}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Relation" />
        </SelectTrigger>
        <SelectContent>
          {types.map((t) => (
            <SelectItem key={t.type_id} value={t.type_id.toString()}>
              {t.type_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
