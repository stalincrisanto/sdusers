export const generateCreateDepartmentsXml = (departments: string[]): string => {
  const records = departments
    .map((department) => {
      return `<record><parameter><name>CI Name</name><value>${department}</value></parameter><parameter><name>CI Type</name><value>Department</value></parameter><parameter><name>Site</name><value>(empty)</value></parameter><parameter><name>Business Impact</name><value>(empty)</value></parameter><parameter><name>Description</name><value>(empty)</value></parameter></record>`;
    })
    .join("");

  return `<API version='1.0' locale='en'><records>${records}</records></API>`;
};
