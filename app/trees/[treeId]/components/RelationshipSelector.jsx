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
        <SelectTrigger className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
          {value.otherPersonId ? (
            <div>
              {
                people.find(
                  (p) =>
                    p.person_id.toString() === value.otherPersonId?.toString()
                )?.person_firstname
              }
              &apos;s
            </div>
          ) : (
            <SelectValue placeholder="Select person" />
          )}
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          {people
            .filter((p) => p.person_id !== excludeId)
            .map((p) => (
              <SelectItem
                key={p.person_id}
                value={p.person_id.toString()}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
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
        <SelectTrigger className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
          <SelectValue placeholder="Relation" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          {types.map((t) => (
            <SelectItem
              key={t.type_id}
              value={t.type_id.toString()}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {t.type_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}