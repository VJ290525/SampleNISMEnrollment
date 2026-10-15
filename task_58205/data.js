'use strict';
const examNames = {'V-A':'Mutual Fund Distributors',VIII:'Equity Derivatives',XV:'Research Analyst',unknown:'Unspecified exam'};
const enrollmentData = Array.from({length:186},(_,i)=>({id:`ENR-${10001+i}`,day:1+(i*7+i%5)%15,exam:i===185?'unknown':['V-A','V-A','VIII','XV'][i%4],center:['Mumbai','Pune','New Delhi'][i%3],status:['Confirmed','Confirmed','Confirmed','Pending','Cancelled'][i%5]}));
const profileData = [
 {id:'C-••1042',name:'Aarav Sharma',exam:'V-A',center:'Mumbai',date:'2026-10-12',time:'09:20',status:'Pending',version:1},
 {id:'C-••1087',name:'Meera Iyer',exam:'VIII',center:'Pune',date:'2026-10-13',time:'11:45',status:'Pending',version:1},
 {id:'C-••1115',name:'Rohan Desai',exam:'XV',center:'New Delhi',date:'2026-10-14',time:'14:10',status:'Pending',version:1},
 {id:'C-••1138',name:'Ananya Rao',exam:'V-A',center:'Mumbai',date:'2026-10-15',time:'10:30',status:'Pending',version:1}
];
const sessionData = [
 {id:'SES-201',exam:'V-A',center:'Mumbai',date:'2026-10-16',time:'09:30',capacity:100,booked:70,holds:5,open:true},
 {id:'SES-202',exam:'VIII',center:'Pune',date:'2026-10-17',time:'10:00',capacity:60,booked:56,holds:4,open:true},
 {id:'SES-203',exam:'XV',center:'New Delhi',date:'2026-10-18',time:'14:00',capacity:80,booked:60,holds:2,open:false},
 {id:'SES-204',exam:'V-A',center:'Pune',date:'2026-10-20',time:'09:30',capacity:null,booked:20,holds:0,open:true},
 {id:'SES-205',exam:'VIII',center:'Mumbai',date:'2026-10-22',time:'11:00',capacity:50,booked:51,holds:0,open:true},
 {id:'SES-206',exam:'XV',center:'Mumbai',date:'2026-10-24',time:'14:00',capacity:80,booked:32,holds:3,open:true}
];
const availableSeats = session => session.capacity===null ? null : Math.max(0,session.capacity-session.booked-session.holds);
if(typeof module!=='undefined') module.exports={enrollmentData,profileData,sessionData,availableSeats,examNames};
