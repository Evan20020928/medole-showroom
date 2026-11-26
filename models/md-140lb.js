/* MD-140LB 吊隱式風管除濕機 — plan from DXF block (origin = overall left / return-flange tips), heights from catalog p.17. */
(window.MEDOLE_MODELS=window.MEDOLE_MODELS||[]).push({
  id:'MD-140LB', slug:'md-140lb', kind:'吊隱式風管除濕機', finish:'black',
  center:{x:540,d:302}, footprint:{L:1078,D:604,H:385},
  note:'依 DXF 平面圖塊與型錄外型尺寸圖建模；未標註部位依圖面比例量取（誤差約 ±5 mm）。標配為雙出雙回（8"×2）。',
  variants:{fixed:'雙出 8"×2・雙回 8"×2（標配）'},
  build(K){
    const m=K.mat,F=window.MEDOLE_FAMILIES,H=385,B={x0:96,x1:1033,d0:152,d1:510};
    K.box(B.x0,B.x1,9.5,H,B.d0,B.d1,m.body,5);K.box(B.x0+6,B.x1-6,0,9.5,B.d0+6,B.d1-6,m.seam);
    K.box(B.x0,B.x1,9.5,11,471,473,m.seam);
    [[256,267],[363,373]].forEach(([a,b])=>K.ridge(B.x0+2,B.x1-2,a,b,H,5,m.body));
    K.box(30,96,67,H,222,404,m.body2,3);K.box(0,30,67,168,222,288,m.body);K.warnLabel(0,117.5,255.0,44.4,88.8,'x-');   /* 電源警告貼紙 */
    F.ears(K,{faceL:B.x0,tipL:50,faceR:B.x1,tipR:1078,d:[182,442],w:56,h:51,x:[68,1056]});
    const dr=F.drain(K,{axis:'z',x:130.5,d:B.d0,h:90,len:29});
    K.box(289,1034,75,385,93,B.d0,m.body2,4);
    F.boxFilters(K,{x0:289,x1:1034,h0:75,h1:385,d0:93,d1:B.d0},{src:'70',carbon:false,fold3:true,back:B.d0});   // 三折式初效濾網
    [483.5,836.2].forEach(x=>K.ovalDuct({x,d:93,dir:-1,hPlate:230,h:230,plateW:276,plateH:148,plateT:21.6,cone:27.1,od:193,len:44.3}));
    [448.5,860.3].forEach(x=>K.ovalDuct({x,d:B.d1,dir:1,hPlate:238,h:227,plateW:276,plateH:148,plateT:22,cone:28,od:193,len:43.6}));
    F.screws(K,[[618,214],[691,214],[618,115],[691,115]],B.d1);
    K.nameplate(230,60,B.d1+0.8,150,40,'z+','MD-140LB','吊隱式除濕機 140L/日');
    K.tag(654,227+97+24,603.6,[0,0,1],'SA','雙出 8"×2');
    K.tag(660,230+97+24,0,[0,0,-1],'RA','雙回 8"×2');
    K.tag(130.5,134,dr[2],[0,0,-1],'3/4"','排水頭');
    K.tag(0,300,313,[-1,0,0],'CB','控制盒');
    K.dim([0,0,604],[1078,0,604],[0,0,90],'1078');
    K.dim([68,51,182],[1056,51,182],[0,0,-300],'988');
    K.dim([1078,0,0],[1078,0,604],[90,0,0],'606');
    K.dim([B.x0,0,B.d1],[B.x0,H,B.d1],[0,0,130],'385');
  }
});
