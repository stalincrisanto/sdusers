import https from "https";
import axios from "axios";
import { UserEpmapWithEmail } from "../../../utils/types";
import { logger } from "../../../utils/logger";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES = 3000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

interface UpdateResultSuccess {
  success: true;
  id: string;
  response: any;
}

interface UpdateResultFailure {
  success: false;
  id: string;
  email_id?: string;
  error: any;
  payload?: any;
}

type UpdateResult = UpdateResultSuccess | UpdateResultFailure;

export const updateUsers2 = async (usersEpmaps: UserEpmapWithEmail[]) => {
  const totalUsers = usersEpmaps.length;

  logger.info("==============================================================");
  logger.info("========== INICIO PROCESO DE ACTUALIZACION USUARIOS ==========");
  logger.info("==============================================================");

  await processAllBatches(usersEpmaps, totalUsers);

  logger.info(
    "=============== FIN DEL PROCESO DE ACTUALIZACIÓN ==============="
  );
};

const processAllBatches = async (
  usersEpmaps: UserEpmapWithEmail[],
  totalUsers: number
) => {
  let processed = 0;
  let successCount = 0;
  let errorCount = 0;
  const errorDetails: UpdateResultFailure[] = [];

  while (processed < totalUsers) {
    const batch = usersEpmaps.slice(processed, processed + BATCH_SIZE);

    logger.info(
      `📦 Procesando lote ${
        Math.ceil(processed / BATCH_SIZE) + 1
      } de ${Math.ceil(totalUsers / BATCH_SIZE)}`
    );

    const batchResults = await processBatch(batch);

    batchResults.forEach((result) => {
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
        errorDetails.push(result);
      }
    });

    processed += batch.length;

    if (processed < totalUsers) {
      logger.info(
        `⏳ Esperando ${DELAY_BETWEEN_BATCHES} ms para el próximo lote...`
      );
      await delay(DELAY_BETWEEN_BATCHES);
    }

    logSummary({ totalUsers, successCount, errorCount, errorDetails });
  }
};

const processBatch = async (
  batchUsers: UserEpmapWithEmail[]
): Promise<UpdateResult[]> => {
  const results: UpdateResult[] = [];

  for (const user of batchUsers) {
    logger.info(`👤 Procesando usuario: ${user.USER_ID}`);
    const result = await updateSingleUser(user);
    results.push(result);
  }

  return results;
};

const updateSingleUser = async (
  user: UserEpmapWithEmail
): Promise<UpdateResult> => {
  let attempt = 0;
  let lastError: any = null;

  while (attempt < MAX_RETRIES) {
    try {
      logger.info(
        `🔄 Intento ${attempt + 1} - ID: ${user.USER_ID}, Email: ${user.EMAIL}`
      );

      const response = await axios.put(
        `${process.env.SERVICE_DESK_API_URL}/v3/users/${user.USER_ID}`,
        new URLSearchParams({
          input_data: JSON.stringify({
            user: {
              ...(user.ZTPLANS && { jobtitle: user.ZTPLANS }),
              ...(user.ZTORGEH && { department: { name: user.ZTORGEH } }),
              ...(user?.N_EMPLEADO && {
                user_udf_fields: {
                  udf_sline_1501: user.N_EMPLEADO,
                },
              }),
              ...(user.CORREO_JF && {
                reporting_to: {
                  email_id: user.CORREO_JF.toLowerCase(),
                },
              }),
            },
          }),
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

      logger.info(`✅ Actualización exitosa para ID ${user.USER_ID}`);
      return { success: true, id: user.USER_ID, response: response.data };
    } catch (error: any) {
      attempt++;
      lastError = error;

      const errorMessage =
        error?.response?.data ||
        error?.message ||
        "Error desconocido sin mensaje";

      logger.warn(
        `⚠️ Error intento ${attempt} para ID ${user.USER_ID} (${user.EMAIL}): ${errorMessage}`
      );

      if (attempt < MAX_RETRIES) {
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
        logger.warn(`🔁 Reintentando en ${retryDelay} ms...`);
        await delay(retryDelay);
      }
    }
  }

  logger.error(
    `❌ Fallo persistente al actualizar ID ${user.USER_ID} (${user.EMAIL})`
  );
  return {
    success: false,
    id: user.USER_ID,
    error: lastError,
    payload: user,
    email_id: user.EMAIL,
  };
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const logSummary = ({
  totalUsers,
  successCount,
  errorCount,
  errorDetails,
}: {
  totalUsers: number;
  successCount: number;
  errorCount: number;
  errorDetails: UpdateResultFailure[];
}) => {
  logger.info("============= RESUMEN DE ACTUALIZACIÓN =============");
  logger.info(`📊 Total procesados: ${totalUsers}`);
  logger.info(`✅ Éxitos: ${successCount}`);
  logger.info(`❌ Fallos: ${errorCount}`);

  if (errorDetails.length > 0) {
    logger.error("========== DETALLES DE LOS ERRORES ==========");
    errorDetails.slice(0, 10).forEach((err, i) => {
      logger.error(
        `${i + 1}. ID: ${err.id} | Email: ${err.email_id || "desconocido"}\n` +
          `🧾 Payload: ${JSON.stringify(err.payload, null, 2)}\n` //+
        // `💥 Error: ${
        //   JSON.stringify(err.error?.response?.data || err.error?.message || err.error)
        // }`
      );
    });

    if (errorDetails.length > 10) {
      logger.info(`... y ${errorDetails.length - 10} errores más.`);
    }
  }

  if (errorCount === 0) {
    logger.info("🎉 TODOS los usuarios fueron actualizados correctamente");
  }
};
