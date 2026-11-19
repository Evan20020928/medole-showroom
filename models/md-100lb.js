/* MD-100LB 吊隱式風管除濕機 — plan from DXF block (origin = overall left / return-flange tips), heights from catalog p.16. */
(window.MEDOLE_MODELS=window.MEDOLE_MODELS||[]).push({
  id:'MD-100LB', slug:'md-100lb', kind:'吊隱式風管除濕機', finish:'black',
  center:{x:540,d:305}, footprint:{L:1080,D:611,H:330},
  note:'依 DXF 平面圖塊與型錄外型尺寸圖建模；未標註部位依圖面比例量取（誤差約 ±5 mm）。標配為雙出雙回（8"×2）。',
  variants:{fixed:'雙出 8"×2・雙回 8"×2（標配）'},
  build(K){
    const m=K.mat,F=window.MEDOLE_FAMILIES,H=330,B={x0:98,x1:1031,d0:154,d1:518};
    K.box(B.x0,B.x1,9.5,H,B.d0,B.d1,m.body,5);K.box(B.x0+6,B.x1-6,0,9.5,B.d0+6,B.d1-6,m.seam);
    K.box(B.x0,B.x1,9.5,11,459,461,m.seam);
    [[246,256],[346,356]].forEach(([a,b])=>K.box(B.x0+2,B.x1-2,H,H+3,a,b,m.body2));
    K.box(30,98,9.5,H,219,400,m.body2,3);K.box(0,30,17,119,219,284,m.body);K.rod('z',10,48,127,403,6,m.led,24);
    F.ears(K,{faceL:B.x0,tipL:47,faceR:B.x1,tipR:1080,d:[180,430],w:50,h:45,x:[72,1060]});
    const dr=F.drain(K,{axis:'z',x:131,d:B.d0,h:80,len:27});
    /* return box + 8" return flanges ×2 */
    K.box(290,1031,79,325,95,B.d0,m.body2,4);
    [482.9,837.5].forEach(x=>K.ovalDuct({x,d:95,dir:-1,hPlate:202,h:202,plateW:273,plateH:148,plateT:20.7,cone:27.3,od:193,len:44}));
    /* supply 8" ×2 */
    [449.6,859.7].forEach(x=>K.ovalDuct({x,d:B.d1,dir:1,hPlate:188,h:175,plateW:273.5,plateH:148,plateT:21.4,cone:28,od:193,len:42.8}));
    F.screws(K,[[619,175],[691,175],[619,74],[691,74]],B.d1);
    K.nameplate(230,55,B.d1+0.8,150,40,'z+','MD-100LB','吊隱式除濕機 100L/日');
    K.tag(654,175+97+24,610.6,[0,0,1],'SA','雙出 8"×2');
    K.tag(660,202+97+24,0,[0,0,-1],'RA','雙回 8"×2');
    K.tag(131,124,dr[2],[0,0,-1],'3/4"','排水頭');
    K.tag(0,260,310,[-1,0,0],'CB','控制盒');
    K.dim([0,0,611],[1080,0,611],[0,0,90],'1080');
    K.dim([72,45,180],[1060,45,180],[0,0,-300],'988');
    K.dim([1080,0,0],[1080,0,611],[90,0,0],'610');
    K.dim([B.x0,0,B.d1],[B.x0,H,B.d1],[0,0,130],'330');
  }
});
