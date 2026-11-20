/* MD-70LBAD 走道型吊隱式除濕機 — plan from MD-ALL_NEW_2026.dxf block (cm→mm, origin = overall left / back), heights from catalog p.15. */
(window.MEDOLE_MODELS=window.MEDOLE_MODELS||[]).push({
  id:'MD-70LBAD', slug:'md-70lbad', kind:'吊隱式風管除濕機（走道型）', finish:'black',
  center:{x:328.5,d:330}, footprint:{L:662,D:660,H:310},
  note:'依 DXF 平面圖塊與型錄外型尺寸圖建模；未標註部位依圖面比例量取（誤差約 ±5 mm）。標配為單出自然回，回風側為甲醛濾網＋初效濾網（可側拉或下拉），構造依原廠 MD-70LB 3D 檔。',
  variants:{fixed:'單出 8"×1・自然回（甲醛＋初效濾網）'},
  build(K){
    const m=K.mat,F=window.MEDOLE_FAMILIES,H=310;
    K.box(45,612,9.5,H,28,561,m.body,4);K.box(51,606,0,9.5,34,555,m.seam);
    [[188,194],[347,353]].forEach(([a,b])=>K.ridge(47,610,a-3,b+3,H,5,m.body));
    /* end rails with hanger holes (622 × 435) */
    [[0,45],[612,657]].forEach(([x0,x1])=>{K.box(x0,x1,40,43,28,510,m.body);K.box(x0<45?42:612,x0<45?45:615,43,72,28,510,m.body);});
    [20,637].forEach(x=>[54,486].forEach(d=>K.hole(x,d,43,7)));
    /* control box on the front face + gland + lamp */
    K.box(45,226,9.5,H,561,629,m.body2,3);K.box(45,112,20,117,629,659,m.body);
    const fTip=F.filterSet(K,{src:'70',x0:126,x1:590,h0:67.1,h1:266.1,back:28,carbon:true});   // 濾網構造同 MD-70LB 3dm
    const dr=F.drain(K,{axis:'z',x:71,d:28,h:80,len:26});
    F.screws(K,[[235,176],[235,75]],561);
    K.nameplate(428,52,561.8,150,40,'z+','MD-70LBAD','吊隱式除濕機 70L/日');
    const tip=K.ovalDuct({x:428.5,d:561,dir:1,hPlate:188,h:176,plateW:273,plateH:148,plateT:14.7,cone:29.3,od:193,len:45});
    K.tag(428.5,176+97+24,650,[0,0,1],'SA','出風 8"×1');
    K.tag(358,300,fTip,[0,0,-1],'RA','自然回・甲醛＋初效濾網（側拉／下拉）');
    K.tag(71,122,dr[2],[0,0,-1],'3/4"','排水頭');
    K.tag(135,330,600,[0,.4,.9],'CB','控制盒');
    K.dim([0,0,660],[657,0,660],[0,0,90],'662');
    K.dim([20,43,54],[637,43,54],[0,0,-150],'622');
    K.dim([657,0,0],[657,0,660],[90,0,0],'648');
    K.dim([45,0,561],[45,H,561],[0,0,140],'310');
  }
});
