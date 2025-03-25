import https from "https";
import axios from "axios";
import { configDev } from "../../config/config";
import { dataForGetDepartments } from "./consts";
import { ResponseSDP, UserEpmap, UserSdp } from "../../utils/types";
import { getInfoUserEmpams } from "../epmaps/epmapsTasks";
import { generateCreateDepartmentsXml } from "./generateXML";

const { SERVICE_DESK_API_URL, API_KEY_SERVICEDESK } = configDev;
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export const getUsers = async () => {
  const inputData = `{
    "list_info": {
        "row_count": "10000",
        "get_total_count": true,
    }
  }`;

  const encodedInputData = encodeURIComponent(inputData);

  const SERVICE_DESK_API_URL_WITH_PARAMS = `${SERVICE_DESK_API_URL}/v3/users?input_data=${encodedInputData}`;

  const responseSdp = await axios.get(`${SERVICE_DESK_API_URL_WITH_PARAMS}`, {
    headers: {
      authtoken: API_KEY_SERVICEDESK,
    },
    httpsAgent,
  });

  const response: ResponseSDP = responseSdp.data;
  const allUsersData = response.users;
  const allUsersEmails: UserSdp[] = allUsersData
    .map(({ id, email_id, name }) => ({
      id,
      email_id,
      name,
    }))
    .filter(({ email_id }) => email_id);
  return allUsersEmails;
};

export const updateUsers = async (usersSdp: UserSdp[]) => {
  try {
    const promises = usersSdp.map(({ id, email_id }) => {
      if (email_id) {
        return getInfoUserEmpams(email_id).then(async (userFromEpmap) => {
          const responseUpdate = await axios.put(
            `${SERVICE_DESK_API_URL}/v3/users/${id}`,
            new URLSearchParams({
              input_data: JSON.stringify({
                user: {
                  ...(userFromEpmap?.ZTPLANS && {
                    jobtitle: userFromEpmap.ZTPLANS,
                  }),
                  ...(userFromEpmap?.ZTORGEH && {
                    department: {
                      name: userFromEpmap.ZTORGEH
                    },
                  })
                },
              }),
            }),
            {
              headers: {
                authtoken: API_KEY_SERVICEDESK,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              httpsAgent,
            }
          );
          return responseUpdate;
        });
      }
      return Promise.resolve();
    });

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  } catch (error) {
    console.log("---------ME ESTA DANDO ERROR EN EL MODIFICAR USUARIOS", error);
    // throw new Error(`${error}`);
  }
};

export const getDepartments = async (): Promise<string[]> => {
  const departmentsResponse = await axios.post(
    `${SERVICE_DESK_API_URL}/cmdb/ci`,
    dataForGetDepartments,
    {
      headers: {
        authtoken: API_KEY_SERVICEDESK,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      httpsAgent,
    }
  );

  const departmentsData =
    departmentsResponse.data.API.response.operation.Details["field-values"]
      .record;

  const departmentsInSdp = departmentsData
    .map((item: any) => item.value.filter((val: any) => val !== "Department"))
    .flat();
  return departmentsInSdp;
};

export const createDepartments = async (
  departmentsSdp: string[],
  usersSdp: UserSdp[]
): Promise<void> => {
  const userEpmapsPromises = usersSdp.map(({ email_id }) =>
    getInfoUserEmpams(email_id!)
  );
  const users = await Promise.all(userEpmapsPromises);

  const departmentsEpmaps = Array.from(
    new Set(users.map((userEpmap) => [userEpmap?.ZTORGEH]).flat())
  );

  const departmentsToCreate = departmentsEpmaps.filter(
    (department) => !departmentsSdp.includes(department!)
  );

  if (departmentsToCreate.length > 0) {
    const INPUT_DATA = generateCreateDepartmentsXml(
      departmentsToCreate as string[]
    );
    const dataForAddDepartments = new URLSearchParams({
      OPERATION_NAME: "add",
      INPUT_DATA,
    });
    await addDepartmentToSdp(dataForAddDepartments);
  }
};

const addDepartmentToSdp = async (dataForAddDepartments: URLSearchParams) => {
  const departmentsAddResponse = await axios.post(
    `${SERVICE_DESK_API_URL}/cmdb/ci`,
    dataForAddDepartments,
    {
      headers: {
        authtoken: API_KEY_SERVICEDESK,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      httpsAgent,
    }
  );
  console.log(
    "departmentsAddResponse",
    departmentsAddResponse.data.API.response.operation.result.statuscode
  );
};
