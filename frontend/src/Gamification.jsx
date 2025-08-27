import React from "react";
import "@material/web/icon/icon.js";
import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";

const Gamification = ({ personalBests, todayData }) => {
  const Card = ({ icon, value, label, color }) => (
    <div className="flex flex-col items-center justify-center w-28 h-28 bg-[var(--theme-secondary)] rounded-2xl shadow-md p-3">
      <md-icon style={{ fontSize: "28px", color }} className="mb-1">
        {icon}
      </md-icon>
      <span className="text-xl font-bold text-[var(--theme-text)]">
        {value}
      </span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );

  return (
    <div className="flex justify-center items-center gap-6 p-4 rounded-xl">
      {personalBests.highestSteps && (
        <Card
          icon="directions_run"
          value={personalBests.highestSteps}
          label="Steps PB"
          color="rgb(59,130,246)" // blue-500
        />
      )}

      {personalBests.lowestWeight && (
        <Card
          icon="scale"
          value={personalBests.lowestWeight}
          label="Weight PB"
          color="rgb(34,197,94)" // green-500
        />
      )}
    </div>
  );
};

export default Gamification;
