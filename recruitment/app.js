const jimPage=/\/(jim|barry)\/?$/.test(location.pathname);
const readOnly=()=>jimPage||archive.readOnly===true;
const $=id=>document.getElementById(id);
let lang=localStorage.getItem('recruitment-language')==='zh'?'zh':'en',archive={candidates:[]},selected;
const statuses=['New','To interview','Interviewed','Offer','Hired','On hold','Not qualified','Rejected'];
const zhStatuses=['新申请','待面试','已面试','已发录用意向','已录用','暂缓','不符合要求','已拒绝'];
const words={en:{title:'Recruitment desk',private:'● Private local archive',logout:'Sign out',staff:'STAFF ACCESS',welcome:'Meet your next great teachers.',intro:'Résumés, introduction videos and team review in one private workspace.',code:'Access code',open:'Open recruitment desk →',applications:'PEOPLE / APPLICATIONS',heading:'Meet your candidates.',refresh:'Refresh ↻',search:'Search candidates',recruiter:'Source',status:'Application status',allRecruiters:'All sources',allStatuses:'All statuses',footer:'Résumés & introduction videos · Human review',empty:'No candidates match your search.',notProvided:'Not provided',age:'Age',nationality:'Nationality',experience:'Experience',education:'Education',year:'Graduation year',expected:'Expected',qualification:'Qualification',asOf:'As of',major:'Major',school:'School',evidence:'Résumé evidence',received:'Received',interview:'Interview time',decision:'Decision time',shanghai:'All dates and times use Shanghai time (UTC+8).',notes:'Team notes',save:'Save review',saved:'Review saved. No message was sent.',saving:'Saving…',resumes:'Résumés',download:'Download',preview:'Preview',missing:'Not downloaded',noResume:'No résumé available.',video:'Introduction video',attach:'Attach video to this candidate',choose:'Choose MP4, WebM or MOV (250 MB maximum)',upload:'Upload selected video',uploading:'Uploading…',uploaded:'Video attached.',videoHelp:'Choose a video for the named candidate. MOV playback depends on browser support; download if it cannot play.',noVideo:'No video attached.',history:'Status history',noHistory:'No recorded changes.',error:'Something went wrong. Refresh and try again.',loginError:'Incorrect access code.',expired:'Please sign in again.',invalid:'Check the entered values and file type.',tooLarge:'Video must be at most 250 MB.',rate:'Too many attempts. Wait one minute.',chooseFirst:'Choose a video first.',selectCandidate:'Selected candidate',visa:'Visa information review',visaHelp:'Separate from application status; not an eligibility decision.',unknown:'Not checked',needs_review:'Needs review',not_flagged:'No issue flagged'},zh:{title:'招聘工作台',private:'● 本地私密档案',logout:'退出登录',staff:'员工访问',welcome:'认识下一位优秀教师。',intro:'在私密工作台中查看简历、自我介绍视频和团队审核记录。',code:'访问码',open:'打开招聘工作台 →',applications:'候选人 / 申请',heading:'候选人一览',refresh:'刷新 ↻',search:'搜索候选人',recruiter:'申请来源',status:'申请状态',allRecruiters:'全部来源',allStatuses:'全部状态',footer:'简历与自我介绍视频 · 人工审核',empty:'没有符合筛选条件的候选人。',notProvided:'未提供',age:'年龄',nationality:'国籍',experience:'工作经验',education:'教育经历',year:'毕业年份',expected:'预计',qualification:'学历 / 资格',asOf:'截至',major:'专业',school:'学校',evidence:'简历依据',received:'收到时间',interview:'面试时间',decision:'决定时间',shanghai:'日期和时间均使用上海时间（UTC+8）。',notes:'团队备注',save:'保存审核记录',saved:'已保存审核记录，未发送任何消息。',saving:'正在保存…',resumes:'简历',download:'下载',preview:'预览',missing:'未下载',noResume:'暂无简历。',video:'自我介绍视频',attach:'为此候选人添加视频',choose:'选择 MP4、WebM 或 MOV（最大 250 MB）',upload:'上传所选视频',uploading:'正在上传…',uploaded:'视频已添加。',videoHelp:'请为显示的候选人选择视频。MOV 播放取决于浏览器支持，如无法播放请下载。',noVideo:'尚未添加视频。',history:'状态变更记录',noHistory:'暂无变更记录。',error:'操作失败，请刷新后重试。',loginError:'访问码不正确。',expired:'请重新登录。',invalid:'请检查输入内容及文件格式。',tooLarge:'视频最大为 250 MB。',rate:'尝试次数过多，请等待一分钟。',chooseFirst:'请先选择视频。',selectCandidate:'当前候选人',visa:'签证信息审核',visaHelp:'独立于申请状态，不代表资格认定。',unknown:'尚未审核',needs_review:'需要审核',not_flagged:'未标记问题'}};
const portalWords={en:{title:'Gold Star candidate portal',staff:'JIM ALTHANS / GOLD STAR',welcome:'Your candidates at Flying English.',intro:'View your candidates and their application progress. This portal is read-only.',heading:'Your candidates.',private:'● Read-only recruiter portal',open:'Open candidate portal →',footer:'Gold Star · Read-only candidate updates'},zh:{title:'Gold Star 候选人门户',staff:'JIM ALTHANS / GOLD STAR',welcome:'您推荐给 Flying English 的候选人',intro:'查看您推荐的候选人及申请进度。本门户为只读。',heading:'您推荐的候选人',private:'● 招聘顾问只读门户',open:'打开候选人门户 →',footer:'Gold Star · 候选人进度（只读）'}};
const t=k=>(jimPage?portalWords[lang][k]:null)||words[lang][k]||k, statusText=s=>lang==='zh'?zhStatuses[statuses.indexOf(s)]||s:s;
function el(tag,text,cls){const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;}
function date(value){const d=new Date(value);return value&&!isNaN(d)?new Intl.DateTimeFormat(lang==='zh'?'zh-CN':'en-GB',{timeZone:'Asia/Shanghai',year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(d):t('notProvided');}
function inputDate(value){if(!value)return '';const d=new Date(value);return isNaN(d)?'':new Date(d.getTime()+8*3600000).toISOString().slice(0,16);}
function value(v){if(v==null||v==='')return t('notProvided');if(typeof v==='object')return v[lang]||v.en||v.zh||t('notProvided');return String(v);}
function error(status){return status===401?t('expired'):status===429?t('rate'):status===413?t('tooLarge'):[400,404,415,422].includes(status)?t('invalid'):t('error');}
async function post(path,data){return fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});}
function signedOut(){$('workspace').hidden=true;$('logout').hidden=true;$('login').hidden=false;archive={candidates:[]};$('detail').replaceChildren();$('candidates').replaceChildren();}
function translate(){document.documentElement.lang=lang;document.title=t('title');document.querySelectorAll('[data-i18n]').forEach(n=>n.textContent=t(n.dataset.i18n));$('language').textContent=lang==='en'?'中文':'English';$('search').placeholder=t('search');$('recruiter').closest('label').hidden=jimPage;const oldR=$('recruiter').value,oldS=$('status-filter').value;$('recruiter').replaceChildren(new Option(t('allRecruiters'),''));[...new Set(['Direct applicant',...archive.candidates.map(c=>c.recruiter).filter(Boolean)])].sort().forEach(r=>$('recruiter').add(new Option(r==='Direct applicant'?(lang==='zh'?'直接申请':'Direct applicant'):r,r)));$('recruiter').value=oldR;$('status-filter').replaceChildren(new Option(t('allStatuses'),''));statuses.forEach(s=>$('status-filter').add(new Option(statusText(s),s)));$('status-filter').value=oldS;$('login-error').textContent='';$('notice').textContent='';render();}
async function load(){try{const r=await fetch(jimPage?'/api/jim/candidates':'/api/candidates');if(r.status===401)return signedOut();if(!r.ok)throw Error(error(r.status));archive=await r.json();$('login').hidden=true;$('workspace').hidden=false;$('logout').hidden=false;translate();}catch(e){$('notice').textContent=t('error');$('login-error').textContent=t('error');}}
function evidence(field,c,host){if(!field?.sourceDocumentId)return;const doc=(c.documents||[]).find(d=>String(d.id)===String(field.sourceDocumentId));if(!doc)return;const details=el('details',null,'evidence');details.append(el('summary',t('evidence')+' · '+doc.name));if(field.sourceText)details.append(el('p',field.sourceText));host.append(details);}
function profile(c){const box=el('section',null,'profile-grid');for(const key of ['age','nationality','experience']){const row=el('div',null,key==='experience'?'wide':'');row.append(el('small',t(key)),el('p',value(c.profile?.[key]?.value)));if(key==='age'&&c.profile?.age?.asOf)row.append(el('small',`${t('asOf')}: ${c.profile.age.asOf}`));evidence(c.profile?.[key],c,row);box.append(row);}$('detail').append(box,el('p',t('education'),'section-label'));const education=c.profile?.education||[];if(!education.length)$('detail').append(el('p',t('notProvided')));education.forEach(ed=>{const row=el('div',null,'education');row.append(el('strong',value(ed.school)),el('p',`${t('year')}: ${value(ed.graduationYear)}${ed.expected?' ('+t('expected')+')':''} · ${t('major')}: ${value(ed.major)}`));if(ed.qualification)row.append(el('p',`${t('qualification')}: ${value(ed.qualification)}`));evidence(ed,c,row);$('detail').append(row);});}
function statusBadge(s){const badge=el('span',statusText(s),'status-badge');badge.dataset.status=s;return badge;}
function avatar(c,large=false){const a=el('span',null,'avatar'+(large?' portrait-large':''));if(c.portrait){const img=el('img');img.src=`/portraits/${encodeURIComponent(c.id)}/${encodeURIComponent(c.portrait.id)}`;img.alt=c.name;img.loading='lazy';a.append(img);}else a.textContent=c.name?.split(/\s+/).map(s=>s[0]).slice(0,2).join('')||'?';return a;}
function render(){const q=$('search').value.toLowerCase(),r=$('recruiter').value,s=$('status-filter').value;const list=archive.candidates.filter(c=>(!r||c.recruiter===r)&&(!s||c.status===s)&&[c.name,c.recruiter].join(' ').toLowerCase().includes(q));if(!list.some(c=>c.id===selected))selected=list[0]?.id;$('count').textContent=lang==='zh'?`${list.length} 位候选人`:`${list.length} shown`;$('summary').textContent=lang==='zh'?`${archive.candidates.length} 位候选人`:`${archive.candidates.length} candidates`;$('candidates').replaceChildren();list.forEach(c=>{const b=el('button',null,'candidate'+(c.id===selected?' active':''));b.setAttribute('aria-pressed',String(c.id===selected));b.dataset.status=c.status;b.append(avatar(c));const info=el('span',null,'candidate-info');info.append(el('strong',c.name),el('small',c.recruiter==='Direct applicant'&&lang==='zh'?'直接申请':c.recruiter),statusBadge(c.status));if(['Rejected','Not qualified'].includes(c.status)&&c.rejectionReason)info.append(el('span',value(c.rejectionReason),'rejection-reason'));b.append(info);b.onclick=()=>{selected=c.id;render();};$('candidates').append(b);});const c=list.find(c=>c.id===selected);$('detail').replaceChildren();if(!c){$('detail').append(el('p',t('empty'),'empty'));return;}$('detail').append(avatar(c,true),statusBadge(c.status),el('p',c.recruiter==='Direct applicant'&&lang==='zh'?'直接申请':c.recruiter,'eyebrow'),el('h2',c.name),el('p',`${t('received')}: ${date(c.receivedAt)}`,'muted'));profile(c);graduationCheck(c);review(c);documents(c);video(c);}
function graduationCheck(c){if(readOnly()||!c.visaReview)return;const box=el('section',null,'visa-review');box.append(el('strong',lang==='zh'?'毕业日期核对':'Graduation-date check'),el('p',value(c.visaReview.reason)),el('p',lang==='zh'?'按您的 2025/2026 年毕业日期规则核对；不代表签证资格判断。':'Checked against your 2025/2026 graduation-date rule; this is not a visa-eligibility decision.','muted'));(c.visaReview.evidence||[]).forEach(item=>evidence(item,c,box));$('detail').append(box);}
function documents(c){$('detail').append(el('p',t('resumes'),'section-label'));if(!(c.documents||[]).length)$('detail').append(el('p',t('noResume')));(c.documents||[]).forEach(d=>{const row=el('div',null,'document');row.append(el('strong',d.name,'document-info'));if(d.available){const path=`/documents/${encodeURIComponent(c.id)}/${encodeURIComponent(d.id)}`,a=el('a',t('download'));a.href=path;row.append(a);if(/\.(pdf|png|jpe?g)$/i.test(d.name)){const a=el('a',t('preview'));a.href=path+'?preview=1';a.target='_blank';a.rel='noopener noreferrer';row.append(a);}}else row.append(el('small',t('missing')));$('detail').append(row);});}
function review(c){if(readOnly()){const panel=el('section',null,'review-panel');if(c.rejectionReason)panel.append(el('p',value(c.rejectionReason)));panel.append(el('p',`${t('status')}: ${statusText(c.status)}`),el('p',`${t('interview')}: ${date(c.interviewAt)}`),el('p',`${t('decision')}: ${date(c.decisionAt)}`),el('p',t('shanghai'),'muted'));$('detail').append(panel);return;}const form=el('form',null,'review-panel'),label=el('label',t('status')),select=el('select');statuses.forEach(s=>select.add(new Option(statusText(s),s)));select.value=c.status;select.dataset.status=c.status;select.onchange=()=>select.dataset.status=select.value;label.append(select);form.append(label);const inputs={};for(const key of ['interviewAt','decisionAt']){const l=el('label',t(key==='interviewAt'?'interview':'decision')),i=el('input');i.type='datetime-local';i.value=inputDate(c[key]);inputs[key]=i;l.append(i);form.append(l);}form.append(el('p',t('shanghai'),'muted wide'));const notesLabel=el('label',t('notes'),'wide'),notes=el('textarea');notes.rows=4;notes.maxLength=10000;notes.value=c.notes||'';notesLabel.append(notes);form.append(notesLabel);const reasons={};for(const language of ['en','zh']){const label=el('label',language==='en'?'Decision reason (English)':'决定原因（中文）','wide'),input=el('input');input.type='text';input.maxLength=500;input.value=c.rejectionReason?.[language]||'';reasons[language]=input;label.append(input);form.append(label);}const save=el('button',t('save')),feedback=el('p',null,'muted');feedback.setAttribute('role','status');form.append(save,feedback);form.onsubmit=async e=>{e.preventDefault();save.disabled=true;feedback.textContent=t('saving');try{const data={candidateId:String(c.id),status:select.value,notes:notes.value,rejectionReason:{en:reasons.en.value,zh:reasons.zh.value}};for(const key of ['interviewAt','decisionAt']){const v=inputs[key].value;if(v!==inputDate(c[key]))data[key]=v?v+':00+08:00':null;}const r=await post('/api/review',data);if(r.status===401){signedOut();return;}if(!r.ok)throw Error(error(r.status));await load();$('notice').textContent=t('saved');}catch(e){feedback.textContent=e.message||t('error');save.disabled=false;}};$('detail').append(form);const history=el('details',null,'history');history.append(el('summary',t('history')));if(!(c.statusHistory||[]).length)history.append(el('p',t('noHistory'),'muted'));(c.statusHistory||[]).forEach(h=>history.append(el('p',`${date(h.at)}${h.eventDateUnknown?(lang==='zh'?'（记录时间；实际日期未提供）':' (recorded; actual date not supplied)'):''} · ${statusText(h.from)} → ${statusText(h.to)}`,'muted')));$('detail').append(history);}
function video(c){$('detail').append(el('p',t('video'),'section-label'));if(c.video){const path=`/videos/${encodeURIComponent(c.id)}/${encodeURIComponent(c.video.id)}`,player=el('video');player.controls=true;player.preload='metadata';player.src=path;player.setAttribute('aria-label',t('video'));const a=el('a',`${t('download')} · ${c.video.name}`);a.href=path+'?download=1';$('detail').append(player,a);}else $('detail').append(el('p',t('noVideo')));}
// Encrypted role-specific index and on-demand attachments.
const role=location.pathname.match(/\/(jim|barry)\/?$/)?.[1]||'staff',storageKey='flying-recruitment-key-'+role;
lang=role==='staff'?'zh':(localStorage.getItem('recruitment-language-'+role)||'en');
let activeKey=null,cryptoKey=null,assetUrls=new Map(),loadSequence=0;
function clearAssets(){for(const url of assetUrls.values())URL.revokeObjectURL(url);assetUrls.clear();}
async function assetUrl(id){
 if(assetUrls.has(id))return assetUrls.get(id);
 const f=archive.files?.[id];if(!f)throw Error('Missing attachment');
 const response=await fetch(f.url);if(!response.ok)throw Error('Attachment download failed');
 const bytes=new Uint8Array(await response.arrayBuffer());
 const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12),additionalData:new TextEncoder().encode('flying-recruitment-asset-v1:'+role+':'+id)},cryptoKey,bytes.slice(12));
 const url=URL.createObjectURL(new Blob([raw],{type:f.contentType}));assetUrls.set(id,url);return url;
}
function avatar(c,large=false){
 const a=el('span',c.name.split(/\s+/).map(s=>s[0]).slice(0,2).join(''),'avatar'+(large?' portrait-large':''));
 if(c.portrait)assetUrl(c.portrait.asset).then(url=>{if(!a.isConnected)return;const img=el('img');img.src=url;img.alt=c.name;a.replaceChildren(img);}).catch(()=>{});
 return a;
}
function documents(c){
 $('detail').append(el('p',t('resumes'),'section-label'));
 for(const d of c.documents||[]){
  const row=el('div',null,'document');row.append(el('strong',d.name));
  const a=el('a',t('download'));a.href='#';a.download=d.name;
  a.onclick=async e=>{if(a.href.startsWith('blob:'))return;e.preventDefault();a.textContent=lang==='zh'?'正在加载…':'Loading…';try{a.href=await assetUrl(d.asset);a.textContent=t('download');a.click();}catch{a.textContent=lang==='zh'?'重试下载':'Retry download';}};
  row.append(a);$('detail').append(row);
 }
}
function video(c){
 $('detail').append(el('p',t('video'),'section-label'));
 if(!c.video){$('detail').append(el('p',t('noVideo')));return;}
 const host=el('div'),button=el('button',lang==='zh'?'播放自我介绍视频':'Play introduction video');
 button.onclick=async()=>{button.disabled=true;button.textContent=lang==='zh'?'正在加载视频…':'Loading video…';try{const url=await assetUrl(c.video.asset);const p=el('video');p.controls=true;p.src=url;const a=el('a',t('download'));a.href=url;a.download=c.video.name;host.replaceChildren(p,a);p.play().catch(()=>{});}catch{button.disabled=false;button.textContent=lang==='zh'?'重试加载视频':'Retry video';}};
 host.append(button);$('detail').append(host);
}
function review(c){
 const box=el('section',null,'review-panel');box.append(el('p',String(t('interview'))+': '+date(c.interviewAt)),el('p',String(t('decision'))+': '+date(c.decisionAt)));
 if(c.recruiterComment)box.append(el('p',value(c.recruiterComment)));
 if(c.rejectionReason)box.append(el('p',value(c.rejectionReason)));
 if(role==='staff'&&c.notes)box.append(el('strong',t('notes')),el('p',c.notes));
 $('detail').append(box);
}
function graduationCheck(){}
function locked(message){
 clearAssets();archive={candidates:[]};$('detail').replaceChildren();$('candidates').replaceChildren();$('workspace').hidden=true;$('logout').hidden=true;$('login').hidden=false;$('login-form').hidden=true;
 $('unlock-message')?.remove();const p=el('p',message);p.id='unlock-message';p.setAttribute('role','status');$('login').append(p);
}
async function load(){
 if(!activeKey)return locked(lang==='zh'?'请使用收到的专属链接打开此页面。':'Open the private invitation link you received.');
 const seq=++loadSequence;locked(lang==='zh'?'正在加载候选人…':'Loading candidates…');
 let stage='network';
 try{
  const raw=await fetch('index.bin?v=20261029b',{cache:'no-store'});if(!raw.ok)throw Error('HTTP '+raw.status);
  const bytes=new Uint8Array(await raw.arrayBuffer());stage='unlock';
  const keyBytes=Uint8Array.from(atob(activeKey.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-activeKey.length%4)%4)),c=>c.charCodeAt(0));
  const key=await crypto.subtle.importKey('raw',keyBytes,'AES-GCM',false,['decrypt']);
  const decrypted=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12),additionalData:new TextEncoder().encode('flying-recruitment-v1:'+role)},key,bytes.slice(12));
  const next=JSON.parse(new TextDecoder().decode(decrypted));if(next.scope!==role)throw Error('Wrong scope');
  if(seq!==loadSequence)return;cryptoKey=key;archive=next;stage='display';$('login').hidden=true;$('workspace').hidden=false;translate();
 }catch(e){
  if(seq!==loadSequence)return;
  locked(stage==='network'?(lang==='zh'?'网络加载失败，请点击重试。':'Could not download candidates. Please retry.'):(stage==='unlock'?(lang==='zh'?'链接无法解锁此页面，请重新打开完整的专属链接。':'This link could not unlock the page. Reopen the full invitation link.'):(lang==='zh'?'页面显示失败，请重试。':'Could not display candidates. Please retry.')));
  const retry=el('button',lang==='zh'?'重试':'Retry');retry.onclick=load;$('login').append(retry);
 }
}
if(role==='barry'){
 Object.assign(portalWords.en,{title:'Arun candidate portal',staff:'BARRY SHORTEN / ARUN'});
 Object.assign(portalWords.zh,{title:'Arun 候选人页面',staff:'BARRY SHORTEN / ARUN'});
}
function contacts(c){
 const box=el('section',null,'contact-panel');box.append(el('p',lang==='zh'?'联系方式':'Contact information','section-label'));
 const labels={email:lang==='zh'?'邮箱':'Email',phone:lang==='zh'?'电话':'Phone',wechat:'WeChat',whatsapp:'WhatsApp'};
 const entries=c.contact?.entries||[];
 if(!entries.length)box.append(el('p',lang==='zh'?'未提供直接联系方式，请联系招聘顾问。':'Direct contact details not provided; contact the recruiter.'));
 for(const item of entries){const p=el('p');p.append(el('strong',(labels[item.type]||item.type)+': '));if(item.type==='email'){const a=el('a',item.value);a.href='mailto:'+item.value;p.append(a);}else p.append(document.createTextNode(item.value));if(item.label)p.append(el('small',' ('+value(item.label)+')'));box.append(p);}
 $('detail').append(box);
}
const originalRender=render;
render=function(){
 originalRender();
 for(const c of archive.candidates){
  const group=c.applicationGroup;if(!group)continue;
  const others=group.members.filter(x=>x.id!==c.id);
  if(!others.length)continue;
  const label=(lang==='zh'?'共同申请：':'Applying together: ')+others.map(x=>x.name).join(', ');
  const cards=[...$('candidates').children];const card=cards.find(x=>x.querySelector('strong')?.textContent===c.name);
  if(card)card.querySelector('.candidate-info').append(el('span',label,'pair-note'));
  if(c.id===selected){const note=el('p',label,'pair-note');$('detail').insertBefore(note,$('detail').querySelector('h2').nextSibling);}
 }
 const c=archive.candidates.find(x=>x.id===selected);if(c)contacts(c);
};
$('login-form').hidden=true;
$('language').onclick=()=>{lang=lang==='en'?'zh':'en';try{localStorage.setItem('recruitment-language-'+role,lang);}catch{}translate();};
$('refresh').onclick=load;$('search').oninput=render;$('recruiter').onchange=render;$('status-filter').onchange=render;
function acceptLink(){
 const fragment=location.hash.slice(1);
 if(/^[A-Za-z0-9_-]{43}$/.test(fragment)){activeKey=fragment;try{localStorage.setItem(storageKey,activeKey);}catch{}history.replaceState(null,'',location.pathname+location.search);}
 else{try{activeKey=localStorage.getItem(storageKey);}catch{}}
}
acceptLink();translate();load();
window.addEventListener('hashchange',()=>{acceptLink();load();});
