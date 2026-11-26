/* 米多力 全熱交換器 DC-PM2.5 過濾系列 MH-D2 ~ D13 DCPMTHZ
   尺寸依型錄「尺寸」表（L, L1, W, W1, W2, H, H1, C, G, N）；接頭喇叭口、吊架、電控箱位置比照先前交付的 Rhino 模型（model.py）。
   平面座標 mm：x = 長度 L（風管接頭軸向），d = 寬度 W（電控箱側 = +d，朝前），h = 高度；本體底面中心為原點。
   外觀依實品照片：鍍鋅鋼板銀灰機體、黑色圓形接頭與方形法蘭底板、黑色電控箱＋黃色高壓警示貼紙、綠色 MEDOLE 標誌。 */
(function(){
const SP={
  'MH-D2DCPMTHZ': {L:736, L1:795, W:580, W1:510, W2:290,H:264,H1:20, C:100,G:20.5,N:144,Q:200},
  'MH-D3DCPMTHZ': {L:814, L1:745, W:599, W1:657, W2:315,H:270,H1:111,C:100,G:20.5,N:144,Q:300},
  'MH-D4DCPMTHZ': {L:814, L1:745, W:804, W1:862, W2:480,H:270,H1:111,C:100,G:20.5,N:144,Q:400},
  'MH-D6DCPMTHZ': {L:894, L1:824, W:904, W1:960, W2:500,H:270,H1:111,C:107,G:20.5,N:194,Q:600},
  'MH-D8DCPMTHZ': {L:1186,L1:1115,W:884, W1:940, W2:428,H:388,H1:170,C:85, G:19,  N:242,Q:800},
  'MH-D10DCPMTHZ':{L:1186,L1:1115,W:1134,W1:1190,W2:678,H:388,H1:170,C:85, G:19,  N:242,Q:1000},
  'MH-D13DCPMTHZ':{L:1199,L1:1130,W:1216,W1:1273,W2:621,H:388,H1:171,C:85, G:19,  N:242,Q:1300}
};
/* 規格（全熱交換器型錄 260529 第 8 頁）：靜壓 Pa、焓效率 夏/冬 %、溫度效率 %、噪音 dB(A)、電壓 V、輸入功率 W、淨重 kg */
const CAT={
  'MH-D2DCPMTHZ': {pa:75,hs:'55-66',hw:'59-70',te:'70-82',db:31.5,v:220,w:38, kg:25},
  'MH-D3DCPMTHZ': {pa:85,hs:'57-70',hw:'61-72',te:'68-82',db:34.5,v:220,w:85, kg:27},
  'MH-D4DCPMTHZ': {pa:88,hs:'57-70',hw:'60-74',te:'69-83',db:37.5,v:220,w:107,kg:33},
  'MH-D6DCPMTHZ': {pa:87,hs:'59-74',hw:'61-78',te:'70-83',db:39,  v:220,w:140,kg:38},
  'MH-D8DCPMTHZ': {pa:90,hs:'55-66',hw:'57-76',te:'68-83',db:41,  v:220,w:160,kg:62},
  'MH-D10DCPMTHZ':{pa:76,hs:'58-70',hw:'62-75',te:'70-83',db:42,  v:220,w:188,kg:72},
  'MH-D13DCPMTHZ':{pa:80,hs:'59-68',hw:'59-70',te:'70-83',db:43,  v:220,w:405,kg:81}
};
const DATA=window.MEDOLE_DATA=window.MEDOLE_DATA||{specs:{}};
Object.keys(SP).forEach(id=>{const s=SP[id];
  DATA.specs[id]={cat:'erv',...CAT[id],cmh:String(s.Q),duct:String(s.N),size:s.L+'*'+s.W+'*'+s.H,L:s.L,L1:s.L1,W:s.W,W1:s.W1,W2:s.W2,H:s.H,H1:s.H1,C:s.C,G:s.G,N:s.N};});

const T_BRK=2.5,B_BRK=40,LEG=40,HOLE_R=6;
let TH=null;   // resolved at build time (three.js loads after the model files)
/* textures made once: heat-exchange core (stacked plates, fine diagonal layer lines) and white PM2.5 pleats */
let CORE_M=null,FIL_M=null,BOARD_M=null;
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new TH.CanvasTexture(c);t.encoding=TH.sRGBEncoding;t.wrapS=t.wrapT=TH.RepeatWrapping;t.anisotropy=8;return t;}
function coreMat(){if(CORE_M)return CORE_M;const t=tex(256,256,(g,W,H)=>{g.fillStyle='#e8e4d8';g.fillRect(0,0,W,H);
    for(let i=-H;i<W;i+=5){g.strokeStyle=i%10?'rgba(120,112,95,.35)':'rgba(90,84,70,.55)';g.lineWidth=1.4;g.beginPath();g.moveTo(i,0);g.lineTo(i+H,H);g.stroke();}});
  t.repeat.set(1/120,1/120);CORE_M=new TH.MeshStandardMaterial({map:t,roughness:.85,metalness:0});return CORE_M;}
function boardMat(){if(BOARD_M)return BOARD_M;const t=tex(256,256,(g,W,H)=>{g.fillStyle='#232427';g.fillRect(0,0,W,H);
    for(let i=0;i<5200;i++){const v=55+Math.random()*80|0;g.fillStyle='rgba('+v+','+v+','+(v+3)+','+(.35+Math.random()*.5)+')';g.fillRect(Math.random()*W,Math.random()*H,1+Math.random()*2.2,1+Math.random()*2.2);}});
  t.repeat.set(2,1);BOARD_M=new TH.MeshStandardMaterial({map:t,roughness:.97,metalness:0,envMapIntensity:.5});return BOARD_M;}
function filMat(){if(FIL_M)return FIL_M;const t=tex(256,64,(g,W,H)=>{for(let x=0;x<W;x+=16){const gr=g.createLinearGradient(x,0,x+16,0);gr.addColorStop(0,'#f4f4f1');gr.addColorStop(.5,'#d9dbd8');gr.addColorStop(1,'#f4f4f1');g.fillStyle=gr;g.fillRect(x,0,16,H);}});
  FIL_M=new TH.MeshStandardMaterial({map:t,roughness:.9,metalness:0});return FIL_M;}
/* 法蘭＋接頭剖面 (r, z)：圓形法蘭盤 Rf → 錐形漸縮 Rc1 → 接頭 R，末端兩道捲邊（實品照片） */
function collarProfile(N,C,H,W2,W){const R=N/2,rin=R-2,Rf=Math.min(0.86*N,H/2-4,W2/2-4,(W-W2)/2-4),Rc=Math.min(0.68*N,Rf-12);
  return {R,rin,Rf,prof:[[rin,0],[Rf,0],[Rf,3.5],[Rc,3.5],[Rc,0.16*C],[R*1.04,0.5*C],[R,0.56*C],[R,C-9],[R+2.6,C-8],[R+2.6,C-4.5],[R,C-3.5],[R,C],[rin,C],[rin,0]]};}

function build(K,id){
  TH=window.THREE;
  const m=K.mat,s=SP[id],{L,L1,W,W1,W2,H,H1,C,G,N}=s,small=id==='MH-D2DCPMTHZ';
  const x0=-L/2,x1=L/2,dB=-W/2,dF=W/2,ztop=H-H1,movers=[];
  /* body: galvanised steel box; one standing seam along the lid; screws along the lid edges */
  K.box(x0,x1,0,H,dB,dF,m.body,3);
  /* EA/OA (室外側) insulated section x0..xs (實品照片): dark speckled board on the end face, front and back;
     its top is a separate darker matte grey panel; the single top seam runs across the width at xs */
  const xs=x0+(small?192:0.26*L);
  {const bd=(w,h,dpt,x,y,z)=>{const pm=new TH.Mesh(new TH.BoxGeometry(w,h,dpt),boardMat());pm.position.set(K.cx(x),y,K.cz(z));pm.castShadow=pm.receiveShadow=true;K.addMesh(pm);};
   bd(2,H-8,W-8,x0-1,H/2,0);                                   // end face
   bd(xs-x0-4,H-8,2,(x0+xs)/2,H/2,dF+1);                       // front
   bd(xs-x0-4,H-8,2,(x0+xs)/2,H/2,dB-1);                       // back
   K.box(x0,xs,H,H+1.2,dB,dF,m.lid,1);                         // top panel (matte grey)
   K.box(xs-4,xs+4,H,H+6,dB+4,dF-4,m.body2,1.5);               // seam
   K.box((x0+xs)/2-22,(x0+xs)/2+22,H*0.32-9,H*0.32+9,dF+2,dF+12,m.ctrl,2);}   // black clip on the board
  for(let x=xs+40;x<=x1-40;x+=Math.max(120,(x1-xs-80)/5))[dB+12,dF-12].forEach(d=>K.rod('y',3.2,x,H+0.6,d,1.2,m.steel,12));
  K.box(x0+4,x1-4,0,0.8,dB+4,dF-4,m.seam);
  /* 4 ports: round black flange plate with 8 screws → stepped cone → collar with rolled end rings */
  const cp=collarProfile(N,C,H,W2,W);
  const ports=[[+1,-1,'RA','回風（室內）'],[+1,+1,'SA','送風（室內）'],[-1,-1,'EA','排風（室外）'],[-1,+1,'OA','新風（室外）']];
  ports.forEach(([sx,sd,code,name])=>{const fx=sx>0?x1:x0,dd=sd*W2/2,hc=H/2;
    K.lathe('x',sx,fx,hc,dd,cp.prof,m.plastic,96);
    for(let i=0;i<8;i++){const a=(i+0.5)*Math.PI/4,r=cp.Rf-8;K.rod('x',3,fx+sx*4.3,hc+r*Math.sin(a),dd+r*Math.cos(a),1.8,m.plastic,12);}
    K.disc('x',cp.rin-0.5,fx+sx*5,hc,dd,m.hole);
    K.tag(fx+sx*(C+3),hc+cp.Rf+22,dd,[sx,0,0],code,name);});
  /* hanger brackets ×4 (galvanised): D2 on the length ends, D3~D13 on the width sides; plate with Φ12 hole + up-stand */
  /* 吊耳：吊孔＋往最前端的窄開口（T 形：橫向圓頭長孔＋往前端的窄開口，實品照片），牙條可從前端滑入 */
  const ear=(px0,px1,pd0,pd1,hx,hd,lx0,lx1,ld0,ld1,dir)=>{K.plateCut(px0,px1,pd0,pd1,ztop-T_BRK,ztop,[{x:hx,d:hd,r:HOLE_R,nw:3.5,lr:0,ha:12,rh:5.5,dir}],m.body2);K.box(lx0,lx1,ztop-LEG,ztop-T_BRK,ld0,ld1,m.body2);};
  if(small){[1,-1].forEach(sx=>[1,-1].forEach(sd=>{const face=sx*L/2,hx=sx*L1/2,hd=sd*W1/2,tip=sx*(L1/2+G),a=Math.min(face,tip),b=Math.max(face,tip);
      ear(a,b,hd-B_BRK/2,hd+B_BRK/2,hx,hd,Math.min(face,face+sx*T_BRK),Math.max(face,face+sx*T_BRK),hd-B_BRK/2,hd+B_BRK/2,sx>0?'+x':'-x');}));}
  else{[1,-1].forEach(sx=>[1,-1].forEach(sd=>{const face=sd*W/2,hx=sx*L1/2,hd=sd*W1/2,tip=sd*(W1/2+G),a=Math.min(face,tip),b=Math.max(face,tip);
      ear(hx-B_BRK/2,hx+B_BRK/2,a,b,hx,hd,hx-B_BRK/2,hx+B_BRK/2,Math.min(face,face+sd*T_BRK),Math.max(face,face+sd*T_BRK),sd>0?'+d':'-d');}));}

  /* ---------- 電控箱: black ribbed plastic housing on a galvanised mounting plate (product photo) ---------- */
  const cb=small?{x0:x0+537,x1:x0+716,dd:73}:{x0:x1-57-172,x1:x1-57,dd:71};
  const ch0=0.05*H,ch1=0.95*H,cw=cb.x1-cb.x0,chh=ch1-ch0,fz=dF+cb.dd;
  K.box(cb.x0-12,cb.x1+12,ch0+10,ch1-4,dF,dF+2,m.body2);                          // mounting plate
  K.box(cb.x0,cb.x1,ch0,ch1-16,dF+2,fz,m.ctrl,6);                                 // housing
  K.box(cb.x0+10,cb.x1-10,ch1-16,ch1,dF+10,fz-8,m.ctrl,4);                        // stepped top cap
  [0.06,0.15,0.85,0.94].forEach(f=>{const x=cb.x0+f*cw;K.box(x-3.5,x+3.5,ch0+6,ch1-20,fz,fz+3,m.ctrl);});   // vertical ribs
  [ch0+10,ch1-26].forEach(h=>K.box(cb.x0+0.2*cw,cb.x1-0.2*cw,h-3,h+3,fz,fz+2.5,m.ctrl));                    // horizontal ribs
  [0.3,0.7].forEach(f=>{const h=ch0+f*chh;K.box(cb.x1,cb.x1+16,h-11,h+11,dF+cb.dd*0.3,dF+cb.dd*0.62,m.body2);K.box(cb.x1+13,cb.x1+16,h-11,h+11,dF+cb.dd*0.62,dF+cb.dd*0.85,m.body2);});   // side hook clips
  [cb.x0+0.3*cw,cb.x0+0.7*cw].forEach(x=>K.rod('y',6,x,ch0-6,dF+cb.dd*0.55,12,m.ctrl,16));                  // cable glands
  K.hvTri((cb.x0+cb.x1)/2,ch1-0.3*chh,fz+0.2,cw*0.5,'z+');
  K.box(cb.x0+0.2*cw,cb.x1-0.2*cw,ch0+0.11*chh,ch0+0.43*chh,fz,fz+0.6,m.label);   // 白色標籤區（內容先留白）
  {const lw=0.6*cw-8,lh=Math.min(lw/4.4,0.32*chh-8);K.nameplate((cb.x0+cb.x1)/2,ch0+0.27*chh,fz+1.2,lh*4.4,lh,'z+',id,'全熱交換器 '+s.Q+' CMH');}   // 型號牌
  K.tag((cb.x0+cb.x1)/2,ch1+26,fz,[0,0,1],'CB','電控箱');

  /* ---------- 維修門 (MEDOLE panel): opens to service the PM2.5 filters and the heat-exchange core ---------- */
  const ax0=xs+16,ax1=small?x0+524:cb.x0-40,ah0=14,ah1=H-14,acx=(ax0+ax1)/2;
  [ax0-14,ax1].forEach(x=>K.box(x,x+14,8,H-8,dF,dF+6,m.body2,2));                 // door frame channels
  K.box(ax0+2,ax1-2,ah0+2,ah1-2,dF+0.2,dF+0.5,m.hole);                            // dark opening behind the door
  const door=K.group(()=>{K.box(ax0,ax1,ah0,ah1,dF+0.6,dF+3,m.body2,2);
    K.logo(ax0+(ax1-ax0)*0.3,ah1-34,dF+3.2,Math.min(190,(ax1-ax0)*0.5),'z+');
    /* 型號牌移到電控箱白色標籤區（使用者指示） */});
  /* 維修門以螺絲固定（實品）：6 顆十字頭螺絲，拆卸時先轉開退出，門板再往外退出並漸隱 */
  const screws=[];[ax0+14,acx,ax1-14].forEach(x=>[ah0+12,ah1-12].forEach(h=>{const sg=new TH.Group();sg.position.set(K.cx(x),h,K.cz(dF+3));
      /* pan-head Phillips screw: low rounded head, cross RECESSED into the head (dark cross set into a flat top, with a shaded bevel) */
      const prof=[[0.01,1.9],[2.6,1.9],[3.8,1.6],[4.5,1.0],[4.7,0.3],[4.7,0]].map(([r,z])=>new TH.Vector2(r,z)).reverse();
      const hdm=new TH.Mesh(new TH.LatheGeometry(prof,28),m.steel);hdm.rotation.x=Math.PI/2;sg.add(hdm);
      [[3.4,0.9],[0.9,3.4]].forEach(([a,b])=>{const ck=new TH.Mesh(new TH.BoxGeometry(a*2,b*2,1.6),m.hole);ck.position.z=1.15;sg.add(ck);});   // cross recess: top sits just below the head top (1.95)
      door.add(sg);screws.push(sg);}));
  door.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.userData.op=o.material.opacity;}});
  const doorMv={kind:'door',name:'維修門（螺絲固定）',g:door,screws,view:0.45,labels:[['in','裝回','鎖上螺絲'],['side','拆下','轉開螺絲・退出']]};
  /* heat-exchange core: square prism standing on a corner (diamond in the side view), slides out +d */
  const hd=(H-90)/2,Dc=W-90,cd1=dF-8,cd0=cd1-Dc;
  const core=K.group(()=>{const sh=new TH.Shape();sh.moveTo(0,hd);sh.lineTo(hd,0);sh.lineTo(0,-hd);sh.lineTo(-hd,0);sh.lineTo(0,hd);
      const cm=new TH.Mesh(new TH.ExtrudeGeometry(sh,{depth:Dc,bevelEnabled:false}),coreMat());cm.position.set(K.cx(acx),H/2,K.cz(cd0));cm.castShadow=cm.receiveShadow=true;K.addMesh(cm);
      [[0,hd],[hd,0],[0,-hd],[-hd,0]].forEach(([u,v])=>K.box(acx+u-4,acx+u+4,H/2+v-4,H/2+v+4,cd0,cd1,m.steel));   // aluminium corner rails
      K.box(acx-26,acx+26,H/2-7,H/2+7,cd1,cd1+8,m.ctrl,2);});                        // pull handle
  /* two PM2.5 filters lying flush on the two lower faces of the diamond core (斜貼芯體) */
  const fl=hd*Math.SQRT2*0.94,ft=18;
  const filters=K.group(()=>[-1,1].forEach(sg=>{const off=hd/2+(ft/2+1.5)/Math.SQRT2,cx=acx+sg*off,cy=H/2-off,rz=-sg*Math.PI/4;   // slab thickness along the face normal (1,-1)·sg → lies flat on the face
      const fm=new TH.Mesh(new TH.BoxGeometry(ft,fl,Dc-6),filMat());fm.position.set(K.cx(cx),cy,K.cz((cd0+cd1)/2-3));fm.rotation.z=rz;fm.castShadow=true;K.addMesh(fm);
      const cap=new TH.Mesh(new TH.BoxGeometry(ft+4,fl+4,5),m.ctrl);cap.position.set(K.cx(cx),cy,K.cz(cd1-2.5));cap.rotation.z=rz;K.addMesh(cap);
      const hdl=new TH.Mesh(new TH.BoxGeometry(8,26,8),m.ctrl);hdl.position.set(K.cx(cx+sg*7/Math.SQRT2),cy-7/Math.SQRT2,K.cz(cd1+4));hdl.rotation.z=rz;K.addMesh(hdl);}));
  movers.push(doorMv,
    {kind:'slideD',name:'全熱交換芯體',g:core,dist:Dc*0.55,door:doorMv,view:0.45,labels:[['in','收回','原位'],['side','抽出','約 55%']]},
    {kind:'slideD',name:'PM2.5 濾網（2 片）',g:filters,dist:Dc*0.5,door:doorMv,view:0.45,labels:[['in','收回','原位'],['side','抽出','約 50%']]});
  movers.forEach(mv=>K.movers.push(mv));

  /* dimensions: overall length on the front, hanger spacing on the back, width on the right, height on the left */
  K.dim([x0,0,fz],[x1,0,fz],[0,0,90],String(L));
  K.dim([-L1/2,ztop,-W1/2],[L1/2,ztop,-W1/2],[0,0,-(small?60:G+60)],String(L1));
  K.dim([x1+C,0,dB],[x1+C,0,dF],[90,0,0],String(W));
  K.dim([x0,0,dF],[x0,H,dF],[0,0,120],String(H));
}

Object.keys(SP).forEach(id=>{const s=SP[id];
  (window.MEDOLE_MODELS=window.MEDOLE_MODELS||[]).push({
    id, slug:id.toLowerCase(), cat:'erv', kind:'全熱交換器・DC-PM2.5 過濾系列', finish:'galv', material:'鍍鋅鋼板',
    center:{x:0,d:0}, footprint:{L:s.L+2*s.C, D:Math.max(s.W1+2*s.G,s.W+2*75), H:s.H},
    note:'依型錄三視圖尺寸表建模（L、L1、W、W1、W2、H、H1、C、G、N 照表）；接頭喇叭口、吊架、電控箱與維修蓋位置比照原 Rhino 模型，未標註部位依圖面比例。'+(id==='MH-D2DCPMTHZ'?'':'安裝時須預留 450×450 維修孔。'),
    variants:{fixed:'四向風管 Φ'+s.N+'（RA 回風／SA 送風／EA 排風／OA 新風）'},
    build(K){build(K,id);}
  });});
})();
