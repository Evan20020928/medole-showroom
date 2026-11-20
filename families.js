/* Shared family builders. Plan coords mm relative to the main body: x from body left edge, d from body back face (+d toward the outlet face), h up. */
(function(){
const F=window.MEDOLE_FAMILIES=window.MEDOLE_FAMILIES||{};

/* Family A: MD-30LB / MD-A40LB / MD-40LBD / MD-70LBD — control box on the left end, hanger brackets on both ends,
   8" oval outlet on the front face, natural return through a back filter or an optional return box. */
F.A=function(K,P,v){
  const m=K.mat,H=P.H,L=P.body.L,D=P.body.D;
  /* cabinet */
  K.box(0,L,P.base,H,0,D,m.body,4);
  K.box(4,L-4,0,P.base,4,D-4,m.seam);
  K.box(0,L,P.base,P.base+1.5,P.body.seam-1,P.body.seam+1,m.seam);           // front lower panel seam
  P.ribs.forEach(([d0,d1])=>K.box(2,L-2,H,H+3,d0,d1,m.body2));               // top lid stiffening ribs
  /* control box, gland, lamp */
  const C=P.ctrl;K.box(C.x0,C.x1,P.base,H,C.d0,C.d1,m.body2,3);
  K.box(C.gx0,C.x0,C.gh0,C.gh1,C.d0,C.gd1,m.body);
  /* hanger brackets (ear at holes.h) */
  const HB=P.holes;
  HB.d.forEach(d=>{K.bracket(0,P.brL,d,P.brW,HB.h,28);K.bracket(L,P.brR,d,P.brW,HB.h,28);HB.x.forEach(x=>K.hole(x,d,HB.h,6));});
  /* drain head on the back face */
  K.rod('z',14,P.drain.x,P.drain.h,-P.drain.len/2,P.drain.len,m.drain,32);K.disc('z',10,P.drain.x,P.drain.h,-P.drain.len-0.3,m.hole);
  /* front face: screws, nameplate */
  P.screws.x.forEach(x=>P.screws.h.forEach(h=>K.screw(x,h,D,1,4.5)));
  K.nameplate(P.plate.x,P.plate.h,D+0.8,150,40,'z+',P.id,P.plate.sub);

  /* ---------- supply (front face d=D) ---------- */
  const O=P.outlet,sid=v.supply?v.supply.id:'s1';let sTip,sTag;
  if(sid==='s1'){
    K.ovalDuct({x:O.x,d:D,dir:1,hPlate:O.hPlate,h:O.h,plateW:O.pw,plateH:O.ph,plateT:O.t,cone:O.cone,od:193,len:O.len});
    sTip=D+O.t+O.cone+O.len;sTag=[O.x,O.h+97+24];
  }else{
    const S=P.supply[sid];
    const dF=D+S.df;
    if(S.box){K.box(S.box[0],S.box[1],S.h[0],S.h[1],D,dF,m.body2,4);}
    else{K.frustumZ(D,[S.back[0],S.back[1],S.hb[0],S.hb[1]],dF,[S.front[0],S.front[1],S.hf[0],S.hf[1]],m.body2);}
    let top=0;
    S.ducts.forEach(([x,h,od,len])=>{K.duct({axis:'z',dir:1,x,h,d:dF,od,len,plate:[od+8,od+8],plateT:3});top=Math.max(top,h+od/2);});
    sTip=dF+Math.max(...S.ducts.map(q=>q[3]));sTag=[(S.ducts[0][0]+S.ducts[S.ducts.length-1][0])/2,top+24];
  }
  K.tag(sTag[0],sTag[1],sTip,[0,0,1],'SA',(v.supply?v.supply.name+' '+v.supply.spec:'出風 8"'));

  /* ---------- return (back face d=0) ---------- */
  const rid=v.ret?v.ret.id:'r0';let rTip,rTag;
  const RB=P.ret;
  if(rid==='r0'){
    const Fi=P.filter;rTip=F.filterSet(K,{src:Fi.src,x0:Fi.x0,x1:Fi.x1,h0:Fi.h0,h1:Fi.h1,back:0,carbon:true});
    rTag=[(Fi.x0+Fi.x1)/2,Fi.h1+34];
    K.tag(rTag[0],rTag[1],rTip,[0,0,-1],'RA','自然回・甲醛＋初效濾網（側拉／下拉）');
  }else{
    const R=RB[rid];K.box(R.box[0],R.box[1],RB.h[0],RB.h[1],R.d0,0,m.body2,4);
    if(R.oval){const o=R.oval;K.ovalDuct({x:o.x,d:R.d0,dir:-1,hPlate:RB.hc,h:RB.hc,plateW:o.pw,plateH:148,plateT:o.t,cone:o.cone,od:193,len:o.len});
      rTip=R.d0-o.t-o.cone-o.len;rTag=[o.x,RB.hc+97+24];}
    else{R.ducts.forEach(([x,od,len])=>K.duct({axis:'z',dir:-1,x,h:RB.hc,d:R.d0,od,len,flare:true,flareR:od>120?12:7}));
      rTip=R.d0-Math.max(...R.ducts.map(q=>q[2]));rTag=[(R.ducts[0][0]+R.ducts[R.ducts.length-1][0])/2,RB.hc+73+24];}
    K.tag(rTag[0],rTag[1],rTip,[0,0,-1],'RA',v.ret.name+' '+v.ret.spec);
  }
  K.tag(P.drain.x,P.drain.h+40,-P.drain.len,[0,0,-1],'3/4"','排水頭');
  K.tag(C.gx0,H*0.8,(C.d0+C.d1)/2,[-1,0,0],'CB','控制盒');

  /* dimensions */
  const xL=C.gx0,xR=P.brR,dF=Math.max(sTip,D),dB=Math.min(rTip,0);
  K.dim([xL,0,dF],[xR,0,dF],[0,0,90],String(P.overall.W));
  K.dim([HB.x[0],HB.h,HB.d[0]],[HB.x[1],HB.h,HB.d[0]],[0,0,-(HB.d[0]-dB)-120],String(P.overall.hole));
  K.dim([xR,0,dB],[xR,0,dF],[90,0,0],String(Math.round(dF-dB)));
  K.dim([0,0,D],[0,H,D],[0,0,120],String(H));
};
})();

/* ---------- small shared parts for the single-configuration models ---------- */
(function(){
const F=window.MEDOLE_FAMILIES;
/* hanger ears on both ends (ear top at h), with round hole + rubber washer */
F.ears=function(K,o){const m=K.mat;o.d.forEach(d=>{K.bracket(o.faceL,o.tipL,d,o.w,o.h,o.leg||28);K.bracket(o.faceR,o.tipR,d,o.w,o.h,o.leg||28);o.x.forEach(x=>K.hole(x,d,o.h,6));});};
/* flat base plates under both ends with slotted holes (長圓孔) */
F.basePlates=function(K,o){const m=K.mat,t=o.t||5;o.d.forEach(d=>{
  K.box(o.xL[0],o.xL[1],0,t,d-o.w/2,d+o.w/2,m.body2);K.box(o.xR[0],o.xR[1],0,t,d-o.w/2,d+o.w/2,m.body2);
  o.slot.forEach(x=>{K.box(x-6,x+6,t-0.5,t+0.6,d-14,d+14,m.hole);});});};
/* natural-return filters, built from the user's Rhino models (MD-30LB / MD-70LB 單出自然回.3dm, tools/filter_rules.py).
   Rules are mm offsets from the 初效濾網 frame rect and from the unit's back face (y = distance behind the back face).
   From the back face outward: 甲醛濾網 (pleated, optional) → 初效濾網 (black frame + diamond wire mesh), held by top/bottom rails.
   Each filter has a side pull (側拉) and a bottom pull (下拉): thin tabs on the 甲醛濾網, black plastic-sheet strap loops (拉帶) folded around the 初效濾網 frame edge. */
F.FILTER_RULES={"30":{"frame":{"y":[16.19999999999999,19.80000000000001],"border":8,"r":8},"mesh":{"px":7.07,"pz":3.06,"wire":3.06},"rings":[{"side":"x","out":19.3,"in":11.0,"zc":0.515,"size":35.0},{"side":"z","out":19.3,"in":11.1,"xc":0.465,"size":35.0}],"carbon":{"dx":[-39.0,3.0],"dz":[-3.0,0.0],"y":[2.0,12.0],"pitch":6.0,"tabs":[{"side":"x","out":30.0,"zc":0.497,"size":15.0,"t":1.0},{"side":"z","out":30.0,"xc":0.509,"size":15.0,"t":1.0}]},"rails":[{"x":[-10.0,-25.0],"z":[-16.0,4.0],"ref":"top","y":[15.0,23.0]},{"x":[-26.0,-11.0],"z":[-16.0,4.0],"ref":"top","y":[0.0,15.0]},{"x":[-27.0,-10.0],"z":[-6.0,4.0],"ref":"bottom","y":[0.0,22.2]}]},"70":{"frame":{"y":[16.19999999999999,19.80000000000001],"border":8,"r":8},"mesh":{"px":10.02,"pz":3.9,"wire":3.89},"rings":[{"side":"z","out":24.5,"in":14.0,"xc":0.465,"size":49.6},{"side":"x","out":27.4,"in":15.6,"zc":0.515,"size":44.4}],"carbon":{"dx":[4.0,-4.7],"dz":[4.9,-0.7],"y":[5.0,13.0],"pitch":7.48,"tabs":[{"side":"z","out":36.3,"xc":0.509,"size":18.7,"t":0.8},{"side":"x","out":37.4,"zc":0.497,"size":18.2,"t":0.8}]},"rails":[{"x":[17.8,-20.8],"z":[-7.7,12.3],"ref":"top","y":[14.0,22.0]},{"x":[0.2,2.7],"z":[2.3,22.3],"ref":"top","y":[1.0,16.0]},{"x":[16.7,-19.4],"z":[-2.5,7.5],"ref":"bottom","y":[1.0,23.2]}]}};
/* o: {src:'30'|'70', x0,x1,h0,h1: 初效濾網 frame rect, back: d of the back face (filters stack toward -d), carbon: include 甲醛濾網} -> outermost d */
F.filterSet=function(K,o){
  const R=F.FILTER_RULES[o.src||'70'],m=K.mat,D=y=>o.back-y,W=o.x1-o.x0,Hh=o.h1-o.h0;let tip=o.back;
  R.rails.forEach(r=>{const ref=r.ref==='top'?o.h1:o.h0;K.box(o.x0+r.x[0],o.x1+r.x[1],ref+r.z[0],ref+r.z[1],D(r.y[1]),D(r.y[0]),m.body2);tip=Math.min(tip,D(r.y[1]));});
  if(o.carbon){const c=R.carbon,cx0=o.x0+c.dx[0],cx1=o.x1+c.dx[1],cz0=o.h0+c.dz[0],cz1=o.h1+c.dz[1],dF=D(c.y[1]);
    K.pleatPanel(cx0,cx1,cz0,cz1,dF,D(c.y[0]),c.pitch);
    c.tabs.forEach(t=>{if(t.side==='x'){const zc=cz0+t.zc*(cz1-cz0);K.box(cx0-t.out,cx0,zc-t.size/2,zc+t.size/2,dF,dF+t.t,m.carbonTab);}
      else{const xc=cx0+t.xc*(cx1-cx0);K.box(xc-t.size/2,xc+t.size/2,cz0-t.out,cz0,dF,dF+t.t,m.carbonTab);}});}
  const f=R.frame;K.filterFrame(o.x0,o.x1,o.h0,o.h1,D(f.y[1]),D(f.y[0]),f.border,f.r,R.mesh);
  const dm=D((f.y[0]+f.y[1])/2);
  /* 拉帶: black plastic-sheet strap looped around the frame edge (user sketch + photo); size from the Rhino loop:
     reach past the edge, overlap on the faces, loop depth 7.5 mm around the frame, strap width = loop length along the edge */
  const la=(R.loopDepth||7.5)/2+1;   // loop 1 mm puffier than the Rhino model on each face (user request)
  /* only the side-pull strap is shown: the bottom-pull strap would hang outside the rails (user request) */
  R.rings.forEach(g=>{if(g.side==='x')K.strapLoop({axis:'x',at:o.x0,c:o.h0+g.zc*Hh,d:dm,out:g.out,inn:g.in,width:g.size,a:la});});
  return Math.min(tip,D(f.y[1]));
};
/* legacy plain filter box (kept for reference) */
F.filter=function(K,o){const m=K.mat;K.box(o.x0,o.x1,o.h0,o.h1,o.d0,o.d1,m.body2);K.box(o.x0+10,o.x1-10,o.h0+10,o.h1-10,o.d0-0.6,o.d0+1,m.seam);};
/* drain head: axis 'z' (back face, dir -1) or 'x' (left end, dir -1) */
F.drain=function(K,o){const m=K.mat,len=o.len||26;
  if(o.axis==='x'){K.rod('x',13,o.x-len/2,o.h,o.d,len,m.drain,28);K.disc('x',9,o.x-len-0.3,o.h,o.d,m.hole);return [o.x-len,o.h,o.d];}
  K.rod('z',13,o.x,o.h,o.d-len/2,len,m.drain,28);K.disc('z',9,o.x,o.h,o.d-len-0.3,m.hole);return [o.x,o.h,o.d-len];};
F.screws=function(K,list,d){list.forEach(([x,h])=>K.screw(x,h,d,1,4.5));};
})();

/* Family C: tall white units with flat-oval 10" flanges (MD-130LB, MD-210LB, MD-250LB, MD-300LBD).
   Plan from DXF blocks (origin = overall left / back-most point), heights from catalog p.16–18. */
(function(){
const F=window.MEDOLE_FAMILIES;
F.C=function(K,P,v){
  const m=K.mat,H=P.H,B=P.body;
  K.box(B.x0,B.x1,P.base,H,B.d0,B.d1,m.body,4);
  K.box(B.x0,B.x1,0,P.base,B.d0+20,B.d1-20,m.seam);
  K.box(B.x0,B.x1,P.base,P.base+1.5,B.seam-1,B.seam+1,m.seam);
  F.basePlates(K,{xL:[0,B.x0],xR:[B.x1,P.L],d:P.plates.d,w:P.plates.w,slot:P.plates.slot});
  /* front-mounted control box (電氣蓋) */
  const C=P.ctrl;K.box(C.x0,C.x1,C.h0,C.h1,B.d1,B.d1+C.dd,m.body2,3);
  [[C.x0+12,C.h0+12],[C.x1-12,C.h0+12],[C.x0+12,C.h1-12],[C.x1-12,C.h1-12]].forEach(([x,h])=>K.screw(x,h,B.d1+C.dd,1,3.5));
  /* supply: boxes with flat-oval outlets */
  let sTip=B.d1,sTop=0;
  P.supply.forEach(s=>{
    const cx=(s.x0+s.x1)/2,ch=s.oh||(s.h0+s.h1)/2,face=B.d1+s.dd;
    const tip=K.stadium({x:cx,h:ch,d:face,dir:1,w:s.ow,hh:s.ohh,len:s.olen||6,t:4,plate:s.plate||null,m:m.plastic,
      recess:{x0:s.x0,x1:s.x1,h0:s.h0,h1:s.h1,depth:s.dd,m:m.body2}});
    sTip=Math.max(sTip,tip);sTop=Math.max(sTop,ch+s.ohh/2);});
  const sx=(P.supply[0].x0+P.supply[P.supply.length-1].x1)/2;
  K.tag(sx,sTop+30,sTip,[0,0,1],'SA',P.supplyName);
  /* return side */
  const rid=v.ret?v.ret.id:(P.ret?'rb':'r0');
  let fTip=B.d0;
  if(rid==='r0'){   // 只有初效濾網：依該機型回風口尺寸，構造比照 MD-70LB 3dm
    const f=P.filter,fr={x0:f.x0+6,x1:f.x1-6,h0:Math.max(f.h0,48),h1:Math.min(f.h1,H-30)};
    fTip=F.filterSet(K,{src:'70',x0:fr.x0,x1:fr.x1,h0:fr.h0,h1:fr.h1,back:B.d0,carbon:false});
    K.tag((fr.x0+fr.x1)/2,fr.h1+40,fTip,[0,0,-1],'RA','自然回・初效濾網（側拉／下拉）');}
  else{const R=P.ret;K.box(R.x0,R.x1,R.h0,R.h1,R.d0,B.d0,m.body2,4);
    R.x.forEach(x=>K.stadium({x,h:R.h,d:R.d0,dir:-1,w:R.w,hh:R.hh,len:R.len,t:3,plate:R.plate,m:m.plastic}));
    K.tag((R.x[0]+R.x[R.x.length-1])/2,R.h+R.hh/2+30,R.d0-R.len,[0,0,-1],'RA',P.retName);
    if(P.topFilter)K.box(P.topFilter[0],P.topFilter[1],H,H+3,P.topFilter[2],P.topFilter[3],m.body2);}
  /* drain on the left end face */
  const dr=F.drain(K,{axis:'x',x:B.x0,d:P.drain.d,h:P.drain.h,len:22});
  K.tag(dr[0],P.drain.h+40,P.drain.d,[-1,0,0],'3/4"','排水頭');
  K.tag((C.x0+C.x1)/2,C.h1+30,B.d1+C.dd,[0,0,1],'CB','控制盒');
  if(P.screws)F.screws(K,P.screws,B.d1);
  K.nameplate(P.plate.x,P.plate.h,B.d1+0.8,150,40,'z+',P.id,P.plate.sub);
  /* dims */
  const dB=rid==='r0'?fTip:P.ret.d0-P.ret.len;
  K.dim([0,0,sTip],[P.L,0,sTip],[0,0,90],String(P.dimL));
  K.dim([P.L,0,dB],[P.L,0,sTip],[90,0,0],String(P.dimD&&rid!=='r0'?P.dimD:Math.round(sTip-dB)));
  K.dim([B.x0,0,B.d1],[B.x0,H,B.d1],[0,0,150],String(H));
};
})();
