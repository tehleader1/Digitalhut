import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <div style={{
      background:"#000",
      color:"#00ff00",
      height:"100vh",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      fontSize:"2rem"
    }}>
      DigitalHut Observatory Online
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
