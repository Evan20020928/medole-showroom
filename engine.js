/* MEDOLE 吊隱式除濕機 3D 展示台 — shared engine
   window.SHOWROOM   : {mode:'hub'|'single', models:[id...], links:{id:url}, self:url}
   window.MEDOLE_DATA: {specs:{id:{...}}, common:{...}, options:[...]}
   window.MEDOLE_MODELS: [{id, slug, kind, finish, material, center:{x,d}, footprint:{L,D}, variants?, build(K,v)}] */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const stageEl=document.querySelector('.stage');
if(!window.THREE){stageEl.insertAdjacentHTML('beforeend','<div class="err">3D 引擎載入失敗，請重新整理頁面。</div>');return;}
const T=THREE,MM=0.001,PI=Math.PI;
const CFG=window.SHOWROOM||{mode:'single',models:[]};
const DATA=window.MEDOLE_DATA||{specs:{},common:{},options:[]};
const REG={};(window.MEDOLE_MODELS||[]).forEach(m=>REG[m.id]=m);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- renderer / scene ---------- */
const canvas=$('gl');
const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();
const camera=new T.PerspectiveCamera(30,1,0.05,80);
(function(){
  const env=new T.Scene();
  const room=new T.Mesh(new T.BoxGeometry(12,6,12),new T.MeshBasicMaterial({color:0x2e3536,side:T.BackSide}));room.position.y=2;env.add(room);
  const soft=(w,h,x,y,z,ry,rx,i)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(i,i,i),side:T.DoubleSide}));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);env.add(m);};
  soft(5,2.4,0,4.9,0,0,PI/2,6);soft(3,3,-5.9,2,1.2,PI/2,0,3.4);soft(3,3,5.9,2.5,-1,-PI/2,0,1.7);soft(6,1.2,0,1.3,-5.9,0,0,2.4);soft(6,1.0,0,1.0,5.9,PI,0,1.2);
  const pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromScene(env,0.04).texture;pm.dispose();
})();
const hemi=new T.HemisphereLight(0xffffff,0x8a9394,0.35);scene.add(hemi);
const key=new T.DirectionalLight(0xffffff,1.7);
key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.radius=6;key.shadow.bias=-0.0004;key.shadow.normalBias=0.01;
scene.add(key);scene.add(key.target);
const rim=new T.DirectionalLight(0xdff6f5,0.6);scene.add(rim);

/* ---------- textures ---------- */
function canvasTex(w,h,draw,srgb){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);
  const t=new T.CanvasTexture(c);if(srgb!==false)t.encoding=T.sRGBEncoding;t.anisotropy=8;return t;}
const grain=canvasTex(512,512,(g,w,h)=>{const d=g.createImageData(w,h);for(let i=0;i<d.data.length;i+=4){const v=110+Math.random()*90;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255;}g.putImageData(d,0,0);},false);
grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(5,5);
/* galvanised spangle: jittered-grid Voronoi crystals used as roughness map under the paint */
const spangle=canvasTex(512,512,(g,w,h)=>{
  const N=18,cs=w/N,seeds=[];
  for(let j=0;j<N;j++)for(let i=0;i<N;i++)seeds.push({x:(i+.15+Math.random()*.7)*cs,y:(j+.15+Math.random()*.7)*cs,v:95+Math.random()*80,a:Math.random()*PI,s:.4+Math.random()*.6});
  const S=(i,j)=>seeds[((j+N)%N)*N+((i+N)%N)];const d=g.createImageData(w,h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ci=Math.floor(x/cs),cj=Math.floor(y/cs);let best=1e9,sd=null;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const s=S(ci+di,cj+dj),sx=s.x+(ci+di-((ci+di+N)%N))*cs,sy=s.y+(cj+dj-((cj+dj+N)%N))*cs,dd=(x-sx)**2+(y-sy)**2;if(dd<best){best=dd;sd=s;}}
    const fe=Math.cos(sd.a)*(x/cs)+Math.sin(sd.a)*(y/cs),v=sd.v+Math.sin(fe*9)*8*sd.s+(Math.random()-.5)*14;
    const k=(y*w+x)*4;d.data[k]=d.data[k+1]=d.data[k+2]=Math.max(0,Math.min(255,v));d.data[k+3]=255;}
  g.putImageData(d,0,0);},false);
spangle.wrapS=spangle.wrapT=T.RepeatWrapping;spangle.repeat.set(2.5,2.5);

/* ---------- materials ---------- */
const FINISH={
  black:{body:0x16171a,body2:0x1b1c1f,metal:.62,rough:1,map:spangle,bump:.18},     // 黑色鍍鋅鋼板
  ivory:{body:0xe6e2d6,body2:0xdcd8cb,metal:.12,rough:.62,map:null,bump:.35},      // 米白粉體塗裝
  white:{body:0xeef0ef,body2:0xe2e5e4,metal:.12,rough:.55,map:null,bump:.3}
};
const mat={
  body:new T.MeshStandardMaterial(),body2:new T.MeshStandardMaterial(),
  seam:new T.MeshStandardMaterial({color:0x0b0c0d,roughness:1}),
  plastic:new T.MeshStandardMaterial({color:0x141516,metalness:0,roughness:.35,side:T.DoubleSide}),
  hole:new T.MeshStandardMaterial({color:0x050606,roughness:1,side:T.DoubleSide}),
  teal:new T.MeshStandardMaterial({color:0x5c9aa0,metalness:.05,roughness:.5,side:T.DoubleSide}),
  tealDark:new T.MeshStandardMaterial({color:0x3f6f74,metalness:.05,roughness:.55,side:T.DoubleSide}),
  rubber:new T.MeshStandardMaterial({color:0x101112,roughness:.9}),
  clear:new T.MeshStandardMaterial({color:0xa9d6d8,metalness:0,roughness:.15,transparent:true,opacity:.55,depthWrite:false}),
  steel:new T.MeshStandardMaterial({color:0xb8bec2,metalness:.85,roughness:.35}),
  grey:new T.MeshStandardMaterial({color:0x6d7377,metalness:.3,roughness:.5}),
  warn:new T.MeshStandardMaterial({color:0xf2c230,roughness:.6}),
  plinth:new T.MeshStandardMaterial({color:0xd9dfe0,metalness:.15,roughness:.35}),
  disc:new T.MeshStandardMaterial({color:0xeef2f2,metalness:.1,roughness:.22}),
  tick:new T.MeshStandardMaterial({color:0x9aa6a8,roughness:.6}),
  led:new T.MeshStandardMaterial({color:0x000000,emissive:0x2fb3b6,emissiveIntensity:2.2,roughness:.4})
};
function applyFinish(name){
  const f=FINISH[name]||FINISH.black;
  [['body',f.body],['body2',f.body2]].forEach(([k,c])=>{const m=mat[k];m.color.set(c);m.metalness=f.metal;m.roughness=f.rough;m.roughnessMap=f.map;m.bumpMap=grain;m.bumpScale=f.bump;m.envMapIntensity=1.1;m.needsUpdate=true;});
}

/* ---------- geometry kit (plan mm: x along length, d from back to front, h up) ---------- */
function shade(m){m.castShadow=true;m.receiveShadow=true;return m;}
function makeKit(group,center){
  const CX=x=>x-center.x,CZ=d=>d-center.d,anchors=[],dims=[];
  const add=o=>{group.add(o);return o;};
  const K={anchors,dims,mat,PI,
    /* axis-aligned box, optional rounded vertical edges + bevel */
    box(x0,x1,h0,h1,d0,d1,m,r){
      const L=x1-x0,H=h1-h0,D=d1-d0;let mesh;
      if(r&&L>4*r&&D>4*r&&H>8){
        const b=Math.min(2.5,r/2),s=new T.Shape(),x=(L-2*b)/2,z=(D-2*b)/2,rr=Math.min(r,x,z);
        s.moveTo(-x+rr,-z);s.lineTo(x-rr,-z);s.quadraticCurveTo(x,-z,x,-z+rr);s.lineTo(x,z-rr);s.quadraticCurveTo(x,z,x-rr,z);
        s.lineTo(-x+rr,z);s.quadraticCurveTo(-x,z,-x,z-rr);s.lineTo(-x,-z+rr);s.quadraticCurveTo(-x,-z,-x+rr,-z);
        const g=new T.ExtrudeGeometry(s,{depth:H-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:3,curveSegments:6});
        g.rotateX(-PI/2);g.translate(0,b,0);
        const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
        for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i));uv.setXY(i,(ax>.5?p.getZ(i):p.getX(i))/400,(ay>.5?p.getZ(i):p.getY(i))/400);}
        mesh=new T.Mesh(g,m);mesh.position.set(CX((x0+x1)/2),h0,CZ((d0+d1)/2));
      }else{mesh=new T.Mesh(new T.BoxGeometry(L,H,D),m);mesh.position.set(CX((x0+x1)/2),(h0+h1)/2,CZ((d0+d1)/2));}
      return add(shade(mesh));
    },
    /* frustum between two axis-aligned rectangles on planes d=dA and d=dB: rect=[x0,x1,h0,h1] */
    frustumZ(dA,rA,dB,rB,m){
      const v=[[rA[0],rA[2],dA],[rA[1],rA[2],dA],[rA[1],rA[3],dA],[rA[0],rA[3],dA],[rB[0],rB[2],dB],[rB[1],rB[2],dB],[rB[1],rB[3],dB],[rB[0],rB[3],dB]];
      const F=dB>dA?[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]]:[[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]];
      const pos=[];F.forEach(f=>{[[0,1,2],[0,2,3]].forEach(t=>t.forEach(i=>{const q=v[f[i]];pos.push(CX(q[0]),q[1],CZ(q[2]));}));});
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.computeVertexNormals();
      const uv=[];for(let i=0;i<pos.length/3;i++)uv.push(pos[i*3]/400,pos[i*3+1]/400);g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
      return add(shade(new T.Mesh(g,m)));
    },
    /* frustum along X between planes x=xA and x=xB: rect=[d0,d1,h0,h1] */
    frustumX(xA,rA,xB,rB,m){
      const v=[[xA,rA[2],rA[0]],[xA,rA[2],rA[1]],[xA,rA[3],rA[1]],[xA,rA[3],rA[0]],[xB,rB[2],rB[0]],[xB,rB[2],rB[1]],[xB,rB[3],rB[1]],[xB,rB[3],rB[0]]];
      const F=xB>xA?[[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]]:[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];
      const pos=[];F.forEach(f=>{[[0,1,2],[0,2,3]].forEach(t=>t.forEach(i=>{const q=v[f[i]];pos.push(CX(q[0]),q[1],CZ(q[2]));}));});
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.computeVertexNormals();
      const uv=[];for(let i=0;i<pos.length/3;i++)uv.push(pos[i*3+2]/400,pos[i*3+1]/400);g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
      return add(shade(new T.Mesh(g,m)));
    },
    /* cylinder along an axis ('x','y','z') centred at plan point */
    rod(axis,r,x,h,d,len,m,seg,open){
      const c=new T.Mesh(new T.CylinderGeometry(r,r,len,seg||48,1,!!open),m);
      if(axis==='x')c.rotation.z=PI/2;else if(axis==='z')c.rotation.x=PI/2;
      c.position.set(CX(x),h,CZ(d));return add(shade(c));
    },
    disc(axis,r,x,h,d,m,rotY){const c=new T.Mesh(new T.CircleGeometry(r,64),m);if(axis==='x')c.rotation.y=PI/2;else if(axis==='y')c.rotation.x=-PI/2;if(rotY)c.rotation.y+=rotY;c.position.set(CX(x),h,CZ(d));return add(c);},
    torus(axis,R,t,x,h,d,m){const o=new T.Mesh(new T.TorusGeometry(R,t,10,72),m);if(axis==='x')o.rotation.y=PI/2;else if(axis==='y')o.rotation.x=PI/2;o.position.set(CX(x),h,CZ(d));return add(o);},
    /* lathe profile [[r,s]...] along axis 'z'|'x' with dir ±1 from plan point */
    lathe(axis,dir,x,h,d,prof,m,seg){
      const o=shade(new T.Mesh(new T.LatheGeometry(prof.map(p=>new T.Vector2(p[0],p[1])),seg||72),m));
      if(axis==='z')o.rotation.x=dir>0?PI/2:-PI/2;else if(axis==='x')o.rotation.z=dir>0?-PI/2:PI/2;else if(dir<0)o.rotation.x=PI;
      o.position.set(CX(x),h,CZ(d));return add(o);
    },
    /* round duct collar (風口法蘭): base at face (plan d or x), pointing dir along axis.
       od outer diameter, len total length; plate:[w,h] square/rect mounting flange; flare:true adds tapered root */
    duct(o){
      const ax=o.axis||'z',dir=o.dir||1,R=o.od/2,L=o.len,m=o.m||mat.plastic;
      const at=(s)=>ax==='z'?[o.x,o.h,o.d+dir*s]:[o.x+dir*s,o.h,o.d];
      let s0=0;
      if(o.plate){const pt=o.plateT||3,[pw,ph]=o.plate;
        if(ax==='z')K.box(o.x-pw/2,o.x+pw/2,o.h-ph/2,o.h+ph/2,Math.min(o.d,o.d+dir*pt),Math.max(o.d,o.d+dir*pt),m);
        else K.box(Math.min(o.x,o.x+dir*pt),Math.max(o.x,o.x+dir*pt),o.h-ph/2,o.h+ph/2,o.d-pw/2,o.d+pw/2,m);
        s0=pt;}
      const fl=o.flare?Math.min(o.flareLen||16,L*0.35):0,F=R+(o.flareR||12);
      const prof=[[R-1.6,s0]];
      if(fl){prof.push([F,s0],[F,s0+3],[R+2,s0+fl]);}else prof.push([R,s0]);
      prof.push([R,L-7],[R+2.5,L-5],[R+2.5,L-2],[R,L],[R-1.6,L]);
      const b=at(0);K.lathe(ax,dir,b[0],b[1],b[2],prof,m);
      const mid=at((s0+L)/2);K.rod(ax,R-1.6,mid[0],mid[1],mid[2],L-s0,mat.hole,56,true);
      const bk=at(s0+Math.min(24,L*0.4));K.disc(ax,R-1.6,bk[0],bk[1],bk[2],mat.hole);
      return at(L);
    },
    /* rounded-rect plate -> loft -> round collar along +/-Z (8" outlet style) */
    ovalDuct(o){
      const dir=o.dir||1,R=o.od/2,pw=o.plateW,ph=o.plateH,rad=o.rad||40,t=o.plateT||21;
      const s=new T.Shape(),x0=-pw/2,y0=-ph/2;
      s.moveTo(x0+rad,y0);s.lineTo(-x0-rad,y0);s.quadraticCurveTo(-x0,y0,-x0,y0+rad);s.lineTo(-x0,-y0-rad);s.quadraticCurveTo(-x0,-y0,-x0-rad,-y0);
      s.lineTo(x0+rad,-y0);s.quadraticCurveTo(x0,-y0,x0,-y0-rad);s.lineTo(x0,y0+rad);s.quadraticCurveTo(x0,y0,x0+rad,y0);
      const pg=new T.ExtrudeGeometry(s,{depth:t,bevelEnabled:false,curveSegments:12});
      const pm=add(shade(new T.Mesh(pg,o.m||mat.plastic)));pm.position.set(CX(o.x),o.hPlate,CZ(o.d));if(dir<0)pm.rotation.y=PI;
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>K.rod('z',4.5,o.x+a*(pw/2-14),o.hPlate+b*(ph/2-14),o.d+dir*(t+2),4,mat.steel,14));
      const dP=o.d+dir*t,dC=dP+dir*o.cone,N=96,Rn=7,pos=[],idx=[];
      for(let j=0;j<=Rn;j++){const tt=j/Rn,e=tt*tt*(3-2*tt),z=CZ(dP+(dC-dP)*tt),cy=o.hPlate+(o.h-o.hPlate)*e;
        for(let i=0;i<=N;i++){const th=i/N*2*PI,c=Math.cos(th),sn=Math.sin(th),p=2/5,a=pw/2-10,bb=ph/2-10;
          const sx=a*Math.sign(c)*Math.pow(Math.abs(c),p),sy=bb*Math.sign(sn)*Math.pow(Math.abs(sn),p);
          pos.push(CX(o.x)+sx+(R*c-sx)*e,cy+sy+(R*sn-sy)*e,z);}}
      for(let j=0;j<Rn;j++)for(let i=0;i<N;i++){const A=j*(N+1)+i,B=A+N+1;idx.push(A,B,A+1,B,B+1,A+1);}
      const lg=new T.BufferGeometry();lg.setAttribute('position',new T.Float32BufferAttribute(pos,3));lg.setIndex(idx);lg.computeVertexNormals();
      add(shade(new T.Mesh(lg,o.m||mat.plastic)));
      K.disc('z',R,o.x,o.h,dP+dir*1,mat.hole);
      return K.duct({axis:'z',dir,x:o.x,h:o.h,d:dC,od:o.od,len:o.len,m:o.m});
    },
    /* flat-oval (stadium) duct along ±Z: outer w×hh, wall t, length len from face d; optional mounting plate [pw,ph]; dark bore */
    stadium(o){
      const dir=o.dir||1,w=o.w,hh=o.hh,t=o.t||3,m=o.m||mat.plastic;
      const shp=(W,Hh)=>{const r=Math.min(Hh/2,W/2),s=new T.Shape(),a=W/2-r;s.moveTo(-a,-Hh/2);s.lineTo(a,-Hh/2);s.absarc(a,0,r,-PI/2,PI/2,false);s.lineTo(-a,Hh/2);s.absarc(-a,0,r,PI/2,3*PI/2,false);return s;};
      const pth=(W,Hh)=>{const r=Math.min(Hh/2,W/2),s=new T.Path(),a=W/2-r;s.moveTo(-a,-Hh/2);s.absarc(-a,0,r,3*PI/2,PI/2,true);s.lineTo(a,Hh/2);s.absarc(a,0,r,PI/2,-PI/2,true);s.lineTo(-a,-Hh/2);return s;};
      const place=(g,dd)=>{const mm=add(shade(new T.Mesh(g,m)));mm.position.set(CX(o.x),o.h,CZ(dd));if(dir<0)mm.rotation.y=PI;return mm;};
      let s0=0;
      if(o.plate){const [pw,ph]=o.plate,pt=o.plateT||4,s=new T.Shape(),r=Math.min(18,ph/4);
        s.moveTo(-pw/2+r,-ph/2);s.lineTo(pw/2-r,-ph/2);s.quadraticCurveTo(pw/2,-ph/2,pw/2,-ph/2+r);s.lineTo(pw/2,ph/2-r);s.quadraticCurveTo(pw/2,ph/2,pw/2-r,ph/2);
        s.lineTo(-pw/2+r,ph/2);s.quadraticCurveTo(-pw/2,ph/2,-pw/2,ph/2-r);s.lineTo(-pw/2,-ph/2+r);s.quadraticCurveTo(-pw/2,-ph/2,-pw/2+r,-ph/2);
        s.holes.push(pth(w-2*t,hh-2*t));place(new T.ExtrudeGeometry(s,{depth:pt,bevelEnabled:false,curveSegments:16}),o.d);s0=pt;
        [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>K.rod('z',4,o.x+a*(pw/2-10),o.h+b*(ph/2-10),o.d+dir*(pt+1.5),3,mat.steel,12));}
      if(o.len>s0){const s=shp(w,hh);s.holes.push(pth(w-2*t,hh-2*t));place(new T.ExtrudeGeometry(s,{depth:o.len-s0,bevelEnabled:false,curveSegments:20}),o.d+dir*s0);}
      const back=new T.Mesh(new T.ShapeGeometry(shp(w-2*t,hh-2*t),20),mat.hole);back.position.set(CX(o.x),o.h,CZ(o.d+dir*Math.min(10,o.len*0.3)));if(dir<0)back.rotation.y=PI;add(back);
      return o.d+dir*o.len;
    },
    /* hanger bracket: ear at height h (top face), from face x outward to tip, centred on plan d */
    bracket(face,tip,d,w,h,leg,m){
      const s=Math.sign(tip-face),t=3;m=m||mat.body;
      K.box(Math.min(face,tip),Math.max(face,tip),h-t,h,d-w/2,d+w/2,m);
      K.box(Math.min(face,face+s*t),Math.max(face,face+s*t),h,h+leg,d-w/2,d+w/2,m);
      K.box(Math.min(tip,tip-s*t),Math.max(tip,tip-s*t),h-12,h,d-w/2,d+w/2,m);
    },
    hole(x,d,h,r){K.torus('y',r+5,3.2,x,h+1,d,mat.rubber);K.rod('y',r,x,h-1.5,d,4,mat.hole,20);},
    nameplate(x,h,d,w,hh,dir,title,sub){
      const tex=canvasTex(1024,232,(g,W,H)=>{g.fillStyle='#f6f8f8';g.fillRect(0,0,W,H);g.fillStyle='#0e6f78';g.fillRect(0,0,22,H);
        g.fillStyle='#132022';g.font='800 100px Archivo, "Noto Sans TC", sans-serif';g.textBaseline='middle';g.fillText(title,62,H*0.42);
        g.fillStyle='#55686a';g.font='500 38px "Noto Sans TC", sans-serif';g.fillText(sub,64,H*0.8);});
      plates.push({tex,title,sub});
      const p=new T.Mesh(new T.PlaneGeometry(w,hh),new T.MeshStandardMaterial({map:tex,roughness:.55}));
      if(dir==='x+')p.rotation.y=PI/2;else if(dir==='x-')p.rotation.y=-PI/2;else if(dir==='z-')p.rotation.y=PI;
      p.position.set(CX(x),h,CZ(d));return add(p);
    },
    /* label anchor: code / name / optional tag, normal as [nx,ny,nz] in plan (x,h,d) */
    tag(x,h,d,n,code,name,extra){anchors.push({p:new T.Vector3(CX(x),h,CZ(d)),n:new T.Vector3(n[0],n[1],n[2]),code,name,tag:extra});},
    dim(a,b,off,txt){dims.push({a:new T.Vector3(CX(a[0]),a[1],CZ(a[2])),b:new T.Vector3(CX(b[0]),b[1],CZ(b[2])),off:new T.Vector3(off[0],off[1],off[2]),txt});}
  };
  return K;
}
const plates=[];

/* ---------- stage ---------- */
const turntable=new T.Group();scene.add(turntable);
let R_disc=0.8;const discH=0.022,baseH=0.07;let stageGroup=null,discGroup=null;
function buildStage(R){
  if(stageGroup){scene.remove(stageGroup);dispose(stageGroup);}if(discGroup){turntable.remove(discGroup);dispose(discGroup);}
  R_disc=R;stageGroup=new T.Group();discGroup=new T.Group();
  const foot=shade(new T.Mesh(new T.CylinderGeometry(R+0.04,R+0.07,baseH,160),mat.plinth));foot.position.y=baseH/2;stageGroup.add(foot);
  const led=new T.Mesh(new T.TorusGeometry(R+0.012,0.006,12,200),mat.led);led.rotation.x=PI/2;led.position.y=baseH+0.002;stageGroup.add(led);
  const sh=canvasTex(256,256,(g,w)=>{const gr=g.createRadialGradient(w/2,w/2,w*0.2,w/2,w/2,w/2);gr.addColorStop(0,'rgba(0,0,0,0.4)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,w);});
  const blob=new T.Mesh(new T.PlaneGeometry((R+.2)*2.6,(R+.2)*2.6),new T.MeshBasicMaterial({map:sh,transparent:true,depthWrite:false}));blob.rotation.x=-PI/2;blob.position.y=0.001;stageGroup.add(blob);
  const catcher=new T.Mesh(new T.PlaneGeometry(30,30),new T.ShadowMaterial({opacity:.16}));catcher.rotation.x=-PI/2;catcher.receiveShadow=true;stageGroup.add(catcher);
  scene.add(stageGroup);
  turntable.position.y=baseH;
  const disc=shade(new T.Mesh(new T.CylinderGeometry(R,R,discH,160),mat.disc));disc.position.y=discH/2;discGroup.add(disc);
  for(let i=0;i<72;i++){const a=i/72*PI*2,long=i%6===0,r=R-(long?0.022:0.013);
    const t=new T.Mesh(new T.BoxGeometry(long?0.03:0.016,0.002,0.003),long?mat.led:mat.tick);t.position.set(Math.cos(a)*r,discH+0.001,Math.sin(a)*r);t.rotation.y=-a;discGroup.add(t);}
  turntable.add(discGroup);
  const s=R*2.2;key.position.set(s*0.7,s*1.7,s*1.2);key.target.position.set(0,0.1,0);rim.position.set(-s,s*.8,-s*1.2);
  const sc=key.shadow.camera;sc.left=sc.bottom=-R*1.5;sc.right=sc.top=R*1.5;sc.near=0.1;sc.far=s*4;sc.updateProjectionMatrix();
}
function dispose(o){o.traverse(n=>{if(n.geometry)n.geometry.dispose();});}

/* ---------- product ---------- */
let product=null,anchors=[],dimAnchors=[],dimGroup=null,current={id:null,v:null};
const labelsEl=$('labels');
function buildProduct(def,vkey){
  if(product){turntable.remove(product);dispose(product);}
  plates.length=0;
  const g=new T.Group();const K=makeKit(g,def.center);
  def.build(K,parseVariant(def,vkey));
  // dimension lines
  dimGroup=new T.Group();
  const lm=new T.LineBasicMaterial({color:new T.Color(getCss('--glow')||'#2fb3b6'),depthTest:false});
  const seg=(a,b)=>{const l=new T.Line(new T.BufferGeometry().setFromPoints([a,b]),lm);l.renderOrder=10;dimGroup.add(l);};
  dimAnchors=K.dims.map(dm=>{const A=dm.a.clone().add(dm.off),B=dm.b.clone().add(dm.off),ext=dm.off.clone().setLength(14);
    seg(A,B);seg(dm.a,A.clone().add(ext));seg(dm.b,B.clone().add(ext));
    const dd=B.clone().sub(A).setLength(12),n=dm.off.clone().setLength(12);
    seg(A.clone().sub(n).sub(dd),A.clone().add(n).add(dd));seg(B.clone().sub(n).sub(dd),B.clone().add(n).add(dd));
    return {p:A.clone().add(B).multiplyScalar(.5),txt:dm.txt};});
  g.add(dimGroup);dimGroup.visible=state.dims;
  g.scale.setScalar(MM);g.position.y=discH+0.003;
  product=g;turntable.add(product);
  anchors=K.anchors;
  labelsEl.innerHTML='';
  anchors.forEach(a=>{const d=document.createElement('div');d.className='tag';d.innerHTML='<b>'+esc(a.code)+'</b>'+esc(a.name)+(a.tag?'<i>'+esc(a.tag)+'</i>':'');labelsEl.appendChild(d);a.el=d;});
  dimAnchors.forEach(a=>{const d=document.createElement('div');d.className='dim';d.textContent=a.txt;labelsEl.appendChild(d);a.el=d;});
}
function getCss(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim();}

/* ---------- variants ---------- */
function variantKeys(def){if(!def||!def.variants)return [];const V=def.variants;return V.fixed?[]:V.supply.flatMap(s=>V.ret.map(r=>s.id+'-'+r.id));}
function parseVariant(def,vkey){
  const V=def.variants;if(!V||V.fixed)return {};
  if(!vkey||variantKeys(def).indexOf(vkey)<0)vkey=V.default;
  const [sid,rid]=vkey.split('-');
  return {key:vkey,supply:V.supply.find(s=>s.id===sid),ret:V.ret.find(r=>r.id===rid)};
}
function variantName(def,v){return v&&v.supply?(v.supply.name+v.ret.name):'';}

/* ---------- orbit camera ---------- */
const target=new T.Vector3();
const VIEWS={iso:[0.62,1.16],front:[0,1.47],side:[PI/2,1.47],top:[0,0.1]};
const orbit={th:VIEWS.iso[0],ph:VIEWS.iso[1],r:3,thGoal:VIEWS.iso[0],phGoal:VIEWS.iso[1],rGoal:3,rMin:.5,rMax:20};
function fitRadius(){const w=canvas.clientWidth||1,a=(camera.aspect||1.6)*Math.max(0.4,1-2*viewOff/w),f=Math.tan(camera.fov*PI/360),need=R_disc*1.18;return Math.max(need/f,need/(f*a))*1.04;}
function placeCamera(){const sp=Math.sin(orbit.ph);camera.position.set(target.x+orbit.r*sp*Math.sin(orbit.th),target.y+orbit.r*Math.cos(orbit.ph),target.z+orbit.r*sp*Math.cos(orbit.th));camera.lookAt(target);}
const ptrs=new Map();let pinch0=0,r0=0;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.classList.add('dragging');
  if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch0=Math.hypot(a.x-b.x,a.y-b.y);r0=orbit.rGoal;}});
canvas.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;const p=ptrs.get(e.pointerId),dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(ptrs.size===1){orbit.thGoal-=dx*0.006;orbit.phGoal=Math.min(1.52,Math.max(0.08,orbit.phGoal-dy*0.005));clearViewPressed();}
  else if(ptrs.size===2){const [a,b]=[...ptrs.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch0>0&&d>0)orbit.rGoal=clampR(r0*pinch0/d);}});
const up=e=>{ptrs.delete(e.pointerId);if(!ptrs.size)canvas.classList.remove('dragging');pinch0=0;};
canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
canvas.addEventListener('wheel',e=>{e.preventDefault();orbit.rGoal=clampR(orbit.rGoal*Math.exp(e.deltaY*0.0012));},{passive:false});
canvas.addEventListener('dblclick',()=>setView('iso'));
function clampR(r){return Math.min(orbit.rMax,Math.max(orbit.rMin,r));}

/* ---------- state & controls ---------- */
const state={playing:!reduce,dir:1,rpm:3,tags:true,dims:false,angle:0,angleGoal:null};
function clearViewPressed(){document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed','false'));}
function setView(v){const [th,ph]=VIEWS[v];let d=th-orbit.thGoal;d=Math.atan2(Math.sin(d),Math.cos(d));orbit.thGoal+=d;orbit.phGoal=ph;orbit.rGoal=fitRadius();
  setPlaying(false);state.angleGoal=0;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===v?'true':'false'));}
const ICON_PAUSE='<rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor"/><rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor"/>',ICON_PLAY='<path d="M4 2.5v11l9.5-5.5z" fill="currentColor"/>';
function setPlaying(p){state.playing=p;if(p)state.angleGoal=null;$('btnPlay').setAttribute('aria-label',p?'暫停旋轉':'開始旋轉');$('icoPlay').innerHTML=p?ICON_PAUSE:ICON_PLAY;}
$('btnPlay').onclick=()=>{setPlaying(!state.playing);if(state.playing)clearViewPressed();};
$('btnDir').onclick=()=>{state.dir*=-1;$('dirTxt').textContent=state.dir>0?'逆時針':'順時針';};
$('inSpeed').oninput=e=>{state.rpm=+e.target.value;$('outSpeed').textContent=state.rpm.toFixed(1)+' rpm';};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
$('btnTags').onclick=e=>{state.tags=!state.tags;e.currentTarget.setAttribute('aria-pressed',state.tags);};
$('btnDims').onclick=e=>{state.dims=!state.dims;e.currentTarget.setAttribute('aria-pressed',state.dims);if(dimGroup)dimGroup.visible=state.dims;};
const sheet=$('sheet');
$('sheetToggle').onclick=()=>{const c=sheet.dataset.collapsed!=='true';sheet.dataset.collapsed=c;$('sheetToggle').setAttribute('aria-expanded',!c);$('sheetArrow').textContent=c?'▴':'▾';};

/* ---------- spec sheet ---------- */
const OPT='選購';
function fmtPower(p){const a=String(p).split('/');return a.length===3?a[0]+' V / '+a[1]+' ph / '+a[2]+' Hz':p;}
function specRows(id,def){
  const s=DATA.specs[id]||{},C=DATA.common||{},rows=[];
  const r=(k,v,cls)=>{if(v!=null&&v!=='')rows.push([k,v,cls]);};
  r('外型尺寸 W×D×H',s.size?s.size.replace(/\*/g,' × ')+' mm':'');
  r('除濕能力',s.cap30?s.cap30+' L/日 <small>(30℃/80%RH)</small>':'');
  r('',s.cap27?s.cap27+' L/日 <small>(27℃/60%RH)</small>':'');
  r('能源因數 E.F',s.ef?s.ef+' L/kWh':'');
  r('電源',fmtPower(s.power||''));
  r('消耗電功率',s.watt?s.watt+' W':'');
  r('運轉 / 啟動電流',s.run_a?s.run_a+' A / '+s.start_a+' A':'');
  r('風量',s.cmh?s.cmh+' CMH':'');
  if(s.fresh&&s.fresh!=='—')r('新風風量',s.fresh+' CMH');
  r('冷媒',s.refrig);
  r('淨重',s.kg?s.kg+' kg':'');
  r('標配出風口',s.out_std,'txt');
  r('標配回風口',s.ret_std,'txt');
  if(s.out_opt&&s.out_opt!=='—')r('選配出風口',s.out_opt,'txt');
  if(s.ret_opt&&s.ret_opt!=='—')r('選配回風口',s.ret_opt,'txt');
  r('除臭/除甲醛濾網',s.filter,'txt');
  r('外氣引進風閥 Φ4"',s.oa_damper,'txt');
  if(s.sus304&&s.sus304!=='—')r('SUS304 不鏽鋼機體',s.sus304,'txt');
  r('機體材質',(def&&def.material)||C.body,'txt');
  r('壓縮機保護',s.comp&&s.comp!=='—'?s.comp:'','txt');
  r('排水管',C.drain);r('適用環境',C.env);r('濕度設定',C.hum_set,'txt');
  return rows;
}
function renderSheet(id,def,v){
  const rows=specRows(id,def);
  $('specTable').innerHTML=rows.map(([k,v,c])=>'<dt>'+esc(k)+'</dt><dd'+(c?' class="'+c+'"':'')+'>'+v+'</dd>').join('');
  $('optList').innerHTML=(DATA.options||[]).map(o=>'<li>'+esc(o)+'</li>').join('');
  $('note').textContent=(def&&def.note)||'此型號 3D 模型建置中，規格可先參考。';
  // variant picker
  const box=$('variantBox');
  if(def&&def.variants&&!def.variants.fixed){
    const V=def.variants;box.hidden=false;
    const chips=(list,cur,kind)=>list.map(o=>'<button type="button" class="chip" data-kind="'+kind+'" data-id="'+o.id+'" aria-pressed="'+(o.id===cur?'true':'false')+'"><b>'+esc(o.name)+'</b><span>'+esc(o.spec)+'</span></button>').join('');
    $('supplyChips').innerHTML=chips(V.supply,v.supply.id,'s');$('returnChips').innerHTML=chips(V.ret,v.ret.id,'r');
    $('variantName').textContent=variantName(def,v);
    box.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{const cur=parseVariant(def,current.v);
      const s=b.dataset.kind==='s'?b.dataset.id:cur.supply.id,r=b.dataset.kind==='r'?b.dataset.id:cur.ret.id;select(current.id,s+'-'+r,true);});
  }else if(def&&def.variants&&def.variants.fixed){box.hidden=false;$('supplyChips').innerHTML='';$('returnChips').innerHTML='';$('variantName').textContent=def.variants.fixed;}
  if(box.classList)box.classList.toggle('fixed',!!(def&&def.variants&&def.variants.fixed));
  else box.hidden=true;
  renderShare(id,v);
}
const MULTI=CFG.mode==='hub'||CFG.mode==='app';
let SOLO=false;   // only one model allowed -> no model menu
const slugOf=id=>{const def=REG[id];return (def&&def.slug)||id.toLowerCase();};
/* ---------- limited share links (app) ----------
   "#set-<token>/<model>-<variant>" opens the app with only the models in <token> (bitmask over CFG.models + 2-char check).
   The device remembers the latest valid set (localStorage), so dropping the hash or re-opening the app keeps the limit.
   A newer valid set link replaces it; "#reset-all" clears it (owner's own device). */
const SETS=CFG.mode==='app',SET_KEY='medole-showroom-set';
let ALLOWED=null,SETTOK='';
function setCheck(m){let x=(m^0x5bd1e995)>>>0;x=Math.imul(x^(x>>>15),0x2c1b3c6d)>>>0;x=Math.imul(x^(x>>>12),0x297a2d39)>>>0;return ((x^(x>>>15))>>>0)%1296;}
function encSet(ids){let m=0;ids.forEach(id=>{const i=CFG.models.indexOf(id);if(i>=0)m|=1<<i;});return m.toString(36)+('0'+setCheck(m).toString(36)).slice(-2);}
function decSet(tok){if(!tok||!/^[0-9a-z]{3,8}$/.test(tok))return null;const m=parseInt(tok.slice(0,-2),36),c=parseInt(tok.slice(-2),36);
  if(!m||setCheck(m)!==c)return null;const ids=CFG.models.filter((id,i)=>m&(1<<i));return ids.length?ids:null;}
function storeSet(tok){try{if(tok)localStorage.setItem(SET_KEY,tok);else localStorage.removeItem(SET_KEY);}catch(e){}}
function storedSet(){try{return localStorage.getItem(SET_KEY)||'';}catch(e){return '';}}
function useSet(tok){const ids=decSet(tok);const was=SETTOK;ALLOWED=ids;SETTOK=ids?tok:'';if(was!==SETTOK&&typeof onSetChange==='function')onSetChange();}
const POOL=()=>ALLOWED||CFG.models;
function hashFor(id,v){const vk=v&&v.key?v.key:'';
  if(MULTI)return (ALLOWED?'set-'+SETTOK+'/':'')+slugOf(id)+(vk?'-'+vk:'');return vk;}
function setUrl(tok,id,vk){return location.href.split('#')[0]+'#set-'+tok+(id?'/'+slugOf(id)+(vk?'-'+vk:''):'');}
function shareUrl(id,v){const h=v&&v.key?v.key:'';
  if(CFG.mode==='app')return setUrl(ALLOWED?SETTOK:encSet([id]),id,h);
  const base=CFG.mode==='hub'?(CFG.links||{})[id]:CFG.self;if(!base)return '';return base+(h?'#'+h:'');}
function renderShare(id,v){
  const url=shareUrl(id,v),box=$('shareBox');
  if(!url){box.hidden=!MULTI;$('shareUrl').textContent='這個型號還沒有獨立頁面。';$('btnCopy').disabled=true;return;}
  box.hidden=false;$('btnCopy').disabled=false;$('shareUrl').textContent=url;
  const n=ALLOWED?ALLOWED.length:1;
  $('shareHint').textContent=(v&&v.key?'連結會直接開啟「'+variantName(REG[id],v)+'」。':'')+(MULTI?(n>1?'對方會看到同樣的 '+n+' 款型號。':'對方只會看到這個型號。'):'');
}
$('btnCopy').onclick=()=>{const t=$('shareUrl').textContent,done=()=>{$('btnCopy').textContent='已複製';setTimeout(()=>$('btnCopy').textContent='複製連結',1600);};
  try{navigator.clipboard.writeText(t).then(done,()=>selectText());}catch(e){selectText();}};
function selectText(){const r=document.createRange();r.selectNodeContents($('shareUrl'));const s=getSelection();s.removeAllRanges();s.addRange(r);}

/* ---------- head ---------- */
function renderHead(id){
  const s=DATA.specs[id]||{},def=REG[id];
  const m=id.match(/^(MD-)(A?)(\d+)(.*)$/);
  $('modelName').innerHTML=m?esc(m[1]+m[2])+'<span>'+esc(m[3])+'</span>'+esc(m[4]):esc(id);
  $('eyebrow').textContent='米多力・'+((def&&def.kind)||'吊隱式風管除濕機');
  $('kpis').innerHTML=[[s.cap30,'L/日','除濕能力'],[s.cmh,'CMH','風量'],[s.ef,'L/kWh','能源因數']].filter(k=>k[0]).map(k=>'<div><b>'+esc(k[0])+'<small>'+k[1]+'</small></b><span>'+k[2]+'</span></div>').join('');
  document.title=id+' 展示台';
}

/* ---------- select model / variant ---------- */
function select(id,vkey,push){
  const def=REG[id];
  const changedModel=current.id!==id;
  current.id=id;
  if(def){
    const v=parseVariant(def,vkey);current.v=v.key||null;
    applyFinish(def.finish);
    if(changedModel){const fp=def.footprint;buildStage(Math.hypot(fp.L+60,fp.D+60)*MM/2+0.05);
      target.set(0,baseH+discH+(fp.H||300)*MM*0.42,0);orbit.rMin=R_disc*1.2;orbit.rMax=R_disc*8;orbit.rGoal=fitRadius();if(!orbit.r||orbit.r<0.01)orbit.r=orbit.rGoal;}
    buildProduct(def,v.key);
    $('placeholder').hidden=true;
    renderSheet(id,def,v);
  }else{
    current.v=null;if(product){turntable.remove(product);dispose(product);product=null;}labelsEl.innerHTML='';anchors=[];dimAnchors=[];
    if(changedModel)buildStage(0.7);$('placeholder').hidden=false;renderSheet(id,null,null);
  }
  renderHead(id);syncTheme();
  const h=hashFor(id,def?parseVariant(def,current.v):null);
  if(push!==false){try{const want=h?'#'+h:' ';if(location.hash!==('#'+h))history.replaceState(null,'',h?'#'+h:location.pathname+location.search);}catch(e){}}
}
function fromHash(){
  let h=decodeURIComponent((location.hash||'').slice(1)).toLowerCase();
  const ids=CFG.models;
  if(MULTI){
    if(SETS){
      const m=h.match(/^set-([0-9a-z]+)(?:\/(.*))?$/);
      if(h==='reset-all'){storeSet('');useSet('');h='';}
      else if(m&&decSet(m[1])){storeSet(m[1]);useSet(m[1]);h=m[2]||'';}
      else if(h.indexOf('solo-')===0){h=h.slice(5);   // older single-model links: honoured as a one-model set unless this device already has a limit
        const had=storedSet();if(had&&decSet(had))useSet(had);
        else{const hit=CFG.models.filter(id=>h===slugOf(id)||h.indexOf(slugOf(id)+'-')===0).sort((x,y)=>slugOf(y).length-slugOf(x).length)[0];
          if(hit){const t=encSet([hit]);storeSet(t);useSet(t);}else useSet('');}}
      else{if(m)h=m[2]||'';useSet(storedSet());}
    }
    const pool=POOL();SOLO=!!ALLOWED&&ALLOWED.length===1;
    let best=null;pool.forEach(id=>{const slug=slugOf(id);if(h===slug||h.indexOf(slug+'-')===0){if(!best||slug.length>best.slug.length)best={id,slug};}});
    applySolo();
    if(best)return {id:best.id,v:h.slice(best.slug.length+1)||null};
    return {id:ALLOWED?pool[0]:(CFG.start||ids[0]),v:null};
  }
  return {id:ids[0],v:h||null};
}
/* ---------- model menu (hub / app) ---------- */
function applySolo(){const mb=$('modelBtn');if(mb)mb.hidden=!MULTI||SOLO;document.documentElement.classList.toggle('solo',SOLO);if(typeof refreshInstall==='function')refreshInstall();}
function openPicker(){const pk=$('picker');pk.hidden=false;
  pk.querySelectorAll('.pk').forEach(b=>b.setAttribute('aria-current',b.dataset.id===current.id?'true':'false'));
  const cur=pk.querySelector('.pk[aria-current="true"]')||pk.querySelector('.pk');if(cur){cur.focus();if(cur.scrollIntoView)cur.scrollIntoView({block:'nearest'});}}
function closePicker(){const pk=$('picker');if(pk.hidden)return;pk.hidden=true;$('modelBtn').focus();}
const GROUPS=[['小型 30–40 L/日',id=>+(DATA.specs[id]||{}).cap30<=40],['中型 70–100 L/日',id=>{const c=+(DATA.specs[id]||{}).cap30;return c>40&&c<=100;}],['大型 130 L/日以上',id=>+(DATA.specs[id]||{}).cap30>100]];
const capOf=id=>+(DATA.specs[id]||{}).cap30;
const PRESETS=[['30–70 L',id=>capOf(id)>=30&&capOf(id)<=70],['小型 30–40 L',id=>capOf(id)<=40],['中型 70–100 L',id=>capOf(id)>40&&capOf(id)<=100],['大型 130 L 以上',id=>capOf(id)>100],['全選',()=>true],['清除',()=>false]];
let picking=null;   // Set of model ids while building a limited share link
function renderPicker(){
  if(!MULTI)return;
  const pool=POOL();
  $('pickerList').innerHTML=GROUPS.map(([title,fn])=>{const items=pool.filter(fn);if(!items.length)return '';
    return '<li class="pk-group"><h3>'+esc(title)+'</h3><ul>'+items.map(id=>{const s=DATA.specs[id]||{},def=REG[id];
      const n=def?(def.variants&&!def.variants.fixed?variantKeys(def).length+' 種組合':'標配'):'建模中';
      return '<li><button type="button" class="pk" data-id="'+esc(id)+'"><span class="pk-sw '+esc(def?def.finish:'')+'" aria-hidden="true"></span><b>'+esc(id)+'</b>'+
        '<span class="pk-meta">'+esc(s.cap30||'—')+' L/日・'+esc(s.cmh||'—')+' CMH</span><span class="pk-n">'+esc(n)+'</span><span class="pk-ck" aria-hidden="true"></span></button></li>';}).join('')+'</ul></li>';}).join('');
  document.querySelectorAll('#pickerList .pk').forEach(b=>b.onclick=()=>{
    if(picking){const id=b.dataset.id;if(picking.has(id))picking.delete(id);else picking.add(id);syncPicking();return;}
    closePicker();select(b.dataset.id,null,true);});
  $('pickerTitle').textContent=ALLOWED?'選擇型號（'+pool.length+' 款）':'選擇型號';
  const tool=$('setTool');if(tool)tool.hidden=!SETS||!!ALLOWED;
  if(ALLOWED)stopPicking();
}
function syncPicking(){
  const pk=$('picker'),on=!!picking;pk.classList.toggle('choosing',on);$('setPanel').hidden=!on;$('btnSetMode').hidden=on;
  $('pickerTitle').textContent=on?'勾選要開放的型號':(ALLOWED?'選擇型號（'+POOL().length+' 款）':'選擇型號');
  pk.querySelectorAll('.pk').forEach(b=>{if(on)b.setAttribute('aria-pressed',picking.has(b.dataset.id)?'true':'false');else b.removeAttribute('aria-pressed');});
  if(!on)return;
  const ids=CFG.models.filter(id=>picking.has(id));
  $('setPresets').querySelectorAll('button').forEach((b,i)=>{const fn=PRESETS[i][1],want=CFG.models.filter(fn);
    b.setAttribute('aria-pressed',i<4&&want.length===ids.length&&want.every(id=>picking.has(id))?'true':'false');});
  const ok=ids.length>0,first=ids.indexOf(current.id)>=0?current.id:ids[0];
  $('setUrl').textContent=ok?setUrl(encSet(ids),first,''):'請至少勾選一款型號。';
  $('btnSetCopy').disabled=!ok;
  $('setHint').textContent=ok?'已選 '+ids.length+' 款：'+ids.join('、')+'。對方打開後只看得到這些型號，之後重新開啟也一樣。':'';
}
function startPicking(){picking=new Set(CFG.models.filter(PRESETS[0][1]));syncPicking();const f=$('picker').querySelector('.pk');if(f)f.focus();}
function stopPicking(){picking=null;if($('setPanel'))syncPicking();}
function onSetChange(){renderPicker();applySetManifest();}
function openPicker(){const pk=$('picker');pk.hidden=false;
  pk.querySelectorAll('.pk').forEach(b=>b.setAttribute('aria-current',b.dataset.id===current.id?'true':'false'));
  const cur=pk.querySelector('.pk[aria-current="true"]')||pk.querySelector('.pk');if(cur){cur.focus();if(cur.scrollIntoView)cur.scrollIntoView({block:'nearest'});}}
function closePicker(){const pk=$('picker');if(pk.hidden)return;pk.hidden=true;stopPicking();$('modelBtn').focus();}
if(MULTI){
  renderPicker();
  $('modelBtn').onclick=openPicker;$('pickerClose').onclick=closePicker;
  $('picker').addEventListener('click',e=>{if(e.target===$('picker'))closePicker();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closePicker();});
  if(SETS&&$('setTool')){
    $('setPresets').innerHTML=PRESETS.map(([t])=>'<button type="button" class="chip mini">'+esc(t)+'</button>').join('');
    $('setPresets').querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{picking=new Set(CFG.models.filter(PRESETS[i][1]));syncPicking();});
    $('btnSetMode').onclick=startPicking;$('btnSetDone').onclick=stopPicking;
    $('btnSetCopy').onclick=()=>{const t=$('setUrl').textContent,b=$('btnSetCopy'),done=()=>{b.textContent='已複製';setTimeout(()=>b.textContent='複製連結',1600);};
      const sel=()=>{const r=document.createRange();r.selectNodeContents($('setUrl'));const s=getSelection();s.removeAllRanges();s.addRange(r);};
      try{navigator.clipboard.writeText(t).then(done,sel);}catch(e){sel();}};
  }
}
/* iPhone home-screen apps keep their own storage, so a limited link must survive "加入主畫面" through the start URL itself */
const IOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
function applySetManifest(){
  if(!SETS||!IOS)return;const l=document.querySelector('link[rel="manifest"]');if(!l)return;
  if(!l.dataset.orig)l.dataset.orig=l.getAttribute('href');
  if(!ALLOWED){l.setAttribute('href',l.dataset.orig);return;}
  const tok=SETTOK,src=new URL(l.dataset.orig,location.href).href,base=location.href.split('#')[0];
  fetch(src).then(r=>r.json()).then(j=>{if(SETTOK!==tok)return;
    j.start_url=base+'#set-'+tok;j.scope=new URL('./',base).href;j.id=new URL('./',base).href+'?set='+tok;
    j.icons=(j.icons||[]).map(i=>Object.assign({},i,{src:new URL(i.src,src).href}));
    l.setAttribute('href','data:application/manifest+json,'+encodeURIComponent(JSON.stringify(j)));}).catch(()=>{});
}
/* ---------- installable app (PWA) ---------- */
let deferredInstall=null,refreshInstall=null;
if(CFG.mode==='app'){
  const ib=$('btnInstall'),standalone=()=>matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;
  const ios=IOS;
  refreshInstall=()=>{ib.hidden=standalone()||!(deferredInstall||ios);};
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;refreshInstall();});
  window.addEventListener('appinstalled',()=>{deferredInstall=null;refreshInstall();});
  ib.onclick=()=>{if(deferredInstall){deferredInstall.prompt();Promise.resolve(deferredInstall.userChoice).catch(()=>{}).then(()=>{deferredInstall=null;refreshInstall();});}else $('iosHelp').hidden=false;};
  $('iosHelpClose').onclick=()=>{$('iosHelp').hidden=true;ib.focus();};
  const fb=$('btnFull');
  if(document.fullscreenEnabled&&matchMedia('(pointer: fine)').matches){fb.hidden=false;
    fb.onclick=()=>{try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{});}catch(e){}};
    document.addEventListener('fullscreenchange',()=>fb.setAttribute('aria-pressed',!!document.fullscreenElement));}
  /* updates: check for a new version every time the app is opened or brought back; when the new version takes over, reload once so it shows right away */
  if('serviceWorker' in navigator){try{
    const hadSW=!!navigator.serviceWorker.controller;let reloaded=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadSW||reloaded)return;reloaded=true;location.reload();});
    navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(reg=>{
      const check=()=>{try{reg.update();}catch(e){}};check();
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check();});
    }).catch(()=>{});
  }catch(e){}}
  refreshInstall();
}
window.addEventListener('hashchange',()=>{const r=fromHash();if(r.id!==current.id||r.v!==current.v){select(r.id,r.v,true);return;}
  const def=REG[current.id],h=hashFor(current.id,def?parseVariant(def,current.v):null);if(location.hash!=='#'+h){try{history.replaceState(null,'','#'+h);}catch(e){}}});

/* ---------- theme sync ---------- */
function isDark(){const t=document.documentElement.dataset.theme;return t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);}
function syncTheme(){
  const glow=getCss('--glow')||'#2fb3b6';mat.led.emissive.set(glow);if(dimGroup)dimGroup.children.forEach(l=>l.material.color.set(glow));
  const dark=isDark();hemi.intensity=dark?.25:.38;renderer.toneMappingExposure=dark?1.0:1.08;
  mat.plinth.color.set(dark?0x2a3233:0xd9dfe0);mat.disc.color.set(dark?0x394243:0xeef2f2);
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',syncTheme);
new MutationObserver(syncTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

/* ---------- boot ---------- */
/* desktop: the spec sheet docks on the right, so centre the stage in the space left of it */
let viewOff=0;
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;
  const docked=matchMedia('(min-width: 761px)').matches&&sheet&&sheet.offsetWidth;viewOff=docked?Math.min((sheet.offsetWidth+16)/2,w*0.3):0;
  if(camera.setViewOffset){if(viewOff)camera.setViewOffset(w,h,viewOff,0,w,h);else if(camera.clearViewOffset)camera.clearViewOffset();}
  camera.updateProjectionMatrix();}
resize();
const boot=fromHash();renderPicker();applySetManifest();select(boot.id,boot.v,true);orbit.r=orbit.rGoal=fitRadius();
new ResizeObserver(()=>{const fit=fitRadius();resize();if(Math.abs(orbit.rGoal-fit)/fit<0.35)orbit.rGoal=fitRadius();}).observe(canvas);
setPlaying(state.playing);
if(matchMedia('(min-width: 761px)').matches)sheet.dataset.collapsed='false';
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(current.id&&REG[current.id])buildProduct(REG[current.id],current.v);});

const v3=new T.Vector3(),n3=new T.Vector3(),toCam=new T.Vector3();
const place=(el,x,y)=>{el.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) translate(-50%,-50%)';};
let last=performance.now();
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000);last=now;
  if(state.playing)state.angle+=state.dir*state.rpm*2*PI/60*dt;
  else if(state.angleGoal!==null){let d=state.angleGoal-state.angle;d=Math.atan2(Math.sin(d),Math.cos(d));state.angle+=d*Math.min(1,dt*6);if(Math.abs(d)<1e-4){state.angle=state.angleGoal;state.angleGoal=null;}}
  turntable.rotation.y=state.angle;
  const k=Math.min(1,dt*8);orbit.th+=(orbit.thGoal-orbit.th)*k;orbit.ph+=(orbit.phGoal-orbit.ph)*k;orbit.r+=(orbit.rGoal-orbit.r)*k;
  placeCamera();renderer.render(scene,camera);
  const w=canvas.clientWidth,h=canvas.clientHeight;
  $('roAngle').textContent=Math.round(((-state.angle*180/PI)%360+360)%360)+'°';
  if(product){product.updateMatrixWorld();
    anchors.forEach(a=>{if(!state.tags){a.el.style.opacity=0;return;}
      v3.copy(a.p).applyMatrix4(product.matrixWorld);n3.copy(a.n).transformDirection(product.matrixWorld);toCam.copy(camera.position).sub(v3).normalize();
      const op=Math.max(0,Math.min(1,(n3.dot(toCam)+0.2)*2.4));v3.project(camera);place(a.el,(v3.x*.5+.5)*w,(-v3.y*.5+.5)*h);a.el.style.opacity=op.toFixed(2);});
    dimAnchors.forEach(a=>{if(!state.dims){a.el.style.opacity=0;return;}v3.copy(a.p).applyMatrix4(product.matrixWorld).project(camera);place(a.el,(v3.x*.5+.5)*w,(-v3.y*.5+.5)*h);a.el.style.opacity=1;});}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.__showroom={select,REG,variantKeys,get current(){return current;}};
})();
