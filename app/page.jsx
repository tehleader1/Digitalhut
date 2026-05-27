"use client"

export default function Home(){

 return (

  <div style={{
   minHeight:"100vh",
   color:"white",
   fontFamily:"Arial",
   padding:"20px"
  }}>

   <h1 style={{
    fontSize:"60px",
    lineHeight:".9"
   }}>
    DigitalHut Observatory
   </h1>

   <p style={{
    fontSize:"22px",
    color:"#cbd5e1"
   }}>
    Clean rebuilt observatory runtime.
   </p>

   <div style={{
    borderRadius:"28px",
    overflow:"hidden",
    marginTop:"30px"
   }}>

    <iframe
     src="https://sketchfab.com/models/2d9f810a6dbd4e7db24f0a2f4e2e9b6d/embed"
     style={{
      width:"100%",
      height:"60vh",
      border:"0"
     }}
     allow="autoplay; fullscreen"
     allowFullScreen
    />

   </div>

  </div>

 )

}
