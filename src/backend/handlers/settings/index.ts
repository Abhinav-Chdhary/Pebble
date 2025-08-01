import { db } from "../../index";

// Update or insert a setting
export const updateSetting = async (flag: string, value: string) => {
  await db.execute(
    "INSERT OR REPLACE INTO settings (flag, value) VALUES (?, ?)",
    [flag, value]
  );
};

// Get a setting
export const getSetting = async (flag: string) => {
  const rows = await db.select<{ value: string }[]>(
    "SELECT value FROM settings WHERE flag = ?",
    [flag]
  );
  return rows.length > 0 ? rows[0].value : null;
};
