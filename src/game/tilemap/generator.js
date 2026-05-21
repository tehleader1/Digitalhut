export function generateSection(section,w,h){

  const props=[]

  if(section===1){

    for(let i=0;i<8;i++){

      props.push({

        type:"car",

        x:120+i*180,

        y:140+(i%4)*180
      })
    }
  }

  if(section===2){

    for(let i=0;i<18;i++){

      props.push({

        type:"wreck",

        x:80+i*90,

        y:100+(i%5)*120
      })
    }
  }

  if(section===3){

    for(let i=0;i<12;i++){

      props.push({

        type:"building",

        x:150+i*140,

        y:60+(i%3)*220
      })
    }
  }

  if(section===4){

    for(let i=0;i<6;i++){

      props.push({

        type:"cliff",

        x:220+i*180,

        y:120+(i%2)*260
      })
    }
  }

  return props
}
