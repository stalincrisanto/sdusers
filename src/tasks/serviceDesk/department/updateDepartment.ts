// import axios from "axios";
// import https from "https";
// import { logger } from "../../../utils/logger";
// import { generateUpdateDepartmentsXml } from "../../../utils/generateXML";

// const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// // Función para esperar una cantidad de milisegundos
// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// export const updateDepartment = async (
//   departmentsToUpdate: {
//     nameToUpdate: string;
//     codeToUpdate: string;
//   }[]
// ) => {
//   const batchSize = 10;
//   const delayBetweenBatches = 2000;
//   for (let i = 0; i < departmentsToUpdate.length; i += batchSize) {
//     const batch = departmentsToUpdate.slice(i, i + batchSize);

//     const promises = batch.map(({ nameToUpdate, codeToUpdate }) => {
//       const INPUT_DATA = generateUpdateDepartmentsXml(
//         nameToUpdate,
//         codeToUpdate
//       );
//       const dataForUpdateDepartments = new URLSearchParams({
//         OPERATION_NAME: "update",
//         INPUT_DATA,
//       });

//       return updateDepartmentToSdp(dataForUpdateDepartments);
//     });

//     const results = await Promise.allSettled(promises);

//     results.forEach((result, index) => {
//       if (result.status === "rejected") {
//         logger.error(`Error en batch [${i + index}]: ${result.reason}`);
//       }
//     });

//     // Esperar antes de procesar el siguiente batch (excepto en el último)
//     if (i + batchSize < departmentsToUpdate.length) {
//       await sleep(delayBetweenBatches);
//     }
//   }
// };

// export const updateDepartmentToSdp = async (
//   dataForUpdateDepartments: URLSearchParams
// ) => {
//   try {
//     await axios.post(
//       `${process.env.SERVICE_DESK_API_URL}/cmdb/ci`,
//       dataForUpdateDepartments,
//       {
//         headers: {
//           authtoken: process.env.API_KEY_SERVICEDESK,
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         httpsAgent,
//       }
//     );
//   } catch (error) {
//     throw new Error(`Fallo al actualizar: ${error}`);
//   }
// };

import axios from "axios";
import https from "https";
import { logger } from "../../../utils/logger";
import { generateUpdateDepartmentsXml } from "../../../utils/generateXML";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const updateDepartment = async (
  departmentsToUpdate: {
    nameToUpdate: string;
    codeToUpdate: string;
  }[]
) => {
  const BATCH_SIZE = 5;
  const DELAY_BETWEEN_BATCHES = 3000;
  const MAX_RETRIES = 1;
  const INITIAL_RETRY_DELAY = 1000;

  let processed = 0;
  let successCount = 0;
  let errorCount = 0;
  const errorDetails: {
    nameToUpdate: string;
    codeToUpdate: string;
    error: any;
    requestXml: string;
    attempt: number;
  }[] = [];

  logger.info("=====================================================================");
  logger.info("================ INICIO ACTUALIZACIÓN DE DEPARTAMENTOS ================");
  logger.info("=====================================================================");

  while (processed < departmentsToUpdate.length) {
    const batch = departmentsToUpdate.slice(processed, processed + BATCH_SIZE);
    logger.info(
      `📦 Procesando lote ${Math.ceil(processed / BATCH_SIZE) + 1} de ${Math.ceil(
        departmentsToUpdate.length / BATCH_SIZE
      )}`
    );

    for (const { nameToUpdate, codeToUpdate } of batch) {
      logger.info(`➡️ Procesando: ${nameToUpdate} (${codeToUpdate})`);

      const INPUT_DATA = generateUpdateDepartmentsXml(nameToUpdate, codeToUpdate);
      const dataForUpdateDepartments = new URLSearchParams({
        OPERATION_NAME: "update",
        INPUT_DATA,
      });

      let attempt = 0;
      let success = false;
      let lastError: any = null;

      while (attempt < MAX_RETRIES && !success) {
        try {
          logger.info(`🔁 Intento ${attempt + 1} - Enviando solicitud POST`);
          await axios.post(
            `${process.env.SERVICE_DESK_API_URL}/cmdb/ci`,
            dataForUpdateDepartments,
            {
              headers: {
                authtoken: process.env.API_KEY_SERVICEDESK,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              httpsAgent,
              timeout: 10000,
            }
          );
          logger.info(`✅ Actualización exitosa: ${nameToUpdate}`);
          success = true;
          successCount++;
        } catch (error: any) {
          lastError = error;
          attempt++;

          const responseData =
            error?.response?.data || error?.message || "Sin mensaje";

          logger.warn(
            `⚠️ Error al intentar actualizar "${nameToUpdate}" (intento ${attempt}): ${responseData}`
          );

          if (attempt < MAX_RETRIES) {
            const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
            logger.warn(`⏱️ Esperando ${delay} ms antes de reintentar...`);
            await sleep(delay);
          }
        }
      }

      if (!success) {
        logger.error(`❌ Fallo persistente al actualizar: ${nameToUpdate} (${codeToUpdate})`);
        errorCount++;
        errorDetails.push({
          nameToUpdate,
          codeToUpdate,
          error: lastError,
          requestXml: INPUT_DATA,
          attempt,
        });
      }
    }

    processed += batch.length;

    if (processed < departmentsToUpdate.length) {
      logger.info(`⏳ Esperando ${DELAY_BETWEEN_BATCHES} ms antes del siguiente lote...`);
      await sleep(DELAY_BETWEEN_BATCHES);
    }
  }

  logger.info("==================== RESUMEN DE ACTUALIZACIÓN ====================");
  logger.info(`📋 Total procesados: ${departmentsToUpdate.length}`);
  logger.info(`✅ Éxitos: ${successCount}`);
  logger.info(`❌ Errores: ${errorCount}`);

  if (errorDetails.length > 0) {
    logger.info("==================== DETALLES DE ERRORES ====================");
    errorDetails.forEach((err, i) => {
      logger.error(
        `${i + 1}. ${err.nameToUpdate} (${err.codeToUpdate})\n` +
        `➡️ Intentos: ${err.attempt}\n` +
        `🛑 Error: ${err.error?.response?.data || err.error?.message || err.error}\n` +
        `📄 XML enviado:\n${err.requestXml}\n`
      );
    });
  }

  if (errorCount === 0) {
    logger.info("🎉 TODOS los departamentos fueron actualizados exitosamente");
  }
};
