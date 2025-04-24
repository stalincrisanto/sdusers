import https from "https";
import axios from "axios";
import { logger } from "../../../utils/logger";
import { UserEpmapWithEmail } from "../../../utils/types";
import { createDepartment } from "./addDepartments";
import { updateDepartment } from "./updateDepartment";

export const processDepartments = async (
  departmentsSdp: string[],
  usersEpmaps: UserEpmapWithEmail[]
): Promise<void> => {
  try {
    // 1. Filtramos departamentos SAP válidos y eliminamos duplicados
    const uniqueSapDepartments = Array.from(
      new Map(
        usersEpmaps
          .filter(({ ZTORGEH }) => ZTORGEH !== undefined) // Filtro por usuarios que no estén con departamentos
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
    const departmentsToUpdate: { nameToUpdate: string; codeToUpdate: string }[] = [];

    uniqueSapDepartments.forEach((sapDepartment) => {
      const existsInSdp = departmentsSdp.includes(sapDepartment.department);

      if (!existsInSdp) {
        // Crear nuevo departamento (nombre + código)
        departmentsToCreate.push({
          nameToCreate: sapDepartment.department,
          codeToCreate: sapDepartment.departmentCode,
        });
      }
      departmentsToUpdate.push({
        nameToUpdate: sapDepartment.department,
        codeToUpdate: sapDepartment.departmentCode
      })
    });

    if (departmentsToCreate.length > 0) {
      createDepartment(departmentsToCreate);
      logger.info(
        `Se han agregado ${departmentsToCreate.length} departamentos`
      );
    }

    if(departmentsToUpdate.length > 0){
      //PROCESO PARA HACER EL UPDATE
      updateDepartment(departmentsToUpdate);
      logger.info(`Se han actualizado los departamentos correctament`);
    }
  } catch (error) {
    logger.error(`Se ha producido un error ${error}`);
    return;
  }
};

