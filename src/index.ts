import { loadEnv } from "./config/config";
import { getUsersEpmaps } from "./tasks/epmaps/user/getUsersEpmaps";
import { processDepartments } from "./tasks/serviceDesk/department/processDepartments";
import { getDepartments } from "./tasks/serviceDesk/department/getDepartments";
import {
  updateUsers,
  updateUsers2,
} from "./tasks/serviceDesk/user/updateUsers";
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
    logger.info(`=========================USUARIOS DESDE SDP ${JSON.stringify(usersSdp)}`);
    const usersEpmaps = await getUsersEpmaps(usersSdp);
    logger.info(`=========================USUARIOS DESDE EPAMPS ${JSON.stringify(usersEpmaps)}`);
    logger.info(`=========================USUARIOS DESDE EPAMPS ${usersEpmaps?.length}`);
    await processDepartments(departmentsSdp, usersEpmaps!);
    // await updateUsers(usersSdp, usersEpmaps!);
    await updateUsers2(usersEpmaps!);
    logger.info("Usuarios actualizados correctamente");
  } catch (error) {
    logger.info(`Ha ocurrido un error al ejecutar el proceso: ${error}`);
  }
};

main();
