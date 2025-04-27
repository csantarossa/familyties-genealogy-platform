"use client";
import React, { createContext, useState, useEffect } from "react";
import { getPeople } from "@/app/actions";
import { transformPeople, transformPerson } from "@/app/utils/transformPerson";
import toast from "react-hot-toast";

export const PersonContext = createContext({
  people: [],
  loading: true,
  selected: null,
  selectPerson: () => {},
  clearSelection: () => {},
});

export function PersonProvider({ treeId, children, setProgress }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({
    id: null,
    trigger: false,
  });

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        setProgress?.(10);
        const raw = await getPeople(treeId);
        setProgress?.(30);

        // Use the new bulk transformation function instead of mapping individual transforms
        const list = await transformPeople(raw);

        setProgress?.(70);
        setPeople(list);
      } catch (e) {
        console.error("Error loading people", e);
        toast.error("Failed to load family tree data");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [treeId]);

  const selectPerson = (personOrId) => {
    const person =
      typeof personOrId === "object"
        ? personOrId
        : people.find((p) => p.id === personOrId);
    setSelected(person || null);
  };

  const clearSelection = () => setSelected(null);

  return (
    <PersonContext.Provider
      value={{
        people,
        loading,
        selected,
        selectPerson,
        setSelected,
        clearSelection,
        setPeople,
      }}
    >
      {children}
    </PersonContext.Provider>
  );
}
