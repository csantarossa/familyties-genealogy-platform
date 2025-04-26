"use client";
import React, { createContext, useState, useEffect } from "react";
import { getPeople } from "@/app/actions";
import { transformPerson } from "@/app/utils/transformPerson";
import toast from "react-hot-toast";

export const PersonContext = createContext({
  people: [],
  loading: true,
  selected: null,
  selectPerson: () => {},
  clearSelection: () => {},
});

export function PersonProvider({ treeId, children }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({
    id: null,
    trigger: false,
  });

  useEffect(() => {
    async function fetchAll() {
      toast.loading("Loading people...");
      setLoading(true);
      try {
        const raw = await getPeople(treeId);
        const list = await Promise.all(raw.map(transformPerson));
        setPeople(list);
      } catch (e) {
        console.error("Error loading people", e);
      } finally {
        setLoading(false);
        toast.dismiss();
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
