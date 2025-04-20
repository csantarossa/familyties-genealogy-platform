"use client";
import "@xyflow/react/dist/style.css";
import FlowSpace from "./components/FlowSpace";
import AddPersonButton from "./components/AddPersonButton";
import SidePanel from "./components/SidePanel";
import { createContext, useEffect, useState } from "react";
import AddPersonModal from "./components/AddPersonModal";
import toast, { Toaster } from "react-hot-toast";
import { Navbar } from "./components/Navbar";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { getTrees } from "@/app/actions";

export const SidePanelContext = createContext();
export const AddPersonModalContext = createContext();

function Home() {
  const router = useRouter();
  const [sidePanelContent, setSidePanelContent] = useState({
    trigger: false,
    firstname: "",
    middlename: "",
    lastname: "",
    other: "",
    img: "",
  });
  const [version, setVersion] = useState(0); // ✅ added version state

  const { user } = useUser();

  const { treeId } = useParams();

  const [addPersonModal, setAddPersonModal] = useState(false);

  useEffect(() => {
    checkUserOwnsTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const checkUserOwnsTree = async () => {
    if (!user) return;

    const trees = await getTrees(user.id);

    const filteredTrees = trees.filter(
      (tree) => Number(tree.tree_id) === Number(treeId)
    );
    if (filteredTrees.length > 0) {
      return;
    } else {
      router.push("/trees");
    }
  };

  return (
    <AddPersonModalContext.Provider value={[addPersonModal, setAddPersonModal]}>
      <SidePanelContext.Provider value={[sidePanelContent, setSidePanelContent]}>
        <div className="w-screen max-h-screen">
          <div className="flex justify-center items-center p-5 gap-10 rounded-2xl shadow-md w-fit absolute z-50 bg-white left-[50%] translate-x-[-50%]">
            <Navbar />
          </div>

          <AddPersonModal trigger={<AddPersonButton />} />
          <SidePanel />

          {/* ✅ GEDCOM Upload UI with version trigger */}
          <div className="absolute top-28 left-6 bg-white border shadow-sm p-4 rounded-md z-40">
            <h2 className="font-semibold text-sm mb-2">Import GEDCOM File</h2>
            <input
              type="file"
              accept=".ged"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const confirmed = window.confirm(
                  "This will delete all existing people in this tree and replace them with data from the GEDCOM file. Continue?"
                );
                if (!confirmed) return;

                const text = await file.text();
                const treeId = window.location.pathname.split("/")[2];

                const res = await fetch(`/api/trees/${treeId}/import`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ gedcomContent: text }),
                });

                const json = await res.json();
                alert("GEDCOM Import: " + (json.message || json.error));

                // Trigger FlowSpace to re-fetch
                setVersion((v) => v + 1);
              }}
            />
          </div>

          {/* ✅ Pass version to FlowSpace to refresh it */}
          <FlowSpace refreshTrigger={version} />
        </div>
      </SidePanelContext.Provider>
    </AddPersonModalContext.Provider>
  );
}

export default Home;
