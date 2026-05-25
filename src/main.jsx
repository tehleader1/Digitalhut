import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <div style={{
      width:"100vw",
      height:"100vh",
      background:"black",
      color:"#00ff00",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      fontSize:"2rem"
    }}>
      DigitalHut Observatory Online
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
