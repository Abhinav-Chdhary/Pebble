import { useState } from "react";
// Tauri
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
// Backend
import { updateSetting } from "../../../backend/handlers/settings";
// Styles
import style from "./style";

const RightPane = () => {
    const [dbPath, setDbPath] = useState("");
    const [query, setQuery] = useState<string>("");
  
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
        await updateSetting("dbPath", selected);
      }
    }
  
    // Run the SQL query via your Rust command
    async function runQuery() {
      if (!dbPath) {
        console.warn("No database selected");
        return;
      }
      if (!query.trim()) {
        console.warn("Query is empty");
        return;
      }
  
      try {
        // invoke the Rust command you defined (`query_sqlite_to_json`)
        const result: string = await invoke("query_sqlite_to_json", {
          dbPath,
          sql: query,
        });
        console.log("Query result JSON:", result);
      } catch (err) {
        console.error("Failed to run query:", err);
      }
    }

    return (
        <div style={style.compWrap}>
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

            {/* SQL query input */}
            <div className="row" style={{ marginTop: 16 }}>
                <textarea
                    id="sql-query-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Write your SQL query here..."
                    rows={6}
                    style={{ width: "100%", fontFamily: "monospace" }}
                />
            </div>

            {/* Run button */}
            <div className="row" style={{ marginTop: 8 }}>
                <button type="button" onClick={runQuery}>
                    Run
                </button>
            </div>
        </div>
    );
};

export default RightPane;