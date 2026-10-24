(() => {
  'use strict';
  const TODAY = '2026-10-24';
  const campaigns = [
    {id:'c01',title:'Monthly giving',category:'Community support',goal:1200},
    {id:'c02',title:'Harvest fundraiser',category:'Seasonal appeal',goal:800},
    {id:'c03',title:'Tools for the garden',category:'Equipment fund',goal:500}
  ];
  const activities = [
    {id:'e01',title:'Garden volunteer shifts',category:'Community gardening',day:6},
    {id:'e02',title:'Compost & coffee',category:'Composting',day:2},
    {id:'e03',title:'Native planting',category:'Native plants',day:6},
    {id:'e04',title:'Harvest for our neighbors',category:'Food recovery',day:3}
  ];
  let api, month='2026-10', saved={overrides:{},gifts:[],removed:[]};
  try { const parsed=JSON.parse(localStorage.getItem('roots-calendar-v2')||'{}'); saved={...saved,...parsed}; } catch {}
  const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date=s=>new Date(`${s}T12:00:00`);
  const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const label=s=>date(s).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
  const cash=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:Number.isInteger(n)?0:2}).format(n);
  const marks={check:'m5 12 4 4L19 6',clock:'M12 8v5l3 2M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0Z',chevron:'m9 5 7 7-7 7',plus:'M12 5v14M5 12h14',leaf:'M20 3c-15-2-19 8-13 14 6 6 16 2 13-14ZM4 21 16 9',heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z'};
  const svg=(name,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${marks[name]}"/></svg>`;
  function days(){const first=date(`${month}-01`),next=new Date(first.getFullYear(),first.getMonth()+1,1,12);const result=[];for(let d=first;d<next;d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,12))result.push(iso(d));return result;}
  function allActivities(){return [...activities,...api.getEvents().filter(e=>!activities.some(a=>a.id===e.id)).map(e=>({...e,day:null}))];}
  function makeRecords(a,day,expected,attended,hours){const future=day>TODAY;const people=api.getPeople();return Array.from({length:expected},(_,i)=>({id:`${a.id}-${day}-${i}`,personId:people[i%people.length]?.id||`sample-${i}`,date:day,eventId:a.id,eventTitle:a.title,category:a.category,status:future?'Scheduled':i<attended?'Attended':'Missed',hours}));}
  function knownEventDate(event){
    if(/^\d{4}-\d{2}-\d{2}$/.test(String(event.date)))return event.date;
    const monthIndex=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'].indexOf(String(event.month).toUpperCase());
    return monthIndex<0?null:`${event.year||TODAY.slice(0,4)}-${String(monthIndex+1).padStart(2,'0')}-${String(event.day).padStart(2,'0')}`;
  }
  function records(){
    const result=[],events=new Map(api.getEvents().map(event=>[event.id,event]));
    function eventHours(event){
      if(event.hours!=null&&Number.isFinite(Number(event.hours))&&Number(event.hours)>=0)return Number(event.hours);
      const times=String(event.start&&event.end?`${event.start} – ${event.end}`:event.time||'').matchAll(/(\d{1,2}):(\d{2})\s*(AM|PM)?/gi);
      const minutes=[...times].map(match=>{let hour=Number(match[1]);if(match[3])hour=hour%12+(match[3].toUpperCase()==='PM'?12:0);return hour*60+Number(match[2]);});
      return minutes.length===2&&minutes[1]>minutes[0]?(minutes[1]-minutes[0])/60:3;
    }
    allActivities().forEach((activity,index)=>days().forEach(day=>{
      const key=`${activity.id}|${day}`,event=events.get(activity.id),isListedDate=event&&knownEventDate(event)===day;
      const descriptor=isListedDate?event:activity;
      if(Object.hasOwn(saved.overrides,key)){
        const value=saved.overrides[key];
        result.push(...makeRecords(descriptor,day,value.expected,value.attended,value.hours));
        return;
      }
      if(isListedDate){
        const count=Number(event.attendees),expected=Number.isFinite(count)?Math.max(0,Math.floor(count)):0;
        result.push(...makeRecords(event,day,expected,expected,eventHours(event)));
        return;
      }
      // Only historical recurring demo activity is synthesized; listed events use their own records.
      if(activity.day===null||day>TODAY||!['2026-09','2026-10'].includes(month)||date(day).getDay()!==activity.day)return;
      const expected=8+((date(day).getDate()+index*3)%9),missed=(date(day).getDate()+index)%4;
      result.push(...makeRecords(activity,day,expected,expected-missed,index===1?1.5:3));
    }));
    return result;
  }
  function donations(){const gifts=[];if(['2026-09','2026-10'].includes(month)){campaigns.forEach((c,i)=>days().filter((d,j)=>d<=TODAY&&(j+i*2)%(i+4)===1).forEach((d,j)=>{const gift={id:`seed-${c.id}-${d}`,date:d,campaignId:c.id,campaignTitle:c.title,amount:[25,50,75,100,150][(j+i)%5]};if(!saved.removed.includes(gift.id))gifts.push(gift);}));}return [...gifts,...saved.gifts.filter(g=>g.date.startsWith(month))];}
  function save(){try{localStorage.setItem('roots-calendar-v2',JSON.stringify(saved));}catch{api.toast('Browser storage unavailable. Changes last for this visit.');}}
  function refresh(focus){api.render();if(focus)document.querySelector(focus)?.focus({preventScroll:true});}
  function render(){const mlabel=date(`${month}-01`).toLocaleDateString('en-US',{month:'long',year:'numeric'}),months=[...new Set(['2026-09','2026-10','2026-11','2026-12',month])].sort();return `${api.head('Your community, over time.','Keep the next important date in sight. See the impact you’re making today.',`<button class="button primary" data-cal="record">${svg('plus')} Record activity</button>`)}${window.RootsTimeline.render()}<div class="timeline-report-controls"><label for="calendar-report-month">Report period</label><select id="calendar-report-month">${months.map(m=>`<option value="${m}" ${m===month?'selected':''}>${date(`${m}-01`).toLocaleDateString('en-US',{month:'long',year:'numeric'})}</option>`).join('')}</select></div>${window.RootsAnalytics.render(records(),{label:`${mlabel} · Events and giving`,donations:donations(),fundraisingGoal:campaigns.reduce((sum,c)=>sum+c.goal,0),startDate:`${month}-01`,endDate:days().at(-1)})}<p class="calendar-demo-note">Illustrative activity through October 24, 2026. Entries and changes stay in this browser. No payment service is connected.</p>`;}
  function eventForm(id,day){const a=allActivities().find(x=>x.id===id);if(!a)return;const rec=records().filter(x=>x.eventId===id&&x.date===day),future=day>TODAY;api.openDialog('Event attendance',`<h2 id="dialog-title">${h(a.title)}</h2><p class="lead">${label(day)}${future?' · Upcoming activity':''}</p><form id="calendar-attendance-form" data-id="${h(id)}" data-date="${day}"><div class="form-field"><label for="cal-expected">Expected volunteers</label><input id="cal-expected" name="expected" type="number" min="0" max="${api.getPeople().length}" value="${rec.length}" required></div>${future?'<p class="hint">These volunteers will be marked as scheduled. Attendance can be recorded for dates through October 24 in this demo.</p>':`<div class="form-field"><label for="cal-attended">Volunteers who attended</label><input id="cal-attended" name="attended" type="number" min="0" max="${api.getPeople().length}" value="${rec.filter(x=>x.status==='Attended').length}" required></div>`}<div class="form-field"><label for="cal-hours">Hours per volunteer</label><input id="cal-hours" name="hours" type="number" min="0.25" max="24" step="0.25" value="${rec[0]?.hours||3}" required></div><button class="button primary wide" type="submit">Save ${future?'scheduled activity':'attendance'}</button><p class="source-note">The analytics update from these demo entries. Set expected volunteers to 0 to remove this activity.</p></form>`);}
  function giftForm(id,day){const c=campaigns.find(x=>x.id===id);if(!c)return;const gifts=donations().filter(x=>x.campaignId===id&&x.date===day);api.openDialog('Donation record',`<h2 id="dialog-title">${h(c.title)}</h2><p class="lead">${label(day)} · ${cash(gifts.reduce((s,g)=>s+g.amount,0))} recorded</p>${gifts.length?`<div class="calendar-gift-list">${gifts.map(g=>`<div><span>Demo donation</span><strong>${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(g.amount)}</strong><button class="calendar-remove" data-cal="remove-gift" data-id="${h(g.id)}" data-campaign="${id}" data-date="${day}" aria-label="Remove ${g.amount} dollar donation">Remove</button></div>`).join('')}</div>`:''}<form id="calendar-gift-form" data-id="${id}" data-date="${day}"><div class="form-field"><label for="cal-amount">Add a donation amount (USD)</label><input id="cal-amount" name="amount" type="number" min="0.01" max="1000000" step="0.01" placeholder="50.00" required></div><button class="button primary wide" type="submit">Record donation</button><p class="source-note">For demo bookkeeping only. This records a fictional gift; no payment is collected.</p></form>`);}
  function addForm(){api.openDialog('Community activity',`<h2 id="dialog-title">Record community activity.</h2><p class="lead">Choose an event or fundraising activity, then record the details.</p><form id="calendar-add-form"><div class="form-field"><label for="cal-activity">Activity</label><select name="activity" id="cal-activity"><optgroup label="Events">${allActivities().map(a=>`<option value="event:${h(a.id)}">${h(a.title)}</option>`).join('')}</optgroup><optgroup label="Fundraising">${campaigns.map(c=>`<option value="gift:${c.id}">${h(c.title)}</option>`).join('')}</optgroup></select></div><div class="form-field"><label for="cal-date">Date</label><input type="date" name="date" id="cal-date" required value="${month==='2026-10'?TODAY:`${month}-01`}"></div><button class="button primary wide" type="submit">Continue</button></form><div class="dialog-section"><h3>A different event?</h3><p>Create an event to include it on the community timeline.</p><button class="button" data-action="add-event">${svg('plus')} Create event</button></div>`);}
  document.addEventListener('click',e=>{const b=e.target.closest('[data-cal]');if(!b||!api)return;const a=b.dataset.cal;
    if(a==='record')addForm();
    else if(a==='remove-gift'){saved.gifts=saved.gifts.filter(g=>g.id!==b.dataset.id);if(b.dataset.id.startsWith('seed-'))saved.removed.push(b.dataset.id);save();refresh();giftForm(b.dataset.campaign,b.dataset.date);api.toast('Demo donation removed.');}
  });
  document.addEventListener('change',e=>{if(e.target.id==='calendar-report-month'){month=e.target.value;refresh('#calendar-report-month');}});
  document.addEventListener('submit',e=>{if(!e.target.id.startsWith('calendar-'))return;e.preventDefault();const f=new FormData(e.target);
    if(e.target.id==='calendar-add-form'){const [type,id]=String(f.get('activity')).split(':'),day=String(f.get('date'));if(type==='gift'&&day>TODAY){const input=document.getElementById('cal-date');input.setCustomValidity('Choose October 24, 2026 or earlier to record a received donation.');input.reportValidity();return;}month=day.slice(0,7);refresh();type==='event'?eventForm(id,day):giftForm(id,day);}
    if(e.target.id==='calendar-attendance-form'){const expected=Number(f.get('expected')),attended=Number(f.get('attended')||0),hours=Number(f.get('hours'));if(attended>expected){const input=document.getElementById('cal-attended');input.setCustomValidity('Attended cannot exceed expected volunteers.');input.reportValidity();return;}saved.overrides[`${e.target.dataset.id}|${e.target.dataset.date}`]={expected,attended,hours};save();api.closeDialog();refresh('[data-cal="record"]');api.toast('Activity saved. Attendance and analytics updated.');}
    if(e.target.id==='calendar-gift-form'){const c=campaigns.find(x=>x.id===e.target.dataset.id);saved.gifts.push({id:`gift-${Date.now()}`,date:e.target.dataset.date,campaignId:c.id,campaignTitle:c.title,amount:Math.round(Number(f.get('amount'))*100)/100});save();api.closeDialog();refresh('[data-cal="record"]');api.toast('Demo donation recorded. Fundraising totals updated.');}
  });
  window.RootsCalendar={configure(callbacks){api=callbacks;},render,records,donations};
})();
