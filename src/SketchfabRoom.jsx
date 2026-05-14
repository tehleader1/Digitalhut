import React from "react";

export default function SketchfabRoom(){

return(

<div
style={{
width:"100vw",
height:"100vh",
position:"fixed",
inset:0,
background:"#000"
}}
>

<iframe
title="Modern livingroom"
frameBorder="0"
allowFullScreen
mozallowfullscreen="true"
webkitallowfullscreen="true"
allow="autoplay; fullscreen; xr-spatial-tracking"
xr-spatial-tracking="true"
execution-while-out-of-viewport="true"
execution-while-not-rendered="true"
web-share="true"
src="https://sketchfab.com/models/09e790bd5e3f4dab937154f60b233481/embed"
style={{
width:"100%",
height:"100%",
border:"0"
}}
/>

</div>

);

}
