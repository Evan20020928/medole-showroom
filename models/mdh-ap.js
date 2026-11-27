/* 米多力 吊隱式風管清淨機 MDH-350（米白塗裝鍍鋅鋼板）／MDH-S350（不鏽鋼）
   外觀尺寸依型錄「外觀尺寸」圖：含法蘭總長 778、吊孔距 680 × 310、寬 420（含控制盒）、高 240、6"(150mm) 回風／出風法蘭。
   機體本身（不含法蘭、控制盒）依圖面比例量取約 625 × 360 × 240。
   平面座標 mm：x = 長度（回風端 −x → 出風端 +x），d = 寬度（濾網門、控制盒側 = +d），h = 高度；機體底面中心為原點。
   五道濾網（依實品照片由回風側起）：不鏽鋼過濾網 → 中效過濾網 → 甲醛過濾網 → 立體活性碳纖 → 高性能 PM2.5 過濾網；回風法蘭內有紫外線殺菌燈。 */
(function(){
const SPEC={cat:'ap',cmh:'320',cmh_lo:'240',pa:'240',pa_lo:'130',w:'60',w_lo:'48',a:'0.26',a_lo:'0.23',kg:'15',db:'44',db_lo:'39',
  power:'單相 220 V／60 Hz',flange:'6"（150 mm）',size:'778*420*240',control:'微電腦線控觸控面板'};
const DATA=window.MEDOLE_DATA=window.MEDOLE_DATA||{specs:{}};
DATA.specs['MDH-350']=Object.assign({},SPEC,{body:'鍍鋅鋼板（米白塗裝）'});
DATA.specs['MDH-S350']=Object.assign({},SPEC,{body:'不鏽鋼'});

let TH=null;
const L=625,W=360,H=240,FL=76.5,CBD=60;   // body, flange length (778−625)/2, control-box protrusion (420−360)
function tex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new TH.CanvasTexture(c);t.encoding=TH.sRGBEncoding;t.wrapS=t.wrapT=TH.RepeatWrapping;t.anisotropy=8;if(rep)t.repeat.set(rep[0],rep[1]);return t;}
let FM=null;
function filterMats(){if(FM)return FM;
  const mk=(t,o)=>new TH.MeshStandardMaterial(Object.assign({map:t,roughness:.85,metalness:0},o||{}));
  FM={
    sus:mk(tex(128,128,(g,W,H)=>{g.fillStyle='#9ea4a9';g.fillRect(0,0,W,H);for(let x=0;x<W;x+=6){g.fillStyle=x%12?'#c9ced2':'#7c8287';g.fillRect(x,0,3,H);}
      for(let y=0;y<H;y+=4){g.fillStyle='rgba(60,64,68,.25)';g.fillRect(0,y,W,1);}},[2,2]),{metalness:.7,roughness:.4}),          // 不鏽鋼波浪編織網
    mid:mk(tex(128,64,(g,W,H)=>{for(let x=0;x<W;x+=8){const gr=g.createLinearGradient(x,0,x+8,0);gr.addColorStop(0,'#3d8fd4');gr.addColorStop(.5,'#1f5fa6');gr.addColorStop(1,'#3d8fd4');g.fillStyle=gr;g.fillRect(x,0,8,H);}},[3,1])),   // 藍色中效
    hcho:mk(tex(128,128,(g,W,H)=>{g.fillStyle='#4a4d50';g.fillRect(0,0,W,H);for(let y=0;y<H;y+=4)for(let x=(y/4%2)*2;x<W;x+=4){g.fillStyle='#2e3033';g.fillRect(x,y,2,2);}},[3,3])),  // 灰色甲醛網
    carbon:mk(tex(128,128,(g,W,H)=>{g.fillStyle='#0d0d0e';g.fillRect(0,0,W,H);g.strokeStyle='#3b3c3f';g.lineWidth=3;const r=10;
      for(let row=0;row<9;row++)for(let col=0;col<9;col++){const cx=col*r*1.75+(row%2)*r*.87,cy=row*r*1.5;g.beginPath();for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;g.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));}g.closePath();g.stroke();}},[2,2])),   // 蜂巢活性碳
    pm:mk(tex(128,64,(g,W,H)=>{for(let x=0;x<W;x+=8){const gr=g.createLinearGradient(x,0,x+8,0);gr.addColorStop(0,'#f7f7f4');gr.addColorStop(.5,'#d6d8d5');gr.addColorStop(1,'#f7f7f4');g.fillStyle=gr;g.fillRect(x,0,8,H);}},[3,1])),   // 白色 PM2.5 摺紙
    frameBlk:new TH.MeshStandardMaterial({color:new TH.Color(0x18191b).convertSRGBToLinear(),roughness:.6}),
    frameSus:new TH.MeshStandardMaterial({color:new TH.Color(0xc9cdd1).convertSRGBToLinear(),metalness:.8,roughness:.3}),
    uv:new TH.MeshBasicMaterial({color:new TH.Color(0x3f63ff).convertSRGBToLinear()}),
    glow:new TH.MeshBasicMaterial({color:0x3f6bff,transparent:true,opacity:.28,depthWrite:false,side:TH.DoubleSide})
  };return FM;}

/* 圓頭螺絲 on a face normal to any axis ('x','y','z') */
function scr(K,axis,dir,x,h,d,r,mm){const R=r||4.5,Hh=R*0.55;return K.lathe(axis,dir,x,h,d,[[R,0],[R,Hh*0.12],[R*0.93,Hh*0.4],[R*0.75,Hh*0.72],[R*0.45,Hh*0.93],[0.01,Hh]],mm,28);}
function build(K,id){
  TH=window.THREE;const m=K.mat,fm=filterMats(),sus=id==='MDH-S350';
  const x0=-L/2,x1=L/2,dB=-W/2,dF=W/2;
  /* body + folded edge lips + lid screws */
  K.box(x0,x1,0,H,dB,dF,m.body,3);
  K.box(x0,x1,H-14,H+1.5,dF,dF+2,m.body2);                                       // top front folded lip
  [x0,x1].forEach(x=>K.box(x-1,x+1,6,H-6,dB+4,dF-4,m.body2));                  // end-cap seams
  for(let x=x0+30;x<=x1-30;x+=(L-60)/5)[dB+14,dF-14].forEach(d=>scr(K,'y',1,x,H,d,3,m.body));
  /* 回風（−x）／出風（+x）法蘭：黑色方形法蘭板＋6" 圓管；回風管內紫外線殺菌燈 */
  const R=75,P=200;
  [[-1,'RA','回風法蘭'],[1,'SA','出風法蘭']].forEach(([sx,code,name])=>{const fx=sx>0?x1:x0,hc=125;
    {const c=24,a=P/2,sh=new TH.Shape();sh.moveTo(-a+c,-a);sh.lineTo(a-c,-a);sh.lineTo(a,-a+c);sh.lineTo(a,a-c);sh.lineTo(a-c,a);sh.lineTo(-a+c,a);sh.lineTo(-a,a-c);sh.lineTo(-a,-a+c);sh.lineTo(-a+c,-a);   // 方形法蘭板，四角切斜角
     const pl=new TH.Mesh(new TH.ExtrudeGeometry(sh,{depth:4,bevelEnabled:false}),m.plastic);pl.rotation.y=Math.PI/2;pl.position.set(K.cx(Math.min(fx,fx+sx*4)),hc,K.cz(0));pl.castShadow=pl.receiveShadow=true;K.addMesh(pl);}
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>scr(K,'x',sx,fx+sx*4,hc+a*(P/2-19),b*(P/2-19),3.2,m.plastic));
    K.lathe('x',sx,fx+sx*4,hc,0,[[R-2,0],[R+10,0],[R+10,6],[R,14],[R,FL-10],[R+2.5,FL-8],[R+2.5,FL-4],[R,FL-4],[R,FL-4],[R-2,FL-4],[R-2,0]],m.plastic,72);
    K.disc('x',R-2.5,fx+sx*0.6,hc,0,m.hole);   // dark duct interior
    if(sx<0){K.rod('z',7,fx-24,hc+22,0,R*1.5,fm.uv,18);K.rod('z',7,fx-24,hc-22,0,R*1.5,fm.uv,18);   // UV 殺菌燈管（藍光，回風口內）
      const gl=new TH.Mesh(new TH.CircleGeometry(R-3,48),fm.glow);gl.rotation.y=-Math.PI/2;gl.position.set(K.cx(fx-FL+8),hc,K.cz(0));gl.renderOrder=3;K.addMesh(gl);}
    K.tag(fx+sx*(FL+4),hc+R+30,0,[sx,0,0],code,name,'6"（150mm）');});
  /* 吊耳 ×4：機體兩端 L 型吊架，吊孔 680 × 310；耳板離機底 25（型錄圖），吊孔往外端開口（鎖孔形：圓孔＋窄頸開到端緣），牙條可從外端滑入 */
  /* 吊耳 ×4（型錄外觀尺寸圖）：L 型吊架鎖在機體兩端面，立邊由機底往上，耳板頂面離機底 83；
     吊孔距 680 × 310，耳板外伸至約 362；開孔 = 圓孔＋往外端的窄縫（俯視圖黃框），牙條可從外端滑入 */
  const EH=83,ET=2.5;
  [1,-1].forEach(sx=>[1,-1].forEach(sd=>{const face=sx*L/2,hx=sx*340,hd=sd*155,tip=sx*362,a=Math.min(face,tip),b=Math.max(face,tip),d0=hd-22,d1=Math.min(W/2,hd+22)*(sd>0?1:1);
    const e0=sd>0?hd-22:Math.max(-W/2,hd-22),e1=sd>0?Math.min(W/2,hd+22):hd+22;
    K.plateCut(a,b,e0,e1,EH-ET,EH,[{x:hx,d:hd,r:6.5,nw:2.2,dir:sx>0?'+x':'-x'}],m.body2);
    K.box(Math.min(face,face+sx*ET),Math.max(face,face+sx*ET),4,EH-ET,e0,e1,m.body2);}));
  /* 殺菌燈座：前側近回風端的小蓋板＋4 顆螺絲 */
  {const cx=x0+38,hc=120;K.box(cx-28,cx+28,hc-48,hc+48,dF,dF+2.5,m.body2,2);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>K.screw(cx+a*19,hc+b*38,dF+2.5,1,2.6,m.body));
   K.tag(cx,hc+70,dF+3,[0,0,1],'UV','紫外線殺菌燈座');}
  /* 控制盒：出風端前側，往外凸出 60 */
  const cb={x0:x0+373,x1:x0+603};
  K.box(cb.x0,cb.x1,46,H-6,dF,dF+CBD,m.body2,3);
  [[cb.x0+12,58],[cb.x1-12,58],[cb.x0+12,H-18],[cb.x1-12,H-18]].forEach(([x,h])=>K.screw(x,h,dF+CBD,1,3,m.body));
  [cb.x0+50,cb.x0+90].forEach(x=>K.rod('y',7,x,40,dF+CBD*0.5,10,m.ctrl,16));       // 出線孔
  {const lw=120,lh=56,lx=cb.x1-20-lw/2,ly=H/2+2;   // 白色標籤：只印型號（其他規格在資訊欄）
   const t=tex(600,280,(g,W,Hh)=>{g.fillStyle='#f4f5f2';g.fillRect(0,0,W,Hh);
     g.fillStyle='#132022';g.font='800 '+(id.length>7?104:116)+'px Archivo, "Noto Sans TC", sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(id,W/2,Hh/2+4);});
   t.wrapS=t.wrapT=TH.ClampToEdgeWrapping;
   K.box(lx-lw/2,lx+lw/2,ly-lh/2,ly+lh/2,dF+CBD,dF+CBD+0.5,m.label);K.decal(lx,ly,dF+CBD+0.8,lw-2,lh-2,'z+',t);}
  K.tag((cb.x0+cb.x1)/2,H+24,dF+CBD,[0,0,1],'CB','控制盒');

  /* ---------- 濾網門（螺絲固定，可拆）＋五道濾網 ---------- */
  const ax0=x0+81,ax1=x0+309,ah0=12,ah1=H-12;
  K.box(ax0+2,ax1-2,ah0+2,ah1-2,dF+0.2,dF+0.5,m.hole);                             // 門後開口
  const door=K.group(()=>{K.box(ax0,ax1,ah0,ah1,dF+0.6,dF+3,m.body2,2);
    [ax0-8,ax1].forEach(x=>K.box(x,x+8,ah0-4,ah1+4,dF+0.3,dF+5,m.body2,1.5));      // 門兩側折邊
    {const lw=Math.min(130,(ax1-ax0)*0.55),lh=lw*71/351,lx=(ax0+ax1)/2-22,ly=ah1-30;   // 白底標牌＋LOGO
     K.box(lx-lw/2-9,lx+lw/2+9,ly-lh/2-7,ly+lh/2+7,dF+3,dF+3.8,m.label);K.logo(lx,ly,dF+3.9,lw,'z+');}});
  /* 不鏽鋼圓形把手（兩顆旋鈕中間，實品五金：圓柱頸＋平面圓帽、帽緣小倒角）：旋鈕轉開後握把手把整片門卸下 */
  door.add(K.group(()=>{const hx=ax1+4,hy=H/2,pz=dF+5,pol=new TH.MeshStandardMaterial({color:new TH.Color(0xd9dde0).convertSRGBToLinear(),metalness:1,roughness:.16,envMapIntensity:1.6});
    K.lathe('z',1,hx,hy,pz,[[0.01,0],[6.5,0],[6.5,14],[16,14],[17,15.2],[17,22.5],[16.2,23.6],[0.01,23.6]],pol,48);}));
  /* 黑色壓花手轉旋鈕 ×2（門右緣上下）；不另用螺絲，旋鈕轉開即可整片卸下 */
  const screws=[];[[ax1+4,ah0+30],[ax1+4,ah1-30]].forEach(([x,h],i)=>{const sg=new TH.Group();sg.position.set(K.cx(x),h,K.cz(dF+5));
    if(i<2){const kn=new TH.Mesh(new TH.CylinderGeometry(8,8,9,20),m.ctrl);kn.rotation.x=Math.PI/2;kn.position.z=4.5;sg.add(kn);
      for(let k=0;k<12;k++){const rb=new TH.Mesh(new TH.BoxGeometry(1.6,2.4,9),m.ctrl);const a=k*Math.PI/6;rb.position.set(8*Math.cos(a),8*Math.sin(a),4.5);rb.rotation.z=a;sg.add(rb);}}   // 壓花手轉頭
    else{const prof=[[0.01,1.9],[2.6,1.9],[3.8,1.6],[4.5,1.0],[4.7,0.3],[4.7,0]].map(([r,z])=>new TH.Vector2(r,z)).reverse();
      const hd=new TH.Mesh(new TH.LatheGeometry(prof,28),m.steel);hd.rotation.x=Math.PI/2;sg.add(hd);
      [[3.4,.9],[.9,3.4]].forEach(([a,b])=>{const ck=new TH.Mesh(new TH.BoxGeometry(a*2,b*2,1.6),m.hole);ck.position.z=1.15;sg.add(ck);});}   // 十字凹槽
    const sh=new TH.Mesh(new TH.CylinderGeometry(2,1.3,13,14),m.steel);sh.rotation.x=Math.PI/2;sh.position.z=-6.5;sh.userData.shank=1;sg.add(sh);
    for(let k=0;k<7;k++){const th=new TH.Mesh(new TH.TorusGeometry(1.95-k*0.07,0.3,6,16),m.steel);th.position.z=-1.2-k*1.6;th.userData.shank=1;sg.add(th);}
    door.add(sg);screws.push(sg);});
  door.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.userData.op=o.material.opacity;o.userData.tr=o.material.transparent;}});
  const doorMv={kind:'door',name:'維修門（手轉旋鈕）',g:door,screws,view:0.3,labels:[['in','裝回','鎖上旋鈕'],['side','卸下','轉開旋鈕・握把手取下']]};

  /* five filters: vertical plates across the airflow, sliding out through the door (+d) */
  const fh=ah1-ah0-14,fd0=dB+16,fd1=dF-2,fdep=fd1-fd0,fhc=H/2;
  const spec=[['不鏽鋼過濾網（可重複清洗）',20,fm.sus,fm.frameSus],['中效過濾網',25,fm.mid,fm.frameBlk],['甲醛過濾網',8,fm.hcho,fm.frameBlk],
              ['立體活性碳纖',25,fm.carbon,fm.frameBlk],['高性能 PM2.5 過濾網',45,fm.pm,fm.frameBlk]];
  const tot=spec.reduce((a,s)=>a+s[1],0)+8*(spec.length-1);let fx=ax0+((ax1-ax0)-tot)/2;
  const movers=[doorMv];
  spec.forEach(([name,t,face,frame],i)=>{const xa=fx,xb=fx+t;fx=xb+8;
    const g=K.group(()=>{
      const core=new TH.Mesh(new TH.BoxGeometry(t-2,fh-10,fdep-10),[face,face,frame,frame,frame,frame]);core.position.set(K.cx((xa+xb)/2),fhc,K.cz((fd0+fd1)/2));core.castShadow=true;K.addMesh(core);
      const fr=(a0,a1,h0,h1,d0,d1)=>{const b=new TH.Mesh(new TH.BoxGeometry(a1-a0,h1-h0,d1-d0),frame);b.position.set(K.cx((a0+a1)/2),(h0+h1)/2,K.cz((d0+d1)/2));b.castShadow=true;K.addMesh(b);};
      if(t>10){fr(xa,xb,fhc-fh/2,fhc-fh/2+5,fd0,fd1);fr(xa,xb,fhc+fh/2-5,fhc+fh/2,fd0,fd1);fr(xa,xb,fhc-fh/2,fhc+fh/2,fd1-5,fd1);fr(xa,xb,fhc-fh/2,fhc+fh/2,fd0,fd0+5);}
      else{const tab=new TH.Mesh(new TH.BoxGeometry(t+2,40,18),fm.frameBlk);tab.position.set(K.cx((xa+xb)/2),fhc,K.cz(fd1-9));K.addMesh(tab);}   // 甲醛網：黑色拉帶
      if(t>10){const lb=new TH.Mesh(new TH.PlaneGeometry(Math.max(6,t-8),fh*0.55),m.label);lb.position.set(K.cx((xa+xb)/2),fhc,K.cz(fd1+0.6));K.addMesh(lb);}});   // 濾網側邊白色標籤
    movers.push({kind:'slideD',name:name,g,dist:fdep*(0.42+i*0.07),door:doorMv,view:0.3,labels:[['in','收回','原位'],['side','抽出','側拉']]});});
  movers.forEach(mv=>K.movers.push(mv));

  /* 尺寸線：含法蘭總長 778、吊孔距 680、寬 420（含控制盒）、高 240 */
  const dFr=dF+CBD;
  K.dim([x0-FL,0,dFr],[x1+FL,0,dFr],[0,0,90],'778');
  K.dim([-340,3,-155],[340,3,-155],[0,0,-(W/2-155)-70],'680');
  K.dim([x1+FL,0,dB],[x1+FL,0,dFr],[90,0,0],'420');
  K.dim([x0,0,dF],[x0,H,dF],[0,0,120],'240');
}

[['MDH-350','ivory','鍍鋅鋼板（米白塗裝）'],['MDH-S350','sus','不鏽鋼']].forEach(([id,finish,mat])=>{
  (window.MEDOLE_MODELS=window.MEDOLE_MODELS||[]).push({
    id, slug:id.toLowerCase(), cat:'ap', kind:'空氣清淨機・吊隱式風管清淨機', finish, material:mat,
    center:{x:0,d:30}, footprint:{L:778, D:460, H:240},
    note:'依型錄外觀尺寸圖建模（含法蘭總長 778、吊孔距 680 × 310、寬 420、高 240、6" 法蘭）；機體本身與濾網門、控制盒位置依圖面比例量取。五道濾網順序依實品照片。'+(id==='MDH-350'?'MDH-350 規格比照 MDH-S350，差別在機體材質。':''),
    variants:{fixed:'回風 6"・出風 6"（150 mm）'},
    build(K){build(K,id);}
  });});
})();
