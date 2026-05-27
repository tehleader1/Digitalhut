export const metadata = {
title:"DigitalHut Observatory"
}

export default function RootLayout({children}){

return (

<html>

<head>

<script
dangerouslySetInnerHTML={{
__html:`
var script=document.createElement("script");
script.src="https://dashboard.searchatlas.com/scripts/dynamic_optimization.js";
script.dataset.uuid="fb51dd0f-e06f-457d-b7e5-952e02bdda6a";
document.head.appendChild(script);
`
}}
/>

</head>

<body>{children}</body>

</html>

)

}
