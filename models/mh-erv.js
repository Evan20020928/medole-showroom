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
const DATA=window.MEDOLE_DATA=window.MEDOLE_DATA||{specs:{}};
Object.keys(SP).forEach(id=>{const s=SP[id];
  DATA.specs[id]={cat:'erv',cmh:String(s.Q),duct:String(s.N),size:s.L+'*'+s.W+'*'+s.H,L:s.L,L1:s.L1,W:s.W,W1:s.W1,W2:s.W2,H:s.H,H1:s.H1,C:s.C,G:s.G,N:s.N};});

const T_BRK=2.5,B_BRK=40,LEG=40,HOLE_R=6;
/* 接頭剖面 (r, z)：喇叭口根部 R0 → 接頭外徑 R，長度 C（同 model.py collar_profile） */
function collarProfile(N,C,H,W2,W){const R=N/2,rin=R-2,d0=Math.min(1.45*N,H-6,W2-10,W-W2-10),R0=d0/2,z1=0.15*C,z2=0.40*C,r1=R+(R0-R)*0.30;
  return {R,rin,R0,prof:[[rin,0],[R0,0],[r1,z1],[R,z2],[R,C],[rin,C],[rin,0]]};}

function build(K,id){
  const m=K.mat,s=SP[id],{L,L1,W,W1,W2,H,H1,C,G,N}=s,small=id==='MH-D2DCPMTHZ';
  const x0=-L/2,x1=L/2,dB=-W/2,dF=W/2,ztop=H-H1;
  /* body: galvanised steel box, top lid seams, end-cap seams */
  K.box(x0,x1,0,H,dB,dF,m.body,3);
  [-0.2,0.2].forEach(f=>K.box(x0+8,x1-8,H,H+0.8,f*W-1.2,f*W+1.2,m.seam));
  [x0+58,x1-58].forEach(x=>K.box(x-1.2,x+1.2,H,H+0.8,dB+6,dF-6,m.seam));
  K.box(x0+4,x1-4,0,0.8,dB+4,dF-4,m.seam);
  /* 4 duct collars (black) with square flange plates; RA/SA on +x, EA/OA on −x; +d = front (電控箱側) */
  const cp=collarProfile(N,C,H,W2,W),P=Math.min(cp.R0*2+18,H-6);
  const ports=[[+1,-1,'RA','回風（室內）'],[+1,+1,'SA','送風（室內）'],[-1,-1,'EA','排風（室外）'],[-1,+1,'OA','新風（室外）']];
  ports.forEach(([sx,sd,code,name])=>{const fx=sx>0?x1:x0,dd=sd*W2/2,hc=H/2;
    K.box(Math.min(fx,fx+sx*3),Math.max(fx,fx+sx*3),hc-P/2,hc+P/2,dd-P/2,dd+P/2,m.plastic);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>K.rod('x',3.2,fx+sx*4,hc+a*(P/2-9),dd+b*(P/2-9),2,m.plastic,12));
    K.lathe('x',sx,fx+sx*3,hc,dd,cp.prof,m.plastic,72);
    K.disc('x',cp.rin-0.5,fx+sx*6,hc,dd,m.hole);
    K.tag(fx+sx*(C+3),hc+cp.R0+26,dd,[sx,0,0],code,name);});
  /* hanger brackets ×4 (galvanised): D2 on the length ends, D3~D13 on the width sides; plate with Φ12 hole + up-stand */
  const ear=(px0,px1,pd0,pd1,hx,hd,lx0,lx1,ld0,ld1)=>{K.plateCut(px0,px1,pd0,pd1,ztop-T_BRK,ztop,[],m.body2,[{x:hx,d:hd,r:HOLE_R}]);K.box(lx0,lx1,ztop-LEG,ztop-T_BRK,ld0,ld1,m.body2);};
  if(small){const off=(L1-L)/2;
    [1,-1].forEach(sx=>[1,-1].forEach(sd=>{const face=sx*L/2,hx=sx*L1/2,hd=sd*W1/2,tip=sx*(L1/2+G),a=Math.min(face,tip),b=Math.max(face,tip);
      ear(a,b,hd-B_BRK/2,hd+B_BRK/2,hx,hd,Math.min(face,face+sx*T_BRK),Math.max(face,face+sx*T_BRK),hd-B_BRK/2,hd+B_BRK/2);}));}
  else{[1,-1].forEach(sx=>[1,-1].forEach(sd=>{const face=sd*W/2,hx=sx*L1/2,hd=sd*W1/2,tip=sd*(W1/2+G),a=Math.min(face,tip),b=Math.max(face,tip);
      ear(hx-B_BRK/2,hx+B_BRK/2,a,b,hx,hd,hx-B_BRK/2,hx+B_BRK/2,Math.min(face,face+sd*T_BRK),Math.max(face,face+sd*T_BRK));}));}
  /* control box (black) on the front side + yellow HV sticker; filter access cover; MEDOLE logo; nameplate */
  let cb;
  if(small)cb={x0:x0+537,x1:x0+716,dd:73};else cb={x0:x1-57-172,x1:x1-57,dd:71};
  const ch0=0.05*H,ch1=0.95*H;
  K.box(cb.x0,cb.x1,ch0,ch1,dF,dF+cb.dd,m.ctrl,4);
  [[cb.x0+10,ch0+10],[cb.x1-10,ch0+10],[cb.x0+10,ch1-10],[cb.x1-10,ch1-10]].forEach(([x,h])=>K.screw(x,h,dF+cb.dd,1,3,m.ctrl));
  K.box(cb.x0+30,cb.x1-30,ch0-14,ch0,dF+cb.dd*0.3,dF+cb.dd*0.7,m.ctrl);   // cable gland strip
  {const w=Math.min((cb.x1-cb.x0)*0.42,(ch1-ch0)*0.34);K.hvSticker((cb.x0+cb.x1)/2,(ch0+ch1)/2+8,dF+cb.dd,w,w,'z+');}
  const acx0=small?x0+192:x0+70,acx1=small?x0+524:cb.x0-40;
  K.box(acx0,acx1,20,H-20,dF,dF+3,m.body2,2);
  [acx0+28,acx1-28].forEach(x=>K.box(x-14,x+14,H/2-5,H/2+5,dF+3,dF+9,m.ctrl,2));   // access-cover latches
  K.logo(acx0+(acx1-acx0)*0.27,H-42,dF+3,Math.min(150,(acx1-acx0)*0.42),'z+');
  K.nameplate(acx0+(acx1-acx0)*0.62,52,dF+3,Math.min(150,(acx1-acx0)*0.42),40,'z+',id,'全熱交換器 '+s.Q+' CMH');
  K.tag((cb.x0+cb.x1)/2,ch1+26,dF+cb.dd,[0,0,1],'CB','電控箱');
  /* dimensions: overall length on the front, hanger spacing on the back, width on the right, height on the left */
  const dFr=dF+cb.dd;
  K.dim([x0,0,dFr],[x1,0,dFr],[0,0,90],String(L));
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
