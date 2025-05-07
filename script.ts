// import { dataUserForDebbug } from "./example2";
import { deparmentsTest } from './example3'

// const emailCounts = new Map<string, number>();

// for (const user of dataUserForDebbug) {
//     emailCounts.set(user.email_id, (emailCounts.get(user.email_id) || 0) + 1);
//   }
  
//   // Filtrar los duplicados
//   const duplicates = dataUserForDebbug.filter(user => (emailCounts.get(user.email_id) || 0) > 1);
  
//   console.log("Usuarios con email duplicado:", duplicates);

const findDuplicates = (array: string[]): string[] => {
  const frequency: { [key: string]: number } = {};
  const duplicates: string[] = [];

  array.forEach(item => {
    if (frequency[item]) {
      duplicates.push(item);
    } else {
      frequency[item] = 1;
    }
  });

  return duplicates;
};

const duplicatedDepartments = findDuplicates(deparmentsTest);
console.log("Elementos duplicados:", duplicatedDepartments);