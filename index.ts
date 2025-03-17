//TODO: probar creando más de 10 usuarios la respuesta de todos los usuarios
import express from "express";
import type { Request, Response } from "express";
import axios from "axios";
import https from "https";
import type { ResponseSD } from "./types";

const app = express();
const PORT = 3000;

const URL_API = "https://localhost:8080/api/v3/users";
const API_KEY_SERVICEDESK = "39E103FE-9155-4956-83C8-351AA4AE1A60";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

app.get("/usuarios", async (req: Request, res: Response) => {
  try {
    // const input_data = {
    //   list_info: {
    //     sort_field: "name",
    //     start_index: 1,
    //     sort_order: "asc",
    //     row_count: 25,
    //     get_total_count: true,
    //   },
    //   fields_required: [
    //     "name",
    //     "email_id",
    //     "employee_id",
    //     "first_name",
    //     "middle_name",
    //     "last_name",
    //     "ciid",
    //   ],
    // };

    const response = await axios.get(URL_API, {
      headers: {
        authtoken: API_KEY_SERVICEDESK,
      },
      httpsAgent,
    });
    const fullResponse: ResponseSD = response.data;
    const users = fullResponse.users.map(({ name, last_name, email_id }) => ({
      name,
      last_name,
      email_id,
    }));
    res.json(users);
  } catch (error) {
    res.status(500).send(`Error al obtener los usuarios ${error}`);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
