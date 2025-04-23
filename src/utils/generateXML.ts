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

export const generateUpdateDepartmentsXml = (
  nameToUpdate: string,
  codeToUpdate: string
): string => {
  const xmlForUpdate = `<?xml version='1.0' encoding='UTF-8'?><API version='1.0'><citype><name>Department</name><criterias><criteria><parameter><name compOperator='IS'>CI Name</name><value>${nameToUpdate}</value></parameter></criteria></criterias><newvalue><record><parameter><name>Description</name><value>${codeToUpdate}</value></parameter></record></newvalue></citype></API>`;

  return xmlForUpdate;
};
