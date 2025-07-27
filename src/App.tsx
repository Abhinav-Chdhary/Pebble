import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
// Styles
import "./App.css";

function App() {
  const [dbPath, setDbPath] = useState("");

  // Select a database file
  async function selectDbFile() {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: "Database",
          extensions: ["db", "sqlite", "sqlite3"],
        },
      ],
    });
    if (typeof selected === "string") {
      setDbPath(selected);
    }
  }

  return (
    <main className="container">
      {/* Title */}
      <h1>Welcome to Pebble</h1>

      {/* Database file selection */}
      <div className="row">
        <input
          id="db-path-input"
          value={dbPath}
          placeholder="Select a database file..."
          readOnly
        />
        <button type="button" onClick={selectDbFile}>
          Select File
        </button>
      </div>
    </main>
  );
}

export default App;
