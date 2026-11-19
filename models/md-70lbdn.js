/* MD-70LBDN 吊隱式新風除濕機
   幾何依：原廠三視圖（俯視/正視/側視）、MD-ALL_NEW_2026.dxf 組合圖塊（單位 cm）、型錄 p.6–8 出回風箱。
   平面座標 mm：x 0..1072 由控制盒側起算；d 由回風法蘭端(後, 0) 往出風/新風端(前, 721.4)；h 由底 0..310。 */
(window.MEDOLE_MODELS=window.MEDOLE_MODELS||[]).push({
  id:'MD-70LBDN', slug:'md-70lbdn', kind:'吊隱式新風除濕機', finish:'black', material:'黑色鍍鋅鋼板粉體塗裝',
  center:{x:536,d:360.7}, footprint:{L:1072,D:740,H:310},
  note:'依原廠三視圖與 DXF 組合圖建模；標註尺寸照圖，其餘依圖面比例量取（誤差約 ±5 mm）。風箱高度圖面未標，依型錄照片比例。',
  variants:{
    default:'s1-r4',
    supply:[{id:'s1',name:'單出',spec:'8"×1'},{id:'s2',name:'雙出',spec:'6"×2'},{id:'s3',name:'三出',spec:'6"+4"×2'},{id:'s4',name:'四出',spec:'4"×4'}],
    ret:[{id:'r1',name:'單回',spec:'8"×1'},{id:'r2',name:'雙回',spec:'6"×2'},{id:'r3',name:'三回',spec:'6"+4"×2'},{id:'r4',name:'四回',spec:'4"×4'}]
  },
  build(K,v){
    const m=K.mat,B={x0:96,x1:1026.5,d0:162,d1:527,h0:9.5,h1:310},FN={x0:772.8,d1:465.5};
    const OD4=98,OD6=146,OD8=193;
    /* cabinet: main section + fresh-air fan section, base pan, corner post */
    K.box(B.x0,FN.x0,B.h0,B.h1,B.d0,B.d1,m.body,5);
    K.box(FN.x0,B.x1,B.h0,B.h1,B.d0,FN.d1,m.body,5);
    K.box(B.x0+6,B.x1-6,0,B.h0,B.d0+6,B.d1-6,m.seam);
    K.box(FN.x0-16,FN.x0,B.h0+12,B.h1-6,B.d1,B.d1+4,m.body2);
    [B.h0+30,B.h1-30].forEach(h=>K.rod('z',3.5,FN.x0-8,h,B.d1+5,4,m.steel,12));

    /* control box + gland + lamp (left end) */
    K.box(29.5,96,9.5,310,227.7,406.5,m.body2,3);
    K.box(0,29.5,17,120,227.7,291.7,m.body);
    K.rod('z',11,44,128,409.5,6,m.led,24);

    /* hanger brackets: holes 982 x 250, ear top at h=45 */
    [189,439].forEach(d=>{K.bracket(B.x0,43.8,d,51,45,29);K.bracket(B.x1,1072,d,51,45,29);K.hole(70,d,45,6);K.hole(1052,d,45,6);});

    /* drain head (back face) */
    K.rod('z',14,130,80,148,28,m.plastic,32);K.disc('z',10,130,80,133.7,m.hole);

    /* outlet-face screws + nameplate */
    [330,400].forEach(x=>[78,180].forEach(h=>K.rod('z',5,x,h,B.d1+1.5,3,m.steel,14)));
    K.nameplate(200,58,B.d1+0.8,160,42,'z+','MD-70LBDN','吊隱式新風除濕機 70L/日');

    /* fresh-air filter box (新風過濾網) + rail + hex thumb nuts */
    K.box(772.8,1026.5,12,305,465.5,606,m.body2,4);
    K.box(776,1024,37,51,606,612,m.body);
    [790,1006.5].forEach(x=>K.rod('z',11,x,44,618,12,m.plastic,6));

    /* 4" fresh-air flange + motorised damper (teal) + clear actuator */
    {const x=902,h=188,R=59,bR=51.5,d0=612,L=109.4;
     K.rod('z',71,x,h,609,6,m.teal,72);
     K.lathe('z',1,x,h,d0,[[bR,0],[R,0],[R,L-16],[R+2,L-14],[R+2,L-10],[R-6,L-8],[R-7,L],[bR,L]],m.teal);
     K.rod('z',bR,x,h,d0+L/2,L,m.tealDark,64,true);K.disc('z',bR,x,h,d0+2,m.hole);
     K.torus('z',R-6,2.6,x,h,d0+L-5,m.rubber);
     K.disc('z',bR-3,x,h,d0+50,m.tealDark,1.05);K.rod('y',3,x,h,d0+50,103,m.grey,12);
     const act=K.box(x-34.5,x+34.5,83.5,124.5,618,668,m.clear);act.castShadow=false;
     K.box(x-22,x+22,91.5,118.5,628,658,m.tealDark);}

    /* electrical connector on the fan-section end (photo) */
    K.box(B.x1,B.x1+14,215,249,FN.d1-48,FN.d1-22,m.grey);

    /* ---------- supply side (front, outlet face d=527) ---------- */
    let sTip=621,sTag=[593.5,300];
    const sid=v.supply.id;
    if(sid==='s1'){
      K.ovalDuct({x:593.5,d:527,dir:1,hPlate:188,h:178,plateW:276,plateH:148,plateT:21,cone:26,od:OD8,len:47});
      sTag=[593.5,178+OD8/2+26];
    }else if(sid==='s2'){
      K.box(399,760,80,290,527,629,m.body2,4);
      [490.5,667.5].forEach(x=>K.duct({axis:'z',dir:1,x,h:185,d:629,od:OD6,len:60,plate:[166,166],plateT:3}));
      sTip=689;sTag=[579,185+OD6/2+26];
    }else{
      const four=sid==='s4',dF=four?612:609;
      K.frustumZ(527,four?[424,756,30,295]:[416,753,30,295],dF,four?[459,722,40,285]:[438,732,40,285],m.body2);
      const L4=four?47:46;
      if(four){[532.5,661].forEach(x=>[104,216].forEach(h=>K.duct({axis:'z',dir:1,x,h,d:dF,od:OD4,len:L4,plate:[104,104],plateT:3})));sTip=dF+L4;sTag=[596,216+OD4/2+24];}
      else{[104,216].forEach(h=>K.duct({axis:'z',dir:1,x:497.5,h,d:dF,od:OD4,len:L4,plate:[104,104],plateT:3}));
           K.duct({axis:'z',dir:1,x:646.5,h:160,d:dF,od:OD6,len:60,plate:[151,151],plateT:3});sTip=dF+60;sTag=[572,216+OD4/2+24];}
    }
    K.tag(sTag[0],sTag[1],sTip,[0,0,1],'SA',v.supply.name+' '+v.supply.spec);

    /* ---------- return side (back, filter return box) ---------- */
    const rid=v.ret.id;let rTip=0,rTagX=542.5;
    if(rid==='r1'){
      K.box(288,872,79,310,95,162,m.body2,4);
      K.ovalDuct({x:569,d:95,dir:-1,hPlate:195,h:195,plateW:270,plateH:148,plateT:18.5,cone:28.5,od:OD8,len:42});
      rTip=6;rTagX=569;
    }else{
      K.box(286.8,1026.5,79,310,49,162,m.body2,4);
      const set=rid==='r2'?[[455.5,OD6],[686,OD6]]:rid==='r3'?[[382,OD4],[551,OD6],[716,OD4]]:[[353.5,OD4],[479.5,OD4],[605.5,OD4],[731.5,OD4]];
      set.forEach(([x,od])=>K.duct({axis:'z',dir:-1,x,h:195,d:49,od,len:od===OD6?55.4:49,flare:true,flareR:od===OD6?12:7}));
      rTip=set.some(s=>s[1]===OD6)?-6.4:0;
      rTagX=rid==='r2'?570:rid==='r3'?551:542.5;
    }
    K.tag(rTagX,195+70+24,rTip,[0,0,-1],'RA',v.ret.name+' '+v.ret.spec);
    K.tag(902,188+59+26,721.4,[0,0,1],'OA','新風 4"・電動風門');
    K.tag(130,122,134,[0,0,-1],'3/4"','排水頭');
    K.tag(0,250,317,[-1,0,0],'CB','控制盒');

    /* dimensions */
    const dFront=Math.max(721.4,sTip),dBack=Math.min(0,rTip),D=Math.round((dFront-dBack)*10)/10;
    K.dim([0,0,dFront],[1072,0,dFront],[0,0,90],'1072');
    K.dim([70,45,189],[1052,45,189],[0,0,-260],'982');
    K.dim([1072,0,dBack],[1072,0,dFront],[90,0,0],String(D));
    K.dim([96,0,527],[96,310,527],[0,0,120],'310');
  }
});
