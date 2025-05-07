// import https from "https";
// import axios from "axios";
// import { logger } from "../../../utils/logger";
// import { dataForGetUsers } from "../consts";

// const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// export const getUsers = async () => {
//     const allUsers: UserSdp[] = [];
//     let startIndex = 1;
//     const batchSize = 10;
//     let totalUsers = 0;
//     let hasMoreUsers = true;

//     try {
//       while (hasMoreUsers) {
//         const inputData = dataForGetUsers(startIndex, batchSize);

//         const encodedInputData = encodeURIComponent(inputData);
//         const url = `${process.env.SERVICE_DESK_API_URL}/v3/users?input_data=${encodedInputData}`;
//         const response = await axios.get(url, {
//           headers: { authtoken: process.env.API_KEY_SERVICEDESK },
//           httpsAgent,
//         });

//         const responseData: ResponseSDP = response.data;

//         logger.info(`INFORMACION DE API EN SDP ${JSON.stringify(response)}`);

//         // Solo en la primera iteración obtenemos el total
//         if (startIndex === 1) {
//           totalUsers = responseData.list_info.total_count;
//           logger.info(`Total de usuarios en SDP: ${totalUsers}`);
//         }

//         // Procesamos los usuarios del batch actual
//         const batchUsers = responseData.users.map(({ id, email_id, name }) => ({
//           id,
//           email_id,
//           name,
//         }));

//         allUsers.push(...batchUsers);

//         // Verificamos si debemos continuar
//         startIndex += batchSize;
//         hasMoreUsers = startIndex <= totalUsers;

//         // Pequeña pausa para evitar saturar la API
//         await new Promise((resolve) => setTimeout(resolve, 3000));
//       }
//       return allUsers;
//     } catch (error) {
//       logger.error(`Error al obtener usuarios: ${error}`);
//       throw new Error("Error al sincronizar usuarios desde Service Desk Plus");
//     }
//   };

import https from "https";
import axios from "axios";
import { logger } from "../../../utils/logger";
import { ResponseSDP, UserSdp } from "../../../utils/types";
import { dataForGetUsers } from "../consts";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// export const getUsers = async (): Promise<UserSdp[]> => {
//   const batchSize = 25; // Tamaño de lote por defecto
//   const delayBetweenBatches = 3000; // Retraso por defecto

//   const allUsers: UserSdp[] = [];
//   const errors: Array<{ batchIndex: number; error: any }> = [];
//   let totalUsers = 0;
//   let startIndex = 1;

//   try {
//     logProcessStart();

//     while (startIndex <= totalUsers || startIndex === 1) {
//       try {
//         const inputData = dataForGetUsers(startIndex, batchSize);
//         const encodedInputData = encodeURIComponent(inputData);
//         const url = `${process.env.SERVICE_DESK_API_URL}/v3/users?input_data=${encodedInputData}`;

//         const response = await axios.get(url, {
//           headers: { authtoken: process.env.API_KEY_SERVICEDESK },
//           httpsAgent,
//         });

//         const responseData: ResponseSDP = response.data;
        
//         logger.info(
//           `PRIMER LOG Respuesta API SDP listInfo: ${JSON.stringify(responseData.list_info)}`
//         );
//         logger.info(
//           `SEGUNDO LOG Respuesta API SDP responseData: ${JSON.stringify(responseData)}`
//         );

//         // Solo en la primera iteración obtenemos el total
//         if (startIndex === 1) {
//           totalUsers = responseData.list_info.total_count;
//           logTotalUsers(totalUsers);
//         }

//         // Procesamos los usuarios del batch actual
//         const batchUsers = responseData.users.map(({ id, email_id, name }) => ({
//           id,
//           email_id,
//           name,
//         }));

//         allUsers.push(...batchUsers);
//         logger.info(`TERCER LOG LUEGO DE AGREGAR EL PRIMER BATCH A LA VARIABLE ${JSON.stringify(allUsers)}`);
//         logBatchProgress(
//           allUsers.length,
//           startIndex + batchSize - 1,
//           totalUsers
//         );

//         // Preparamos la siguiente iteración
//         startIndex += batchSize;

//         // Pequeña pausa para evitar saturar la API
//         if (startIndex <= totalUsers) {
//           await delayWithLog(delayBetweenBatches);
//         }
//       } catch (error) {
//         errors.push({ batchIndex: startIndex, error });
//         logger.error(
//           `Error en lote ${startIndex}-${startIndex + batchSize - 1}: ${
//             error instanceof Error ? error.message : String(error)
//           }`
//         );

//         // Continuamos con el siguiente lote después de un retraso adicional
//         startIndex += batchSize;
//         await delayWithLog(delayBetweenBatches * 2); // Mayor retraso para reintentos
//       }
//     }

//     logProcessResults(allUsers.length, errors.length, errors);
//     return allUsers;
//   } catch (error) {
//     logger.error(
//       `Error general en getUsers: ${
//         error instanceof Error ? error.message : String(error)
//       }`
//     );
//     return [];
//   }
// };

// Helper functions

export const getUsers = async (): Promise<UserSdp[]> => {
  const batchSize = 25;
  const delayBetweenBatches = 3000;

  const allUsers: UserSdp[] = [];
  const errors: Array<{ batchIndex: number; error: any }> = [];
  let totalUsers = 0;
  let currentBatch = 1;
  let hasMoreRows = true;

  try {
    logProcessStart();

    while (hasMoreRows) {
      try {
        const startIndex = (currentBatch - 1) * batchSize;
        logger.info(`➡️ Lote ${currentBatch} | start_index: ${startIndex}`);
        const inputData = dataForGetUsers(startIndex, batchSize);
        const encodedInputData = encodeURIComponent(inputData);
        const url = `${process.env.SERVICE_DESK_API_URL}/v3/users?input_data=${encodedInputData}`;

        const response = await axios.get(url, {
          headers: { authtoken: process.env.API_KEY_SERVICEDESK },
          httpsAgent,
        });

        const responseData: ResponseSDP = response.data;

        // Log solo en la primera iteración
        if (currentBatch === 1) {
          totalUsers = responseData.list_info.total_count;
          logTotalUsers(totalUsers);
        }

        hasMoreRows = responseData.list_info.has_more_rows;

        const batchUsers = responseData.users.map(({ id, email_id, name }) => ({
          id,
          email_id,
          name,
        }));

        allUsers.push(...batchUsers);

        logger.info(`Usuarios agregados en el lote ${currentBatch}: ${batchUsers.length}`);
        logger.info(`Detalles de usuarios del batch ${JSON.stringify(batchUsers)}`);
        // logger.info(`Detalles de usuarios del arreglo de allUsers ${JSON.stringify(allUsers)}`);
        logBatchProgress(allUsers.length, startIndex + batchSize, totalUsers);

        currentBatch++;

        if (hasMoreRows) {
          await delayWithLog(delayBetweenBatches);
        }
      } catch (error) {
        errors.push({ batchIndex: currentBatch, error });
        logger.error(
          `Error en lote ${currentBatch}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        currentBatch++;
        await delayWithLog(delayBetweenBatches * 2);
      }
    }

    logProcessResults(allUsers.length, errors.length, errors);
    return allUsers;
  } catch (error) {
    logger.error(
      `Error general en getUsers: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return [];
  }
};

const logProcessStart = () => {
  logger.info("==============================================================");
  logger.info("======== INICIO PROCESO DE OBTENCIÓN DE USUARIOS SDP ========");
  logger.info("==============================================================");
};

const logTotalUsers = (total: number) => {
  logger.info(`Total de usuarios en SDP: ${total}`);
  logger.info(`Procesando en lotes...`);
};

const logBatchProgress = (
  processed: number,
  current: number,
  total: number
) => {
  logger.info(
    `Obtenidos ${processed} usuarios | Progreso: ${current}/${total} (${Math.round(
      (current / total) * 100
    )}%)`
  );
};

const delayWithLog = async (ms: number) => {
  logger.info(`⏳ Esperando ${ms} ms antes del siguiente lote...`);
  await delay(ms);
};

const logProcessResults = (
  successCount: number,
  errorCount: number,
  errors: Array<{ batchIndex: number; error: any }>
) => {
  logger.info("==============================================================");
  logger.info("================== RESUMEN DE PROCESAMIENTO ==================");
  logger.info(`Total de usuarios obtenidos: ${successCount}`);
  logger.info(`Total de lotes con errores: ${errorCount}`);

  if (errors.length > 0) {
    logger.info("Lotes con errores:");
    errors.forEach(({ batchIndex, error }) => {
      logger.info(
        `- Lote ${batchIndex}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    });
  }
  logger.info("==============================================================");
};
