import { useState } from "preact/hooks";
import "./DBCMenu.css";
import { dbcManager } from "../../../backend/dbc/DBCManager";

export function DBCMenu() {
  const [status, setStatus] = useState("");
  const [loadedDbcs, setLoadedDbcs] = useState<string[]>(dbcManager.getLoadedFileNames());
  const [dragActive, setDragActive] = useState(false);

  async function processFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".dbc")) {
      setStatus("Please select a valid .dbc file.");
      return;
    }

    try {
      setStatus("Loading DBC...");
      const text = await file.text();
      dbcManager.loadDBCFromString(text, file.name);

      setStatus(`Loaded: ${file.name}`);
      setLoadedDbcs(dbcManager.getLoadedFileNames());
      dbcManager.printSummary();
    } catch (err) {
      console.error(err);
      setStatus("Failed to load DBC file.");
    }
  }

  function handleFileUpload(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) processFile(file);
    input.value = ""; // so that you can upload the same file twice
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setDragActive(false);
  }

  function handleDelete(name: string) {
    dbcManager.removeDBC(name);
    setLoadedDbcs(dbcManager.getLoadedFileNames());
    setStatus(`Removed: ${name}`);
  }

  return (
    <div className="dbc-menu">
      <h3>DBC Loader</h3>

      {/* Dropzone */}
      <div
        className={`dbc-dropzone ${dragActive ? "drag-active" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById("dbcHiddenInput")?.click()}
      >
        <p>Click to upload or drag & drop a .dbc file</p>
      </div>

      {/* Hidden file input */}
      <input
        id="dbcHiddenInput"
        type="file"
        accept=".dbc"
        onInput={handleFileUpload}
        className="dbc-input-hidden"
      />

      <div className="dbc-status">{status}</div>

      {loadedDbcs.length > 0 && (
        <div className="loaded-dbc-list">
          <h4>Loaded DBCs:</h4>
          <ul>
            {loadedDbcs.map((name) => (
              <li key={name} className="dbc-list-item">
                <span>{name}</span>
                <button
                  className="dbc-delete-btn"
                  onClick={() => handleDelete(name)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
