import "dotenv/config";
import bcrypt from "bcryptjs";
import {initDb,q,pool} from "./db.js";
import {randomUUID} from "node:crypto";
const id=()=>randomUUID();
async function main(){
 if(process.env.ENABLE_DEMO_SEED!=="true")throw new Error("Set ENABLE_DEMO_SEED=true in .env");
 await initDb();const password=process.env.DEMO_SEED_PASSWORD||"ChangeMe123!";
 let r=await q("SELECT id FROM institutions WHERE official_id='DEMO-INST-001'");let inst=r.rows[0]?.id;
 if(!inst){r=await q("INSERT INTO institutions(id,official_id,name,state,district,institution_type,source_name) VALUES($1,'DEMO-INST-001','Demo Engineering Institute','Delhi','New Delhi','Engineering','SIMULATED DEMO FIXTURE') RETURNING id",[id()]);inst=r.rows[0].id;}
 const accounts=[["Demo Admin","admin@regulaflow.local","ADMIN",null],["Demo Regional Officer","officer@regulaflow.local","REGIONAL_OFFICER",null],["Demo Institution User","institution@regulaflow.local","INSTITUTION","DEMO-INST-001"],["Demo EVC Member","evc@regulaflow.local","EVC_MEMBER",null]];
 const users={};
 for(const [name,email,role,institution_id] of accounts){r=await q("SELECT id FROM users WHERE email=$1",[email]);if(r.rowCount){users[role]=r.rows[0].id;continue;}r=await q("INSERT INTO users(id,name,email,password_hash,role,institution_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING id",[id(),name,email,await bcrypt.hash(password,12),role,institution_id]);users[role]=r.rows[0].id;}
 r=await q("SELECT id FROM applications WHERE application_number='DEMO-1001'");let appId=r.rows[0]?.id;
 if(!appId){appId=id();await q("INSERT INTO applications(id,application_number,institution_id,application_type,academic_year,workflow_path,current_stage,status,assigned_user_id,assigned_role,due_date,is_demo,created_by) VALUES($1,'DEMO-1001',$2,'New Course Approval','2026-27','SCRUTINY_EVC','SCRUTINY','PENDING',$3,'REGIONAL_OFFICER',CURRENT_DATE+3,TRUE,$4)",[appId,inst,users.REGIONAL_OFFICER,users.ADMIN]);await q("INSERT INTO application_events(id,application_id,actor_id,action,to_stage,to_status,metadata) VALUES($1,$2,$3,'DEMO_SEEDED','SCRUTINY','PENDING',$4)",[id(),appId,users.ADMIN,JSON.stringify({label:"SIMULATED DEMO RECORD"})]);}
 r=await q("SELECT id FROM compliance_records WHERE title='Demo lease expiry'");if(!r.rowCount)await q("INSERT INTO compliance_records(id,institution_id,application_id,record_type,title,due_date,expiry_date,status,is_demo) VALUES($1,$2,$3,'LEASE','Demo lease expiry',CURRENT_DATE+2,CURRENT_DATE+14,'PENDING',TRUE)",[id(),inst,appId]);
 console.log("Seed complete. Demo accounts (change password before any real deployment):");for(const [,email,role] of accounts)console.log(`${role}: ${email} / ${password}`);console.log("All seeded institution/application/compliance data are simulated, not actual AICTE operational records.");
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>pool.end());
