import React, { useState } from 'react';

export default function Yolov5SetupCard() {
  const [collapsed, setCollapsed] = useState(false);

  const notebookPath = '/backend/yolov5installationfiles/ISL%20Detection%20Yolov5.ipynb';
  const dataYamlPath = '/backend/datasets/data.yaml';

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">YOLOv5 Setup for Practice</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Follow these steps to (re)install YOLOv5 and wire it to EchoAid when you're ready.</p>
        </div>
        <button
          type="button"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 sm:px-6 pb-5">
          <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-700 dark:text-gray-200">
            <li>
              Open the YOLOv5 installation notebook and follow the steps to clone, download weights, and train/evaluate.
              <div className="mt-2">
                <a
                  href={notebookPath}
                  className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                  download
                >
                  Download: ISL Detection Yolov5.ipynb
                </a>
              </div>
            </li>
            <li>
              Use the provided dataset config to point YOLOv5 at the ISL dataset.
              <div className="mt-2">
                <a
                  href={dataYamlPath}
                  className="inline-flex items-center rounded-md bg-slate-50 dark:bg-slate-900/30 px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/50"
                  download
                >
                  Download: datasets/data.yaml
                </a>
              </div>
            </li>
            <li>
              Expose a detection endpoint (e.g., FastAPI or Node) that accepts an image or frame and returns detections in JSON. Once available, we can wire this Practice page to call it.
            </li>
          </ol>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Tip: If you prefer client-side detection, consider converting to ONNX/Web and running with onnxruntime-web. Otherwise, keep detection server-side for simplicity.
          </div>
        </div>
      )}
    </div>
  );
}