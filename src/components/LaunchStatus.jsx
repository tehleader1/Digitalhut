import React,{
  useEffect,
  useState
} from "react"

export default function LaunchStatus(){

  const [status,setStatus] =
    useState(null)

  async function load(){

    try{

      const res =
        await fetch(
          "http://localhost:8787/api/health"
        )

      const json =
        await res.json()

      setStatus(json)

    }
    catch(err){
      console.log(err)
    }

  }

  useEffect(()=>{

    load()

    const timer =
      setInterval(load,5000)

    return ()=>clearInterval(timer)

  },[])

  if(!status) return null

  return(

    <section
      style={{
        margin:"20px",
        padding:"18px",
        borderRadius:"18px",
        background:"#050816",
        border:"1px solid #26334f",
        color:"white",
        display:"flex",
        flexWrap:"wrap",
        gap:"12px"
      }}
    >

      <div style={ok}>
        Frontend Online
      </div>

      <div style={ok}>
        Backend Online
      </div>

      <div style={ok}>
        Time Capsule Active
      </div>

      <div style={pending}>
        Marketplace Initializing
      </div>

      <div style={pending}>
        Discover Mode Pending
      </div>

    </section>

  )

}

const ok = {
  background:"#052e16",
  color:"#22c55e",
  padding:"10px 14px",
  borderRadius:"999px",
  fontWeight:"bold"
}

const pending = {
  background:"#3b0764",
  color:"#c084fc",
  padding:"10px 14px",
  borderRadius:"999px",
  fontWeight:"bold"
}
