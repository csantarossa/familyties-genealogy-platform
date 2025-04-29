"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useState } from "react";

export default function UserGuidesPage() {
  const [openItem, setOpenItem] = useState(null);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">📘 User Guides</h1>
      <Accordion>
        <AccordionItem value="sidepanel" openItem={openItem} setOpenItem={setOpenItem}>
          <AccordionTrigger>📋 Using the Sidepanel</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Update Info:</strong> Click on a person node in the Family tree, then use the left-side panel to edit name, gender, birth/death info, and tags.</li>
              <li><strong>Add to Gallery:</strong> Use the <b>"Gallery"</b> tab in the side panel to upload or view media.</li>
              <li><strong>Delete Person:</strong> In the side panel, locate and click the <b>"bin"</b> button (top right). Confirm the deletion when prompted.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="manage" openItem={openItem} setOpenItem={setOpenItem}>
          <AccordionTrigger>👤 Managing People</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Add People:</strong> Click the <b>"Add Person +"</b> button in the tree view. Fill in the person's details in the popup form. Click <b>"Next"</b> to continue filling. Click <b>"Add"</b> to add them to the tree.</li>
              <li><strong>Update Relationships:</strong> Select the person you want to connect. Find the <b>"Relationships"</b> section in the side panel. Select person you want to add relation to and select the relation. Click <b>"Add Relation"</b>.</li>
              <li><strong>Update Career:</strong> Find the Career fields in the side panel. Fill in relevant information in custom fields and click <b>"Save"</b>.</li>
              <li><strong>Update Education:</strong> Find the Education fields in the side panel. Fill in relevant information in custom fields and click <b>"Save"</b>.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="trees" openItem={openItem} setOpenItem={setOpenItem}>
          <AccordionTrigger>🌳 Working with Trees</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Create Tree:</strong> From the <b>"Trees Dashboard"</b>, click <b>"New Tree"</b>. Fill in relevant information in custom fields and click <b>"Create"</b> - <b>"Start from scratch"</b>. Fill in relevant information and click <b>"Add your first person!"</b>.</li>
              <li><strong>Navigate Between Trees:</strong> Use the <b>"Trees Dashboard"</b> to switch between trees.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="gedcom" openItem={openItem} setOpenItem={setOpenItem}>
          <AccordionTrigger>📂 Import/Export</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Import GEDCOM:</strong> From the <b>"Trees Dashboard"</b>, click <b>"New Tree"</b>. Fill in relevant information in custom fields and click <b>"Create"</b> - <b>"Import GEDCOM file"</b> - <b>"Choose File"</b> - <b>Select your file</b> - <b>"Upload your file!"</b>.</li>
              <li><strong>Export Tree:</strong> Feature may be available via Export button or coming soon.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
