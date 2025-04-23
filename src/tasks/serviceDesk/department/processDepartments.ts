import https from "https";
import axios from "axios";
import { logger } from "../../../utils/logger";
import { UserEpmapWithEmail } from "../../../utils/types";
import { createDepartment } from "./addDepartments";

export const processDepartments = async (
  departmentsSdp: string[],
  usersEpmaps: UserEpmapWithEmail[]
): Promise<void> => {
  try {
    // 1. Filtramos departamentos SAP válidos y eliminamos duplicados
    const uniqueSapDepartments = Array.from(
      new Map(
        usersEpmaps
          .filter(({ ZTORGEH }) => ZTORGEH !== undefined) // Ignoramos valores vacíos
          .map(({ ZTORGEH, ZORGEH }) => [
            ZTORGEH, // Clave única: nombre del departamento
            {
              department: ZTORGEH,
              nameInSdp: `${ZTORGEH} [${ZORGEH}]`, // Nombre + código para SDP
              departmentCode: ZORGEH,
            },
          ])
      ).values()
    );

    // 2. Separamos departamentos para crear o actualizar
    const departmentsToCreate: {
      nameToCreate: string;
      codeToCreate: string;
    }[] = [];
    const departmentsToUpdate: { oldName: string; newName: string }[] = [];

    uniqueSapDepartments.forEach((sapDepartment) => {
      const existsInSdp = departmentsSdp.includes(sapDepartment.department);

      if (!existsInSdp) {
        // Crear nuevo departamento (nombre + código)
        departmentsToCreate.push({
          nameToCreate: sapDepartment.department,
          codeToCreate: sapDepartment.departmentCode,
        });
      }
    });

    if (departmentsToCreate.length > 0) {
      createDepartment(departmentsToCreate)
      logger.info(`Se han agregado ${departmentsToCreate.length} departamentos`);
    }

  } catch (error) {
    logger.error(`Se ha producido un error ${error}`);
    return;
  }
};

// export const addDepartmentToSdp = async (
//   dataForAddDepartments: URLSearchParams
// ) => {
//   try {
//     await axios.post(
//       `${process.env.SERVICE_DESK_API_URL}/cmdb/ci`,
//       dataForAddDepartments,
//       {
//         headers: {
//           authtoken: process.env.API_KEY_SERVICEDESK,
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         httpsAgent,
//       }
//     );
//     logger.info("Se han actualizado los departamentos correctamente");
//   } catch (error) {
//     logger.error(
//       `Se ha producido un error al guardar los departamentos: ${error}`
//     );
//   }
// };
