import https from "https";
import axios from "axios";

const URL_API = "https://localhost:8080/api/cmdb/ci";
const API_KEY_SERVICEDESK = "A2C6B0D6-CE8F-4D22-A61D-7A0C81954266";

const data = new URLSearchParams({
  OPERATION_NAME: "read",
  INPUT_DATA:
    '<?xml version="1.0" encoding="UTF-8"?><API version="1.0" locale="en"><citype><name>Department</name><criterias><criteria><parameter><name compOperator="IS">CI Type</name><value>Department</value></parameter></criteria></criterias><returnFields><name>CI Name</name><name>CI Type</name></returnFields><range><startindex>1</startindex><limit>50</limit></range></citype></API>',
});

export const departmentsProcess = async (): Promise<string[]> => {
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });

  const departmentsResponse = await axios.post(URL_API, data, {
    headers: {
      authtoken: API_KEY_SERVICEDESK,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    httpsAgent,
  });

  const departmentsData =
    departmentsResponse.data.API.response.operation.Details["field-values"]
      .record;
  const departmentsInSdp = departmentsData
    .map((item: any) => item.value.filter((val: any) => val !== "Department"))
    .flat();
  //   console.log(
  //     "deparments--->",
  //     departmentsResponse.data.API.response.operation.Details["field-values"]
  //       .record
  //   );
  console.log("------->", departmentsInSdp);
  return departmentsInSdp;
};

export const createDepartments = async (name: string): Promise<void> => {
  console.log("name---->", name);
}
