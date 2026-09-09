let activeDay='d12',routeVariant='common';
const $=s=>document.querySelector(s);

function dayById(id){return D.find(d=>d.id===id)}
function itemDone(dayId,index){return index==null?false:!!saved[`${dayId}-${index}`]}
function googleSearch(q){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q)+'&hl=ko'}
function googleDir(q){return 'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(q)+'&hl=ko'}
function dedupe(points){return points.filter((p,i)=>i===0||p!==points[i-1])}
function routePoints(dayId,variant='common'){
  const r=ROUTES[dayId];
  if(dayId==='d13'&&variant!=='common'&&r.branches?.[variant]){
    const common=(r.common||[]).map(x=>x[0]);
    const branch=r.branches[variant].map(x=>x[0]);
    return dedupe([common[0],common[1],common[2],branch[branch.length-1],...common.slice(3)]);
  }
  return dedupe((r.common||[]).map(x=>x[0]));
}
function googleMapsUrl(dayId,variant='common'){
  const pts=routePoints(dayId,variant);
  if(!pts.length)return googleSearch('삿포로');
  const origin=pts[0],destination=pts[pts.length-1],waypoints=pts.slice(1,-1);
  let url='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(origin)+'&destination='+encodeURIComponent(destination)+'&travelmode=walking&hl=ko';
  if(waypoints.length)url+='&waypoints='+encodeURIComponent(waypoints.join('|'));
  return url;
}
function googleEmbedUrl(dayId,variant='common'){
  const pts=routePoints(dayId,variant);
  if(pts.length<2)return 'https://maps.google.com/maps?hl=ko&gl=kr&q='+encodeURIComponent('삿포로')+'&z=13&output=embed';
  const origin=encodeURIComponent(pts[0]);
  const daddr=pts.slice(1).map(encodeURIComponent).join('+to:');
  return 'https://maps.google.com/maps?hl=ko&gl=kr&ie=UTF8&f=d&output=embed&dirflg=w&saddr='+origin+'&daddr='+daddr;
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
      <div class="event"><div class="event-title"><h4>${x[2]}</h4><span class="kind ${x[4]}">${TYPE_LABEL[x[4]]||x[4]}</span></div><div class="event-meta">${x[3]}</div>${x[6]?`<div class="event-note">${x[6]}</div>`:''}${hasPlace?`<div class="row-actions"><button class="map-search" data-q="${String(x[5]).replace(/"/g,'&quot;')}">지도</button><button class="map-dir" data-q="${String(x[5]).replace(/"/g,'&quot;')}">길찾기</button></div>`:''}</div>
      <button class="check" aria-label="${x[2]} 완료 표시" aria-pressed="${done}">✓</button>${x[7]==='split'?splitHTML():''}
    </li>`;
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
}
function renderRouteVariants(){
  const wrap=$('#routeVariants');
  if(activeDay!=='d13'){wrap.hidden=true;wrap.innerHTML='';routeVariant='common';return}
  wrap.hidden=false;
  wrap.innerHTML=[['common','공통 동선',''],['guns','건스 · 영화','guns'],['yumi','유미 · 팩토리','yumi']].map(([id,label,cls])=>`<button class="route-variant ${cls} ${routeVariant===id?'active':''}" data-variant="${id}">${label}</button>`).join('');
  wrap.querySelectorAll('.route-variant').forEach(b=>b.onclick=()=>{routeVariant=b.dataset.variant;renderRouteVariants();renderMap()});
}
function renderMap(){
  const r=ROUTES[activeDay];
  $('#routeNote').textContent=r.note||'';
  const pts=routePoints(activeDay,routeVariant);
  $('#routeCount').innerHTML=`<b>${pts.length}</b>개 지점`;
  $('#routeMapFrame').src=googleEmbedUrl(activeDay,routeVariant);
  $('#googleRoute').onclick=()=>window.open(googleMapsUrl(activeDay,routeVariant),'_blank','noopener');
  const airport=airportUrl(activeDay),airportButton=$('#airportRoute');
  airportButton.hidden=!airport;
  if(airport)airportButton.onclick=()=>window.open(airport,'_blank','noopener');
}
function switchDay(id){
  activeDay=id;routeVariant='common';history.replaceState(null,'','#'+id.slice(1));renderTabs();renderSchedule();renderRouteVariants();renderMap();window.scrollTo({top:0,behavior:'instant'});
}
$('#resetMap').onclick=()=>renderMap();
const hash='d'+location.hash.replace('#','');if(D.some(d=>d.id===hash))activeDay=hash;
renderTabs();renderSchedule();renderRouteVariants();renderMap();
