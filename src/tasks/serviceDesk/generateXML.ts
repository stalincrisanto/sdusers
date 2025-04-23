export const generateCreateDepartmentsXml = (
  departments: { nameToCreate: string; codeToCreate: string }[]
): string => {
  const records = departments
    .map(({ nameToCreate, codeToCreate }) => {
      return `<record><parameter><name>CI Name</name><value>${nameToCreate}</value></parameter><parameter><name>CI Type</name><value>Department</value></parameter><parameter><name>Description</name><value>${codeToCreate}</value></parameter></record>`;
    })
    .join("");

  return `<API version='1.0' locale='en'><records>${records}</records></API>`;
};
