/* MD-100LB 吊隱式風管除濕機 — plan from DXF block (origin = overall left / return-flange tips), heights from catalog p.16.
   每個 8" 風口可各自改為 6"+6"、6"+4"+4"、4"×4（分歧風箱，外型比照 MD-70LBDN 同規格風箱）。 */
(function(){
const OPTS=[{id:'8',name:'8"',spec:'單孔'},{id:'66',name:'6"+6"',spec:'雙孔'},{id:'644',name:'6"+4"+4"',spec:'三孔'},{id:'4444',name:'4"×4',spec:'四孔'}];
const RET=OPTS.concat([{id:'f',name:'自然回',spec:'甲醛+初效',whole:true}]);
(window.MEDOLE_MODELS=window.MEDOLE_MODELS||[]).push({
  id:'MD-100LB', slug:'md-100lb', kind:'吊隱式風管除濕機', finish:'black',
  center:{x:540,d:305}, footprint:{L:1080,D:611,H:330},
  note:'依 DXF 平面圖塊與型錄外型尺寸圖建模；未標註部位依圖面比例量取（誤差約 ±5 mm）。型錄標配為雙出雙回（8"×2），回風側亦可改為自然回（甲醛＋初效濾網，可側拉或下拉，依回風口比例比照 MD-70LB 3D 檔）；每個 8" 風口可各自改為 6"+6"、6"+4"+4" 或 4"×4，分歧風箱外型比照 MD-70LBDN 同規格風箱估計。',
  variants:{
    default:'8-8-8-8',
    ports:[{id:'sa',side:'s',name:'出風口 A（控制盒側）'},{id:'sb',side:'s',name:'出風口 B'},
           {id:'ra',side:'r',name:'回風口 A（控制盒側）',opts:RET},{id:'rb',side:'r',name:'回風口 B',opts:RET}],
    opts:OPTS,
    /* 自然回 replaces the whole return side, so both return ports switch together */
    normalize(parts,changed){const i=2,j=3;
      if(changed==='ra'||changed==='rb'){const me=changed==='ra'?i:j,other=changed==='ra'?j:i;
        if(parts[me]==='f')parts[other]='f';else if(parts[other]==='f')parts[other]='8';}
      else if((parts[i]==='f')!==(parts[j]==='f')){parts[i]=parts[i]==='f'?'8':parts[i];parts[j]=parts[j]==='f'?'8':parts[j];}
      return parts;}
  },
  build(K,v){
    const m=K.mat,F=window.MEDOLE_FAMILIES,H=330,B={x0:98,x1:1031,d0:154,d1:518};
    const OD4=98,OD6=146;
    K.box(B.x0,B.x1,9.5,H,B.d0,B.d1,m.body,5);K.box(B.x0+6,B.x1-6,0,9.5,B.d0+6,B.d1-6,m.seam);
    K.box(B.x0,B.x1,9.5,11,459,461,m.seam);
    [[246,256],[346,356]].forEach(([a,b])=>K.ridge(B.x0+2,B.x1-2,a,b,H,5,m.body));
    K.box(30,98,9.5,H,219,400,m.body2,3);K.box(0,30,17,119,219,284,m.body);
    F.ears(K,{faceL:B.x0,tipL:47,faceR:B.x1,tipR:1080,d:[180,430],w:50,h:45,x:[72,1060]});
    const dr=F.drain(K,{axis:'z',x:131,d:B.d0,h:80,len:27});

    /* one port: 8" oval flange, or a tapered branch box with 6"/4" collars.
       holes relative to port centre [dx,dh,od]; front face half-size [w,h]; side 's' faces +d, 'r' faces -d */
    const LAY={
      '66':{holes:[[-80,0,OD6],[80,0,OD6]],w:160,h:88},
      '644':{holes:[[-82,-56,OD4],[-82,56,OD4],[72,0,OD6]],w:155,h:112},
      '4444':{holes:[[-62,-56,OD4],[-62,56,OD4],[62,-56,OD4],[62,56,OD4]],w:120,h:112}
    };
    function port(side,x,opt){
      const sup=side==='s';
      if(opt==='8'){
        if(sup){K.ovalDuct({x,d:B.d1,dir:1,hPlate:188,h:175,plateW:273.5,plateH:148,plateT:21.4,cone:28,od:193,len:42.8});return {tip:B.d1+21.4+28+42.8,top:175+97};}
        K.ovalDuct({x,d:95,dir:-1,hPlate:202,h:202,plateW:273,plateH:148,plateT:20.7,cone:27.3,od:193,len:44});return {tip:95-20.7-27.3-44,top:202+97};
      }
      const L=LAY[opt],hc=sup?175:202,face=sup?B.d1:95,dir=sup?1:-1,dep=sup?80:55,dF=face+dir*dep;
      const lim=sup?[12,327]:[82,322],cl=(a)=>Math.max(lim[0],Math.min(lim[1],a));
      K.frustumZ(face,[x-L.w-10,x+L.w+10,cl(hc-L.h-15),cl(hc+L.h+15)],dF,[x-L.w,x+L.w,hc-L.h,hc+L.h],m.body2);
      let tip=dF,top=hc+L.h;
      L.holes.forEach(([dx,dh,od])=>{const len=sup?(od===OD6?60:47):(od===OD6?55.4:49);
        if(sup)K.duct({axis:'z',dir:1,x:x+dx,h:hc+dh,d:dF,od,len,plate:[od+8,od+8],plateT:3});
        else K.duct({axis:'z',dir:-1,x:x+dx,h:hc+dh,d:dF,od,len,flare:true,flareR:od===OD6?12:7});
        tip=sup?Math.max(tip,dF+len+3):Math.min(tip,dF-len-3);});
      return {tip,top};
    }

    /* return side: natural return (甲醛＋初效濾網 on the back face, proportioned like MD-70LB 3dm) or return box + ports A/B */
    const nat=v.ports.ra.id==='f';let ra,rb;
    if(nat){const fr={x0:292,x1:1026,h0:67,h1:286};const t=F.filterSet(K,Object.assign({src:'70',back:B.d0,carbon:true,fold3:true},fr));   // 三折式
      ra=rb={tip:t,top:fr.h1+10};}
    else{K.box(290,1031,79,325,95,B.d0,m.body2,4);F.boxFilters(K,{x0:290,x1:1031,h0:79,h1:325,d0:95,d1:B.d0},{src:'70',carbon:true,fold3:true,back:B.d0,nat:{x0:292,x1:1026,h0:67,h1:286}});ra=port('r',482.9,v.ports.ra.id);rb=port('r',837.5,v.ports.rb.id);}
    /* supply ports A/B */
    const sa=port('s',449.6,v.ports.sa.id),sb=port('s',859.7,v.ports.sb.id);
    F.screws(K,[[619,175],[691,175],[619,74],[691,74]],B.d1);
    const plateX=v.ports.sa.id==='8'?230:195;
    K.nameplate(plateX,55,B.d1+0.8,150,40,'z+','MD-100LB','吊隱式除濕機 100L/日');

    const sTip=Math.max(sa.tip,sb.tip),rTip=Math.min(ra.tip,rb.tip);
    K.tag(654,Math.max(sa.top,sb.top)+24,sTip,[0,0,1],'SA','出風 '+v.ports.sa.name+'／'+v.ports.sb.name);
    K.tag(660,Math.max(ra.top,rb.top)+24,rTip,[0,0,-1],'RA',nat?'自然回・甲醛＋初效濾網（側拉／下拉）':'回風 '+v.ports.ra.name+'／'+v.ports.rb.name);
    K.tag(131,124,dr[2],[0,0,-1],'3/4"','排水頭');
    K.tag(0,260,310,[-1,0,0],'CB','控制盒');
    const dF=Math.max(611,sTip),dB=Math.min(0,rTip),D=Math.round(dF-dB);
    K.dim([0,0,dF],[1080,0,dF],[0,0,90],'1080');
    K.dim([72,45,180],[1060,45,180],[0,0,-300],'988');
    K.dim([1080,0,dB],[1080,0,dF],[90,0,0],D===611?'610':String(D));
    K.dim([B.x0,0,B.d1],[B.x0,H,B.d1],[0,0,130],'330');
  }
});
})();
