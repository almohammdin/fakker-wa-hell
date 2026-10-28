const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');let script=html.match(/<script>([\s\S]*)<\/script>/)[1];script=script.replace(/\ninitCMS\(\);/,'\n').replace(/\ngo\('home'\);/,'\n');
const nodes={};function node(id){return nodes[id]??={innerHTML:'',textContent:'',scrollIntoView(){},addEventListener(){},querySelectorAll(){return[]},insertAdjacentHTML(pos,s){this.innerHTML+=s},classList:{toggle(){}},querySelector(){return null}}}
const context={NodeFilter:{SHOW_TEXT:4},MutationObserver:class{observe(){}},document:{createTreeWalker(){return {nextNode(){return null}}},getElementById:node,querySelectorAll:()=>[],querySelector:()=>null,fonts:{ready:Promise.resolve()}},window:{addEventListener(){},scrollTo(){},print(){}},localStorage:{getItem(){return null},setItem(){}},console,structuredClone,Map,Set,Date,setTimeout,clearTimeout,confirm:()=>true,alert(){},crypto:require('crypto').webcrypto};vm.createContext(context);vm.runInContext(script,context);
vm.runInContext(`
validateCMS(CMS_SEED);if(lessons.length!==25||bank.length!==45)throw Error('counts');
let migrated=upgradeContent(LEGACY_SEED);validateCMS(migrated);if(migrated.lessons.length!==25)throw Error('migration');
let edited=clone(LEGACY_SEED);edited.lessons[0].fields[2]='custom text';if(upgradeContent(edited).lessons[0].fields[2]!=='custom text')throw Error('overwritten edit');
let removed=clone(CMS_SEED);removed.lessons.pop();if(upgradeContent(removed).lessons.length!==24)throw Error('restored deleted lesson');
for(let i=0;i<25;i++){lesson=i;learn();if(!app.innerHTML.includes('response-create'))throw Error('activity');if(!bank.some(q=>q.g===i))throw Error('missing quiz');printSheet(i);printSheet(i,true)}
lesson=0;keepThinking('reason','<img src=x onerror=alert(1)>');if(activityHTML(lessonRecord(),'reason').includes('<img src=x'))throw Error('XSS');
const k=thinkingKey(lessonRecord(),'reason');let editedQuestion=clone(lessonRecord());editedQuestion.thinking.prompt+=' new';if(thinkingKey(editedQuestion,'reason')===k)throw Error('stale response');
cms.draft=clone(CMS_SEED);cms.kind='lessons';cms.selected=cms.draft.lessons[0].id;editCMS({target:{dataset:{field:'t:hint'},value:'new hint'}});if(itemCMS().thinking.hint!=='new hint')throw Error('editor');
printSheet(-1);if((document.getElementById('paper').innerHTML.match(/<section /g)||[]).length!==25)throw Error('print count');
`,context);console.log('PASS: 25 lessons, 45 questions, migration preserving edits/deletions, all lesson/worksheet renders, response escaping/invalidation, teacher editor.');

vm.runInContext(`
delivery.teacherRows=Array.from({length:50},(_,i)=>({key:'u'+i+'/lesson0',uid:'u'+i,id:'lesson0',year:'y',answer:{studentName:'طالب '+i,classId:i%2?'b':'a',submittedAt:i+1},review:i%3?null:{status:'reviewed',reviewedAt:100,score:8}}));
if(filteredDeliveries().length!==50)throw Error('50 rows');delivery.classId='a';if(filteredDeliveries().length!==25)throw Error('class filter');delivery.status='reviewed';if(filteredDeliveries().length!==9)throw Error('review filter');
if(deliveryStatus({answer:{submittedAt:200},review:{status:'revision',reviewedAt:100}})!=='pending')throw Error('resubmit status');
if(!csvCell('=SUM(A1)').includes("'="))throw Error('CSV formula');
cms.allowed=true;delivery.status='';delivery.selected=new Set(filteredDeliveries().map(r=>r.key));prepareDeliveryDelete();if(delivery.stage!==1||delivery.deleteRows.length!==25)throw Error('first confirmation');secondDeliveryDelete();if(delivery.stage!==2)throw Error('second confirmation');cancelDeliveryDelete();if(delivery.stage!==0||delivery.deleteRows.length)throw Error('cancel delete');
`,context);console.log('PASS: 50 submissions, class/status filtering, revision status, CSV formula protection, two deletion confirmations and cancel.');
