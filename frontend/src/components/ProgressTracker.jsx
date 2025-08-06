import React from 'react';

function ProgressTracker({ progress = 0 }) {
  return (
    <div className="w-[300px] mx-auto" aria-label="Progress Bar">
      <div className="w-full h-4 bg-[#393E46] rounded-full overflow-hidden">
        <div
          className="h-4 bg-[#00CC00] rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
    </div>
  );
}

export default ProgressTracker;
