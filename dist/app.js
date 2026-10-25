(() => {
  'use strict';
  const paths = {
    sprout:'<path d="M12 21V10m-4 11h8M12 14C5 14 3 10 4 6c5 0 8 3 8 8Zm0-4c0-6 4-9 9-8 0 5-3 8-9 8Z"/>',
    overview:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="11" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="18" width="7" height="3" rx="1"/>',
    people:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/><circle cx="9" cy="7" r="4"/>',
    funding:'<path d="m3 9 9-6 9 6M3 10h18M5 10v8m5-8v8m4-8v8m5-8v8M2 21h20M3 18h18"/>',
    projects:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M12 11v6m-3-3h6"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-13 4h1m3 0h1m3 0h1m-9 3h1m3 0h1"/>',
    arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
    chevron:'<path d="m9 5 7 7-7 7"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    leaf:'<path d="M20 3c-8-1-15 3-15 9a6 6 0 0 0 6 6c6 0 9-7 9-15ZM3 21 15 9"/>',
    repeat:'<path d="m17 2 4 4-4 4M3 11V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4m14-1v3a2 2 0 0 1-2 2H3"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    bookmark:'<path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4Z"/>',
    external:'<path d="M14 3h7v7m0-7L10 14M11 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M3 15v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5"/>',
    pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    water:'<path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z"/>',
    copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>'
  };
  const icon = (name) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name] || paths.leaf)+'</svg>';
  const esc = (str) => String(str ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const initials = name => name.split(' ').map(x=>x[0]).slice(0,2).join('');
  const fixture = {
    people: [
      {id:'mila',name:'Mila Chen',role:'Garden steward',skills:['Permaculture','Teaching'],availability:'Weekends',hours:6,visits:3},
      {id:'jordan',name:'Jordan Davis',role:'Community volunteer',skills:['Composting','Outreach'],availability:'Weekends',hours:4,visits:2},
      {id:'sam',name:'Sam Rivera',role:'Workshop facilitator',skills:['Teaching','Water systems'],availability:'Weekdays',hours:5,visits:3},
      {id:'alex',name:'Alex Morgan',role:'Community volunteer',skills:['Outreach','Event support'],availability:'Weekends',hours:3,visits:1},
      {id:'priya',name:'Priya Shah',role:'Garden steward',skills:['Permaculture','Native plants'],availability:'Weekends',hours:5,visits:2},
      {id:'leo',name:'Leo Thompson',role:'New volunteer',skills:['Photography','Outreach'],availability:'Weekdays',hours:0,visits:0},
      {id:'nia',name:'Nia Williams',role:'Community volunteer',skills:['Native plants','Event support'],availability:'Weekends',hours:3,visits:1},
      {id:'eli',name:'Eli Brooks',role:'Garden steward',skills:['Water systems','Composting'],availability:'Weekends',hours:4,visits:2},
      {id:'sofia',name:'Sofia Patel',role:'Community volunteer',skills:['Teaching','Event support'],availability:'Weekdays',hours:2,visits:1},
      {id:'noah',name:'Noah Kim',role:'Community volunteer',skills:['Permaculture','Composting'],availability:'Weekends',hours:4,visits:1},
      {id:'amara',name:'Amara Wilson',role:'Community volunteer',skills:['Photography','Native plants'],availability:'Weekdays',hours:2,visits:1},
      {id:'owen',name:'Owen Garcia',role:'Community volunteer',skills:['Outreach','Water systems'],availability:'Weekends',hours:2,visits:1}
    ],
    projects: [
      {id:'regeneration',name:'Neighborhood regeneration',description:'A hands-on skills series to help neighbors restore soil, grow food, and care for shared green spaces.',status:'Proposed',opportunity:'ava',skills:['Permaculture','Teaching'],team:['mila','sam','priya'],location:'East Bay · site to confirm'},
      {id:'garden',name:'Saturday garden care',description:'A recurring morning of planting, composting, and shared garden care. A welcoming first step for new volunteers.',status:'Active',opportunity:'',skills:['Composting','Native plants'],team:['jordan','nia','eli','noah'],location:'Community garden · demo location'},
      {id:'water',name:'Water-wise garden workshop',description:'Bring neighbors together to learn practical ways to conserve water and support resilient gardens.',status:'Planning',opportunity:'',skills:['Water systems','Teaching'],team:['sam','owen'],location:'East Bay · site to confirm'}
    ],
    events: [
      {id:'e1',title:'Community garden morning',date:'2026-10-31',time:'09:00',duration:3,location:'Community garden · demo location',project:'garden',attendees:['mila','jordan','priya','nia','eli','noah']},
      {id:'e2',title:'Regeneration planning circle',date:'2026-11-04',time:'17:30',duration:1.5,location:'Online · link to arrange',project:'regeneration',attendees:['mila','sam','priya']},
      {id:'e3',title:'Water-wise workshop',date:'2026-11-14',time:'10:00',duration:2,location:'East Bay · venue to confirm',project:'water',attendees:['sam','owen','sofia']}
    ],
    steps:[],saved:[],activity:[],attendance:[]
  };
  const STORAGE='roots-demo-v1';
  let state=structuredClone(fixture);
  let storageAvailable=true;
  try { const saved=JSON.parse(localStorage.getItem(STORAGE)); if(saved && ['people','projects','events','steps','saved','activity','attendance'].every(k=>Array.isArray(saved[k]))) state=saved; } catch { storageAvailable=false; }
  const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(state));storageAvailable=true;}catch{storageAvailable=false;} updateStorageStatus();};
  function updateStorageStatus(){document.getElementById('storage-status').textContent=storageAvailable?'Changes saved in this browser':'Browser storage unavailable · changes last for this visit only';}
  const opportunity = id => ROOTS_DATA.opportunities.find(o=>o.id===id);
  const person = id => state.people.find(p=>p.id===id);
  const totalHours=()=>state.people.reduce((sum,p)=>sum+Number(p.hours),0);
  let view='overview', fundingFilter='All opportunities', fundingQuery='', peopleFilter='Everyone', peopleQuery='', formMode='', formOpportunity='';
  const main=document.getElementById('main');
  const dialog=document.getElementById('detail-dialog');
  const content=document.getElementById('detail-content');
  let toastTimer;
  function toast(message){const node=document.getElementById('toast');node.textContent=message+(storageAvailable?'':' Changes last for this visit only.');node.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('visible'),3400);}
  function activity(text){state.activity.unshift({text,at:new Date().toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})});state.activity=state.activity.slice(0,20);}
  const badge=(label,tone='neutral')=>'<span class="tag '+esc(tone)+'">'+esc(label)+'</span>';
  const button=(label,action,cls='',id='',symbol='')=>'<button class="button '+cls+'" data-action="'+action+'"'+(id?' data-id="'+esc(id)+'"':'')+'>'+ (symbol?icon(symbol):'')+label+'</button>';
  const textButton=(label,action,id='',symbol='arrow')=>'<button class="text-button" data-action="'+action+'"'+(id?' data-id="'+esc(id)+'"':'')+'>'+label+(symbol?icon(symbol):'')+'</button>';
  const avatars=ids=>'<div class="avatar-group">'+ids.slice(0,4).map(id=>'<span class="mini-avatar" title="'+esc(person(id)?.name)+'">'+esc(initials(person(id)?.name || '?'))+'</span>').join('')+(ids.length>4?'<span class="mini-avatar">+'+(ids.length-4)+'</span>':'')+'</div>';
  function dateParts(date){const d=new Date(date+'T12:00:00');return {month:d.toLocaleDateString('en-US',{month:'short'}),day:d.getDate(),label:d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})};}
  const dateTile=date=>{const d=dateParts(date);return '<div class="date-tile"><span>'+d.month+'</span><strong>'+d.day+'</strong></div>';};
  function timeLabel(event){const [h,m]=event.time.split(':').map(Number);return (h%12 || 12)+':'+String(m).padStart(2,'0')+' '+(h>=12?'pm':'am')+' · '+event.duration+' hours';}
  function heading(title,description,actions=''){return '<div class="page-heading"><div><h1>'+title+'</h1><p>'+description+'</p></div><div class="heading-actions">'+actions+'</div></div>';}
  function metric(label,value,note,symbol){return '<div class="metric"><div><div class="metric-label">'+label+'</div><div class="metric-value">'+value+'</div><div class="metric-note">'+note+'</div></div><span class="metric-icon">'+icon(symbol)+'</span></div>';}
  function metrics(){const returned=state.people.filter(p=>p.visits>1).length;return '<div class="metrics">'+metric('Community volunteers',state.people.length,'<strong>'+returned+' returning</strong> volunteers','people')+metric('Volunteer return rate',Math.round(returned/state.people.length*100)+'%',returned+' of '+state.people.length+' have returned','repeat')+metric('Opportunities to explore',ROOTS_DATA.opportunities.length,'Funding, learning & more','sprout')+'</div><p class="section-caption">'+icon('info')+'Illustrative workspace metrics · fictional volunteers and activity</p>';}
  function overview(){
    const tasks=[
      ['applicant','Confirm the receiving organization','Check applicant status and fiscal sponsorship.'],
      ['supervisor','Find a project supervisor','Name the person who can support a recurring team.'],
      ['terms','Check program requirements','Verify current eligibility and application steps.']
    ];
    const next=state.events.filter(e=>e.date>='2026-10-24').sort((a,b)=>a.date.localeCompare(b.date))[0];
    return heading('Good people. New possibilities.','Connect the support you find with the community you already have.','<span class="date-label">'+icon('calendar')+'Saturday, October 24</span>'+button('New project','new-project','primary','','plus'))+
    metrics()+
    '<div class="dashboard-grid"><section class="panel spotlight" aria-labelledby="feature-title"><div class="spotlight-top">'+badge('Funding opportunity','white')+badge('Check eligibility','amber')+'</div><h2 id="feature-title">Ava Community Energy</h2><div class="spotlight-amount">Up to $2,500 <span>in potential sponsorship</span></div><p>A little support can grow into something meaningful. Explore funding for a neighborhood regeneration skills series.</p><div class="spotlight-bottom">'+button('Explore opportunity','opportunity','primary','ava','arrow')+'<span class="spotlight-note">'+icon('calendar')+'Published window · Sep–Nov</span></div></section>'+
    '<section class="panel nextsteps"><div class="panel-header"><div><h2>Make the next move</h2><p>A few foundations before pursuing funding.</p></div></div><div class="steps">'+tasks.map(([id,title,description])=>'<label class="step '+(state.steps.includes(id)?'done':'')+'"><input type="checkbox" data-step="'+id+'" '+(state.steps.includes(id)?'checked':'')+'><span><strong>'+title+'</strong><small>'+description+'</small></span></label>').join('')+'</div><div class="step-progress"><div class="track"><span style="width:'+state.steps.length/3*100+'%"></span></div>'+state.steps.length+' of 3 complete</div></section></div>'+
    '<div class="dashboard-grid lower-grid"><section class="panel"><div class="panel-header"><div><h2>Good things in the works</h2><p>Projects taking root in your community.</p></div>'+textButton('All projects','navigate','projects')+'</div><div class="project-list">'+state.projects.slice(0,3).map((p,i)=>'<div class="project-row"><span class="project-mark">'+icon(i===2?'water':'sprout')+'</span><div><h3>'+esc(p.name)+'</h3><p>'+p.team.length+' potential team members · '+esc(p.opportunity?opportunity(p.opportunity)?.organization:'Community-led')+'</p></div><div class="row-end">'+badge(p.status,p.status==='Active'?'blue':'neutral')+'<button class="icon-button" data-action="project" data-id="'+p.id+'" aria-label="Open '+esc(p.name)+'">'+icon('chevron')+'</button></div></div>').join('')+'</div></section>'+
    '<section class="panel"><div class="panel-header"><div><h2>Next time, together</h2><p>Your next community gathering.</p></div></div>'+(next?'<div class="event-preview"><div class="event-top">'+dateTile(next.date)+'<div><h3>'+esc(next.title)+'</h3><p>'+esc(timeLabel(next))+'</p></div></div><div class="event-people">'+avatars(next.attendees)+'<span>'+next.attendees.length+' people on the demo roster</span></div>'+button('View gathering','event','',''+next.id,'calendar')+'</div>':'<div class="event-preview"><p class="muted">Plan a gathering to bring your community together.</p></div>')+'</section></div>'+
    '<section class="benefit-banner"><span class="benefit-icon">'+icon('heart')+'</span><div><h3>Give people a reason to return.</h3><p>Learning, funded placements, and tangible benefits—with the conditions visible.</p></div>'+textButton('Explore participant benefits','benefits')+'</section>';
  }
  const fundingCategories=['All opportunities','Funding','Employer match','Participant benefits','Saved'];
  function funding(){
    return heading('Support for what comes next.','Find the opportunity. Understand the conditions. Take the next step.',button('Export opportunities','export-funding','','','download'))+
    '<div class="funding-summary"><div class="funding-number"><span>Potential project support</span><strong>$2,500</strong><small>Illustrative Ava proposal ceiling</small></div><div class="funding-number"><span>Approved funding</span><strong>$0</strong><small>No awards recorded</small></div><div class="funding-number"><span>Payments received</span><strong>$0</strong><small>No payments recorded</small></div></div>'+
    '<div class="toolbar"><div class="filter-group" role="group" aria-label="Filter opportunities">'+fundingCategories.map(t=>'<button class="filter-button" data-funding-filter="'+t+'" aria-pressed="'+(fundingFilter===t)+'">'+t+'</button>').join('')+'</div><label class="search-wrap">'+icon('search')+'<input type="search" id="funding-search" aria-label="Search opportunities" placeholder="Search opportunities" value="'+esc(fundingQuery)+'"></label></div><div class="opportunity-grid" id="opportunity-grid">'+fundingCards()+'</div><p class="source-note">Official program information checked October 24, 2026. Guild eligibility and partnerships are unconfirmed. External program benefits are earned through the provider’s own process; general Guild hours do not automatically qualify.</p>';
  }
  function fundingCards(){
    const filtered=ROOTS_DATA.opportunities.filter(o=>(fundingFilter==='All opportunities'||(fundingFilter==='Saved'?state.saved.includes(o.id):o.category===(fundingFilter==='Participant benefits'?'Participant benefit':fundingFilter))) && (o.title+' '+o.organization+' '+o.tags.join(' ')).toLowerCase().includes(fundingQuery.toLowerCase()));
    if(!filtered.length)return '<div class="empty-state"><h3>'+(fundingFilter==='Saved'?'Your shortlist starts here.':'No matching opportunities.')+'</h3><p>'+(fundingFilter==='Saved'?'Save an opportunity with the bookmark button to keep it close.':'Try another search or show all opportunities.')+'</p>'+button('Show all opportunities','clear-funding')+'</div>';
    return filtered.map(o=>'<article class="opportunity-card"><div class="op-top">'+badge(o.category)+'<button class="icon-button bookmark '+(state.saved.includes(o.id)?'saved':'')+'" data-action="save-opportunity" data-id="'+o.id+'" aria-label="'+(state.saved.includes(o.id)?'Unsave':'Save')+' '+esc(o.organization)+'" aria-pressed="'+state.saved.includes(o.id)+'">'+icon('bookmark')+'</button></div><h2>'+esc(o.title)+'</h2><p class="provider">'+esc(o.organization)+'</p><div class="op-amount">'+esc(o.amount)+'</div><div class="op-unit">'+esc(o.unit)+'</div><p class="op-summary">'+esc(o.summary)+'</p>'+badge(o.status,o.statusTone)+'<div class="op-bottom">'+textButton('View opportunity','opportunity',o.id)+'<span class="muted">'+(o.category==='Participant benefit'?'For participants':'For organizations')+'</span></div></article>').join('');
  }
  function people(){
    return heading('A community of possibility.','Know your people, recognize their skills, and help them find their next role.',button('Export people','export-people','','','download'))+
    '<div class="metrics">'+metric('Community volunteers',state.people.length,'All records are fictional','people')+metric('Approved demo hours',totalHours().toLocaleString(),'Internal records · not provider eligibility','clock')+metric('Skills in the community',new Set(state.people.flatMap(p=>p.skills)).size,'A little of everyone’s know-how','leaf')+'</div>'+
    '<div class="toolbar"><div class="filter-group" role="group" aria-label="Filter people">'+['Everyone','Returning','New volunteers','Weekends'].map(t=>'<button class="filter-button" data-people-filter="'+t+'" aria-pressed="'+(peopleFilter===t)+'">'+t+'</button>').join('')+'</div><label class="search-wrap">'+icon('search')+'<input type="search" id="people-search" aria-label="Search people or skills" placeholder="Search people or skills" value="'+esc(peopleQuery)+'"></label></div><div id="people-results">'+peopleRows()+'</div><p class="source-note">People, skills, availability, and hours are fictional demo records. “Returning” means two or more recorded visits.</p>';
  }
  function peopleRows(){
    const filtered=state.people.filter(p=>(peopleFilter==='Everyone'||peopleFilter==='Returning'&&p.visits>1||peopleFilter==='New volunteers'&&p.visits<2||peopleFilter==='Weekends'&&p.availability==='Weekends')&&(p.name+' '+p.skills.join(' ')).toLowerCase().includes(peopleQuery.toLowerCase()));
    if(!filtered.length)return '<div class="empty-state"><h3>No matching people.</h3><p>Try another name or skill, or choose Everyone.</p></div>';
    return '<div class="table-container"><table><thead><tr><th scope="col">Volunteer</th><th scope="col">Skills & interests</th><th scope="col">Availability</th><th scope="col">Approved demo hours</th><th scope="col">Participation</th><th scope="col"><span class="muted">Profile</span></th></tr></thead><tbody>'+filtered.map(p=>'<tr><td><div class="person-cell"><span class="person-avatar">'+initials(p.name)+'</span><span><strong>'+esc(p.name)+'</strong><small>'+esc(p.role)+'</small></span></div></td><td>'+p.skills.map(s=>'<span class="skill-tag">'+esc(s)+'</span>').join('')+'</td><td class="muted">'+esc(p.availability)+'</td><td class="number">'+p.hours+' hrs</td><td>'+badge(p.visits>1?'Returning':'New volunteer',p.visits>1?'blue':'neutral')+'</td><td><button class="icon-button" data-action="person" data-id="'+p.id+'" aria-label="View '+esc(p.name)+'">'+icon('chevron')+'</button></td></tr>').join('')+'</tbody></table></div>';
  }
  function projectForm(){return '<form class="inline-form" id="project-form"><h2>Give a good idea a place to grow.</h2><div class="form-grid"><label class="field">Project name<input name="name" required maxlength="90" placeholder="e.g. Neighborhood seed swap"></label><label class="field">Linked opportunity<select name="opportunity"><option value="">Community-led · no opportunity yet</option>'+ROOTS_DATA.opportunities.filter(o=>o.category!=='Participant benefit').map(o=>'<option value="'+o.id+'" '+(o.id===formOpportunity?'selected':'')+'>'+esc(o.organization)+' — '+esc(o.title)+'</option>').join('')+'</select></label><label class="field full">What will your community do?<textarea name="description" required maxlength="500" placeholder="Describe the purpose and what a volunteer can help with."></textarea></label><label class="field">Location<input name="location" required maxlength="120" placeholder="Location or site to confirm"></label><label class="field">Main skill needed<select name="skill">'+['Permaculture','Teaching','Composting','Outreach','Water systems','Native plants','Event support','Photography'].map(s=>'<option>'+s+'</option>').join('')+'</select></label></div><div class="form-actions">'+button('Cancel','cancel-form')+'<button type="submit" class="button primary">'+icon('plus')+'Create demo project</button></div></form>';}
  function projects(){
    return heading('Good things in the works.','Turn a promising opportunity into a project with a purpose and a team.',button('New project','new-project','primary','','plus'))+
    (formMode==='project'?projectForm():'')+
    '<div class="project-grid">'+state.projects.map((p,i)=>'<article class="project-card"><div class="project-card-top"><span class="project-mark">'+icon(i===2?'water':'sprout')+'</span>'+badge(p.status,p.status==='Active'?'blue':'neutral')+'</div><h2>'+esc(p.name)+'</h2><p>'+esc(p.description)+'</p><div class="project-meta">'+icon('pin')+esc(p.location)+'</div><div class="project-meta">'+icon('funding')+esc(p.opportunity?opportunity(p.opportunity)?.organization:'Community-led project')+'</div><div class="op-bottom">'+avatars(p.team)+textButton(p.team.length+' potential members','project',p.id)+'</div></article>').join('')+'</div><p class="source-note">Projects and teams are illustrative. A team match is a suggestion based on demo skills, not an invitation or commitment. Funding remains potential until separately approved.</p>';
  }
  function eventForm(){return '<form class="inline-form" id="event-form"><h2>Make time to grow together.</h2><div class="form-grid"><label class="field full">Gathering name<input name="title" required maxlength="90" placeholder="e.g. Community planting morning"></label><label class="field">Date<input type="date" name="date" required min="2026-10-24" value="2026-10-31"></label><label class="field">Start time<input type="time" name="time" required value="09:00"></label><label class="field">Duration in hours<input name="duration" type="number" min=".5" max="12" step=".5" required value="2"></label><label class="field">Project<select name="project">'+state.projects.map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join('')+'</select></label><label class="field full">Location<input name="location" required maxlength="120" placeholder="A meeting place or location to confirm"></label></div><div class="form-actions">'+button('Cancel','cancel-form')+'<button type="submit" class="button primary">'+icon('plus')+'Create demo gathering</button></div></form>';}
  function events(){
    return heading('Make space for coming together.','Plan a gathering, prepare an invitation, and recognize the hours people give.',button('New gathering','new-event','primary','','plus'))+
    (formMode==='event'?eventForm():'')+
    '<div class="event-list">'+[...state.events].sort((a,b)=>a.date.localeCompare(b.date)).map(e=>'<article class="event-card">'+dateTile(e.date)+'<div class="event-info"><h2>'+esc(e.title)+'</h2><p>'+esc(dateParts(e.date).label)+' · '+esc(timeLabel(e))+'</p><p>'+esc(e.location)+'</p><div class="event-tags">'+badge('Demo gathering')+'<span class="muted" style="font-size:10px">'+e.attendees.length+' people on the roster</span></div></div><div class="event-actions">'+button('View gathering','event','',e.id)+button('Record hours','attendance','primary',e.id,'check')+'</div></article>').join('')+'</div><p class="source-note">Gatherings are fictional and not connected to a calendar. Invitations are previews only. Approved demo hours are internal records and do not establish eligibility for external benefits.</p>';
  }
  function render(){
    updateStorageStatus();
    document.getElementById('navigation').innerHTML=[['overview','Overview','overview'],['people','People','people'],['funding','Opportunities','funding'],['projects','Projects','projects'],['events','Gatherings','calendar']].map(([id,label,symbol])=>'<a href="#'+id+'" class="'+(view===id?'active':'')+'"'+(view===id?' aria-current="page"':'')+'>'+icon(symbol)+label+'</a>').join('');
    main.innerHTML=({overview,people,funding,projects,events}[view]||overview)();
    document.title='Roots — '+({overview:'Overview',people:'People',funding:'Opportunities',projects:'Projects',events:'Gatherings'}[view]);
    document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
  }
  function navigate(target){formMode='';if(view===target){render();window.scrollTo({top:0,behavior:'instant'});}else location.hash=target;}
  window.addEventListener('hashchange',()=>{if(location.hash==='#main'){main.focus();return;}view=['overview','people','funding','projects','events'].includes(location.hash.slice(1))?location.hash.slice(1):'overview';render();window.scrollTo({top:0,behavior:'instant'});});
  function openDrawer(label,html){content.innerHTML='<div class="drawer-top"><span>'+esc(label)+'</span><button class="icon-button" data-action="close" aria-label="Close details" autofocus>'+icon('close')+'</button></div><div class="drawer-content">'+html+'</div>';if(!dialog.open)dialog.showModal();dialog.scrollTop=0;}
  function opportunityDetail(id){
    const o=opportunity(id); if(!o)return;
    const relationship=o.category==='Participant benefit'?(o.id==='college'?'Campus partnership required':'External referral'):'Eligibility unconfirmed';
    openDrawer('Opportunity details',badge(relationship,o.statusTone)+'<h2 id="detail-title">'+esc(o.title)+'</h2><p>'+esc(o.organization)+'</p><div class="detail-amount">'+esc(o.amount)+'</div><div class="detail-unit">'+esc(o.unit)+'</div><p>'+esc(o.summary)+'</p><dl class="detail-facts"><dt>Who benefits</dt><dd>'+esc(o.recipient)+'</dd><dt>Timing</dt><dd>'+esc(o.timing)+'</dd></dl><div class="drawer-section"><h3>What needs to be true</h3><ul class="requirements">'+o.requirements.map(r=>'<li>'+esc(r)+'</li>').join('')+'</ul></div><div class="notice">'+esc(o.caution)+'</div>'+(id==='microsoft'?'<div class="drawer-section"><h3>Explore the potential match</h3><label class="field">Illustrative eligible hours<input id="match-hours" type="number" min="0" max="600" step="1" value="20"></label><div class="detail-amount" id="match-total">$500</div><p class="source-date">20 hours × $25. A potential donation to an eligible organization, subject to program approval and limits.</p></div>':'')+'<div class="drawer-actions">'+(o.category!=='Participant benefit'?button('Plan a project','plan-project','primary',o.id,'plus'):'')+button(state.saved.includes(id)?'Saved to shortlist':'Save opportunity','save-detail','',id,'bookmark')+'</div><div class="drawer-section"><a class="source-link" href="'+esc(o.url)+'" target="_blank" rel="noopener noreferrer">'+esc(o.sourceLabel)+icon('external')+'</a>'+(id==='college'?'<a class="source-link" style="margin-top:10px" href="https://publicservice.berkeley.edu/programs/collegecorps/" target="_blank" rel="noopener noreferrer">Berkeley intake status'+icon('external')+'</a>':'')+'<p class="source-date">Official source checked '+esc(o.checked)+'. Confirm current provider terms.</p></div>');
  }
  function projectDetail(id){
    const p=state.projects.find(p=>p.id===id);if(!p)return;
    const candidates=state.people.filter(v=>v.skills.some(s=>p.skills.includes(s))).sort((a,b)=>b.skills.filter(s=>p.skills.includes(s)).length-a.skills.filter(s=>p.skills.includes(s)).length);
    openDrawer('Project workspace',badge(p.status,p.status==='Active'?'blue':'neutral')+'<h2 id="detail-title">'+esc(p.name)+'</h2><p>'+esc(p.description)+'</p><dl class="detail-facts"><dt>Location</dt><dd>'+esc(p.location)+'</dd><dt>Needed skills</dt><dd>'+p.skills.map(esc).join(', ')+'</dd><dt>Support</dt><dd>'+(p.opportunity?textButton(esc(opportunity(p.opportunity)?.organization),'opportunity',p.opportunity):'Community-led · no funding linked')+'</dd></dl><div class="drawer-section"><h3>A potential team</h3><p class="attendance-note">Suggested by matching skills. Check availability and interest before inviting anyone.</p><form id="team-form" data-id="'+p.id+'"><div class="team-options">'+candidates.map(v=>'<label class="team-option"><input type="checkbox" name="team" value="'+v.id+'" '+(p.team.includes(v.id)?'checked':'')+'><span class="person-avatar">'+initials(v.name)+'</span><span>'+esc(v.name)+'<small>'+v.skills.filter(s=>p.skills.includes(s)).map(esc).join(', ')+' · '+esc(v.availability)+'</small></span></label>').join('')+'</div><div class="form-actions"><button class="button primary" type="submit">'+icon('check')+'Save potential team</button></div></form></div><div class="notice green">This is a fictional project. Saving a team does not send invitations or secure funding.</div>');
  }
  function personDetail(id){
    const p=person(id);if(!p)return;
    const matches=state.projects.filter(pr=>pr.skills.some(s=>p.skills.includes(s)));
    openDrawer('Volunteer profile',badge('Fictional volunteer')+'<h2 id="detail-title">'+esc(p.name)+'</h2><p>'+esc(p.role)+'</p><dl class="detail-facts"><dt>Skills</dt><dd>'+p.skills.map(esc).join(', ')+'</dd><dt>Availability</dt><dd>'+esc(p.availability)+'</dd><dt>Demo hours</dt><dd>'+p.hours+' approved hours</dd><dt>Visits</dt><dd>'+p.visits+' recorded visits</dd></dl><div class="drawer-section"><h3>Where their skills could help</h3>'+matches.map(pr=>'<div class="project-row"><div><h3>'+esc(pr.name)+'</h3><p>Matches: '+pr.skills.filter(s=>p.skills.includes(s)).map(esc).join(', ')+'</p></div><div class="row-end">'+textButton('View','project',pr.id)+'</div></div>').join('')+'</div><div class="notice green">Skills and availability are demo data. A match is a starting point for a conversation.</div>');
  }
  function invitationText(e){return 'Hi everyone,\n\nLet’s grow something good together. Join us for '+e.title.toLowerCase()+'.\n\nWhen: '+dateParts(e.date).label+', '+e.date.slice(0,4)+' · '+timeLabel(e)+'\nWhere: '+e.location+'\n\nWe’ll make space for learning, lending a hand, and meeting your neighbors. Please reply to the organizer to confirm your availability and any access needs.\n\nSee you there,\nEast Bay Permaculture Guild\n\n[Demo invitation — details need confirmation before use.]';}
  function eventDetail(id){
    const e=state.events.find(e=>e.id===id);if(!e)return;
    openDrawer('Gathering details',badge('Demo gathering')+'<h2 id="detail-title">'+esc(e.title)+'</h2><dl class="detail-facts"><dt>When</dt><dd>'+esc(dateParts(e.date).label)+', '+esc(e.date.slice(0,4))+'<br>'+esc(timeLabel(e))+'</dd><dt>Where</dt><dd>'+esc(e.location)+'</dd><dt>People</dt><dd>'+e.attendees.length+' on the fictional roster</dd></dl><div class="drawer-section"><h3>Invitation preview</h3><p class="attendance-note">A draft you can review and copy. Nothing is sent from Roots.</p><div class="invitation">'+esc(invitationText(e))+'</div><div class="drawer-actions">'+button('Copy invitation','copy-invitation','',id,'copy')+button('Record demo hours','attendance','primary',id,'check')+'</div></div>');
  }
  function attendance(id){
    const e=state.events.find(e=>e.id===id);if(!e)return;
    const previous=state.attendance.find(a=>a.eventId===id);
    openDrawer('Attendance & hours',badge('Demo records only','amber')+'<h2 id="detail-title">'+esc(e.title)+'</h2><p>Select attendees and approve their demonstration hours. This does not submit hours to any external program.</p><div class="notice">'+(previous?'This gathering already has approved demo hours. Edit the record below; saving replaces the previous entry without adding it twice.':'This is a future fictional gathering. Recording hours simulates the approval workflow.')+'</div><form id="attendance-form" data-id="'+id+'"><div class="team-options">'+state.people.map(p=>{const row=previous?.entries.find(x=>x.personId===p.id);return '<label class="team-option"><input type="checkbox" name="attendee" value="'+p.id+'" '+((previous?!!row:e.attendees.includes(p.id))?'checked':'')+'><span class="person-avatar">'+initials(p.name)+'</span><span>'+esc(p.name)+'<small>'+esc(p.role)+'</small></span><input aria-label="Hours for '+esc(p.name)+'" class="hours-input" type="number" name="hours-'+p.id+'" min=".5" max="12" step=".5" required value="'+(row?.hours||e.duration)+'"></label>';}).join('')+'</div><p class="attendance-note">Hours are stored locally. Provider eligibility and employer claims require separate verification.</p><div class="form-actions"><button class="button primary" type="submit">'+icon('check')+'Approve demo hours</button></div></form>');
  }
  function about(){openDrawer('About Roots',badge('Interactive concept')+'<h2 id="detail-title">Good things grow together.</h2><p>Roots helps the East Bay Permaculture Guild connect community projects, people, and possibilities.</p><ul class="about-list"><li>People, projects, gatherings, and metrics are fictional examples.</li><li>Opportunity information comes from linked official sources. No Guild partnerships or program eligibility have been confirmed.</li><li>Project drafts, shortlists, teams, and hours are stored in this browser only. '+(storageAvailable?'':'Storage is unavailable for this visit. ')+'There is no shared database or account system.</li><li>No applications, messages, calendar invitations, or payments are submitted.</li><li>This standalone dashboard follows the shared Roots concept. Garden Steward / Vue / Strapi integration remains future work.</li></ul><div class="drawer-section"><h3>Recent demo activity</h3>'+(state.activity.length?'<ul class="activity-list">'+state.activity.slice(0,5).map(a=>'<li>'+esc(a.text)+'<small>'+esc(a.at)+'</small></li>').join('')+'</ul>':'<p class="attendance-note">Try saving an opportunity or planning a project. Your local activity will appear here.</p>')+'</div><div class="drawer-section"><a class="source-link" href="https://chatgpt.com/share/6add45f5-cd30-83ea-8d00-2b39b51c5a83" target="_blank" rel="noopener noreferrer">View the original Roots concept'+icon('external')+'</a></div>');}
  function exportCSV(name,rows){
    const csv=rows.map(row=>row.map(value=>{let str=String(value??'');if(/^[=+\-@]/.test(str))str="'"+str;return '"'+str.replace(/"/g,'""')+'"';}).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('CSV exported.');
  }
  document.addEventListener('click',async event=>{
    const filter=event.target.closest('[data-funding-filter]');if(filter){fundingFilter=filter.dataset.fundingFilter;render();document.querySelector('[data-funding-filter="'+fundingFilter+'"]').focus();return;}
    const pf=event.target.closest('[data-people-filter]');if(pf){peopleFilter=pf.dataset.peopleFilter;render();document.querySelector('[data-people-filter="'+peopleFilter+'"]').focus();return;}
    const target=event.target.closest('[data-action]');if(!target)return;
    const {action,id}=target.dataset;
    if(action==='navigate'){navigate(id);}
    else if(action==='benefits'){fundingFilter='Participant benefits';fundingQuery='';navigate('funding');}
    else if(action==='opportunity')opportunityDetail(id);
    else if(action==='project')projectDetail(id);
    else if(action==='person')personDetail(id);
    else if(action==='event')eventDetail(id);
    else if(action==='attendance')attendance(id);
    else if(action==='close')dialog.close();
    else if(action==='about')about();
    else if(action==='clear-funding'){fundingFilter='All opportunities';fundingQuery='';render();}
    else if(action==='save-opportunity'||action==='save-detail'){
      const wasSaved=state.saved.includes(id);state.saved=wasSaved?state.saved.filter(x=>x!==id):[...state.saved,id];activity((wasSaved?'Removed from':'Saved to')+' shortlist: '+opportunity(id).organization);save();if(view==='funding')render();if(action==='save-detail')opportunityDetail(id);toast(wasSaved?'Removed from your shortlist.':'Saved to your opportunity shortlist.');
    }else if(action==='new-project'||action==='plan-project'){
      if(dialog.open)dialog.close();view='projects';formMode='project';formOpportunity=action==='plan-project'?id:'';history.replaceState(null,'','#projects');render();document.querySelector('#project-form input').focus();window.scrollTo({top:0,behavior:'instant'});
    }else if(action==='new-event'){
      view='events';formMode='event';history.replaceState(null,'','#events');render();document.querySelector('#event-form input').focus();
    }else if(action==='cancel-form'){formMode='';render();}
    else if(action==='copy-invitation'){
      const e=state.events.find(e=>e.id===id);try{await navigator.clipboard.writeText(invitationText(e));toast('Invitation copied. Nothing has been sent.');}catch{toast('Clipboard unavailable. Select and copy the invitation text.');}
    }else if(action==='export-people'){exportCSV('roots-demo-people.csv',[['Fictional demo volunteer','Role','Skills','Availability','Approved demo hours','Visits'],...state.people.map(p=>[p.name,p.role,p.skills.join('; '),p.availability,p.hours,p.visits])]);}
    else if(action==='export-funding'){exportCSV('roots-opportunities.csv',[['Provider','Opportunity','Category','Benefit','Recipient','Status','Conditions','Official source','Checked'],...ROOTS_DATA.opportunities.map(o=>[o.organization,o.title,o.category,o.amount,o.recipient,o.status,o.requirements.join('; ')+' '+o.caution,o.url,o.checked])]);}
  });
  document.addEventListener('input',e=>{
    if(e.target.id==='funding-search'){fundingQuery=e.target.value;document.getElementById('opportunity-grid').innerHTML=fundingCards();}
    if(e.target.id==='people-search'){peopleQuery=e.target.value;document.getElementById('people-results').innerHTML=peopleRows();}
    if(e.target.id==='match-hours'){const hours=Math.min(600,Math.max(0,Number(e.target.value)||0));document.getElementById('match-total').textContent=(hours*25).toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});document.querySelector('#match-total + .source-date').textContent=hours+' hours × $25. Illustrative only, subject to remaining annual limits and program approval.';}
  });
  document.addEventListener('change',e=>{
    if(e.target.dataset.step){const id=e.target.dataset.step;state.steps=e.target.checked?[...new Set([...state.steps,id])]:state.steps.filter(x=>x!==id);save();const focusedId=id;render();document.querySelector('[data-step="'+focusedId+'"]')?.focus();}
  });
  document.addEventListener('submit',e=>{
    const form=e.target; if(!['project-form','event-form','team-form','attendance-form'].includes(form.id))return;e.preventDefault();
    const data=new FormData(form);
    if(form.id==='project-form'){
      const name=data.get('name').trim(),description=data.get('description').trim(),location=data.get('location').trim();
      if(!name||!description||!location){toast('Add a project name, purpose, and location.');return;}
      const project={id:'p-'+Date.now(),name,description,location,opportunity:data.get('opportunity'),skills:[data.get('skill')],status:'Proposed',team:[]};state.projects.unshift(project);activity('Created demo project: '+name);save();formMode='';render();toast('Project created. Match a potential team next.');projectDetail(project.id);
    }else if(form.id==='event-form'){
      const title=data.get('title').trim(),location=data.get('location').trim();if(!title||!location){toast('Add a gathering name and location.');return;}
      const project=state.projects.find(p=>p.id===data.get('project'));const gathering={id:'e-'+Date.now(),title,location,date:data.get('date'),time:data.get('time'),duration:Number(data.get('duration')),project:project.id,attendees:[...project.team]};state.events.push(gathering);activity('Created demo gathering: '+title);save();formMode='';render();toast('Gathering created in this demo workspace.');
    }else if(form.id==='team-form'){
      const p=state.projects.find(p=>p.id===form.dataset.id);p.team=data.getAll('team');activity('Updated potential team: '+p.name);save();render();toast('Potential team saved. No invitations sent.');projectDetail(p.id);
    }else if(form.id==='attendance-form'){
      const ids=data.getAll('attendee');if(!ids.length){toast('Select at least one attendee before approving hours.');return;}
      const eventId=form.dataset.id;const previous=state.attendance.find(a=>a.eventId===eventId);
      if(previous)previous.entries.forEach(row=>{const p=person(row.personId);p.hours-=row.hours;p.visits-=1;});
      const entries=ids.map(id=>({personId:id,hours:Number(data.get('hours-'+id))}));
      entries.forEach(row=>{const p=person(row.personId);p.hours+=row.hours;p.visits+=1;});
      state.attendance=state.attendance.filter(a=>a.eventId!==eventId);state.attendance.push({eventId,entries});state.events.find(e=>e.id===eventId).attendees=ids;activity('Approved '+entries.reduce((n,r)=>n+r.hours,0)+' demo hours for '+ids.length+' volunteers');save();dialog.close();render();toast('Demo hours approved for '+ids.length+' volunteers.');
    }
  });
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  view=['overview','people','funding','projects','events'].includes(location.hash.slice(1))?location.hash.slice(1):'overview';
  render();
})();
