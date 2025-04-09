import { createClientAsync, BasicAuthSecurity } from "soap";
import { UserEpmap } from "../../utils/types";
import { logger } from "../../utils/logger";

const SOAP_URL =
  "http://srvpiqas.emaapq.local:50000/dir/wsdl?p=ic/35398c31057f3401bc39d197fff37622";
const ENDPOINT =
  "http://srvpiqas.emaapq.local:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BS_INTRANET_QAS&receiverParty=&receiverService=&interface=SI_EstrucOrgEmpleados_Req&interfaceNamespace=urn:epmaps.com:INTRANET:ERP:EstrucOrgEmpleados";
const SOAP_USER = "PIQSERVICE";
const SOAP_PASSWORD = "PIQEPM@P$2016";

export const getInfoUserEmpams = async (email: string) => {
  try {
    const client = await createClientAsync(SOAP_URL, {
      endpoint: ENDPOINT,
      wsdl_options: {
        auth: {
          username: SOAP_USER,
          password: SOAP_PASSWORD,
        },
      },
    });
    client.setSecurity(new BasicAuthSecurity(SOAP_USER, SOAP_PASSWORD));

    const args = {
      CORREO_EMPLEADO: email,
    };
    const [response] = await client.SI_EstrucOrgEmpleados_ReqAsync(args);

    const user: UserEpmap = response.DATOS;
    // logger.info(
    //   `EMPLEADO OBTENIDO CON ÉXITO ${JSON.stringify(response.DATOS)}`
    // );
    return user;
  } catch (error) {
    logger.error(`ERROR AL OBTENER DATOS DEL SERVICIO SOAP ${error}`);
    throw error;
  }
};
