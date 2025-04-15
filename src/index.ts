import { createDepartments } from "./tasks/serviceDesk/createDepartments";
import {
  getDepartments,
  getUsers
} from "./tasks/serviceDesk/serviceDeskTasks";
import { updateUsers } from "./tasks/serviceDesk/updateUsers";
import { logger } from "./utils/logger";

export const main = async () => {
  try {
    const departmentsSdp = await getDepartments();
    logger.info(`CANTIDAD DE DEPARTAMENTOS: ${departmentsSdp.length}`);
    const usersSdp = await getUsers();
    const usersEpmaps = await createDepartments(departmentsSdp, usersSdp);
    logger.info(`Departamentos actualizados correctamente`);
    await updateUsers(usersSdp, usersEpmaps!);
    logger.info("Usuarios actualizados correctamente");
  } catch (error) {
    logger.info(`Ha ocurrido un error al ejecutar el proceso: ${error}`);
  }
};

main();
