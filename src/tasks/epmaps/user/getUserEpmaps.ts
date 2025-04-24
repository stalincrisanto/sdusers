import { createClientAsync, BasicAuthSecurity } from "soap";
import { UserEpmap } from "../../../utils/types";
import { logger } from "../../../utils/logger";

// const EPMAPS_SOAP_URL =
//   "http://srvpiqas.emaapq.local:50000/dir/wsdl?p=ic/35398c31057f3401bc39d197fff37622";
// const EPMAPS_ENDPOINT =
//   "http://srvpiqas.emaapq.local:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BS_INTRANET_QAS&receiverParty=&receiverService=&interface=SI_EstrucOrgEmpleados_Req&interfaceNamespace=urn:epmaps.com:INTRANET:ERP:EstrucOrgEmpleados";
// const EPMAPS_SOAP_USER = "PIQSERVICE";
// const EPMAPS_SOAP_PASSWORD = "PIQEPM@P$2016";

export const getUserEpmaps = async (email: string) => {
  try {
    const client = await createClientAsync(process.env.EPMAPS_SOAP_URL!, {
      endpoint: process.env.EPMAPS_ENDPOINT,
      wsdl_options: {
        auth: {
          username: process.env.EPMAPS_SOAP_USER,
          password: process.env.EPMAPS_SOAP_PASSWORD,
        },
      },
    });
    client.setSecurity(new BasicAuthSecurity(process.env.EPMAPS_SOAP_USER!, process.env.EPMAPS_SOAP_PASSWORD!));

    const args = {
      CORREO_EMPLEADO: email,
    };
    const [response] = await client.SI_EstrucOrgEmpleados_ReqAsync(args);

    const user: UserEpmap = response.DATOS;
    return user;
  } catch (error) {
    logger.error(`ERROR AL OBTENER DATOS DEL SERVICIO SOAP ${error}`);
    throw error;
  }
};
