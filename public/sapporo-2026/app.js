let activeDay='d12',map=null,mapReady=false,markers=[],routeLoadToken=0,lastRouteRequestAt=0;
const $=s=>document.querySelector(s);
const ROUTER='https://routing.openstreetmap.de/routed-foot/route/v1/driving/';
const ROUTE_CACHE_KEY='sp26RouteGeometryV2';
let routeCache=loadRouteCache();

function dayById(id){return D.find(d=>d.id===id)}
function itemDone(dayId,index){return index==null?false:!!saved[`${dayId}-${index}`]}
function googleSearch(q){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q)+'&hl=ko'}
function googleDir(q){return 'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(q)+'&travelmode=walking&hl=ko'}
function dedupeTuples(points){return points.filter((p,i)=>i===0||p[0]!==points[i-1][0])}
function coordsFor(points){return points.map(p=>COORDS[p[0]]).filter(Boolean).map(([lat,lng])=>[lng,lat])}
function googleDayUrl(dayId){
  const pts=dedupeTuples((ROUTES[dayId]?.common||[])).map(x=>x[0]);
  if(!pts.length)return googleSearch('삿포로');
  const origin=pts[0],destination=pts[pts.length-1],waypoints=pts.slice(1,-1);
  let url='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(origin)+'&destination='+encodeURIComponent(destination)+'&travelmode=walking&hl=ko';
  if(waypoints.length)url+='&waypoints='+encodeURIComponent(waypoints.join('|'));
  return url;
}
function airportUrl(dayId){
  if(dayId==='d12')return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent('New Chitose Airport')+'&destination='+encodeURIComponent('SAPPORO STREAM HOTEL')+'&travelmode=transit&hl=ko';
  if(dayId==='d15')return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent('SAPPORO STREAM HOTEL')+'&destination='+encodeURIComponent('New Chitose Airport')+'&travelmode=transit&hl=ko';
  return null;
}
function tabLabel(d){return `<strong>${d.day}</strong>${d.label.split(' · ')[1]||d.label}`}
function renderTabs(){
  $('#tabs').innerHTML=D.map(d=>`<button class="day-tab ${d.id===activeDay?'active':''}" data-day="${d.id}" aria-current="${d.id===activeDay?'page':'false'}">${tabLabel(d)}</button>`).join('');
  document.querySelectorAll('.day-tab').forEach(b=>b.onclick=()=>switchDay(b.dataset.day));
}
function splitHTML(){return `<div class="split-lanes"><div class="split-lane"><b>건스 · 영화</b>유나이티드 시네마 삿포로</div><div class="split-lane yumi"><b>유미 · 팩토리</b>카페 작업 후 영화 종료 시간에 합류</div></div>`}
function renderSchedule(){
  const d=dayById(activeDay);
  $('#dayEyebrow').textContent=`SEP ${d.day} · ${DAY_NAMES[d.id]}`;
  $('#dayTitle').textContent=d.title;
  $('#daySub').textContent=d.subtitle;
  $('#scheduleList').innerHTML=d.items.map((x,i)=>{
    const done=itemDone(d.id,i),hasPlace=!!x[5];
    return `<li class="schedule-row ${done?'done':''}" data-index="${i}">
      <div class="time">${x[0]}<small>${x[1]}</small></div><div class="rail"></div>
      <div class="event"><div class="event-title"><h4>${x[2]}</h4><span class="kind ${x[4]}">${TYPE_LABEL[x[4]]||x[4]}</span></div><div class="event-meta">${x[3]}</div>${x[6]?`<div class="event-note">${x[6]}</div>`:''}${hasPlace?`<div class="row-actions"><button class="map-search" data-q="${String(x[5]).replace(/"/g,'&quot;')}">지도</button><button class="map-dir" data-q="${String(x[5]).replace(/"/g,'&quot;')}">Google 길찾기</button></div>`:''}</div>
      <button class="check" aria-label="${x[2]} 완료 표시" aria-pressed="${done}">✓</button>${x[7]==='split'?splitHTML():''}
    </li>`;
  }).join('');
  document.querySelectorAll('.check').forEach(b=>b.onclick=()=>toggleDone(+b.closest('.schedule-row').dataset.index));
  document.querySelectorAll('.map-search').forEach(b=>b.onclick=()=>focusPlace(b.dataset.q));
  document.querySelectorAll('.map-dir').forEach(b=>b.onclick=()=>window.open(googleDir(b.dataset.q),'_blank','noopener'));
  updateProgress();
}
function updateProgress(){
  const d=dayById(activeDay),done=d.items.filter((_,i)=>itemDone(d.id,i)).length;
  $('#scheduleProgress').textContent=`${done} / ${d.items.length} 완료`;
}
function toggleDone(index){
  const key=`${activeDay}-${index}`;
  if(saved[key])delete saved[key];else saved[key]=true;
  localStorage.setItem('sp26',JSON.stringify(saved));
  renderSchedule();
  loadDayRoute();
}
function focusPlace(key){
  const c=COORDS[key];
  if(!c||!mapReady)return;
  map.easeTo({center:[c[1],c[0]],zoom:16,duration:350});
  document.querySelector('.map-section')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function loadRouteCache(){
  try{
    const x=JSON.parse(localStorage.getItem(ROUTE_CACHE_KEY)||'{}');
    const maxAge=7*24*60*60*1000;
    if(!x.ts||Date.now()-x.ts>maxAge)return {};
    return x.data||{};
  }catch(e){return {}}
}
function saveRouteCache(){
  try{localStorage.setItem(ROUTE_CACHE_KEY,JSON.stringify({ts:Date.now(),data:routeCache}))}catch(e){}
}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function routeRequest(points){
  const valid=dedupeTuples(points).filter(p=>COORDS[p[0]]);
  if(valid.length<2)return null;
  const key=valid.map(p=>p[0]).join('>');
  if(routeCache[key])return routeCache[key];
  const wait=Math.max(0,1050-(Date.now()-lastRouteRequestAt));
  if(wait)await sleep(wait);
  lastRouteRequestAt=Date.now();
  const coords=coordsFor(valid).map(c=>c.join(',')).join(';');
  const url=ROUTER+coords+'?overview=full&steps=true&geometries=geojson&generate_hints=false';
  const res=await fetch(url,{headers:{Accept:'application/json'}});
  if(!res.ok)throw new Error(`route ${res.status}`);
  const json=await res.json();
  if(json.code!=='Ok'||!json.routes?.[0])throw new Error(json.code||'NoRoute');
  const out={points:valid,legs:json.routes[0].legs||[]};
  routeCache[key]=out;saveRouteCache();return out;
}
function legGeometry(leg){
  const coords=[];
  (leg.steps||[]).forEach(step=>{
    const arr=step.geometry?.coordinates||[];
    arr.forEach(c=>{const last=coords[coords.length-1];if(!last||last[0]!==c[0]||last[1]!==c[1])coords.push(c)})
  });
  return coords;
}
function routeFeatures(result,kind='common',skipLegs=new Set()){
  if(!result)return [];
  const features=[];
  result.legs.forEach((leg,i)=>{
    if(skipLegs.has(i))return;
    const coordinates=legGeometry(leg);
    if(coordinates.length<2)return;
    const target=result.points[i+1];
    features.push({type:'Feature',properties:{kind,done:kind==='common'&&itemDone(activeDay,target?.[1])?1:0,leg:i},geometry:{type:'LineString',coordinates}})
  });
  return features;
}
function setStatus(text){const el=$('#mapStatus');if(!text){el.hidden=true;el.textContent=''}else{el.hidden=false;el.textContent=text}}
function routeSourceData(features){return {type:'FeatureCollection',features}}
function setRouteData(features){const src=map?.getSource('day-routes');if(src)src.setData(routeSourceData(features))}
function addRouteLayers(){
  map.addSource('day-routes',{type:'geojson',data:routeSourceData([])});
  map.addLayer({id:'route-casing',type:'line',source:'day-routes',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#ffffff','line-width':7,'line-opacity':.9}});
  map.addLayer({id:'route-common-planned',type:'line',source:'day-routes',filter:['all',['==',['get','kind'],'common'],['==',['get','done'],0]],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':COLORS.common,'line-width':4.2,'line-dasharray':[.7,1.0],'line-opacity':.95}});
  map.addLayer({id:'route-common-done',type:'line',source:'day-routes',filter:['all',['==',['get','kind'],'common'],['==',['get','done'],1]],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':COLORS.done,'line-width':5,'line-opacity':1}});
  map.addLayer({id:'route-guns',type:'line',source:'day-routes',filter:['==',['get','kind'],'guns'],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':COLORS.guns,'line-width':4.4,'line-dasharray':[.65,.9],'line-opacity':.98}});
  map.addLayer({id:'route-yumi',type:'line',source:'day-routes',filter:['==',['get','kind'],'yumi'],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':COLORS.yumi,'line-width':4.4,'line-dasharray':[.65,.9],'line-opacity':.98}});
}
function applyKoreanLabels(){
  const style=map?.getStyle();
  if(!style)return;
  (style.layers||[]).forEach(layer=>{
    if(layer.type!=='symbol'||!layer.layout?.['text-field'])return;
    try{map.setLayoutProperty(layer.id,'text-field',['coalesce',['get','name:ko'],['get','name_ko'],['get','name'],['get','name:en'],['get','name_en'],['get','ref']])}catch(e){}
  });
}
function clearMarkers(){markers.forEach(m=>m.remove());markers=[]}
function markerElement(number,label,cls='',done=false){
  const el=document.createElement('div');el.className=`map-stop ${cls} ${done?'done':''}`;
  el.innerHTML=`<span class="map-stop-num">${number}</span><span class="map-stop-label">${label}</span>`;
  return el;
}
function addMarkerAt(key,number,label,cls='',done=false){
  const c=COORDS[key];if(!c)return;
  const m=new maplibregl.Marker({element:markerElement(number,label||key,cls,done),anchor:'center'}).setLngLat([c[1],c[0]]).addTo(map);
  markers.push(m);
}
function renderMarkers(){
  if(!mapReady)return;clearMarkers();
  const r=ROUTES[activeDay],common=r?.common||[],groups=new Map();
  common.forEach((p,i)=>{
    const g=groups.get(p[0])||{numbers:[],label:p[2]||p[0],items:[]};
    g.numbers.push(String(i+1));if(p[1]!=null)g.items.push(p[1]);groups.set(p[0],g);
  });
  groups.forEach((g,key)=>addMarkerAt(key,g.numbers.join('·'),g.label,'',g.items.length>0&&g.items.every(i=>itemDone(activeDay,i))));
  if(activeDay==='d13'&&r.branches){
    const g=r.branches.guns?.[r.branches.guns.length-1];
    const y=r.branches.yumi?.[r.branches.yumi.length-1];
    if(g)addMarkerAt(g[0],'3G',g[2]||'건스','guns',false);if(y)addMarkerAt(y[0],'3Y',y[2]||'유미','yumi',false);
  }
}
function renderLegend(){
  const split=activeDay==='d13';
  $('#mapLegend').innerHTML=`<span class="legend-item"><i class="legend-line"></i>예정 경로</span><span class="legend-item"><i class="legend-line done"></i>완료 구간</span>${split?'<span class="legend-item"><i class="legend-line guns"></i>건스</span><span class="legend-item"><i class="legend-line yumi"></i>유미</span>':''}`;
}
function renderOrder(){
  const r=ROUTES[activeDay],common=r?.common||[];
  if(activeDay!=='d13'){
    $('#routeOrder').innerHTML=common.map((p,i)=>`<span class="order-stop"><span class="order-num">${i+1}</span>${p[2]}</span>`).join('');return;
  }
  const before=common.slice(0,3).map((p,i)=>`<span class="order-stop"><span class="order-num">${i+1}</span>${p[2]}</span>`).join('');
  const after=common.slice(3).map((p,i)=>`<span class="order-stop"><span class="order-num">${i+4}</span>${p[2]}</span>`).join('');
  $('#routeOrder').innerHTML=before+`<span class="order-split"><span class="order-branch guns">3G 영화</span><span class="order-branch yumi">3Y 카페</span></span>`+after;
}
function fitCurrentRoute(){
  if(!mapReady)return;
  const r=ROUTES[activeDay],pts=[...(r?.common||[])];
  if(activeDay==='d13'&&r.branches)Object.values(r.branches).forEach(a=>pts.push(...a));
  const coords=coordsFor(pts);if(!coords.length){map.easeTo({center:CITY_CENTER,zoom:13,duration:0});return}
  const b=coords.reduce((acc,c)=>acc.extend(c),new maplibregl.LngLatBounds(coords[0],coords[0]));
  map.fitBounds(b,{padding:{top:58,bottom:58,left:48,right:48},maxZoom:15.4,duration:0});
}
async function loadDayRoute(){
  const token=++routeLoadToken,r=ROUTES[activeDay];
  $('#routeNote').textContent=r?.note||'';renderLegend();renderOrder();renderMarkers();fitCurrentRoute();
  $('#routeCount').innerHTML=`<b>${r?.common?.length||0}</b>개 순서 지점`;
  if(!mapReady)return;
  setRouteData([]);setStatus('실제 보행 경로 계산 중…');
  try{
    let features=[];
    const common=await routeRequest(r.common||[]);if(token!==routeLoadToken)return;
    if(activeDay==='d13'){
      features.push(...routeFeatures(common,'common',new Set([2])));
      const factory=r.common[2],hotel=r.common[3];
      const gunsDest=r.branches?.guns?.[r.branches.guns.length-1];
      const yumiDest=r.branches?.yumi?.[r.branches.yumi.length-1];
      if(gunsDest){const g=await routeRequest([factory,gunsDest,hotel]);if(token!==routeLoadToken)return;features.push(...routeFeatures(g,'guns'))}
      if(yumiDest){const y=await routeRequest([factory,yumiDest,hotel]);if(token!==routeLoadToken)return;features.push(...routeFeatures(y,'yumi'))}
    }else features.push(...routeFeatures(common,'common'));
    setRouteData(features);setStatus('');fitCurrentRoute();
  }catch(e){
    if(token!==routeLoadToken)return;
    setRouteData([]);setStatus('실제 보행 경로를 불러오지 못했습니다. 지점 순서는 유지되며 Google 길찾기를 사용할 수 있습니다.');
  }
}
function initMap(){
  if(!window.maplibregl){setStatus('지도를 불러오지 못했습니다.');return}
  map=new maplibregl.Map({container:'routeMap',style:'https://tiles.openfreemap.org/styles/bright',center:CITY_CENTER,zoom:13,minZoom:11.4,maxZoom:18,maxBounds:CITY_BOUNDS,dragRotate:false,pitchWithRotate:false,touchPitch:false,cooperativeGestures:false,attributionControl:true,localIdeographFontFamily:'Apple SD Gothic Neo, Noto Sans CJK KR, sans-serif'});
  map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
  map.on('load',()=>{applyKoreanLabels();addRouteLayers();mapReady=true;loadDayRoute()});
  map.on('error',()=>{});
}
function renderMapMeta(){
  const airport=airportUrl(activeDay),airportButton=$('#airportRoute');airportButton.hidden=!airport;
  if(airport)airportButton.onclick=()=>window.open(airport,'_blank','noopener');
  $('#googleRoute').onclick=()=>window.open(googleDayUrl(activeDay),'_blank','noopener');
}
function switchDay(id){
  activeDay=id;history.replaceState(null,'','#'+id.slice(1));renderTabs();renderSchedule();renderMapMeta();loadDayRoute();window.scrollTo({top:0,behavior:'instant'});
}
$('#resetMap').onclick=()=>fitCurrentRoute();
const hash='d'+location.hash.replace('#','');if(D.some(d=>d.id===hash))activeDay=hash;
renderTabs();renderSchedule();renderMapMeta();renderLegend();renderOrder();initMap();
