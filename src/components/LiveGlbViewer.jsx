export default function LiveGlbViewer({ model }){

  if(!model){

    return (

      <div
        style={{
          width:"100%",
          height:"520px",
          background:"#000",
          borderRadius:"28px",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          color:"#94a3b8"
        }}
      >
        No Observatory Signal Loaded
      </div>

    )

  }

  return (

    <iframe
      src={`/viewer.html?model=${model}`}
      style={{
        width:"100%",
        height:"520px",
        border:"none",
        borderRadius:"28px",
        background:"#000"
      }}
      allow="camera;gyroscope;accelerometer;xr-spatial-tracking"
    />

  )

}
