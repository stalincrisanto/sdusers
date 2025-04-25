import https from "https";
import axios from "axios";
import {
  UserEpmapWithEmail,
  UserSdp,
  UserSdpComplete,
} from "../../../utils/types";
import { logger } from "../../../utils/logger";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export const updateUsers = async (
  usersSdp: UserSdp[],
  usersEpmaps: UserEpmapWithEmail[]
) => {
  try {
    logger.info(
      `ESTOY EN LA FUNCION PARA MODIFICAR usuarios epmaps tamano ${usersEpmaps.length}`
    );
    logger.info(
      `PARA VERIFICAR QUE TODOS LOS DE EPMAPS TIENEN CORREO Y ESTAN CON ID ${JSON.stringify(
        usersEpmaps
      )}`
    );
    const BATCH_SIZE = 10;
    const DELAY_BETWEEN_BATCHES = 3000;
    const MAX_RETRIES = 3;
    const INITIAL_RETRY_DELAY = 1000;

    const updateSingleUser = async (user: UserEpmapWithEmail) => {
      const userPayload = {
        user: {
          ...(user.ZTPLANS && { jobtitle: user.ZTPLANS }),
          ...(user?.ZTORGEH && {
            department: { name: user.ZTORGEH },
          }),
          ...(user?.N_EMPLEADO && {
            user_udf_fields: {
              udf_sline_1501: user.N_EMPLEADO,
            },
          }),
        },
      };

      let attempt = 0;
      let lastError: any = null;

      while (attempt < MAX_RETRIES) {
        try {
          logger.info(
            `🔄 Intento ${attempt + 1} para usuario ID ${user.USER_ID}`
          );
          logger.info(`📧 Email: ${user.EMAIL}`);
          logger.info(`📦 Payload:\n${JSON.stringify(userPayload, null, 2)}`);

          const response = await axios.put(
            `${process.env.SERVICE_DESK_API_URL}/v3/users/${user.USER_ID}`,
            new URLSearchParams({
              input_data: JSON.stringify(userPayload),
            }),
            {
              headers: {
                authtoken: process.env.API_KEY_SERVICEDESK,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              httpsAgent,
              timeout: 10000,
            }
          );
          logger.info(`✅ RESPUESTA DE LA API (${JSON.stringify(response)})`);
          logger.info(
            `✅ Usuario actualizado: ID ${user.USER_ID} (${user.EMAIL})`
          );
          return { success: true, id: user.USER_ID, response: response.data };
        } catch (error: any) {
          lastError = error;
          attempt++;

          const errorMessage =
            error?.response?.data ||
            error?.message ||
            "Error desconocido sin mensaje";

          logger.warn(
            `⚠️ Fallo intento ${attempt} para usuario ID ${user.USER_ID} (${user.EMAIL}): ${errorMessage}`
          );

          if (attempt < MAX_RETRIES) {
            const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
            logger.warn(`⏱️ Reintentando en ${delay} ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      logger.error(
        `❌ Fallo persistente al actualizar usuario ID ${user.USER_ID} (${user.EMAIL})`
      );
      return {
        success: false,
        id: user.USER_ID,
        error: lastError,
        payload: userPayload,
        email_id: user.EMAIL,
      };
    };

    const processBatch = async (batch: UserEpmapWithEmail[]) => {
      const results = [];
      for (const user of batch) {
        results.push(await updateSingleUser(user));
      }
      return results;
    };

    // PROCESAMIENTO POR LOTES
    const totalUsers = usersEpmaps.length;
    let processed = 0;
    let successCount = 0;
    let errorCount = 0;
    const errorDetails: {
      id: string;
      email_id?: string;
      error: any;
      payload?: any;
    }[] = [];

    logger.info(
      "==================== INICIO PROCESO ACTUALIZACIÓN USUARIOS ===================="
    );

    while (processed < totalUsers) {
      const batch = usersEpmaps.slice(processed, processed + BATCH_SIZE);
      logger.info(
        `🚀 Procesando lote ${
          Math.ceil(processed / BATCH_SIZE) + 1
        } de ${Math.ceil(totalUsers / BATCH_SIZE)}`
      );

      const batchResults = await processBatch(batch);

      batchResults.forEach((result) => {
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          if (result.error) {
            errorDetails.push({
              id: result.id,
              email_id: result.email_id,
              error: result.error,
              payload: result.payload,
            });
          }
        }
      });

      processed += batch.length;

      if (processed < totalUsers) {
        logger.info(
          `⏳ Esperando ${DELAY_BETWEEN_BATCHES} ms antes del siguiente lote...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_BATCHES)
        );
      }
    }

    logger.info(
      "============= RESUMEN DE ACTUALIZACIÓN DE USUARIOS ============="
    );
    logger.info(`Total intentados: ${totalUsers}`);
    logger.info(`✅ Éxitos: ${successCount}`);
    logger.info(`❌ Fallos: ${errorCount}`);

    if (errorDetails.length > 0) {
      logger.error("========== DETALLES DE LOS ERRORES ==========");
      errorDetails.slice(0, 10).forEach((err, i) => {
        logger.error(
          `${i + 1}. ID: ${err.id} | Email: ${
            err.email_id || "desconocido"
          }\n` +
            `🧾 Payload: ${JSON.stringify(err.payload, null, 2)}\n` +
            `💥 Error: ${
              err.error?.response?.data || err.error?.message || err.error
            }`
        );
      });
      if (errorDetails.length > 10) {
        logger.info(`... y ${errorDetails.length - 10} errores más.`);
      }
    }

    if (errorCount === 0) {
      logger.info("🎉 TODOS los usuarios fueron actualizados correctamente");
    }
  } catch (error) {
    logger.error("🚨 ERROR CRÍTICO EN EL PROCESO DE ACTUALIZACIÓN DE USUARIOS");
    logger.error(`🧨 Detalles: ${error}`);
    throw error;
  }
};
