const fallback=[
 {title:"Canada Terrain Observatory",category:"terrain",url:"https://sketchfab.com/search?q=canada%20terrain&type=models"},
 {title:"Tokyo Structure Scan",category:"structures",url:"https://sketchfab.com/search?q=tokyo%20building&type=models"},
 {title:"Moon Planetary Surface",category:"planetary",url:"https://sketchfab.com/search?q=moon%20terrain&type=models"},
 {title:"New York Map Signal",category:"maps",url:"https://sketchfab.com/search?q=new%20york%20map&type=models"},
 {title:"Europe Geographic Layer",category:"geographical",url:"https://sketchfab.com/search?q=europe%20terrain&type=models"}
]
export async function POST(req){
 const {query=""}=await req.json()
 const q=query.toLowerCase()
 const item=fallback.find(x=>x.title.toLowerCase().includes(q)||x.category.includes(q)) || fallback[Math.floor(Math.random()*fallback.length)]
 return Response.json({result:item, ai:`DigitalHut found a ${item.category} observatory signal for ${query||item.title}. This can be used for GLB discovery, saved history, tiered access, and research routing.`})
}
