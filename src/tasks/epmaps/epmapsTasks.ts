import { createClientAsync } from "soap";
import { UserEpmap } from "../../utils/types";

const SOAP_URL = "http://localhost:3001/soap?wsdl";

export const getInfoUserEmpams = async (email: string) => {
  try {
    const client = await createClientAsync(SOAP_URL);
    const args = {
      CORREO_EMPLEADO: email,
    };
    const response = await client.MT_EstrucOrgEmpleados_ReqAsync(args);

    const user: UserEpmap = response[0].DATOS;
    console.log("response en api soap", response[0].DATOS);
    return user;
  } catch (error) {
    console.log("error en la api de epmaps", error);
  }
};