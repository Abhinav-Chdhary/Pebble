use base64::{prelude::BASE64_STANDARD, Engine as Base64Engine};
use rusqlite::{types::ValueRef, Connection};
use serde_json::{Number, Value};
use std::error::Error;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Open the SQLite database at `db_path`, execute `sql`, and return the rows as a JSON array.
/// Each row becomes a JSON object mapping column names to values. Blobs are base64-encoded.
#[tauri::command]
fn query_sqlite_to_json(db_path: &str, sql: &str) -> Result<String, String> {
    // Use a helper closure to handle the main logic and map errors
    let result = (|| -> Result<String, Box<dyn Error>> {
        // 1. Open the database
        let conn = Connection::open(db_path)?;
        // println!("Database opened");

        // 2. Prepare the statement and capture column names
        let mut stmt = conn.prepare(sql)?;
        // println!("Statement prepared");

        let column_names = stmt
            .column_names()
            .iter()
            .map(|s| s.to_string())
            .collect::<Vec<_>>();

        // 3. Execute the query
        let mut rows = stmt.query([])?;
        let mut results = Vec::new();

        // 4. Iterate over each row
        while let Some(row) = rows.next()? {
            let mut obj = serde_json::Map::new();

            // 5. For each column, inspect its type and convert to serde_json::Value
            for (i, col_name) in column_names.iter().enumerate() {
                let value_ref = row.get_ref(i)?;
                let json_value = match value_ref {
                    ValueRef::Null => Value::Null,
                    ValueRef::Integer(i) => Value::Number(Number::from(i)),
                    ValueRef::Real(f) => {
                        // from_f64 returns Option<Number>
                        Number::from_f64(f)
                            .map(Value::Number)
                            .unwrap_or(Value::Null)
                    }
                    ValueRef::Text(t) => Value::String(String::from_utf8_lossy(t).to_string()),
                    ValueRef::Blob(b) => {
                        // encode binary data as base64 using the imported STANDARD engine
                        Value::String(BASE64_STANDARD.encode(b))
                    }
                };
                obj.insert(col_name.clone(), json_value);
            }

            results.push(Value::Object(obj));
        }

        // 6. Serialize the Vec<Value> into a JSON string
        let json = Value::Array(results);
        Ok(serde_json::to_string(&json)?)
    })();

    result.map_err(|e| e.to_string())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, query_sqlite_to_json])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}