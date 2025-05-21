'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function UserGuidesPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">User Guides</h1>
      <Accordion type="multiple" className="w-full">

        {/* Using the Sidepanel */}
        <AccordionItem value="sidepanel">
          <AccordionTrigger>Using the Sidepanel</AccordionTrigger>
          <AccordionContent>
            <h3 className="text-xl font-semibold mb-2">How to Update Information</h3>
            <ol className="list-decimal list-inside mb-4">
              <li>Click on a person node in the Family Tree.</li>
              <li>The right sidebar (Sidepanel) will open automatically.</li>
              <li>Edit fields like Gender, Birthdate, Birthplace, Death, and Tags directly.</li>
              <li>After making changes, click the <b>Save</b> button.</li>
            </ol>

            <h3 className="text-xl font-semibold mb-2">How to Add to the Gallery</h3>
            <ol className="list-decimal list-inside mb-4">
              <li>Open the Sidepanel by selecting a person.</li>
              <li>Scroll to the Gallery section.</li>
              <li>Click <b>Add Image</b> or <b>Upload</b> button.</li>
              <li>Choose an image from your device and upload.</li>
              <li>Click <b>Save</b> after uploading to confirm.</li>
            </ol>

            <h3 className="text-xl font-semibold mb-2">How to Delete People</h3>
            <ol className="list-decimal list-inside">
              <li>Click on the person node you wish to delete.</li>
              <li>In the Sidepanel, locate the <b>Delete</b> button (usually near Save).</li>
              <li>Confirm the deletion when prompted.</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        {/* Managing People */}
        <AccordionItem value="managing-people">
          <AccordionTrigger>Managing People</AccordionTrigger>
          <AccordionContent>
            <h3 className="text-xl font-semibold mb-2">How to Add People</h3>
            <ol className="list-decimal list-inside mb-4">
              <li>On the Family Tree page, click the <b>Add Person</b> button (or right-click a node).</li>
              <li>Fill in the person’s details in the popup form.</li>
              <li>Click <b>Save</b> to add them to the tree.</li>
            </ol>

            <h3 className="text-xl font-semibold mb-2">How to Update Notes</h3>
            <ol className="list-decimal list-inside mb-4">
              <li>Select a person in the Family Tree.</li>
              <li>Scroll in the Sidepanel to the <b>Notes</b> section.</li>
              <li>Type or edit the notes.</li>
              <li>Click <b>Save</b> to save your changes.</li>
            </ol>

            <h3 className="text-xl font-semibold mb-2">How to Update Relationships</h3>
            <ol className="list-decimal list-inside mb-4">
              <li>Select the person you want to connect.</li>
              <li>Find the Relationships section in the Sidepanel.</li>
              <li>Add parents, spouses, or children by linking existing people or creating new ones.</li>
              <li>Click <b>Save</b>.</li>
            </ol>

            <h3 className="text-xl font-semibold mb-2">How to Update Career and Education</h3>
            <ol className="list-decimal list-inside">
              <li>Select a person in the Family Tree.</li>
              <li>Find the Career or Education fields in the Sidepanel.</li>
              <li>Fill in relevant information about jobs, degrees, schools, etc.</li>
              <li>Click <b>Save</b>.</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        {/* Working with Trees */}
        <AccordionItem value="working-trees">
          <AccordionTrigger>Working with Trees</AccordionTrigger>
          <AccordionContent>
            <h3 className="text-xl font-semibold mb-2">How to Make a Tree</h3>
            <ol className="list-decimal list-inside mb-4">
              <li>Navigate to the Trees Dashboard.</li>
              <li>Click <b>Create New Tree</b>.</li>
              <li>Fill in the Tree Name and any initial settings.</li>
              <li>Click <b>Create</b> to start building your tree.</li>
            </ol>

            <h3 className="text-xl font-semibold mb-2">How to Navigate to the Trees Dashboard</h3>
            <ol className="list-decimal list-inside">
              <li>Click on the <b>Trees</b> link in the main navbar.</li>
              <li>You will be directed to the Trees Dashboard where you can manage all your trees.</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        {/* Import/Export */}
        <AccordionItem value="import-export">
          <AccordionTrigger>Import/Export</AccordionTrigger>
          <AccordionContent>
            <h3 className="text-xl font-semibold mb-2">How to Import a GEDCOM File</h3>
            <ol className="list-decimal list-inside">
              <li>Navigate to the Trees Dashboard.</li>
              <li>Find and click the <b>Import GEDCOM</b> button.</li>
              <li>Select your .ged file from your computer.</li>
              <li>Wait for the import to complete and review your tree!</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}