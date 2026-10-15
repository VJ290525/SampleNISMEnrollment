'use strict';
const $=id=>document.getElementById(id);
let filters={period:'month',exam:'all',center:'all',status:'all'},selectedProfile=null,selectedVersion=null;
const audit=[];
let sessionRange={start:'2026-10-15',end:'2026-11-14'};
const dateLabel=date=>new Date(`${date}T12:00:00+05:30`).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'});
const matchesScope=row=>(filters.exam==='all'||row.exam===filters.exam)&&(filters.center==='all'||row.center===filters.center);
const filteredEnrollments=()=>enrollmentData.filter(row=>matchesScope(row)&&(filters.status==='all'||row.status===filters.status)&&(filters.period==='month'||filters.period==='week'&&row.day>=15&&row.day<=21));
const scopedSessions=()=>sessionData.filter(row=>matchesScope(row)&&row.date>=sessionRange.start&&row.date<=sessionRange.end);
function notify(message){$('toast').textContent=message;$('toast').style.display='block';clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('toast').style.display='none',4000);}
function render(){
 const rows=filteredEnrollments(),confirmed=rows.filter(x=>x.status==='Confirmed').length,sessions=scopedSessions();
 $('total').textContent=rows.length.toLocaleString('en-IN');$('confirmed').textContent=confirmed;$('rate').textContent=rows.length?`${(confirmed/rows.length*100).toFixed(1)}% of selected enrollments`:'No matching enrollments';
 $('pending').textContent=profileData.filter(x=>matchesScope(x)&&x.status==='Pending').length;
 const known=sessions.filter(x=>availableSeats(x)!==null);$('seats').textContent=known.length?known.reduce((sum,x)=>sum+availableSeats(x),0):'—';
 $('seats-note').textContent=sessions.length?`${known.length} known sessions${known.length<sessions.length?' · '+(sessions.length-known.length)+' availability unavailable':''}`:'No matching upcoming sessions';
 $('status-summary').textContent=['Confirmed','Pending','Cancelled'].map(status=>`${status}: ${rows.filter(x=>x.status===status).length}`).join(' · ');
 renderTrend(rows);renderDistribution(rows);renderReviews();renderSessions();
}
function renderTrend(rows){
 const days=filters.period==='week'?7:filters.period==='future'?30:31,start=filters.period==='week'?15:1;
 const buckets=Array.from({length:days},(_,i)=>({day:start+i,count:rows.filter(row=>row.day===start+i).length}));
 const max=Math.max(1,...buckets.map(x=>x.count)),left=27,width=530,height=125,barWidth=width/days;
 $('trend').setAttribute('aria-label',`${rows.length} enrollments in ${days} daily buckets. Exact values are available in the daily data table.`);
 $('trend').innerHTML=rows.length?`<svg viewBox="0 0 580 180" aria-hidden="true">${[0,.5,1].map(r=>`<line x1="27" x2="565" y1="${20+height*(1-r)}" y2="${20+height*(1-r)}" stroke="#e9edf1"/><text x="3" y="${24+height*(1-r)}" fill="#9ba6af" font-size="9">${Math.round(max*r)}</text>`).join('')}${buckets.map((b,i)=>`<rect x="${left+i*barWidth+2}" y="${20+height-height*b.count/max}" width="${Math.max(2,barWidth-4)}" height="${height*b.count/max}" rx="2" fill="${b.day===15?'#223e54':'#dc9566'}"/><text x="${left+i*barWidth+barWidth/2}" y="165" text-anchor="middle" font-size="8" fill="#919ca7">${i%5===0||i===days-1?`${b.day}`:''}</text>`).join('')}<text x="555" y="178" text-anchor="end" font-size="9" fill="#919ca7">${filters.period==='future'?'November':'October'} · IST</text></svg>`:'<div class="empty">No enrollments match these filters.</div>';
 $('trend-data').innerHTML=buckets.map(x=>`<tr><td>${x.day} ${filters.period==='future'?'Nov':'Oct'} 2026 (IST)</td><td>${x.count}</td></tr>`).join('');
}
function renderDistribution(rows){
 const colors=['#203e55','#d88e5d','#91a9b9','#b8bdc3'];
 const groups=Object.keys(examNames).map(exam=>({exam,count:rows.filter(x=>x.exam===exam).length})).filter(x=>x.count).sort((a,b)=>b.count-a.count);
 $('distribution').innerHTML=groups.length?groups.map((x,i)=>`<div class="distribution-row"><div class="distribution-head"><button class="text-button exam-drill" data-exam="${x.exam}">${x.exam==='unknown'?'Unspecified exam':`${x.exam} · ${examNames[x.exam]}`}</button><span>${x.count} <span class="subtle">· ${(x.count/rows.length*100).toFixed(1)}%</span></span></div><div class="bar-track"><div class="bar-fill" style="width:${x.count/rows.length*100}%;background:${colors[i]}"></div></div></div>`).join('')+'<p class="rounding">Rounded shares may not sum to 100%.</p>':'<div class="empty">No enrollments in this period.</div>';
 $('exam-data').innerHTML=groups.map(x=>`<tr><td>${examNames[x.exam]}</td><td>${x.count}</td><td>${(x.count/rows.length*100).toFixed(1)}%</td></tr>`).join('');
 document.querySelectorAll('.exam-drill').forEach(button=>button.addEventListener('click',()=>openEnrollments(button.dataset.exam)));
}
function renderReviews(){
 const search=$('search').value.trim().toLocaleLowerCase();
 const rows=profileData.filter(x=>matchesScope(x)&&($('review-status').value==='all'||x.status===$('review-status').value)&&(!$('profile-date').value||x.date>=$('profile-date').value)&&(!search||x.name.toLowerCase().includes(search)||x.id.toLowerCase()===search));
 const pending=profileData.filter(x=>matchesScope(x)&&x.status==='Pending').length;
 $('nav-count').textContent=pending;$('queue-count').textContent=pending;
 $('review-rows').innerHTML=rows.map(x=>`<tr><td><div class="candidate"><span class="initial">${x.name.split(' ').map(n=>n[0]).join('')}</span><div>${x.name}<small>${x.center}</small></div></div></td><td>${x.id}</td><td>${x.exam} · ${examNames[x.exam]}</td><td>${dateLabel(x.date)}<br><small>${x.time} IST</small></td><td><span class="badge ${x.status==='Approved'?'approved':x.status==='Rejected'?'rejected':''}">${x.status}</span></td><td><button class="review-button" data-profile="${x.id}">${x.status==='Pending'?'Review':'View'}</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty">No profiles match your review filters.</td></tr>';
 $('review-summary').textContent=`${rows.length} profiles · oldest submission first`;
 document.querySelectorAll('[data-profile]').forEach(button=>button.addEventListener('click',()=>openProfile(button.dataset.profile)));
}
function renderSessions(){
 const sessions=scopedSessions();
 $('session-grid').innerHTML=sessions.map(x=>{const available=availableSeats(x),booking=!x.open?'Booking closed':available===null?'Availability unavailable':available===0?'Full':'Booking open';return `<article class="session"><div class="session-top"><span class="exam-code">NISM Series ${x.exam}</span><span class="badge ${booking==='Booking open'?'approved':''}">${booking}</span></div><h3>${examNames[x.exam]}</h3><p>${x.center} · ${dateLabel(x.date)} · ${x.time} IST</p><div class="capacity"><span>${x.id} · Scheduled</span><strong class="${available===0?'full':available!==null&&available<20?'low':''}">${available===null?'Unavailable':`${available} seats left`}</strong></div><div class="bar-track"><div class="bar-fill" style="background:#39576b;width:${x.capacity?Math.min(100,(x.booked+x.holds)/x.capacity*100):0}%"></div></div><p style="margin:10px 0 0">Capacity: ${x.capacity??'unavailable'} · Booked: ${x.booked} · Holds: ${x.holds}</p>${x.capacity!==null&&x.booked+x.holds>x.capacity?'<p style="color:#ac5555">Allocation exceeds capacity · operations review needed</p>':''}<button class="text-button session-details" data-session="${x.id}">View session details →</button></article>`;}).join('')||'<div class="empty">No sessions match these session dates, exam, and centre.</div>';
 document.querySelectorAll('[data-session]').forEach(button=>button.addEventListener('click',()=>{const session=sessionData.find(x=>x.id===button.dataset.session);$('details-title').textContent=`Session ${session.id}`;$('details-content').textContent=`${examNames[session.exam]} · ${session.center} · ${dateLabel(session.date)} ${session.time} IST. Scheduled. Capacity ${session.capacity??'unavailable'}, confirmed allocations ${session.booked}, active holds ${session.holds}, available ${availableSeats(session)??'unavailable'}. ${session.open?'Booking window open.':'Booking closed.'} Availability is indicative and does not reserve a seat.`;$('details-dialog').showModal();}));
}
function openProfile(id){
 selectedProfile=profileData.find(x=>x.id===id);selectedVersion=selectedProfile.version;const x=selectedProfile;
 $('review-title').textContent=x.name;$('reason').value=x.reason||'';$('review-error').textContent='';
 $('profile-details').innerHTML=`<dl class="profile-grid"><div><dt>Candidate reference</dt><dd>${x.id}</dd></div><div><dt>Current status</dt><dd>${x.status}</dd></div><div><dt>Examination</dt><dd>${x.exam} · ${examNames[x.exam]}</dd></div><div><dt>Exam centre</dt><dd>${x.center}</dd></div><div><dt>Submitted (IST)</dt><dd>${dateLabel(x.date)} ${x.time}</dd></div><div><dt>Sample checks</dt><dd>Identity & qualification available</dd></div></dl>`;
 ['approve','reject','correction'].forEach(id=>$(id).disabled=x.status!=='Pending');$('review-dialog').showModal();
}
function decide(status){
 const reason=$('reason').value.trim();if(status!=='Approved'&&!reason){$('review-error').textContent='Enter a reason before rejecting or requesting a correction.';$('reason').focus();return;}
 if(selectedProfile.version!==selectedVersion||selectedProfile.status!=='Pending'){$('review-error').textContent='This profile changed after you opened it. Close and reopen to load its current status.';return;}
 if(!window.confirm(`${status==='Approved'?'Approve':status==='Rejected'?'Reject':'Request correction for'} ${selectedProfile.id}? This updates fictional preview data only.`))return;
 audit.push({candidate:selectedProfile.id,actor:'Demo reviewer',at:new Date().toISOString(),prior:selectedProfile.status,next:status,reason});selectedProfile.status=status;selectedProfile.reason=reason;selectedProfile.version++;$('review-dialog').close();render();notify(`${selectedProfile.id}: ${status}. Sample audit event recorded.`);
}
function openEnrollments(exam='all'){
 const rows=filteredEnrollments().filter(x=>exam==='all'||x.exam===exam);$('details-title').textContent='Matching enrollments';$('details-content').textContent=`${rows.length} enrollments · ${filters.period} · centre: ${filters.center} · status: ${filters.status}. `+rows.map(x=>`${x.id} | ${x.day} October | ${examNames[x.exam]} | ${x.center} | ${x.status}`).join('\n');$('details-dialog').showModal();
}
$('apply').addEventListener('click',()=>{filters={period:$('period').value,exam:$('exam').value,center:$('center').value,status:$('status').value};render();notify('Dashboard filters applied. Profile and session dates remain separate.');});
$('reset').addEventListener('click',()=>{['period','exam','center','status'].forEach(id=>$(id).selectedIndex=0);filters={period:'month',exam:'all',center:'all',status:'all'};render();});
$('refresh').addEventListener('click',()=>{$('filter-time').textContent=`Refreshed ${new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit'})} IST · fixed demo dataset`;render();notify('Sample snapshot refreshed; filters preserved.');});
['search','review-status','profile-date'].forEach(id=>$(id).addEventListener('input',renderReviews));
['session-start','session-end'].forEach(id=>$(id).addEventListener('change',()=>{if($('session-start').value>$('session-end').value){$('session-error').textContent='Session start must be on or before the end date.';return;}$('session-error').textContent='';sessionRange={start:$('session-start').value,end:$('session-end').value};render();}));
$('close-dialog').addEventListener('click',()=>$('review-dialog').close());$('close-details').addEventListener('click',()=>$('details-dialog').close());
$('approve').addEventListener('click',()=>decide('Approved'));$('reject').addEventListener('click',()=>decide('Rejected'));$('correction').addEventListener('click',()=>decide('Correction requested'));
$('export').addEventListener('click',()=>openEnrollments());
render();
