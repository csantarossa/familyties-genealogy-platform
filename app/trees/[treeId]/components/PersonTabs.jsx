import React, { useContext, useEffect, useState } from "react";
import imageCompression from "browser-image-compression";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PopUp from "./PopUp";
import { Plus } from "@geist-ui/icons";
import UploadImage from "./UploadImage";
import {
  Edit2,
  RotateCcw,
  Save,
  Upload,
  Trash,
  Image,
  ImageIcon,
  X,
} from "lucide-react";
import { getImmediateFamily, getSiblingsBySharedParents } from "@/app/actions";
import toast from "react-hot-toast";
import DatePickerInput from "./DatePickerInput";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import {
  parseDate,
  formatForBackend,
  formatDisplayDate,
} from "@/app/utils/parseDate";
import ConfirmModal from "./ConfirmModal";
import RelationshipSelector from "./RelationshipSelector";
import { createRelationship, deleteRelationship } from "@/app/actions";
import { PersonContext } from "@/app/contexts/PersonContext";

const PersonTabs = () => {
  const { treeId } = useParams();
  const { selected, setPeople, setSelected } = useContext(PersonContext);

  const [relationships, setRelationships] = useState([]);
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [isEditingCareer, setIsEditingCareer] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [addRelationLoading, setAddRelationLoading] = useState(false);
  const [editedGender, setEditedGender] = useState(selected.gender);
  const [notes, setNotes] = useState(selected.notes);
  const [editedDob, setEditedDob] = useState(parseDate(selected.dob));
  const [editedDod, setEditedDod] = useState(parseDate(selected.dod));
  const [editedCareer, setEditedCareer] = useState(
    selected.additionalInfo?.career || []
  );
  const [editedEducation, setEditedEducation] = useState(
    selected.additionalInfo?.education || []
  );
  const [siblings, setSiblings] = useState([]);

  const [birthTown, setBirthTown] = useState(selected.birthTown || "");
  const [birthCity, setBirthCity] = useState(selected.birthCity || "");
  const [birthState, setBirthState] = useState(selected.birthState || "");
  const [birthCountry, setBirthCountry] = useState(selected.birthCountry || "");

  const [deathTown, setDeathTown] = useState(selected.deathTown || "");
  const [deathCity, setDeathCity] = useState(selected.deathCity || "");
  const [deathState, setDeathState] = useState(selected.deathState || "");
  const [deathCountry, setDeathCountry] = useState(selected.deathCountry || "");

  const personId = selected.id;

  const [editedTags, setEditedTags] = useState(selected.person_tags || []);
  const [editedConfidence, setEditedConfidence] = useState(
    selected.confidence || ""
  );
  const [newTagInput, setNewTagInput] = useState("");

  // Format dates before sending
  const updatedCareer = editedCareer.map((job) => ({
    ...job,
    start_date: formatForBackend(job.start_date),
    end_date: formatForBackend(job.end_date),
  }));

  const updatedEducation = editedEducation.map((edu) => ({
    ...edu,
    start_date: formatForBackend(edu.start_date),
    end_date: formatForBackend(edu.end_date),
  }));

  const [careerBackup, setCareerBackup] = useState([]);
  const [educationBackup, setEducationBackup] = useState([]);

  const [isEditingRelationships, setIsEditingRelationships] = useState(false);
  const [showAddRelation, setShowAddRelation] = useState(false);
  const [newRelation, setNewRelation] = useState({
    otherPersonId: "",
    typeId: "",
  });

  useEffect(() => {
    toast.loading("Loading sidepanel");
    handleGetRelationships();
    toast.dismiss();
  }, []);

  useEffect(() => {
    if (!isEditingGeneral) {
      if (selected.dob) {
        setEditedDob(parseDate(selected.dob));
      }
      if (selected.dod) {
        setEditedDod(parseDate(selected.dod));
      }
      setEditedGender(selected.gender || "");
      setNotes(selected.notes || "");
      setEditedTags(selected.tags || []);
      setEditedConfidence(selected.confidence || "");
      setBirthTown(selected.birthTown || "");
      setBirthCity(selected.birthCity || "");
      setBirthState(selected.birthState || "");
      setBirthCountry(selected.birthCountry || "");
      setDeathTown(selected.deathTown || "");
      setDeathCity(selected.deathCity || "");
      setDeathState(selected.deathState || "");
      setDeathCountry(selected.deathCountry || "");
    }
  }, [selected, isEditingGeneral]);

  const handleGetRelationships = async () => {
    const data = await getImmediateFamily(selected.id);
    const siblingData = await getSiblingsBySharedParents(selected.id);
    setSiblings(siblingData);
    setRelationships(data);
  };

  const handleSaveGallery = async (img) => {
    try {
      toast.loading("Saving image");
      const personId = selected.id;
      let uploadedImageUrl = null;

      // ✅ Upload the image first if one was selected
      if (img) {
        const compressedFile = await imageCompression(img, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });

        const formData = new FormData();
        formData.append("file", compressedFile);

        const uploadRes = await fetch(`/api/trees/${treeId}/s3-upload`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.url;

        if (uploadedImageUrl) {
          setSelected((prev) => ({
            ...prev,
            gallery: [
              ...(prev.gallery || []),
              { image_url: uploadedImageUrl }, // match your backend schema
            ],
          }));
          const imageRes = await fetch(
            `/api/trees/${treeId}/s3-upload/gallery`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                person_id: personId,
                url: uploadedImageUrl,
              }),
            }
          );

          const imageData = await imageRes.json();
          if (!imageRes.ok || !imageData.success) {
            toast.error("Image saved to S3 but failed to save in database");
            toast.dismiss();
            return;
          }
          toast.dismiss();
          toast.success("Image saved");
        }
      }
    } catch (error) {
      console.error(error);
      toast.dismiss();
    } finally {
      setImageFile(null);
    }
  };

  const handleDeleteImage = async (url) => {
    toast.loading("Deleting image...");
    try {
      const res = await fetch(`/api/trees/${treeId}/s3-upload/gallery`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person_id: selected.id,
          url: url,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        toast.error("Failed to delete image");
        return;
      }

      // Remove from gallery UI
      setSelected((prev) => ({
        ...prev,
        gallery: prev.gallery.filter((img) => img.image_url !== url),
      }));

      toast.success("Image deleted");
    } catch (err) {
      console.error("❌ Error deleting image:", err);
      toast.error("Error deleting image");
    } finally {
      toast.dismiss();
    }
  };
  const promoteGalleryImageToProfile = async (imgUrl) => {
    const res = await fetch(`/api/trees/${treeId}/gallery/promote`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        person_id: selected.id,
        image_url: imgUrl,
      }),
    });

    if (res.ok) {
      setSelected((prev) => ({
        ...prev,
        profileImage: imgUrl,
        gallery: prev.gallery,
      }));
      setPeople((prev) =>
        prev.map((p) =>
          p.id === selected.id ? { ...p, profileImage: imgUrl } : p
        )
      );
      toast.success("Set as profile picture");
    } else {
      toast.error("Failed to update profile image");
    }
  };
  const handleSave = async (e) => {
    toast.loading("Saving changes...");
    try {
      // Update general person info
      const res = await fetch(`/api/trees/${treeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId: selected.id,
          firstname: selected.firstname,
          middlename: selected.middlename,
          lastname: selected.lastname,
          gender: editedGender,
          dob: formatForBackend(editedDob),
          dod: formatForBackend(editedDod),
          confidence: editedConfidence,
          tags: editedTags,
          birthTown,
          birthCity,
          birthState,
          birthCountry,
          deathTown,
          deathCity,
          deathState,
          deathCountry,
          notes: notes,
        }),
      });

      const resCareer = await fetch(`/api/trees/${selected.id}/career`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId: selected.id,
          career: updatedCareer,
        }),
      });

      const resEducation = await fetch(`/api/trees/${personId}/education`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId: selected.id,
          education: updatedEducation,
        }),
      });

      if (!res.ok || !resCareer.ok || !resEducation.ok) {
        toast.error("Failed to update data.");
        return;
      }
      const updatedFields = {
        gender: editedGender,
        dob: editedDob,
        dod: editedDod,
        tags: editedTags,
        confidence: editedConfidence,
        birthTown,
        birthCity,
        birthState,
        birthCountry,
        deathTown,
        deathCity,
        deathState,
        deathCountry,
        notes,
        additionalInfo: {
          career: editedCareer,
          education: editedEducation,
        },
      };
      toast.success("Updated successfully!");
      setSelected((prev) => ({
        ...prev,
        gender: editedGender,
        dob: editedDob,
        dod: editedDod,
        tags: editedTags,
        confidence: editedConfidence,
        birthTown: birthTown,
        birthCity: birthCity,
        birthState: birthState,
        birthCountry: birthCountry,
        deathTown: deathTown,
        deathCity: deathCity,
        deathState: deathState,
        deathCountry: deathCountry,
        notes: notes,
        additionalInfo: {
          career: editedCareer,
          education: editedEducation,
          trigger: prev.trigger,
          id: prev.id,
          treeId: prev.treeId,
        },
      }));

      setPeople((prev) =>
        prev.map((p) => (p.id === selected.id ? { ...p, ...updatedFields } : p))
      );

      setIsEditingGeneral(false);
      setIsEditingCareer(false);
      setIsEditingEducation(false);
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error");
    }
    toast.dismiss();
  };

  const birthLocation = [
    selected.birthTown,
    selected.birthCity,
    selected.birthState,
    selected.birthCountry,
  ];

  return (
    <div className="max-h-full overflow-hidden">
      <Tabs defaultValue="info" className="w-[450px] h-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger className="hover:bg-gray-200" value="info">
            Info
          </TabsTrigger>
          <TabsTrigger className="hover:bg-gray-200" value="gallery">
            Gallery
          </TabsTrigger>
          <TabsTrigger className="hover:bg-gray-200" value="notes">
            Notes
          </TabsTrigger>
        </TabsList>

        {/* Info tab */}
        <TabsContent value="info" className="h-full">
          <Card className="border-none shadow-none h-full">
            <div className="h-full pb-10 overflow-y-auto px-4">
              {/* General Info */}
              <CardHeader className="flex flex-row justify-between">
                <CardTitle className="text-lg">General Information</CardTitle>
                <Edit2
                  size={16}
                  className="cursor-pointer"
                  onClick={() => {
                    if (!isEditingGeneral) {
                      const dobParsed = parseDate(selected.dob);
                      const dodParsed = parseDate(selected.dod);

                      console.log("🧠 RAW DOB:", selected.dob);
                      console.log("🧠 PARSED DOB:", dobParsed);

                      setEditedDob(dobParsed);
                      setEditedDod(dodParsed);
                      setEditedGender(selected.gender || "");
                      setNotes(selected.notes || "");
                      setEditedTags(selected.tags || []);
                      setEditedConfidence(selected.confidence || "");
                    }
                    setIsEditingGeneral((prev) => !prev);
                  }}
                />
              </CardHeader>

              <CardContent className="space-y-2">
                {/* Gender */}
                <div className="space-y-0">
                  <Label className="font-semibold text-sm">Gender</Label>
                  {isEditingGeneral ? (
                    <Select value={editedGender} onValueChange={setEditedGender}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{selected.gender}</p>
                  )}
                </div>

                {/* DOB */}
                <div className="space-y-0">
                  <Label className="font-semibold text-sm">Birth</Label>
                  {!isEditingGeneral ? (
                    <>
                      <p className="text-sm">{formatDisplayDate(editedDob)}</p>
                      <p className="text-sm">
                        <span className="">
                          {[birthTown, birthCity, birthState, birthCountry]
                            .filter(Boolean)
                            .join(", ") || "Place of Birth Unknown"}
                        </span>
                      </p>
                    </>
                  ) : (
                    <>
                      <DatePickerInput
                        date={editedDob}
                        setDate={setEditedDob}
                      />
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="space-y-2 mt-2">
                          <Input
                            value={birthTown}
                            onChange={(e) => setBirthTown(e.target.value)}
                            placeholder="Town"
                          />
                          <Input
                            value={birthCity}
                            onChange={(e) => setBirthCity(e.target.value)}
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-2 mt-2">
                          <Input
                            value={birthState}
                            onChange={(e) => setBirthState(e.target.value)}
                            placeholder="State"
                          />
                          <Input
                            value={birthCountry}
                            onChange={(e) => setBirthCountry(e.target.value)}
                            placeholder="Country"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* DOD */}
                <div className="space-y-0">
                <Label className="font-semibold text-sm">Death</Label>
                {isEditingGeneral ? (
                  <>
                    <DatePickerInput date={editedDod} setDate={setEditedDod} />
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2 mt-2">
                        <Input
                          value={deathTown}
                          onChange={(e) => setDeathTown(e.target.value)}
                          placeholder="Town"
                        />
                        <Input
                          value={deathCity}
                          onChange={(e) => setDeathCity(e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2 mt-2">
                        <Input
                          value={deathState}
                          onChange={(e) => setDeathState(e.target.value)}
                          placeholder="State"
                        />
                        <Input
                          value={deathCountry}
                          onChange={(e) => setDeathCountry(e.target.value)}
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm">{formatDisplayDate(editedDod, true)}</p>
                    {editedDod && (
                      <p className="text-sm">
                        {[deathTown, deathCity, deathState, deathCountry]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </>
                )}
              </div>

                {/* Tags */}
                <div className="space-y-0">
                  <Label className="font-semibold text-sm">Tags</Label>

                  {isEditingGeneral ? (
                    <>
                      <div className="flex gap-2">
                        <Input
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          placeholder="e.g. 🌟 ❤️ 💻"
                          className="text-sm w-full"
                        />
                        <Button
                          onClick={() => {
                            if (newTagInput.trim()) {
                              setEditedTags([
                                ...editedTags,
                                newTagInput.trim(),
                              ]);
                              setNewTagInput("");
                            }
                          }}
                          variant="outline"
                        >
                          Add
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {editedTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-sm bg-zinc-100 px-2 py-1 rounded-lg flex items-center gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => {
                                const updated = [...editedTags];
                                updated.splice(idx, 1);
                                setEditedTags(updated);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              ❌
                            </button>
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editedTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-sm bg-zinc-100 px-2 py-1 rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save and Cancel Button */}
                {isEditingGeneral && (
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleSave}>Save</Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditedGender(selected.gender);
                        setEditedDob(parseDate(selected.dob));
                        setEditedDod(parseDate(selected.dod));
                        setIsEditingGeneral(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>

              <hr />

              {/* Relationships */}
              <CardHeader className="flex flex-row justify-between">
                <CardTitle className="text-lg">Relationships</CardTitle>
                <div className="flex items-center gap-3">
                  {isEditingRelationships && (
                    <Plus
                      size={20}
                      className="cursor-pointer"
                      onClick={() => setShowAddRelation((prev) => !prev)}
                    />
                  )}
                  <Edit2
                    size={16}
                    className="cursor-pointer"
                    onClick={() => {
                      setIsEditingRelationships((prev) => !prev);
                      setShowAddRelation(false);
                    }}
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Add‑new form */}
                {isEditingRelationships && showAddRelation && (
                  <div className="flex flex-col gap-2 p-2 bg-gray-50 rounded">
                    <RelationshipSelector
                      treeId={treeId}
                      excludeId={personId}
                      value={newRelation}
                      onChange={setNewRelation}
                    />
                    <Button
                      className="w-full"
                      disabled={
                        !newRelation.otherPersonId || !newRelation.typeId
                      }
                      onClick={async () => {
                        setAddRelationLoading(true);
                        await createRelationship(
                          personId,
                          newRelation.otherPersonId,
                          newRelation.typeId
                        );
                        setAddRelationLoading(false);
                        await handleGetRelationships();
                        setNewRelation({ otherPersonId: "", typeId: "" });
                        setShowAddRelation(false);
                        toast.success("Relation added successfully!");
                      }}
                    >
                      {addRelationLoading ? (
                        <div className="loading"></div>
                      ) : (
                        "Add Relation"
                      )}
                    </Button>
                  </div>
                )}

                {/* Parents */}
                <div>
                  <Label className="text-xs font-semibold">Parents</Label>
                  {relationships
                    .filter((r) => r.direction === "parent")
                    .map((r) => (
                      <div
                        key={r.relationship_id}
                        className="flex justify-between items-center"
                      >
                        <p className="text-sm pl-2">
                          {r.other_person_firstname} {r.other_person_lastname}
                        </p>
                        {isEditingRelationships && (
                          <ConfirmModal
                            title="Delete Relationship"
                            description="Are you sure you want to remove this relationship?"
                            onConfirm={async () => {
                              await deleteRelationship(r.relationship_id);
                              await handleGetRelationships();
                              toast.success("Relationship deleted.");
                            }}
                            trigger={
                              <Trash
                                size={16}
                                className="cursor-pointer text-red-500 hover:text-red-700"
                              />
                            }
                          />
                        )}
                      </div>
                    ))}
                </div>

                {/* Children */}
                <div>
                  <Label className="text-xs font-semibold">Children</Label>
                  {relationships
                    .filter((r) => r.direction === "child")
                    .map((r) => (
                      <div
                        key={r.relationship_id}
                        className="flex justify-between items-center"
                      >
                        <p className="text-sm pl-2">
                          {r.other_person_firstname} {r.other_person_lastname}
                        </p>
                        {isEditingRelationships && (
                          <ConfirmModal
                            title="Delete Relationship"
                            description="Are you sure you want to remove this relationship?"
                            onConfirm={async () => {
                              await deleteRelationship(r.relationship_id);
                              await handleGetRelationships();
                              toast.success("Relationship deleted.");
                            }}
                            trigger={
                              <Trash
                                size={16}
                                className="cursor-pointer text-red-500 hover:text-red-700"
                              />
                            }
                          />
                        )}
                      </div>
                    ))}
                </div>

                {/* Spouse */}
                <div>
                  <Label className="text-xs font-semibold">Spouse</Label>
                  {relationships
                    .filter((r) => r.type_name === "spouse")
                    .map((r) => (
                      <div
                        key={r.relationship_id}
                        className="flex justify-between items-center"
                      >
                        <p className="text-sm pl-2">
                          {r.other_person_firstname} {r.other_person_lastname}
                        </p>
                        {isEditingRelationships && (
                          <ConfirmModal
                            title="Delete Relationship"
                            description="Are you sure you want to remove this relationship?"
                            onConfirm={async () => {
                              await deleteRelationship(r.relationship_id);
                              await handleGetRelationships();
                              toast.success("Relationship deleted.");
                            }}
                            trigger={
                              <Trash
                                size={16}
                                className="cursor-pointer text-red-500 hover:text-red-700"
                              />
                            }
                          />
                        )}
                      </div>
                    ))}
                </div>

                {/* Siblings (derived, not editable) */}
                <div>
                  <Label className="text-xs font-semibold">Siblings</Label>
                  {siblings.map((s) => (
                    <p key={s.person_id} className="text-sm pl-2">
                      {s.person_firstname} {s.person_lastname}
                    </p>
                  ))}
                </div>
              </CardContent>
              <hr />

              {/* Career */}
              <CardHeader className="flex flex-row justify-between">
                <CardTitle className="text-lg">Career</CardTitle>
                <div className="flex items-center gap-3">
                  {isEditingCareer && (
                    <Plus
                      size={20}
                      className="cursor-pointer"
                      onClick={() =>
                        setEditedCareer((prev) => [
                          ...prev,
                          {
                            job_title: "",
                            institution: "",
                            location: "",
                            start_date: null,
                            end_date: null,
                            description: "",
                          },
                        ])
                      }
                    />
                  )}
                  <Edit2
                    size={16}
                    className="cursor-pointer"
                    onClick={() => {
                      if (!isEditingCareer) {
                        setCareerBackup(
                          JSON.parse(JSON.stringify(editedCareer))
                        ); // deep copy
                      }
                      setIsEditingCareer(!isEditingCareer);
                    }}
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {editedCareer.map((job, index) => (
                  <div key={index} className="relative border p-3 rounded-lg">
                    {isEditingCareer ? (
                      <>
                        <div className="space-y-2">
                          <Label className="text-xs">Job Title</Label>
                          <Input
                            value={job.job_title || ""}
                            onChange={(e) => {
                              const updated = [...editedCareer];
                              updated[index].job_title = e.target.value;
                              setEditedCareer(updated);
                            }}
                          />
                          <Label className="text-xs">Company</Label>
                          <Input
                            value={job.institution || ""}
                            onChange={(e) => {
                              const updated = [...editedCareer];
                              updated[index].institution = e.target.value;
                              setEditedCareer(updated);
                            }}
                          />
                          <Label className="text-xs">Location</Label>
                          <Input
                            value={job.location || ""}
                            onChange={(e) => {
                              const updated = [...editedCareer];
                              updated[index].location = e.target.value;
                              setEditedCareer(updated);
                            }}
                          />
                          <Label className="text-xs">Start Date</Label>
                          <DatePickerInput
                            date={job.start_date}
                            setDate={(val) => {
                              const updated = [...editedCareer];
                              updated[index].start_date = val;
                              setEditedCareer(updated);
                            }}
                          />
                          <Label className="text-xs">End Date</Label>
                          <DatePickerInput
                            date={job.end_date}
                            setDate={(val) => {
                              const updated = [...editedCareer];
                              updated[index].end_date = val;
                              setEditedCareer(updated);
                            }}
                          />
                          <Label className="text-xs">Description</Label>
                          <Input
                            value={job.description || ""}
                            onChange={(e) => {
                              const updated = [...editedCareer];
                              updated[index].description = e.target.value;
                              setEditedCareer(updated);
                            }}
                          />
                        </div>

                        <ConfirmModal
                          title="Delete Career Entry"
                          description="Are you sure you want to remove this career entry?"
                          onConfirm={() => {
                            const updated = [...editedCareer];
                            updated.splice(index, 1);
                            setEditedCareer(updated);
                          }}
                          trigger={
                            <Trash
                              size={18}
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer transition"
                            />
                          }
                        />
                      </>
                    ) : (
                      <div className="space-y-1">
                        <Label className="font-semibold text-base">
                          {job.job_title}
                        </Label>
                        <p className="text-sm font-medium">{job.institution}</p>
                        <p className="text-sm">{job.location}</p>
                        <CardDescription>{job.description}</CardDescription>
                        <p className="text-sm">
                          {job.start_date
                            ? format(new Date(job.start_date), "dd MMM yyyy")
                            : "Start Unknown"}
                          {" - "}
                          {job.end_date
                            ? format(new Date(job.end_date), "dd MMM yyyy")
                            : "Present"}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {isEditingCareer && editedCareer.length !== 0 && (
                  <div className="flex justify-end gap-2">
                    <Button onClick={handleSave}>Save</Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const restored = careerBackup.map((job) => ({
                          ...job,
                          start_date: job.start_date
                            ? new Date(job.start_date)
                            : null,
                          end_date: job.end_date
                            ? new Date(job.end_date)
                            : null,
                        }));
                        setEditedCareer(restored);
                        setIsEditingCareer(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>

              <hr />

              {/* Education */}
              <CardHeader className="flex flex-row justify-between">
                <CardTitle className="text-lg">Education</CardTitle>
                <div className="flex items-center gap-3">
                  {isEditingEducation && (
                    <Plus
                      size={20}
                      className="cursor-pointer"
                      onClick={() =>
                        setEditedEducation((prev) => [
                          ...prev,
                          {
                            title: "",
                            institution: "",
                            location: "",
                            start_date: null,
                            end_date: null,
                            description: "",
                          },
                        ])
                      }
                    />
                  )}
                  <Edit2
                    size={16}
                    className="cursor-pointer"
                    onClick={() => {
                      if (!isEditingEducation) {
                        setEducationBackup(
                          JSON.parse(JSON.stringify(editedEducation))
                        ); // deep copy
                      }
                      setIsEditingEducation(!isEditingEducation);
                    }}
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {editedEducation.map((edu, index) => (
                  <div key={index} className="relative border p-3 rounded-lg">
                    {isEditingEducation ? (
                      <>
                        <div className="space-y-2">
                          <Label className="text-xs">Title</Label>
                          <Input
                            value={edu.title || ""}
                            onChange={(e) => {
                              const updated = [...editedEducation];
                              updated[index].title = e.target.value;
                              setEditedEducation(updated);
                            }}
                          />
                          <Label className="text-xs">Institution</Label>
                          <Input
                            value={edu.institution || ""}
                            onChange={(e) => {
                              const updated = [...editedEducation];
                              updated[index].institution = e.target.value;
                              setEditedEducation(updated);
                            }}
                          />
                          <Label className="text-xs">Location</Label>
                          <Input
                            value={edu.location || ""}
                            onChange={(e) => {
                              const updated = [...editedEducation];
                              updated[index].location = e.target.value;
                              setEditedEducation(updated);
                            }}
                          />
                          <Label className="text-xs">Start Date</Label>
                          <DatePickerInput
                            date={edu.start_date}
                            setDate={(val) => {
                              const updated = [...editedEducation];
                              updated[index].start_date = val;
                              setEditedEducation(updated);
                            }}
                          />
                          <Label className="text-xs">End Date</Label>
                          <DatePickerInput
                            date={edu.end_date}
                            setDate={(val) => {
                              const updated = [...editedEducation];
                              updated[index].end_date = val;
                              setEditedEducation(updated);
                            }}
                          />
                          <Label className="text-xs">Description</Label>
                          <Input
                            value={edu.description || ""}
                            onChange={(e) => {
                              const updated = [...editedEducation];
                              updated[index].description = e.target.value;
                              setEditedEducation(updated);
                            }}
                          />
                        </div>

                        <ConfirmModal
                          title="Delete Education Entry"
                          description="Are you sure you want to remove this education entry?"
                          onConfirm={() => {
                            const updated = [...editedEducation];
                            updated.splice(index, 1);
                            setEditedEducation(updated);
                          }}
                          trigger={
                            <Trash
                              size={18}
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer transition"
                            />
                          }
                        />
                      </>
                    ) : (
                      <div className="space-y-1">
                        <Label className="font-semibold text-base">
                          {edu.title}
                        </Label>
                        <p className="text-sm font-medium">{edu.institution}</p>
                        <p className="text-sm">{edu.location}</p>
                        <CardDescription>{edu.description}</CardDescription>
                        <p className="text-sm">
                          {edu.start_date
                            ? format(new Date(edu.start_date), "dd MMM yyyy")
                            : "Start Unknown"}
                          {" - "}
                          {edu.end_date
                            ? format(new Date(edu.end_date), "dd MMM yyyy")
                            : "Present"}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {isEditingEducation && editedEducation.length !== 0 && (
                  <div className="flex justify-end gap-2">
                    <Button onClick={handleSave}>Save</Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const restored = educationBackup.map((edu) => ({
                          ...edu,
                          start_date: edu.start_date
                            ? new Date(edu.start_date)
                            : null,
                          end_date: edu.end_date
                            ? new Date(edu.end_date)
                            : null,
                        }));
                        setEditedEducation(restored);
                        setIsEditingEducation(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        </TabsContent>

        {/* Gallery */}
        <TabsContent value="gallery">
          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-4 justify-center w-full items-start p-0 m-0 gap-3">
              <label htmlFor="uploadFile">
                <UploadImage />
              </label>
              <input
                id="uploadFile"
                className="!hidden"
                type="file"
                onChange={(e) => {
                  setImageFile(e.target.files[0]);
                  handleSaveGallery(e.target.files[0]);
                }}
              />

              {Array.isArray(selected.gallery) &&
                selected.gallery.map((img, index) => (
                  <div key={index} className="w-28 h-28 relative group">
                    <PopUp img={img.image_url} index={index} />

                    {img.image_url !== selected.profileImage && (
                      <button
                        className="bg-white absolute top-7 right-1 rounded p-1 text-xs shadow hover:bg-blue-100 z-10 opacity-0 group-hover:opacity-100 transition"
                        onClick={() =>
                          promoteGalleryImageToProfile(img.image_url)
                        }
                      >
                        <ImageIcon size={16} />
                      </button>
                    )}

                    <ConfirmModal
                      title="Delete this image?"
                      description="This action cannot be undone. The image will be permanently removed from the gallery."
                      onConfirm={() => handleDeleteImage(img.image_url)}
                      trigger={
                        <span className="bg-white absolute top-0 right-1 rounded p-1 shadow hover:bg-red-100 z-10 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                          <X size={16} />
                        </span>
                      }
                    />
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes" className="">
          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle>Notes</CardTitle>

              <CardDescription>
                A flexible space to suit your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-center w-full items-center p-0 m-0 gap-3 overflow-auto">
              <Textarea
                onChange={(e) => {
                  setNotes(e.target.value);
                }}
                value={notes}
                className="w-full min-h-60"
              />
              <div className="flex justify-end gap-2 w-full">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setNotes(selected.notes);
                  }}
                >
                  <RotateCcw />
                </Button>
                <Button onClick={handleSave}>Update</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonTabs;
