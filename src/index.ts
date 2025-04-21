import { loadEnv } from "./config/config";
import { createDepartments } from "./tasks/serviceDesk/createDepartments";
import { getDepartments, getUsers } from "./tasks/serviceDesk/serviceDeskTasks";
import { updateUsers } from "./tasks/serviceDesk/updateUsers";
import { logger } from "./utils/logger";

// AMBIENTE DE DESARROLLO
// Para el cambio a producción, modificar "dev" por "prod"
loadEnv("dev");

export const main = async () => {
  try {
    const departmentsSdp = await getDepartments();
    const usersSdp = await getUsers();
    const usersEpmaps = await createDepartments(departmentsSdp, usersSdp);
    logger.info(`Departamentos actualizados correctamente`);
    await updateUsers(usersSdp, usersEpmaps!);
    logger.info("Usuarios actualizados correctamente");
    setTimeout(() => {}, 3000);
  } catch (error) {
    logger.info(`Ha ocurrido un error al ejecutar el proceso: ${error}`);
  }
};

main();
