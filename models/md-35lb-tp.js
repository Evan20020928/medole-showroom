/* MD-35LB-TP 吊隱式除濕機（110V）— no DXF block; geometry from catalog p.13 outline drawing (top/front/side views).
   Plan origin: x = overall left (base-plate end), d = back of filter frame. */
(window.MEDOLE_MODELS=window.MEDOLE_MODELS||[]).push({
  id:'MD-35LB-TP', slug:'md-35lb-tp', kind:'吊隱式風管除濕機（110V）', finish:'white',
  center:{x:340,d:222}, footprint:{L:680,D:445,H:265},
  note:'依型錄外型尺寸圖建模（DXF 無此型號圖塊）；未標註部位依圖面比例量取（誤差約 ±5 mm）。標配單出自然回；選配出回風 6"×2 未建模。',
  variants:{fixed:'單出 8"×1・自然回風（標配）'},
  build(K){
    const m=K.mat,F=window.MEDOLE_FAMILIES,H=265,B={x0:40,x1:640,d0:12,d1:351};
    K.box(B.x0,B.x1,8,H,B.d0,B.d1,m.body,4);K.box(B.x0,B.x1,0,8,B.d0+20,B.d1-20,m.seam);
    K.box(B.x0,B.x1,8,9.5,315,317,m.seam);
    F.basePlates(K,{xL:[0,40],xR:[640,680],d:[92,232],w:60,slot:[20,660],t:5});
    K.box(40,212,8,H-2,B.d1,B.d1+58,m.body2,3);
    F.filter(K,{x0:225,x1:599,d0:0,d1:12,h0:16,h1:258});
    const dr=F.drain(K,{axis:'x',x:40,d:34,h:55,len:20});
    F.screws(K,[[242,161],[314,161],[242,61],[314,61]],B.d1);
    K.ovalDuct({x:488,d:B.d1,dir:1,hPlate:172,h:161,plateW:270,plateH:140,plateT:19,cone:27,od:193,len:47});
    K.nameplate(488,48,B.d1+0.8,150,40,'z+','MD-35LB-TP','吊隱式除濕機 35L/日 110V');
    K.tag(488,161+97+24,444,[0,0,1],'SA','出風 8"×1');
    K.tag(412,288,0,[0,0,-1],'RA','自然回風・濾網');
    K.tag(dr[0],95,34,[-1,0,0],'3/4"','排水頭');
    K.tag(126,H+28,B.d1+58,[0,0,1],'CB','控制盒');
    K.dim([0,0,444],[680,0,444],[0,0,90],'680');
    K.dim([680,0,0],[680,0,444],[90,0,0],'445');
    K.dim([B.x0,0,B.d1],[B.x0,H,B.d1],[0,0,120],'265');
  }
});
