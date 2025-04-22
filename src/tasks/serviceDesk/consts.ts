export const dataForGetDepartments = new URLSearchParams({
  OPERATION_NAME: "read",
  INPUT_DATA:
    '<?xml version="1.0" encoding="UTF-8"?><API version="1.0" locale="en"><citype><name>Department</name><criterias><criteria><parameter><name compOperator="IS">CI Type</name><value>Department</value></parameter></criteria></criterias><returnFields><name>CI Name</name><name>CI Type</name></returnFields><range><startindex>1</startindex><limit>500</limit></range></citype></API>',
});

export const dataForAddDepartments = (inputData: string) => {
  return new URLSearchParams({
    OPERATION_NAME: "add",
    INPUT_DATA: inputData,
  });
};

export const dataForGetUsers = (startIndex: number, batchSize: number) => {
  const inputData = `{
    list_info: {
      start_index: ${startIndex},
      row_count: ${batchSize},
      get_total_count: ${startIndex === 1},
      search_fields: {
        email_id: "*" 
      } 
    },
    fields_required: ["name", "email_id", "department", "jobtitle"]
  }`;
  return inputData;
};
