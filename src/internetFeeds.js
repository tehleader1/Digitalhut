export const internetFeeds = {

  sketchfab:[
    {
      title:"Sketchfab Urban Feed",
      description:"Live imported architectural observatory assets",
      url:"https://sketchfab.com"
    }
  ],

  nasa:[
    {
      title:"NASA 3D Feed",
      description:"Space observatory terrain and orbital structures",
      url:"https://nasa3d.arc.nasa.gov"
    }
  ],

  cesium:[
    {
      title:"Cesium Terrain",
      description:"Global streamed terrain observatory rendering",
      url:"https://cesium.com/platform/cesiumjs/"
    }
  ],

  openstreetmap:[
    {
      title:"OpenStreetMap Structures",
      description:"Global geographic structure intelligence",
      url:"https://www.openstreetmap.org"
    }
  ],

  smithsonian:[
    {
      title:"Smithsonian 3D",
      description:"Historical observatory object archives",
      url:"https://3d.si.edu"
    }
  ],

  polypizza:[
    {
      title:"Poly Pizza Assets",
      description:"Open low-poly environment observatory feed",
      url:"https://poly.pizza"
    }
  ]

}

export function getInternetSignals(){

  return Object.values(
    internetFeeds
  ).flat()

}
