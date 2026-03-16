import { useState } from "preact/hooks";
import "./DBCMenu.css";
import { dbcManager } from "../../../backend/dbc/DBCManager";

export function DBCMenu() {
  const [status, setStatus] = useState("");
  const [loadedDbcs, setLoadedDbcs] = useState<string[]>(dbcManager.getLoadedFileNames());
  const [dragActive, setDragActive] = useState(false);

  function processContents(fileName: string, text: string) {
    dbcManager.loadDBCFromString(text, fileName);

    setStatus(`Loaded: ${fileName}`);
    setLoadedDbcs(dbcManager.getLoadedFileNames());
    dbcManager.printSummary();
  }

  async function processFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".dbc")) {
      setStatus("Please select a valid .dbc file.");
      return;
    }

    try {
      setStatus("Loading DBC...");
      const text = await file.text();
      processContents(file.name, text);
    } catch (err) {
      console.error(err);
      setStatus("Failed to load DBC file.");
    }
  }

  async function handleDesktopFileSelect() {
    if (!window.electronAPI) {
      document.getElementById("dbcHiddenInput")?.click();
      return;
    }

    try {
      setStatus("Opening DBC dialog...");
      const selectedFile = await window.electronAPI.files.openDBCFile();
      if (!selectedFile) {
        setStatus("DBC open canceled.");
        return;
      }

      if (!selectedFile.name.toLowerCase().endsWith(".dbc")) {
        setStatus("Please select a valid .dbc file.");
        return;
      }

      setStatus("Loading DBC...");
      processContents(selectedFile.name, selectedFile.contents);
    } catch (err) {
      console.error(err);
      setStatus("Failed to open DBC file.");
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
        onClick={handleDesktopFileSelect}
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
