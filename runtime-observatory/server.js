import express from "express"
import { createServer as createViteServer } from "vite"

const app = express()

app.get("/health",(req,res)=>{
  res.status(200).send("OK")
})

async function start(){

  const vite =
    await createViteServer({
      server:{
        middlewareMode:true
      },
      appType:"spa"
    })

  app.use(vite.middlewares)

  app.listen(10000,"0.0.0.0",()=>{
    console.log(
      "Sedans 2.0 Runtime Live"
    )
  })

}

start()
