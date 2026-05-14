const fs=require("fs");

const files=fs.readFileSync("asset-report/all-assets.txt","utf8")
.split("\n")
.filter(Boolean);

const groups={
  exteriors:[],
  interiors:[],
  kitchen:[],
  gaming:[],
  couchFurniture:[],
  businessBuildings:[],
  blendOnly:[]
};

for(const f of files){
  const low=f.toLowerCase();

  if(low.includes("building") || low.includes("house") || low.includes("bambo")){
    groups.exteriors.push(f);
  }

  if(low.includes("room") || low.includes("interior") || low.includes("scene")){
    groups.interiors.push(f);
  }

  if(low.includes("kitchen")){
    groups.kitchen.push(f);
  }

  if(low.includes("gaming")){
    groups.gaming.push(f);
  }

  if(low.includes("couch")){
    groups.couchFurniture.push(f);
  }

  if(low.includes("office") || low.includes("business")){
    groups.businessBuildings.push(f);
  }

  if(low.endsWith(".blend")){
    groups.blendOnly.push(f);
  }
}

for(const [name,list] of Object.entries(groups)){
  console.log("\n### "+name.toUpperCase());
  list.forEach(x=>console.log(x));
}
