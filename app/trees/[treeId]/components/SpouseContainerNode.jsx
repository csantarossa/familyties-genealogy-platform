import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import TreeNode from "./TreeNode";

// This component will contain two TreeNodes side by side when they're spouses
function SpouseContainerNode({ data, id }) {
  const { person, spouse } = data;

  // Extract IDs for connection handles
  const personId = person.id;
  const spouseId = spouse ? spouse.id : null;

  return (
    <div
      className="flex flex-row items-center rounded-md relative"
      style={{ backgroundColor: "transparent" }}
    >
      {/* Left person */}
      <div className="relative flex flex-col items-center">
        {/* Multiple distributed handles on top of the left person for incoming connections */}
        <Handle
          type="target"
          position={Position.Top}
          id={`top-left-${personId}`}
          className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
          style={{ background: "#000" }}
        />
        <Handle
          type="target"
          position={Position.Top}
          id={`top-${personId}`}
          className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
          style={{ background: "#000" }}
        />
        <Handle
          type="target"
          position={Position.Top}
          id={`top-right-${personId}`}
          className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
          style={{ background: "#000" }}
        />

        <TreeNode data={person} id={personId} isInSpouseContainer={true} />

        {/* Optional left invisible handle if needed */}
        <Handle
          type="target"
          position={Position.Left}
          id={`left-${personId}`}
          className="opacity-0"
          style={{ background: "#000", visibility: "visible" }}
        />
      </div>

      {/* Connector between spouses */}
      {spouse && <div className="h-[3.5px] w-20 bg-[#000]"></div>}

      {/* Right spouse */}
      {spouse && (
        <div className="relative flex flex-col items-center">
          {/* Multiple distributed handles on top of the right spouse for incoming connections */}
          <Handle
            type="target"
            position={Position.Top}
            id={`top-left-${spouseId}`}
            className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
            style={{ background: "#000" }}
          />
          <Handle
            type="target"
            position={Position.Top}
            id={`top-${spouseId}`}
            className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
            style={{ background: "#000" }}
          />
          <Handle
            type="target"
            position={Position.Top}
            id={`top-right-${spouseId}`}
            className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
            style={{ background: "#000" }}
          />

          <TreeNode data={spouse} id={spouseId} isInSpouseContainer={true} />

          {/* Optional right invisible handle if needed */}
          <Handle
            type="source"
            position={Position.Right}
            id={`right-${spouseId}`}
            className="opacity-0"
            style={{ background: "#000", visibility: "visible" }}
          />
        </div>
      )}

      {/* Multiple distributed handles on the bottom of the container for outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-left"
        className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
        style={{ background: "#000" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
        style={{ background: "#000" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-right"
        className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
        style={{ background: "#000" }}
      />

      {/* Create one targeted handle for each potential child */}
      {/* These will be referenced by the specific parent-child edges */}
      <div className="absolute bottom-0 left-0 right-0 opacity-0 pointer-events-none">
        {/* Dynamically create handles - these won't be visible but will be available for connections */}
        {Array.from({ length: 10 }).map((_, index) => (
          <Handle
            key={index}
            type="source"
            position={Position.Bottom}
            id={`bottom-child-${index}`}
            className="!absolute !top-[50%] !translate-y-[-50%] !left-[50%] !translate-x-[-50%] opacity-0"
            style={{
              left: `${(index + 1) * 9}%`,
              bottom: 0,
              background: "#000",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(SpouseContainerNode);
