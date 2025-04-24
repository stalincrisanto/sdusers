import { loadEnv } from "./config/config";
import { getUsersEpmaps } from "./tasks/epmaps/user/getUsersEpmaps";
import { processDepartments } from "./tasks/serviceDesk/department/processDepartments";
import { getDepartments } from "./tasks/serviceDesk/department/getDepartments";
import { updateUsers } from "./tasks/serviceDesk/user/updateUsers";
import { getUsers } from "./tasks/serviceDesk/user/getUsers";
import { logger } from "./utils/logger";
import { getInfoUserEmpams } from "./soapFake";

// AMBIENTE DE DESARROLLO
// Para el cambio a producción, modificar "dev" por "prod"
loadEnv("dev");

export const main = async () => {
  try {
    // PROCESO PARA CREAR/ACTUALIZAR DEPARTAMENTOS
    const departmentsSdp = await getDepartments();
    const usersSdp = await getUsers();
    const usersEpmaps = await getUsersEpmaps(usersSdp);
    await processDepartments(departmentsSdp, usersEpmaps!);
    await updateUsers(usersSdp, usersEpmaps!);
    logger.info("Usuarios actualizados correctamente");
  } catch (error) {
    logger.info(`Ha ocurrido un error al ejecutar el proceso: ${error}`);
  }
};

main();
