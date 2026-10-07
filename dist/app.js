const $ = s => document.querySelector(s);
const COMMON_CATEGORY_OPTIONS=['astro-ph','cond-mat','gr-qc','hep-ex','hep-ph','hep-th','quant-ph'];
const MORE_CATEGORY_OPTIONS=['hep-lat','math-ph','nucl-ex','nucl-th','physics'];
const CATEGORY_OPTIONS=[...COMMON_CATEGORY_OPTIONS,...MORE_CATEGORY_OPTIONS];
const STAGE_OPTIONS=['Undergrad','Master’s','PhD','Postdoc','Faculty','Alumni'];
function readStore(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function saveStore(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
let config={...readStore('physics-wall-config',{}),...window.WALL_CONFIG}, rows=readStore('physics-wall-cache',[]), backendConnected=false, flagId=null;
let voter=readStore('physics-wall-voter',null);if(!/^[a-f0-9-]{36}$/.test(String(voter||''))){voter=crypto.randomUUID();saveStore('physics-wall-voter',voter)}
let featuredOffset=0, activeCategories=new Set(), activeStages=new Set(), fieldFiltersOpen=false, sortMode='latest', page=0, pageCount=1, selectedMapResponseId=null;
let institutionIndex=new Map(),institutionsLoading=null,autoFilledPlace=null;
function pageSize(){const columns=getComputedStyle($('#wall')).gridTemplateColumns.split(/\s+/).filter(Boolean).length||1;return columns*2}
const svgHeart='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
const svgFlag='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V3m0 1c5-4 9 4 14 0v10c-5 4-9-4-14 0"/></svg>';
const svgShare='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"/></svg>';
function endpointValid(url){try{let u=new URL(url);return u.protocol==='https:'&&u.hostname==='script.google.com'&&/^\/macros\/s\/[\w-]+\/exec$/.test(u.pathname)}catch{return false}}
function api(action,params={}){return new Promise((resolve,reject)=>{if(!endpointValid(config.endpointUrl))return reject(new Error('Connect the site endpoint first.'));const callback='wallcb'+crypto.randomUUID().replaceAll('-','');const script=document.createElement('script');const url=new URL(config.endpointUrl);Object.entries({action,visitor:voter,callback,...params}).forEach(([k,v])=>url.searchParams.set(k,v));let timer;function clean(){clearTimeout(timer);script.remove();delete window[callback]}window[callback]=data=>{clean();data.ok?resolve(data):reject(new Error(data.error||'Could not complete this request.'))};script.onerror=()=>{clean();reject(new Error('Could not reach the wall. Please try again.'))};timer=setTimeout(()=>{clean();reject(new Error('The wall is taking too long to respond. Please try again.'))},20000);script.src=url.href;document.head.append(script)})}
function text(tag,value,cls){const el=document.createElement(tag);el.textContent=value;if(cls)el.className=cls;return el}
function displayDate(value){if(!value)return '';const date=new Date(value+'T12:00:00');return Number.isNaN(date.getTime())?'':new Intl.DateTimeFormat('en',{day:'numeric',month:'short',year:'numeric'}).format(date)}
function answerClass(r,index=null){if(index!==null)return index%2?'answer-blue':'answer-black';const slot=[...String(r.id)].reduce((sum,char)=>sum+char.charCodeAt(0),0)%2;return slot?'answer-blue':'answer-black'}
function institutionKey(value){return value.trim().toLocaleLowerCase()}
async function loadInstitutions(){if(institutionIndex.size)return;if(institutionsLoading)return institutionsLoading;institutionsLoading=fetch('institutions.json').then(response=>{if(!response.ok)throw new Error('Institution directory unavailable.');return response.json()}).then(items=>{const options=document.createDocumentFragment();for(const item of items){institutionIndex.set(institutionKey(item.name),item);const option=document.createElement('option');option.value=item.name;options.append(option)}$('#institution-options').append(options)}).catch(()=>{});return institutionsLoading}
function arxivLink(value){const raw=(value||'').trim().replace(/^arxiv:\s*/i,'');if(/^(\d{4}\.\d{4,5}|[a-z-]+(\.[A-Z]{2})?\/\d{7})(v\d+)?$/.test(raw))return 'https://arxiv.org/abs/'+raw;try{const u=new URL(raw);if(u.protocol==='https:'&&u.hostname==='arxiv.org'&&/^\/(a|abs)\/[A-Za-z0-9._/-]+$/.test(u.pathname)&&!u.search&&!u.hash)return u.href}catch{}return null}
function storyUrl(id){const url=new URL(location.href);url.hash='story='+encodeURIComponent(id);return url.href}
async function shareStory(r){const url=storyUrl(r.id),data={title:'Why We Do Physics',text:`“${r.reason}” — ${r.name||'Anonymous'}`,url};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(url);$('#status').textContent='Story link copied.'}}catch(err){if(err.name!=='AbortError')$('#status').textContent='Could not share this story.'}}
function newSubmissionId(){return 'WWDP-'+crypto.randomUUID().replaceAll('-','').slice(0,10).toUpperCase()}
function showSubmissionConfirmation(id){$('#submission-id').textContent=id;$('#copy-submission-id').textContent='COPY';$('#submission-dialog').showModal()}
function makeTile(r,i,demo,prefix){
 const tile=document.createElement('article');
 tile.id=prefix+'-'+r.id;
 tile.className='tile'+(r.reason.length>110?' long':'');
 tile.classList.add(answerClass(r,i));
 if(r.date)tile.append(text('span',displayDate(r.date),'tile-date'));
 tile.append(text('blockquote',r.reason));
 const credit=document.createElement('div');credit.className='credit';
 const creditName=document.createElement('div');creditName.className='credit-name';creditName.append(text('strong',r.name||'Anonymous'));if(r.year)creditName.append(text('span',`, PhD ${r.year}`,'credit-year'));credit.append(creditName);
 if(r.affiliation)credit.append(text('span',r.affiliation));
 const location=[r.city,r.country].filter(Boolean).join(', ');if(location)credit.append(text('span',location));
 const arxiv=arxivLink(r.arxiv);
 if(arxiv){const link=text('a',arxiv.includes('/a/')?'arXiv profile':'arXiv paper','arxiv');link.href=arxiv;link.target='_blank';link.rel='noopener noreferrer';credit.append(link)}
 tile.append(credit);
 const tagValues=[r.category,r.stage].filter(Boolean);
 if(tagValues.length){const tags=document.createElement('div');tags.className='tags';tagValues.forEach(value=>tags.append(text('span',value)));tile.append(tags)}
 const bottom=document.createElement('div');bottom.className='tile-bottom';
 const heart=document.createElement('button'),liked=!!r.liked;
 heart.setAttribute('aria-pressed',String(liked));heart.setAttribute('aria-label',`${liked?'Remove heart from':'Heart'} response by ${r.name}`);heart.innerHTML=svgHeart;heart.append(text('span',r.hearts||0));
 heart.onclick=async()=>{heart.disabled=true;try{const result=await api('heart',{id:r.id,liked:!liked});r.hearts=result.hearts;r.liked=result.liked;render();$('#status').textContent=''}catch(e){$('#status').textContent=e.message;heart.disabled=false}};
 const share=document.createElement('button');share.className='share';share.innerHTML=svgShare;share.title='Share';share.setAttribute('aria-label',`Share response by ${r.name||'Anonymous'}`);share.onclick=()=>shareStory(r);
 const flag=document.createElement('button');flag.className='flag';flag.innerHTML=svgFlag;flag.title='Flag';flag.setAttribute('aria-label',`Flag response by ${r.name}`);flag.onclick=()=>{flagId=r.id;$('#flag-status').textContent='';$('#flag-form').hidden=false;$('#flag-dialog').showModal()};
 bottom.append(heart,share,flag);tile.append(bottom);return tile;
}
function toggleSelection(set,value){set.has(value)?set.delete(value):set.add(value);page=0;render()}
function renderFilters(){const root=$('#filter-chips');root.replaceChildren();const common=document.createElement('div');common.className='filter-chip-row';for(const value of COMMON_CATEGORY_OPTIONS){const chip=text('button',value,'filter-chip');chip.type='button';chip.setAttribute('aria-pressed',String(activeCategories.has(value)));chip.onclick=()=>toggleSelection(activeCategories,value);common.append(chip)}const expand=text('button',fieldFiltersOpen?'−':'+','filter-expand');expand.type='button';expand.setAttribute('aria-expanded',String(fieldFiltersOpen));expand.setAttribute('aria-label',fieldFiltersOpen?'Hide more arXiv fields':'Show more arXiv fields');expand.onclick=()=>{fieldFiltersOpen=!fieldFiltersOpen;if(!fieldFiltersOpen)MORE_CATEGORY_OPTIONS.forEach(value=>activeCategories.delete(value));page=0;render()};common.append(expand);root.append(common);if(fieldFiltersOpen){const more=document.createElement('div');more.className='filter-chip-row filter-field-row';for(const value of MORE_CATEGORY_OPTIONS){const chip=text('button',value,'filter-chip');chip.type='button';chip.setAttribute('aria-pressed',String(activeCategories.has(value)));chip.onclick=()=>toggleSelection(activeCategories,value);more.append(chip)}root.append(more)}const stages=document.createElement('div');stages.className='filter-chip-row filter-stage-row';if(activeCategories.size||activeStages.size){const clear=text('button','clear','filter-clear');clear.type='button';clear.onclick=()=>{activeCategories.clear();activeStages.clear();fieldFiltersOpen=false;page=0;render()};stages.append(clear)}for(const value of STAGE_OPTIONS){const chip=text('button',value,'filter-chip');chip.type='button';chip.setAttribute('aria-pressed',String(activeStages.has(value)));chip.onclick=()=>toggleSelection(activeStages,value);stages.append(chip)}root.append(stages)}
function render(){
 const wall=$('#wall'),featured=$('#featured');wall.replaceChildren();featured.replaceChildren();
 const demo=false,all=rows;
 const query=($('#search-input').value||'').toLocaleLowerCase().trim();
 const matches=all.filter(r=>(!activeCategories.size||activeCategories.has(r.category))&&(!activeStages.size||activeStages.has(r.stage))&&[r.reason,r.name,r.affiliation,r.year,r.arxiv,r.city,r.country,r.category,r.stage].join(' ').toLocaleLowerCase().includes(query));
 const list=[...matches].sort((a,b)=>sortMode==='liked'?(b.hearts||0)-(a.hearts||0):String(b.date||'').localeCompare(String(a.date||'')));
 renderFilters();
 const countries=new Set(list.map(r=>r.country).filter(Boolean)).size;
 $('#response-tally').textContent=`${list.length} ${list.length===1?'response':'responses'} · ${countries} ${countries===1?'country':'countries'}`;
 $('#search-count').textContent=query?`${list.length} of ${all.length} responses`:'';
 $('#count').textContent=all.length;$('#count-label').textContent=all.length===1?'response':'responses';$('#mode').textContent='Community responses';
 $('#sort-latest').setAttribute('aria-pressed',String(sortMode==='latest'));$('#sort-liked').setAttribute('aria-pressed',String(sortMode==='liked'));
 const carouselRows=all.filter(r=>!r.illustrative),featuredRows=carouselRows.length?[carouselRows[featuredOffset%carouselRows.length]]:[];
 $('#featured-prev').disabled=carouselRows.length<=1;$('#featured-next').disabled=carouselRows.length<=1;
 featuredRows.forEach(r=>featured.append(makeTile(r,featuredOffset,demo,'featured')));
 const perPage=pageSize();pageCount=Math.max(1,Math.ceil(list.length/perPage));page=Math.min(page,pageCount-1);
 const pageRows=list.slice(page*perPage,(page+1)*perPage);for(const [i,r]of pageRows.entries())wall.append(makeTile(r,page*perPage+i,demo,'tile'));
 if(!list.length&&query)wall.append(text('p','No responses match your search.'));
 const pager=document.querySelector('.pager');pager.hidden=pageCount<=1;$('#page-count').textContent=`${page+1}/${pageCount}`;$('#page-prev').disabled=page===0;$('#page-next').disabled=page>=pageCount-1;
 renderClouds(list,featuredRows[0]?.id||null);
 const shared=decodeURIComponent((location.hash.match(/^#story=(.*)$/)||[])[1]||'');if(shared)queueMicrotask(()=>document.getElementById('tile-'+CSS.escape(shared))?.scrollIntoView({block:'center'}));
}
async function load(){if(!config.endpointUrl){backendConnected=false;render();return}try{const data=await api('wall');backendConnected=true;rows=data.rows;saveStore('physics-wall-cache',rows);render();$('#status').textContent=''}catch{backendConnected=false;render();$('#status').textContent=''}}
for(const button of document.querySelectorAll('.close'))button.onclick=()=>button.closest('dialog').close();for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
$('#contribute').onclick=()=>$('#submit-dialog').showModal();
$('#submit-form').onsubmit=async e=>{
 e.preventDefault();
 const form=e.target,f=new FormData(form),submissionId=newSubmissionId();
 const entry={name:f.get('name'),affiliation:f.get('affiliation'),stage:f.get('stage'),category:f.get('category'),year:f.get('year'),reason:f.get('reason'),arxiv:f.get('arxiv')||'',city:f.get('city'),country:f.get('country')};
 if(!endpointValid(config.endpointUrl)){$('#form-message').textContent='Submissions are temporarily unavailable.';return}
 const button=form.querySelector('button[type="submit"]');button.disabled=true;
 try{
  const params=new URLSearchParams({action:'submit',submissionId,name:entry.name,affiliation:entry.affiliation,stage:entry.stage,category:entry.category,year:entry.year,reason:entry.reason,city:entry.city,country:entry.country,mapOptIn:entry.city&&entry.country?'yes':'',consent:f.get('consent')?'yes':'',website:f.get('website')||''});
  await fetch(config.endpointUrl,{method:'POST',mode:'no-cors',body:params});
  $('#submit-dialog').close();form.reset();reasonCount.textContent='0 / 140';resetLocation();$('#status').textContent='Received for review.';showSubmissionConfirmation(submissionId)
 }catch{$('#form-message').textContent='Could not send. Please try again.'}finally{button.disabled=false}
};
$('#flag-form').onsubmit=async e=>{e.preventDefault();if(!config.endpointUrl){$('#flag-status').textContent='Reporting is temporarily unavailable.';return}const b=e.target.querySelector('button');b.disabled=true;try{await api('flag',{id:flagId,reason:$('#flag-reason').value});$('#flag-status').textContent='Flag received. The moderator can review it.';$('#flag-form').hidden=true}catch(err){$('#flag-status').textContent=err.message}finally{b.disabled=false}};
load();setInterval(()=>{if(config.endpointUrl&&!document.hidden&&!document.querySelector('dialog[open]'))load()},60000);

function renderClouds(list,featuredId){
 const root=$('#clouds'),pins=$('#map-pins'),lines=$('#map-lines');root.replaceChildren();pins.replaceChildren();lines.replaceChildren();
 const located=list.filter(r=>Number.isFinite(r.lat)&&Number.isFinite(r.lng)&&Math.abs(r.lat)<=90&&Math.abs(r.lng)<=180&&r.city);
 $('#map-status').textContent=located.length?`${located.length} mapped ${located.length===1?'response':'responses'}.`:'No mapped responses.';
 function clearCloud(){root.replaceChildren();lines.replaceChildren()}
 function showCloud(r){
  clearCloud();
  if(!r)return;
  const px=(r.lng+180)/360*100,py=(90-r.lat)/180*100,x=Math.min(72,Math.max(1,px+2)),y=py<50?58:4,edgeY=py<50?y:y+30;
  const cloud=document.createElement('button');cloud.className='cloud';cloud.style.left=x+'%';cloud.style.top=y+'%';
  cloud.append(text('blockquote',r.reason.length>100?r.reason.slice(0,97)+'…':r.reason),text('span',`${r.name} · ${r.city}, ${r.country}`));
  cloud.setAttribute('aria-label',`Read declaration by ${r.name} in ${r.city}`);
  cloud.onclick=()=>{const tile=document.getElementById('tile-'+r.id);if(!tile)return;tile.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});tile.classList.add('highlight');setTimeout(()=>tile.classList.remove('highlight'),2500)};
  const line=document.createElementNS('http://www.w3.org/2000/svg','line');
  for(const [k,v]of Object.entries({x1:px*10,y1:py*5,x2:(x+12.5)*10,y2:edgeY*5,stroke:'#0056b3','stroke-width':'1',opacity:'.28','stroke-linecap':'round'}))line.setAttribute(k,v);
  lines.append(line);root.append(cloud);
 }
 const restoreSelected=()=>showCloud(located.find(r=>r.id===selectedMapResponseId));
 const positions=new Map();
 for(const r of located){
  const key=[r.lat,r.lng].join(','),index=positions.get(key)||0;positions.set(key,index+1);
  const angle=index*2.39996,radius=index?Math.min(1.25,.34*Math.sqrt(index)):0;
  const pin=document.createElement('button');pin.className='map-pin'+(r.id===featuredId?' is-featured':'');pin.style.left=((r.lng+180)/360*100+Math.cos(angle)*radius)+'%';pin.style.top=((90-r.lat)/180*100+Math.sin(angle)*radius)+'%';
  pin.setAttribute('aria-label',`${r.name||'Anonymous'} · ${r.city}, ${r.country}`);pin.title=pin.getAttribute('aria-label');
  pin.addEventListener('pointerenter',()=>showCloud(r));pin.addEventListener('pointerleave',restoreSelected);
  pin.addEventListener('focus',()=>showCloud(r));pin.addEventListener('blur',restoreSelected);
  pin.onclick=e=>{e.stopPropagation();selectedMapResponseId=r.id;if(!r.illustrative){const carouselRows=rows.filter(item=>!item.illustrative),next=carouselRows.findIndex(item=>item.id===r.id);if(next>=0)featuredOffset=next}render()};
  pins.append(pin);
 }
 restoreSelected();
}
$('.map-canvas').addEventListener('click',e=>{if(e.target.closest('.map-pin,.cloud'))return;selectedMapResponseId=null;$('#clouds').replaceChildren();$('#map-lines').replaceChildren()});
$('#about').onclick=()=>$('#about-dialog').showModal();
$('#copy-submission-id').onclick=async e=>{try{await navigator.clipboard.writeText($('#submission-id').textContent);e.currentTarget.textContent='COPIED'}catch{e.currentTarget.textContent='COPY FAILED'}};
$('#search-input').oninput=()=>{page=0;render()};
function stepFeatured(delta){const all=rows.filter(r=>!r.illustrative);if(all.length<=1)return;featuredOffset=(featuredOffset+delta+all.length)%all.length;selectedMapResponseId=null;render()}
$('#featured-prev').onclick=()=>stepFeatured(-1);$('#featured-next').onclick=()=>stepFeatured(1);
function setSort(mode){sortMode=mode;page=0;render()}$('#sort-latest').onclick=()=>setSort('latest');$('#sort-liked').onclick=()=>setSort('liked');
function setPage(next){page=next;render();document.querySelector('.wall-section').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})}$('#page-prev').onclick=()=>setPage(Math.max(0,page-1));$('#page-next').onclick=()=>setPage(page+1);
const reasonInput=document.querySelector('textarea[name="reason"]'),reasonCount=$('#reason-count'),affiliationInput=document.querySelector('input[name="affiliation"]'),stageInput=document.querySelector('select[name="stage"]'),locationInput=document.querySelector('input[name="location"]'),cityInput=document.querySelector('input[name="city"]'),countryInput=document.querySelector('input[name="country"]');
function parseLocation(){const parts=locationInput.value.split(',');cityInput.value=parts.length>1?parts.slice(0,-1).join(',').trim():'';countryInput.value=parts.length>1?parts.at(-1).trim():'';locationInput.setCustomValidity(locationInput.value&&!cityInput.value?'Enter city and country, separated by a comma.':'')}
function fillInstitutionPlace(){const match=stageInput.value!=='Alumni'?institutionIndex.get(institutionKey(affiliationInput.value)):null;if(match){autoFilledPlace=`${match.city}, ${match.country}`;locationInput.value=autoFilledPlace;parseLocation();return}if(autoFilledPlace&&locationInput.value===autoFilledPlace)locationInput.value='';autoFilledPlace=null;parseLocation()}
function resetLocation(){autoFilledPlace=null;parseLocation()}
reasonInput.oninput=()=>reasonCount.textContent=`${reasonInput.value.length} / 140`;affiliationInput.onfocus=loadInstitutions;affiliationInput.oninput=()=>loadInstitutions().then(fillInstitutionPlace);stageInput.onchange=fillInstitutionPlace;locationInput.oninput=()=>{autoFilledPlace=null;parseLocation()};resetLocation();loadInstitutions();
// Refresh the decorative constellation after the page and its controls are ready.
render();
let cloudResize;window.addEventListener('resize',()=>{clearTimeout(cloudResize);cloudResize=setTimeout(render,200)});
