// import { getInfoUserEmpams } from "../../../soapFake";
// import { logger } from "../../../utils/logger";
// import { UserEpmap, UserEpmapWithEmail, UserSdp } from "../../../utils/types";
// import { getUserEpmaps } from "./getUserEpmaps";

// const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// export const getUsersEpmaps = async (
//   usersSdp: UserSdp[]
// ): Promise<UserEpmapWithEmail[] | null> => {
//   const BATCH_SIZE = 5; // Puedes ajustar esto según rendimiento/pruebas
//   const users: (UserEpmap | null)[] = [];
//   const usersWithFailed: string[] = [];
//   let userFailed: number = 0;

//   try {
//     for (let i = 0; i < usersSdp.length; i += BATCH_SIZE) {
//       const batch = usersSdp.slice(i, i + BATCH_SIZE);

//       const batchPromises = batch.map(async ({ email_id, id }) => {
//         try {
//           const userInfo = await withTimeout(getUserEpmaps(email_id!), 10000); // 5s
//           if (!userInfo) {
//             logger.error(`Usuario con email: ${email_id} NO ENCONTRADO`);
//             userFailed ++;
//             usersWithFailed.push(email_id!)
//             return null;
//           }
//           // Agregar el email al objeto devuelto por getInfoUserEmpams
//           return  { ...userInfo, EMAIL: email_id, USER_ID: id };
//         } catch (err) {
//           return null;
//         }
//       });

//       const batchResults = await Promise.all(batchPromises);
//       // Filtra los null antes de agregarlos al array final
//       const validResults = batchResults.filter(result => result !== null);
//       users.push(...validResults);

//       logger.info(`Se han procesado ${validResults.length} usuarios desde EPMAPS`);

//       // Optional: agregar pequeño delay para dar respiro al servidor SOAP
//       // AQUI AL PARECER HAY UNA LENTITUD EN ALGUN LADO
//       await delay(5000); // 200ms entre lotes
//     }

//     // TODO: agregar un log aparte con los correos sin respuesta
//     logger.info(`Total de usuarios obtenidos desde EPMAPS ${users.length}`);
//     logger.info(`Total de registros sin respuesta de EPMAPS ${userFailed}`);
//     logger.info(`Total de usuarios errores obtenidos desde EPMAPS ${usersWithFailed.length}`);
//     logger.info(`Total de usuarios errores obtenidos desde EPMAPS ${usersWithFailed}`);

//     return users.filter((user) => user !== null) as UserEpmapWithEmail[];
//   } catch (error) {
//     logger.error(`Se ha producido un error ${error}`);
//     return null;
//   }
// };

// const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
//   return new Promise((resolve, reject) => {
//     const timeoutId = setTimeout(() => {
//       reject(new Error(`Timeout de ${ms}ms alcanzado`));
//     }, ms);

//     promise
//       .then((res) => {
//         clearTimeout(timeoutId);
//         resolve(res);
//       })
//       .catch((err) => {
//         clearTimeout(timeoutId);
//         reject(err);
//       });
//   });
// };

import { getUserEpmaps } from "./getUserEpmaps";
import { logger } from "../../../utils/logger";
import { UserEpmapWithEmail, UserSdp } from "../../../utils/types";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const getUsersEpmaps = async (
  usersSdp: UserSdp[]
): Promise<UserEpmapWithEmail[] | null> => {
  const BATCH_SIZE = 5; // Lotes de usuarios a procesar
  const DELAY_BETWEEN_BATCHES = 3000; // Espera entre lotes
  const users: UserEpmapWithEmail[] = [];
  const usersWithFailed: string[] = [];
  let userFailed: number = 0;

  try {
    logger.info(
      "=============================================================="
    );
    logger.info(
      "========== INICIO PROCESO DE OBTENCIÓN DE USUARIOS =========="
    );
    logger.info(
      "=============================================================="
    );

    // Procesamos los usuarios en lotes
    for (let i = 0; i < usersSdp.length; i += BATCH_SIZE) {
      const batch = usersSdp.slice(i, i + BATCH_SIZE); // Lote de usuarios

      // Procesamos cada usuario en el lote
      const batchResults = await processBatch(batch);
      const validResults = batchResults.filter((result) => result !== null);

      // Agregamos los resultados válidos al array final
      users.push(...validResults);

      logger.info(
        `Se han procesado ${validResults.length} usuarios desde EPMAPS`
      );

      // Esperamos antes de procesar el siguiente lote
      if (i + BATCH_SIZE < usersSdp.length) {
        logger.info(
          `⏳ Esperando ${DELAY_BETWEEN_BATCHES} ms antes del siguiente lote...`
        );
        await delay(DELAY_BETWEEN_BATCHES); // Retraso entre lotes
      }
    }

    // Resumen de resultados
    logger.info(`Total de usuarios obtenidos desde EPMAPS: ${users.length}`);
    logger.info(`Total de registros sin respuesta de EPMAPS: ${userFailed}`);
    logger.info(`Total de usuarios con errores: ${usersWithFailed.length}`);
    logger.info(`Usuarios con errores: ${usersWithFailed}`);

    return users; // Retornamos los usuarios obtenidos
  } catch (error) {
    logger.error(`Se ha producido un error: ${error}`);
    return null; // En caso de error, retornamos null
  }
};

// Función que procesa un lote de usuarios
const processBatch = async (
  batch: UserSdp[]
): Promise<(UserEpmapWithEmail | null)[]> => {
  const batchResults = await Promise.all(
    batch.map(async ({ email_id, id }) => {
      try {
        const userInfo = await getUserEpmaps(email_id!); // Llamada a la API de EPMAPS
        if (!userInfo) {
          logger.error(`Usuario con email: ${email_id} NO ENCONTRADO`);
          return null; // Si no se encuentra usuario, retornamos null
        }
        // Agregar el email y ID al objeto de usuario
        return { ...userInfo, EMAIL: email_id, USER_ID: id };
      } catch (err) {
        logger.error(
          `Error al obtener el usuario con email: ${email_id}, error: ${err}`
        );
        return null; // En caso de error, retornamos null
      }
    })
  );
  return batchResults; // Retornamos los resultados del lote
};
