import React from "react";
import Image from "next/image";

const PopUp = ({ img, index }) => {
  return (
    <div>
      <label htmlFor={`my_modal_${index}`} className="cursor-pointer">
        <div className="w-28 h-28 relative">
          <Image
            htmlFor={`my_modal_${index}`}
            alt="Person's main image"
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
            src={img}
          />
        </div>
      </label>

      {/* Put this part before </body> tag */}
      <input
        type="checkbox"
        id={`my_modal_${index}`}
        className="modal-toggle"
      />
      <div className="modal" role="dialog">
        <div className="modal-box w-fit h-fit p-0 relative rounded-none">
          <img
            alt="Person's main image"
            // layout="fill" // Makes the image cover the container
            // objectFit="contain" // Ensures it fits within the box and maintains aspect ratio
            className="rounded-md"
            src={img}
          />
        </div>

        <label className="modal-backdrop" htmlFor={`my_modal_${index}`}>
          Close
        </label>
      </div>
    </div>
  );
};

export default PopUp;
