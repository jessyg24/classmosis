/**
 * Parse a CSV file and extract student names.
 * Handles common roster formats from Google Classroom, Clever, Aeries, PowerSchool, and manual exports.
 */
export function parseStudentCsv(text: string): { names: string[]; error: string | null } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) {
    return { names: [], error: "CSV must have a header row and at least one student." };
  }

  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());

  // Try to find the best column(s) for student names
  const nameCol = findColumn(header, [
    "name", "student name", "student", "full name",
    "display name", "display_name", "displayname",
  ]);

  const firstNameCol = findColumn(header, [
    "first name", "first_name", "firstname", "given name", "given_name",
  ]);

  const lastNameCol = findColumn(header, [
    "last name", "last_name", "lastname", "family name", "family_name", "surname",
  ]);

  if (nameCol === -1 && (firstNameCol === -1 || lastNameCol === -1)) {
    if (header.length === 1) {
      const names = lines.slice(1)
        .map((line) => parseCsvLine(line)[0]?.trim())
        .filter((n): n is string => !!n && n.length > 0);
      return { names, error: null };
    }
    return {
      names: [],
      error: `Could not find a name column. Expected: "Name", "Student Name", "Full Name", or "First Name" + "Last Name". Found: ${header.join(", ")}`,
    };
  }

  const names: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    let name = "";
    if (nameCol !== -1) {
      name = (cols[nameCol] || "").trim();
    } else if (firstNameCol !== -1 && lastNameCol !== -1) {
      const first = (cols[firstNameCol] || "").trim();
      const last = (cols[lastNameCol] || "").trim();
      name = `${first} ${last}`.trim();
    }
    if (name) names.push(name);
  }

  if (names.length === 0) {
    return { names: [], error: "No student names found in the CSV." };
  }
  return { names, error: null };
}

function findColumn(header: string[], candidates: string[]): number {
  for (const candidate of candidates) {
    const idx = header.indexOf(candidate);
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
