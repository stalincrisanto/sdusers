import https from "https";
import axios from "axios";
import qs from "qs";

const URL_API = "https://localhost:8080/api/cmdb/ci";
const API_KEY_SERVICEDESK = "2A61B73F-5C50-4C45-B022-B6471454E007";

let data = qs.stringify({
  OPERATION_NAME: "read",
  INPUT_DATA:
    '<?xml version="1.0" encoding="UTF-8"?><API version="1.0" locale="en"><citype><name>Department</name><criterias><criteria><parameter><name compOperator="IS">CI Type</name><value>Department</value></parameter></criteria></criterias><returnFields><name>CI Name</name><name>CI Type</name></returnFields><range><startindex>1</startindex><limit>50</limit></range></citype></API>',
});

export const departmentsProcess = async () => {
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
  const result = departmentsData.map((item: any) =>
    item.value.filter((val: any) => val !== "Department")
  ).flat();
//   console.log(
//     "deparments--->",
//     departmentsResponse.data.API.response.operation.Details["field-values"]
//       .record
//   );
console.log("------->", result);
};

// import https from "https";
// const axios = require('axios');
// const qs = require('qs');
// let data = qs.stringify({
//   'OPERATION_NAME': 'read',
//   'INPUT_DATA': '<?xml version="1.0" encoding="UTF-8"?>\n<API version="1.0" locale="en">\n    <citype>\n        <name>Department</name>\n        <criterias>\n            <criteria>\n                <parameter>\n                    <name compOperator="IS">CI Type</name>\n                    <value>Department</value>\n                </parameter>\n            </criteria>\n        </criterias>\n        <returnFields>\n            <name>CI Name</name>\n            <name>CI Type</name>\n        </returnFields>\n        <!-- If the total number pages is 100, we can give the navigation from 50 to 50 -->\n        <range>\n            <startindex>1</startindex>\n            <limit>50</limit>\n        </range>\n    </citype>\n</API>'
// });

// export const departmentsProcess = async () => {

//     const httpsAgent = new https.Agent({ rejectUnauthorized: false });
//     let config = {
//       method: 'post',
//       maxBodyLength: Infinity,
//       url: 'https://localhost:8080/api/cmdb/ci',
//       headers: {
//         'authtoken': '2A61B73F-5C50-4C45-B022-B6471454E007',
//         'Content-Type': 'application/x-www-form-urlencoded',
//         'Cookie': 'SDPSESSIONID=78844DF28540C56B0AB7EBEAB345F3F9; _zcsr_tmp=f7e96108-9edd-4922-8663-fd2507e09fac; sdpcsrfcookie=f7e96108-9edd-4922-8663-fd2507e09fac'
//       },
//       httpsAgent,
//       data : data
//     };

//     axios.request(config)
//     .then((response: any) => {
//       console.log(JSON.stringify(response.data));
//     })
//     .catch((error: any) => {
//       console.log(error);
//     });

// }
