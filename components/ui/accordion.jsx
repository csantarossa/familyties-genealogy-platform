"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Accordion({ children }) {
  return <div className="border rounded-md divide-y">{children}</div>;
}

export function AccordionItem({ value, children, openItem, setOpenItem }) {
  const isOpen = openItem === value;

  return (
    <div>
      <div
        onClick={() => setOpenItem(isOpen ? null : value)}
        className="cursor-pointer px-4 py-3 bg-gray-100 hover:bg-gray-200 font-semibold flex justify-between items-center transition-colors"
      >
        <div className="hover:underline">
          {children[0]}
        </div>
        <span className="text-xl">{isOpen ? "−" : "+"}</span>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3">
              {children[1]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AccordionTrigger({ children }) {
  return <div className="flex items-center space-x-2">{children}</div>
}

export function AccordionContent({ children }) {
  return <div className="text-sm text-gray-700">{children}</div>
}