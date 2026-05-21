import React, {useEffect, useRef, useState} from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function Game(){
  const canvasRef = useRef(null);
  const [ui,setUi]=useState({hp:100,souls:0,wave:1,army:0,msg:"Raise the fallen."});

  useEffect(()=>{
    const c=canvasRef.current, ctx=c.getContext("2d");
    let W,H,raf,last=0;
    const resize=()=>{W=c.width=innerWidth*devicePixelRatio;H=c.height=innerHeight*devicePixelRatio;c.style.width=innerWidth+"px";c.style.height=innerHeight+"px";ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)};
    resize(); addEventListener("resize",resize);

    const player={x:innerWidth/2,y:innerHeight/2,hp:100,souls:0,wave:1,cool:0,spell:0};
    let undead=[], enemies=[], fx=[], traps=[], pickups=[];
    let joy={on:false,x:80,y:innerHeight-110,dx:0,dy:0};
    let t=0, spawn=0, waveClock=0;

    const rnd=(a,b)=>a+Math.random()*(b-a);
    const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const addFx=(x,y,text)=>fx.push({x,y,text,life:70});

    function spawnEnemy(){
      const side=Math.floor(Math.random()*4);
      const e={x:side===0?-20:side===1?innerWidth+20:rnd(0,innerWidth),y:side===2?-20:side===3?innerHeight+20:rnd(0,innerHeight),hp:30+player.wave*8,speed:rnd(.45,.9)+player.wave*.04,type:Math.random()<.15?"priest":"guard"};
      enemies.push(e);
    }

    function raise(e){
      undead.push({x:e.x,y:e.y,hp:45,ang:rnd(0,6.28),bite:0});
      player.souls++;
      addFx(e.x,e.y,"RISE");
    }

    function sacrifice(){
      if(!undead.length)return;
      const u=undead.pop();
      addFx(u.x,u.y,"BLOOD NOVA");
      enemies.forEach(e=>{ if(dist(u,e)<150)e.hp-=80; });
      fx.push({x:u.x,y:u.y,text:"✹",life:30,big:true});
    }

    function surprise(){
      const r=Math.random();
      if(r<.33){ pickups.push({x:rnd(40,innerWidth-40),y:rnd(70,innerHeight-170),type:"heal"}); addFx(player.x,player.y,"HEALTH RELIC"); }
      else if(r<.66){ traps.push({x:rnd(40,innerWidth-40),y:rnd(70,innerHeight-170),r:45,life:500}); addFx(player.x,player.y,"BONE TRAP"); }
      else { for(let i=0;i<8;i++) spawnEnemy(); addFx(player.x,player.y,"AMBUSH!"); }
    }

    function step(ts){
      const dt=Math.min(32,ts-last||16); last=ts; t+=dt; spawn+=dt; waveClock+=dt;
      ctx.fillStyle="#08070b"; ctx.fillRect(0,0,innerWidth,innerHeight);

      player.x+=joy.dx*3.2; player.y+=joy.dy*3.2;
      player.x=Math.max(20,Math.min(innerWidth-20,player.x));
      player.y=Math.max(40,Math.min(innerHeight-150,player.y));

      if(spawn>650){spawn=0;spawnEnemy();}
      if(waveClock>28000){waveClock=0;player.wave++;surprise();}

      traps.forEach(tr=>{tr.life--; ctx.strokeStyle="#6d28d9"; ctx.beginPath();ctx.arc(tr.x,tr.y,tr.r,0,7);ctx.stroke(); enemies.forEach(e=>{if(dist(tr,e)<tr.r)e.hp-=.25})});
      traps=traps.filter(x=>x.life>0);

      enemies.forEach(e=>{
        let target=undead.find(u=>dist(u,e)<110)||player;
        const a=Math.atan2(target.y-e.y,target.x-e.x);
        e.x+=Math.cos(a)*e.speed; e.y+=Math.sin(a)*e.speed;
        if(dist(e,player)<18){player.hp-=.08; addFx(player.x,player.y,"-");}
      });

      undead.forEach((u,i)=>{
        let e=enemies.reduce((p,n)=>!p||dist(u,n)<dist(u,p)?n:p,null);
        if(e){
          const a=Math.atan2(e.y-u.y,e.x-u.x);
          u.x+=Math.cos(a)*1.45; u.y+=Math.sin(a)*1.45;
          if(dist(u,e)<18){e.hp-=.55; u.bite=8;}
        } else {
          u.ang+=.03; u.x+=((player.x+Math.cos(u.ang+i)*55)-u.x)*.025; u.y+=((player.y+Math.sin(u.ang+i)*55)-u.y)*.025;
        }
      });

      enemies.filter(e=>e.hp<=0).forEach(raise);
      enemies=enemies.filter(e=>e.hp>0);

      pickups.forEach(p=>{
        ctx.fillStyle="#22c55e"; ctx.fillRect(p.x-8,p.y-8,16,16);
        if(dist(p,player)<24){player.hp=Math.min(100,player.hp+30);p.gone=true;addFx(player.x,player.y,"HEAL");}
      });
      pickups=pickups.filter(p=>!p.gone);

      undead.forEach(u=>{ctx.fillStyle="#22c55e";ctx.fillRect(u.x-6,u.y-6,12,12);});
      enemies.forEach(e=>{ctx.fillStyle=e.type==="priest"?"#facc15":"#ef4444";ctx.fillRect(e.x-7,e.y-7,14,14);});
      ctx.fillStyle="#a855f7";ctx.fillRect(player.x-10,player.y-10,20,20);

      fx.forEach(f=>{f.life--;ctx.globalAlpha=Math.max(0,f.life/70);ctx.fillStyle=f.big?"#9333ea":"#fff";ctx.font=f.big?"34px monospace":"16px monospace";ctx.fillText(f.text,f.x,f.y-=.4);ctx.globalAlpha=1;});
      fx=fx.filter(f=>f.life>0);

      ctx.strokeStyle="#ffffff55";ctx.beginPath();ctx.arc(joy.x,joy.y,48,0,7);ctx.stroke();ctx.beginPath();ctx.arc(joy.x+joy.dx*32,joy.y+joy.dy*32,20,0,7);ctx.stroke();

      setUi({hp:Math.floor(player.hp),souls:player.souls,wave:player.wave,army:undead.length,msg:player.hp<=0?"You fell. Refresh to rerun.":"Necromancer run active."});
      if(player.hp>0) raf=requestAnimationFrame(step);
    }

    function touch(e){
      const p=e.touches[0]; if(!p)return;
      const x=p.clientX,y=p.clientY;
      if(x<170&&y>innerHeight-220){joy.on=true;let dx=(x-joy.x)/45,dy=(y-joy.y)/45;let m=Math.hypot(dx,dy)||1;joy.dx=Math.max(-1,Math.min(1,dx/m));joy.dy=Math.max(-1,Math.min(1,dy/m));}
    }
    const end=()=>{joy.on=false;joy.dx=joy.dy=0};
    addEventListener("touchstart",touch);addEventListener("touchmove",touch);addEventListener("touchend",end);
    addEventListener("keydown",e=>{if(e.code==="Space")sacrifice()});
    c.onclick=e=>{ if(e.clientX>innerWidth-170 && e.clientY>innerHeight-170) sacrifice(); };

    raf=requestAnimationFrame(step);
    return()=>{cancelAnimationFrame(raf);removeEventListener("resize",resize)};
  },[]);

  return <><canvas ref={canvasRef}/><div className="hud">HP {ui.hp} | Souls {ui.souls} | Army {ui.army} | Wave {ui.wave}<br/>{ui.msg}</div><button className="spell">Sacrifice</button></>
}

createRoot(document.getElementById("root")).render(<Game/>);
