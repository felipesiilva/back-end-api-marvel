import express, { Request, Response, NextFunction } from "express";
import axios from "axios";
import cors from "cors";
import md5 from "md5";
import "dotenv/config";

const privateKey = '108386fcbedc12f26fe6de7cefab209e6706ea5b';
const publicKey = '10f55f530df2a7d5b5ee6cd58bdf8d2c';
const apiUrl = "http://gateway.marvel.com/v1/public";

const app = express();

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`started server on PORT:${port} `);
});

app.use(cors());
app.use(express.json());

app.get("/personagem", (req: Request, res: Response, next: NextFunction) => {
  const page: number = Number(req.query.page) - 1; //validar
  const limit: number = Number(req.query.limit); //validar
  const ts = new Date().getTime().toString();
  const hash = md5(ts + privateKey + publicKey);

  axios
    .get(`${apiUrl}/characters`, {
      params: {
        ts: ts,
        apikey: publicKey,
        hash: hash,
        orderBy: "name",
        limit: limit,
        offset: page * limit,
      },
    })
    .then((response) => {
      const personagens: Array<any> = response.data.data.results;
      const nomes: Array<any> = personagens.map((personagem) => {
        return {
          nome: personagem.name,
          id: personagem.id,
        };
      });
      const objRetorno = {
        page: page + 1,
        count: nomes.length,
        totalPages: Math.floor(response.data.data.total / limit + 1),
        personagens: [...nomes],
      };
      res.json(objRetorno);
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).send("Internal error");
    });
});

app.get(
  "/personagem/:id",
  (req: Request, res: Response, next: NextFunction) => {
    const ts = new Date().getTime().toString();
    const hash = md5(ts + privateKey + publicKey);

    const idPersonagem: number = Number(req.params.id);

    axios
      .get(`${apiUrl}/characters/${idPersonagem}`, {
        params: {
          ts: ts,
          apikey: publicKey,
          hash: hash,
        },
      })
      .then((response) => {
        const imagem: string = response.data.data.results[0].thumbnail;
        const nome: string = response.data.data.results[0].name;
        let descricao: string = response.data.data.results[0].description;
        const hqs: any = response.data.data.results[0].comics.items.map(
          (item: { name: any; resourceURI: any }) => {
            return { name: item.name, uri: item.resourceURI };
          }
        );

        if (!descricao) {
          descricao = "Não informado";
        }
        //else if ()

        console.log(hqs);

        return res.json({
          img: imagem,
          nome: nome,
          descricao: descricao,
          hqs: hqs,
        });
      });
  }
);
