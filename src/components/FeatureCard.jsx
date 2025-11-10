// src/components/FeatureCard.jsx
import React from "react";

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="rounded-xl bg-white p-6 text-center shadow-md transition hover:shadow-lg">
      <div className="-mt-16 mb-4 flex justify-center">
        <div className="h-[100px] w-[100px]">
          <img src={icon} alt="icon" className="h-full w-full object-contain" />
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-indigo-950">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default FeatureCard;
