import https from "https";
import axios from "axios";
import { configDev, configProd } from "../../config/config";
import { dataForGetDepartments } from "./consts";
import { ResponseSDP, UserEpmap, UserSdp } from "../../utils/types";
import { getInfoUserEmpams } from "../epmaps/epmapsTasks";
import { generateCreateDepartmentsXml } from "./generateXML";
import { logger } from "../../utils/logger";

const { SERVICE_DESK_API_URL, API_KEY_SERVICEDESK } = configProd;
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export const getUsers = async () => {
  const allUsers: UserSdp[] = [];
  let startIndex = 1;
  const batchSize = 100;
  let totalUsers = 0;
  let hasMoreUsers = true;

  try {
    while (hasMoreUsers) {
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

      const encodedInputData = encodeURIComponent(inputData);
      const url = `${SERVICE_DESK_API_URL}/v3/users?input_data=${encodedInputData}`;
      const response = await axios.get(url, {
        headers: { authtoken: API_KEY_SERVICEDESK },
        httpsAgent,
      });

      const responseData: ResponseSDP = response.data;

      // Solo en la primera iteración obtenemos el total
      if (startIndex === 1) {
        totalUsers = responseData.list_info.total_count;
        logger.info(`Total de usuarios en SDP: ${totalUsers}`);
      }

      // Procesamos los usuarios del batch actual
      const batchUsers = responseData.users.map(({ id, email_id, name }) => ({
        id,
        email_id,
        name,
      }));

      allUsers.push(...batchUsers);

      // Verificamos si debemos continuar
      startIndex += batchSize;
      hasMoreUsers = startIndex <= totalUsers;

      // Pequeña pausa para evitar saturar la API
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    logger.info(`Total de usuarios obtenidos: ${allUsers.length}`);
    return allUsers;
  } catch (error) {
    logger.error(`Error al obtener usuarios: ${error}`);
    throw new Error("Error al sincronizar usuarios desde Service Desk Plus");
  }
};

// export const updateUsers = async (
//   usersSdp: UserSdp[],
//   usersEpmaps: UserEpmap[]
// ) => {
//   try {



//     const promises = usersSdp.map(({ id, email_id }) => {
//       if (email_id) {
//         return getInfoUserEmpams(email_id).then(async (userFromEpmap) => {
//           const responseUpdate = await axios.put(
//             `${SERVICE_DESK_API_URL}/v3/users/${id}`,
//             new URLSearchParams({
//               input_data: JSON.stringify({
//                 user: {
//                   ...(userFromEpmap?.ZTPLANS && {
//                     jobtitle: userFromEpmap.ZTPLANS,
//                   }),
//                   ...(userFromEpmap?.ZTORGEH && {
//                     department: {
//                       name: userFromEpmap.ZTORGEH,
//                     },
//                   }),
//                 },
//               }),
//             }),
//             {
//               headers: {
//                 authtoken: API_KEY_SERVICEDESK,
//                 "Content-Type": "application/x-www-form-urlencoded",
//               },
//               httpsAgent,
//             }
//           );
//           return responseUpdate;
//         });
//       }
//       return Promise.resolve();
//     });

//     if (promises.length > 0) {
//       await Promise.all(promises);
//       logger.info("====================Usuarios modificados=================");
//     }
//   } catch (error) {
//     logger.error(`ERROR AL MODIFICAR EL USUARIO`);
//     throw new Error(`${error}`);
//   }
// };


// export const updateUsers = async (
//   usersSdp: UserSdp[],
//   usersEpmaps: UserEpmap[]
// ) => {
//   try {
//     const limit = pLimit(10); // máximo 10 peticiones a la vez

//     const tasks = usersSdp.map(({ id, email_id }) =>
//       limit(async () => {
//         if (!email_id) return;

//         const userFromEpmap = usersEpmaps.find(
//           (user) => user.EMAIL?.toLowerCase() === email_id.toLowerCase()
//         );

//         if (!userFromEpmap) return;

//         const responseUpdate = await axios.put(
//           `${SERVICE_DESK_API_URL}/v3/users/${id}`,
//           new URLSearchParams({
//             input_data: JSON.stringify({
//               user: {
//                 ...(userFromEpmap.ZTPLANS && {
//                   jobtitle: userFromEpmap.ZTPLANS,
//                 }),
//                 ...(userFromEpmap.ZTORGEH && {
//                   department: {
//                     name: userFromEpmap.ZTORGEH,
//                   },
//                 }),
//               },
//             }),
//           }),
//           {
//             headers: {
//               authtoken: API_KEY_SERVICEDESK,
//               "Content-Type": "application/x-www-form-urlencoded",
//             },
//             httpsAgent,
//           }
//         );

//         return responseUpdate;
//       })
//     );

//     await Promise.all(tasks);
//     logger.info("===========Usuarios modificados===========");
//   } catch (error) {
//     logger.error("ERROR AL MODIFICAR EL USUARIO");
//     throw new Error(`${error}`);
//   }
// };


export const getDepartments = async (): Promise<string[]> => {
  try {
    const response = await axios.post(
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

    const { data } = response;

    // Verificar si la respuesta es exitosa (status code 200)
    const statusCode = data.API.response.operation.result.statuscode;
    const message = data.API.response.operation.result.message;
    if (statusCode !== 200) {
      logger.error(`Error: Received status code ${statusCode} - ${message}`);
      return [];
    }

    const departmentsData =
      data.API.response.operation.Details["field-values"]?.record;
    if (!departmentsData) {
      logger.error("No departments data found");
      return [];
    }

    const departmentsInSdp = departmentsData
      .map((item: any) => item.value)
      .flat()
      .filter((val: any) => val !== "Department");

    return departmentsInSdp;
  } catch (error) {
    logger.error(`Error fetching departments: ${error}`);
    return [];
  }
};

// export const createDepartments = async (
//   departmentsSdp: string[],
//   usersSdp: UserSdp[]
// ): Promise<void> => {
//   try {
//     const userEpmapsPromises = usersSdp.map(({ email_id }) =>
//       getInfoUserEmpams(email_id!)
//     );
//     const users = await Promise.all(userEpmapsPromises);

//     const departmentsEpmaps = Array.from(
//       new Set(users.map((userEpmap) => [userEpmap?.ZTORGEH]).flat())
//     ).filter((department) => department !== undefined);

//     const departmentsToCreate = departmentsEpmaps.filter(
//       (department) => !departmentsSdp.includes(department!)
//     );

//     if (departmentsToCreate.length > 0) {
//       const INPUT_DATA = generateCreateDepartmentsXml(
//         departmentsToCreate as string[]
//       );
//       const dataForAddDepartments = new URLSearchParams({
//         OPERATION_NAME: "add",
//         INPUT_DATA,
//       });
//       await addDepartmentToSdp(dataForAddDepartments);
//     }
//   } catch (error) {
//     logger.error(`Se ha producido un error ${error}`);
//   }
// };

export const addDepartmentToSdp = async (
  dataForAddDepartments: URLSearchParams
) => {
  try {
    await axios.post(`${SERVICE_DESK_API_URL}/cmdb/ci`, dataForAddDepartments, {
      headers: {
        authtoken: API_KEY_SERVICEDESK,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      httpsAgent,
    });
    logger.info("Se han actualizado los departamentos correctamente");
  } catch (error) {
    logger.error(
      `Se ha producido un error al guardar los departamentos: ${error}`
    );
  }
};
