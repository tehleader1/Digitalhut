import React,{
  useEffect,
  useState
} from "react"

export default function PWAInstall(){

  const [
    deferredPrompt,
    setDeferredPrompt
  ] = useState(null)

  const [
    installable,
    setInstallable
  ] = useState(false)

  useEffect(()=>{

    const handler = (e)=>{

      e.preventDefault()

      setDeferredPrompt(e)

      setInstallable(true)

    }

    window.addEventListener(
      "beforeinstallprompt",
      handler
    )

    return ()=>{

      window.removeEventListener(
        "beforeinstallprompt",
        handler
      )

    }

  },[])

  async function install(){

    if(deferredPrompt){

      deferredPrompt.prompt()

      await deferredPrompt.userChoice

      setDeferredPrompt(null)

      return

    }

    alert(
`Install DigitalHut manually:

Chrome Menu
→ Add to Home Screen

OR

Chrome Menu
→ Install App`
    )

  }

  return(

    <button
      onClick={install}
      style={{
        marginTop:"20px",
        background:"#22c55e",
        color:"white",
        border:"none",
        borderRadius:"16px",
        padding:"16px 24px",
        fontWeight:"900",
        width:"100%"
      }}
    >

      {

        installable

        ?

        "Install Observatory App"

        :

        "Enable Observatory App Install"

      }

    </button>

  )

}
