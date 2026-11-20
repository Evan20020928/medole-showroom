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
  P.ribs.forEach(([d0,d1])=>K.ridge(2,L-2,d0,d1,H,5,m.body));               // top lid stiffening ribs
  /* control box, gland, lamp */
  const C=P.ctrl;K.box(C.x0,C.x1,P.base,H,C.d0,C.d1,m.body2,3);
  K.box(C.gx0,C.x0,C.gh0,C.gh1,C.d0,C.gd1,m.body);
  /* hanger brackets (ear at holes.h) */
  const HB=P.holes;
  HB.d.forEach(d=>{K.bracket(0,P.brL,d,P.brW,HB.h,28);K.bracket(L,P.brR,d,P.brW,HB.h,28);HB.x.forEach(x=>K.hole(x,d,HB.h,6));});
  /* drain head on the back face */
  K.rod('z',14,P.drain.x,P.drain.h,-P.drain.len/2,P.drain.len,m.drain,32);K.obstacles.push({x0:P.drain.x-14,x1:P.drain.x+14,h0:P.drain.h-14,h1:P.drain.h+14,d0:-P.drain.len,d1:0});K.disc('z',10,P.drain.x,P.drain.h,-P.drain.len-0.3,m.hole);
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
    F.boxFilters(K,{x0:R.box[0],x1:R.box[1],h0:RB.h[0],h1:RB.h[1],d0:R.d0,d1:0},{src:P.filter.src,carbon:true,back:0,nat:P.filter});
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
/* o: {src:'30'|'70', x0,x1,h0,h1: 初效濾網 frame rect, back: d the filters stack from (toward -d), carbon: include 甲醛濾網,
        fold3: 三折式 (both filters), inBox: {x0} filters sit inside a return box and slide out through a slot in its end face at x0} -> outermost d */
F.filterSet=function(K,o){
  const R=F.FILTER_RULES[o.src||'70'],m=K.mat,D=y=>o.back-y,W=o.x1-o.x0,Hh=o.h1-o.h0,T3=window.THREE;let tip=o.back;
  const list=[];   // movers, in UI order
  /* three equal hinged panels; panel(xa,xb,lead) builds one panel; hinges are vertical lines at d=dm; panels fold away from the unit */
  function trifold(x0,x1,dm,panel,knuckles,geo){
    const s3=(x1-x0)/3,xa=x0+s3,xb=x0+2*s3;let p1,p2;
    const g=K.group(()=>{K.group(()=>panel(xb,x1,false));p2=K.group(()=>panel(xa,xb,false));p1=K.group(()=>panel(x0,xa,true));if(knuckles)knuckles(xa,xb);});
    const h2=new T3.Group(),h1=new T3.Group();
    h2.position.set(K.cx(xb),0,K.cz(dm));g.add(h2);h2.add(p2);p2.position.set(-K.cx(xb),0,-K.cz(dm));
    h1.position.set(K.cx(xa)-K.cx(xb),0,0);h2.add(h1);h1.add(p1);p1.position.set(-K.cx(xa),0,-K.cz(dm));
    return {g,side:2*s3,fold:Object.assign({step:s3,a1:Math.PI/6,a2:Math.PI/4,h1,h2,x0,dm},geo)};}
  if(!o.inBox)R.rails.forEach(r=>{const ref=r.ref==='top'?o.h1:o.h0;K.box(o.x0+r.x[0],o.x1+r.x[1],ref+r.z[0],ref+r.z[1],D(r.y[1]),D(r.y[0]),m.body2);tip=Math.min(tip,D(r.y[1]));});
  let dMin=1e9,dMax=-1e9;
  if(o.carbon){const c=R.carbon,cx0=o.x0+c.dx[0],cx1=o.x1+c.dx[1],cz0=o.h0+c.dz[0],cz1=o.h1+c.dz[1],dF=D(c.y[1]),dB=D(c.y[0]),dmc=(dF+dB)/2;
    dMin=Math.min(dMin,dF-1);dMax=Math.max(dMax,dB);
    const tabs=()=>c.tabs.forEach(t=>{if(t.side==='x'){const zc=cz0+t.zc*(cz1-cz0);K.box(cx0-t.out,cx0,zc-t.size/2,zc+t.size/2,dF,dF+t.t,m.carbonTab);}});   // bottom tab hidden (user request)
    if(o.fold3){const tf=trifold(cx0,cx1,dmc,(xa,xb,lead)=>{K.pleatPanel(xa,xb,cz0,cz1,dF,dB,c.pitch);if(lead)tabs();},null,
        {out:Math.max(0,...c.tabs.filter(t=>t.side==='x').map(t=>t.out)),ht:(dB-dF)/2,y0:cz0,y1:cz1});
      list.push({name:'甲醛除臭濾網（三折式）',g:tf.g,side:tf.side,fold:tf.fold,hMin:cz0});}
    else{const cg=K.group(()=>{K.pleatPanel(cx0,cx1,cz0,cz1,dF,dB,c.pitch);tabs();});
      const parts=[{x0:cx0,h0:cz0,h1:cz1,d0:dF,d1:dB}];
      c.tabs.filter(t=>t.side==='x').forEach(t=>{const zc=cz0+t.zc*(cz1-cz0);parts.push({x0:cx0-t.out,h0:zc-t.size/2,h1:zc+t.size/2,d0:dF,d1:dB});});
      list.push({name:'甲醛除臭濾網',g:cg,side:0.5*(cx1-cx0),down:0.5*(cz1-cz0),hMin:cz0-36,parts});}}
  const f=R.frame,dm=D((f.y[0]+f.y[1])/2),la=(R.loopDepth||7.5)/2+1,wf=K.FRAME_ROD+0.4,ld=(R.loopDepth||7.5)/2+2;
  dMin=Math.min(dMin,dm-ld);dMax=Math.max(dMax,dm+ld);
  const straps=()=>R.rings.forEach(g=>{if(g.side==='x')K.strapLoop({axis:'x',at:o.x0,c:o.h0+g.zc*Hh,d:dm,out:g.out,inn:g.in,width:g.size,a:la,wf});});
  const frame=(xa,xb)=>K.filterFrame(xa,xb,o.h0,o.h1,D(f.y[1]),D(f.y[0]),f.border,f.r,R.mesh);
  if(o.fold3){const tf=trifold(o.x0,o.x1,dm,(xa,xb,lead)=>{frame(xa,xb);if(lead)straps();},
      (xa,xb)=>[xa,xb].forEach(x=>[0.2,0.8].forEach(q=>K.rod('y',K.FRAME_ROD+0.6,x,o.h0+q*Hh,dm,16,m.inox,12))),   // hinge knuckles
      {out:Math.max(0,...R.rings.filter(g=>g.side==='x').map(g=>g.out)),ht:ld,y0:o.h0,y1:o.h1});
    list.unshift({name:'初效濾網（三折式）',g:tf.g,side:tf.side,fold:tf.fold,hMin:o.h0});}
  else{const pg=K.group(()=>{frame(o.x0,o.x1);straps();});
    const pparts=[{x0:o.x0,h0:o.h0,h1:o.h1,d0:dm-ld,d1:dm+ld}];
    R.rings.filter(g=>g.side==='x').forEach(g=>{const zc=o.h0+g.zc*Hh;pparts.push({x0:o.x0-g.out,h0:zc-g.size/2,h1:zc+g.size/2,d0:dm-ld,d1:dm+ld});});
    list.unshift({name:'初效濾網',g:pg,side:0.5*W,down:0.5*Hh,hMin:o.h0,parts:pparts});}
  if(o.inBox){   // 回風箱濾網抽取孔: dark slot in the box end face the filters slide through
    const hs0=Math.min(o.h0,o.carbon?o.h0+R.carbon.dz[0]:o.h0)-3,hs1=o.h1+3;
    K.box(o.inBox.x0-0.8,o.inBox.x0+0.2,hs0,hs1,dMin-2,dMax+2,m.hole);
    const bx=o.inBox;K.obstacles.push({x0:bx.x0,x1:bx.x1,h0:bx.h0,h1:bx.h1,d0:bx.d0,d1:bx.d1,slot:[dMin-2,dMax+2]});   // the box itself: only the slot band is free
    list.forEach(mv=>{mv.name='回風箱'+mv.name;if(mv.fold)mv.fold.boxX0=o.inBox.x0;});}
  list.forEach(mv=>K.movers.push(mv));
  return Math.min(tip,D(f.y[1]));
};
/* filters when a return box is fitted: same filters at the SAME place as natural return (o.nat rect, against the body back face o.back,
   in their rails); the box simply covers them, and its end face at b.x0 gets the pull slot lined up with the filters. b = box extents. */
F.boxFilters=function(K,b,o){
  const n=o.nat||{x0:b.x0,x1:b.x1-10,h0:b.h0+14,h1:b.h1-14};
  const r={x0:Math.max(n.x0,b.x0),x1:Math.min(n.x1,b.x1-4),h0:Math.max(n.h0,b.h0+4),h1:Math.min(n.h1,b.h1-4)};
  /* the slot sits above anything in the pull path at the filters' depth (e.g. the drain head), so the filters can come straight out */
  K.obstacles.forEach(ob=>{if(!ob.slot&&ob.x1<=b.x0+1&&ob.d1>o.back-26&&ob.d0<o.back&&ob.h1>r.h0&&ob.h0<r.h1)r.h0=Math.max(r.h0,ob.h1+3);});
  F.filterSet(K,{src:o.src,x0:r.x0,x1:r.x1,h0:r.h0,h1:r.h1,back:o.back,carbon:o.carbon,fold3:o.fold3,inBox:b});
};
/* 機殼頂部三角凸筋 (5 mm): two ridges along the length at ~27 % and ~57 % of the body depth from the back face */
F.topRidges=function(K,x0,x1,d0,d1,H,w){const D=d1-d0,hw=(w||12)/2;[0.27,0.57].forEach(f=>K.ridge(x0,x1,d0+f*D-hw,d0+f*D+hw,H,5,K.mat.body));};
/* legacy plain filter box (kept for reference) */
F.filter=function(K,o){const m=K.mat;K.box(o.x0,o.x1,o.h0,o.h1,o.d0,o.d1,m.body2);K.box(o.x0+10,o.x1-10,o.h0+10,o.h1-10,o.d0-0.6,o.d0+1,m.seam);};
/* drain head: axis 'z' (back face, dir -1) or 'x' (left end, dir -1) */
F.drain=function(K,o){const m=K.mat,len=o.len||26;
  if(o.axis==='x'){K.rod('x',13,o.x-len/2,o.h,o.d,len,m.drain,28);K.obstacles.push({x0:o.x-len,x1:o.x,h0:o.h-13,h1:o.h+13,d0:o.d-13,d1:o.d+13});K.disc('x',9,o.x-len-0.3,o.h,o.d,m.hole);return [o.x-len,o.h,o.d];}
  K.rod('z',13,o.x,o.h,o.d-len/2,len,m.drain,28);K.obstacles.push({x0:o.x-13,x1:o.x+13,h0:o.h-13,h1:o.h+13,d0:o.d-len,d1:o.d});K.disc('z',9,o.x,o.h,o.d-len-0.3,m.hole);return [o.x,o.h,o.d-len];};
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
  F.topRidges(K,B.x0+2,B.x1-2,B.d0,B.d1,H);
  F.basePlates(K,{xL:[0,B.x0],xR:[B.x1,P.L],d:P.plates.d,w:P.plates.w,slot:P.plates.slot});
  /* front-mounted control box (電氣蓋) */
  const C=P.ctrl;K.box(C.x0,C.x1,C.h0,C.h1,B.d1,B.d1+C.dd,m.body2,3);
  [[C.x0+12,C.h0+12],[C.x1-12,C.h0+12],[C.x0+12,C.h1-12],[C.x1-12,C.h1-12]].forEach(([x,h])=>K.screw(x,h,B.d1+C.dd,1,3.5));
  /* supply: boxes with flat-oval outlets */
  let sTip=B.d1,sTop=0;
  P.supply.forEach(s=>{
    const cx=(s.x0+s.x1)/2,ch=s.oh||(s.h0+s.h1)/2,face=B.d1+s.dd;
    const tip=s.bare   // 只有黑色法蘭（照片）: black plate + flat-oval collar straight off the body face, open into the unit
      ?K.stadium({x:cx,h:ch,d:B.d1,dir:1,w:s.ow,hh:s.ohh,len:s.dd+(s.olen||6),t:4,plate:[s.ow+34,s.ohh+34],plateT:5,m:m.plastic})
      :K.stadium({x:cx,h:ch,d:face,dir:1,w:s.ow,hh:s.ohh,len:s.olen||6,t:4,plate:s.plate||null,m:m.plastic,
      recess:{x0:s.x0,x1:s.x1,h0:s.h0,h1:s.h1,depth:s.dd,m:m.body2}});
    sTip=Math.max(sTip,tip);sTop=Math.max(sTop,ch+s.ohh/2);});
  const sx=(P.supply[0].x0+P.supply[P.supply.length-1].x1)/2;
  K.tag(sx,sTop+30,sTip,[0,0,1],'SA',P.supplyName);
  /* return side */
  const rid=v.ret?v.ret.id:(P.ret?'rb':'r0');
  let fTip=B.d0;
  if(rid==='r0'){   // 只有初效濾網：依該機型回風口尺寸，構造比照 MD-70LB 3dm
    const f=P.filter,fr={x0:f.x0+6,x1:f.x1-6,h0:Math.max(f.h0,48),h1:Math.min(f.h1,H-30)};
    fTip=F.filterSet(K,{src:'70',x0:fr.x0,x1:fr.x1,h0:fr.h0,h1:fr.h1,back:B.d0,carbon:false,fold3:P.id!=='MD-130LB'});   // 三折式（MD-130LB 為單層）
    K.tag((fr.x0+fr.x1)/2,fr.h1+40,fTip,[0,0,-1],'RA','自然回・初效濾網（側拉／下拉）');}
  else{const R=P.ret;K.box(R.x0,R.x1,R.h0,R.h1,R.d0,B.d0,m.body2,4);
    {const f=P.filter;F.boxFilters(K,{x0:R.x0,x1:R.x1,h0:R.h0,h1:R.h1,d0:R.d0,d1:B.d0},{src:'70',carbon:false,fold3:P.id!=='MD-130LB',back:B.d0,
      nat:{x0:f.x0+6,x1:f.x1-6,h0:Math.max(f.h0,48),h1:Math.min(f.h1,H-30)}});}   // same rect as natural return
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
  {const sl=P.plates.slot,pd=P.plates.d[0];   // 吊耳（底板吊孔）距離, on the back side like MD-140LB
   K.dim([sl[0],5,pd],[sl[1],5,pd],[0,0,-(pd-dB)-120],String(Math.round(sl[1]-sl[0])));}
  K.dim([P.L,0,dB],[P.L,0,sTip],[90,0,0],String(P.dimD&&rid!=='r0'?P.dimD:Math.round(sTip-dB)));
  K.dim([B.x0,0,B.d1],[B.x0,H,B.d1],[0,0,150],String(H));
};
})();
