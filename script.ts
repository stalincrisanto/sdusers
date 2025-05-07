import { dataUserForDebbug } from "./example2";

const emailCounts = new Map<string, number>();

for (const user of dataUserForDebbug) {
    emailCounts.set(user.email_id, (emailCounts.get(user.email_id) || 0) + 1);
  }
  
  // Filtrar los duplicados
  const duplicates = dataUserForDebbug.filter(user => (emailCounts.get(user.email_id) || 0) > 1);
  
  console.log("Usuarios con email duplicado:", duplicates);