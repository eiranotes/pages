let activeDay='d12',map=null,mapReady=false,markers=[];
const $=s=>document.querySelector(s);

function dayById(id){return D.find(d=>d.id===id)}
function itemDone(dayId,index){return index==null?false:!!saved[`${dayId}-${index}`]}
function coordFor(key){const c=COORDS[key];return c?[c[1],c[0]]:null}
function googleSearch(q){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q)}
function googleDir(q){return 'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(q)}
function googleDayRoute(id){
  const r=ROUTES[id], pts=(r.common||[]).map(x=>x[0]);
  if(!pts.length)return googleSearch('Sapporo');
  let url='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(pts[0])+'&destination='+encodeURIComponent(pts[pts.length-1]);
  if(pts.length>2)url+='&waypoints='+encodeURIComponent(pts.slice(1,-1).join('|'));
  return url;
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
    const done=itemDone(d.id,i), hasPlace=!!x[5];
    return `<li class="schedule-row ${done?'done':''}" data-index="${i}">
      <div class="time">${x[0]}<small>${x[1]}</small></div><div class="rail"></div>
      <div class="event"><div class="event-title"><h4>${x[2]}</h4><span class="kind ${x[4]}">${TYPE_LABEL[x[4]]||x[4]}</span></div><div class="event-meta">${x[3]}</div>${x[6]?`<div class="event-note">${x[6]}</div>`:''}${hasPlace?`<div class="row-actions"><button class="map-search" data-q="${String(x[5]).replace(/"/g,'&quot;')}">지도</button><button class="map-dir" data-q="${String(x[5]).replace(/"/g,'&quot;')}">길찾기</button></div>`:''}</div>
      <button class="check" aria-label="${x[2]} 완료 표시" aria-pressed="${done}">✓</button>${x[7]==='split'?splitHTML():''}
    </li>`
  }).join('');
  document.querySelectorAll('.check').forEach(b=>b.onclick=()=>toggleDone(+b.closest('.schedule-row').dataset.index));
  document.querySelectorAll('.map-search').forEach(b=>b.onclick=()=>window.open(googleSearch(b.dataset.q),'_blank','noopener'));
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
  refreshRoute();
}
function applyKoreanLabels(){
  if(!map)return;
  const style=map.getStyle();
  (style.layers||[]).forEach(layer=>{
    if(layer.type!=='symbol'||!(layer.layout&&layer.layout['text-field']))return;
    if(!/place|poi|road|street|highway|water|park|airport|transit|station|rail|label|name/i.test(layer.id))return;
    try{map.setLayoutProperty(layer.id,'text-field',['coalesce',['get','name:ko'],['get','name_ko'],['get','name:en'],['get','name_en'],['get','name'],['get','ref']])}catch(e){}
  });
}
function lineFeature(points,dayId){
  return {type:'Feature',properties:{},geometry:{type:'LineString',coordinates:points.map(p=>coordFor(p[0])).filter(Boolean)}}
}
function completedFeatures(points,dayId){
  const out=[];
  for(let i=1;i<points.length;i++){
    const target=points[i];
    if(target[1]!=null&&itemDone(dayId,target[1])){
      const a=coordFor(points[i-1][0]),b=coordFor(target[0]);if(a&&b)out.push({type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[a,b]}})
    }
  }
  return out;
}
function setGeo(id,data){const s=map.getSource(id);if(s)s.setData(data)}
function geo(features){return {type:'FeatureCollection',features}}
function addRouteLayers(){
  const defs=[['planned',COLORS.common,[.7,1.15],4.1],['done',COLORS.done,null,5.1],['guns',COLORS.guns,[.65,1.0],4.1],['gunsDone',COLORS.guns,null,5.1],['yumi',COLORS.yumi,[.65,1.0],4.1],['yumiDone',COLORS.yumi,null,5.1]];
  defs.forEach(([id,color,dash,width])=>{
    map.addSource(id,{type:'geojson',data:geo([])});
    const paint={'line-color':color,'line-width':width,'line-opacity':.92};if(dash)paint['line-dasharray']=dash;
    map.addLayer({id,type:'line',source:id,layout:{'line-cap':'round','line-join':'round'},paint});
  });
}
function clearMarkers(){markers.forEach(m=>m.remove());markers=[]}
function addMarker(coord,label,done,cls=''){
  if(!coord)return;
  const el=document.createElement('div');el.className=`route-marker ${done?'done':''} ${cls}`;el.textContent=label;
  const m=new maplibregl.Marker({element:el,anchor:'center'}).setLngLat(coord).addTo(map);markers.push(m);
}
function refreshRoute(){
  const r=ROUTES[activeDay];if(!r)return;
  $('#routeNote').textContent=r.note||'';
  const common=r.common||[];
  $('#routeCount').innerHTML=`<b>${common.length}</b>개 도심 지점`;
  $('#legend').innerHTML=`<span class="legend-item"><i class="legend-line"></i>예정</span><span class="legend-item"><i class="legend-line done"></i>완료</span>${r.branches?'<span class="legend-item"><i class="legend-line guns"></i>건스</span><span class="legend-item"><i class="legend-line yumi"></i>유미</span>':''}`;
  if(!mapReady)return;
  setGeo('planned',geo([lineFeature(common,activeDay)]));
  setGeo('done',geo(completedFeatures(common,activeDay)));
  const guns=r.branches?.guns||[],yumi=r.branches?.yumi||[];
  setGeo('guns',geo(guns.length?[lineFeature(guns,activeDay)]:[]));setGeo('gunsDone',geo(completedFeatures(guns,activeDay)));
  setGeo('yumi',geo(yumi.length?[lineFeature(yumi,activeDay)]:[]));setGeo('yumiDone',geo(completedFeatures(yumi,activeDay)));
  clearMarkers();
  common.forEach((p,i)=>addMarker(coordFor(p[0]),String(i+1),itemDone(activeDay,p[1])));
  if(guns.length)addMarker(coordFor(guns[guns.length-1][0]),'G',itemDone(activeDay,guns[guns.length-1][1]),'branch-guns');
  if(yumi.length)addMarker(coordFor(yumi[yumi.length-1][0]),'Y',itemDone(activeDay,yumi[yumi.length-1][1]),'branch-yumi');
  fitCityRoute();
}
function fitCityRoute(){
  if(!mapReady)return;
  const r=ROUTES[activeDay],coords=[];
  (r.common||[]).forEach(p=>{const c=coordFor(p[0]);if(c)coords.push(c)});
  if(r.branches)Object.values(r.branches).flat().forEach(p=>{const c=coordFor(p[0]);if(c)coords.push(c)});
  if(!coords.length){map.easeTo({center:CITY_CENTER,zoom:12.7});return}
  const b=coords.reduce((acc,c)=>acc.extend(c),new maplibregl.LngLatBounds(coords[0],coords[0]));
  map.fitBounds(b,{padding:{top:44,bottom:44,left:36,right:36},maxZoom:14.5,duration:0});
}
function initMap(){
  if(!window.maplibregl){$('#mapFallback').style.display='grid';return}
  map=new maplibregl.Map({container:'routeMap',style:'https://tiles.openfreemap.org/styles/positron',center:CITY_CENTER,zoom:12.7,minZoom:11.2,maxZoom:17,maxBounds:CITY_BOUNDS,dragRotate:false,pitchWithRotate:false,touchPitch:false,localIdeographFontFamily:'Apple SD Gothic Neo, Noto Sans CJK KR, sans-serif',attributionControl:true});
  map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
  const failTimer=setTimeout(()=>{if(!mapReady)$('#mapFallback').style.display='grid'},9000);
  map.on('load',()=>{clearTimeout(failTimer);$('#mapFallback').style.display='none';applyKoreanLabels();addRouteLayers();mapReady=true;refreshRoute()});
}
function switchDay(id){
  activeDay=id;history.replaceState(null,'','#'+id.slice(1));renderTabs();renderSchedule();refreshRoute();window.scrollTo({top:0,behavior:'instant'});
}
$('#resetMap').onclick=()=>{if(mapReady){map.easeTo({center:CITY_CENTER,zoom:12.7,duration:250})}};
$('#googleRoute').onclick=()=>window.open(googleDayRoute(activeDay),'_blank','noopener');
const hash='d'+location.hash.replace('#','');if(D.some(d=>d.id===hash))activeDay=hash;
renderTabs();renderSchedule();refreshRoute();initMap();
