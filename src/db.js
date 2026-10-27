import pg from "pg";
import "dotenv/config";
const {Pool}=pg;
export const pool=new Pool({connectionString:process.env.DATABASE_URL});
export const q=(sql,params=[])=>pool.query(sql,params);
export async function initDb(){await q(`
CREATE TABLE IF NOT EXISTS users(id UUID PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN('INSTITUTION','REGIONAL_OFFICER','BUREAU_OFFICER','EVC_MEMBER','COMMITTEE_MEMBER','COMPETENT_AUTHORITY','ADMIN')),institution_id TEXT,active BOOLEAN DEFAULT TRUE,created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS institutions(id UUID PRIMARY KEY,official_id TEXT UNIQUE,name TEXT NOT NULL,state TEXT,district TEXT,address TEXT,institution_type TEXT,source_name TEXT,source_url TEXT,source_snapshot_date DATE,created_at TIMESTAMPTZ DEFAULT NOW(),updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS applications(id UUID PRIMARY KEY,application_number TEXT UNIQUE NOT NULL,institution_id UUID NOT NULL REFERENCES institutions(id),application_type TEXT NOT NULL,academic_year TEXT,workflow_path TEXT NOT NULL,current_stage TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'PENDING',assigned_user_id UUID REFERENCES users(id),assigned_role TEXT,due_date DATE,deficiency_reason TEXT,is_demo BOOLEAN DEFAULT TRUE,created_by UUID REFERENCES users(id),created_at TIMESTAMPTZ DEFAULT NOW(),updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS application_events(id UUID PRIMARY KEY,application_id UUID REFERENCES applications(id) ON DELETE CASCADE,actor_id UUID REFERENCES users(id),action TEXT NOT NULL,from_stage TEXT,to_stage TEXT,from_status TEXT,to_status TEXT,reason TEXT,metadata JSONB DEFAULT '{}'::jsonb,created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS compliance_records(id UUID PRIMARY KEY,institution_id UUID REFERENCES institutions(id),application_id UUID REFERENCES applications(id),record_type TEXT NOT NULL,title TEXT NOT NULL,due_date DATE,expiry_date DATE,status TEXT DEFAULT 'PENDING',evidence_name TEXT,verified_by UUID REFERENCES users(id),verified_at TIMESTAMPTZ,is_demo BOOLEAN DEFAULT TRUE,created_at TIMESTAMPTZ DEFAULT NOW(),updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS evc_records(id UUID PRIMARY KEY,application_id UUID REFERENCES applications(id),scheduled_at TIMESTAMPTZ,status TEXT DEFAULT 'QUEUED',coordinator_id UUID REFERENCES users(id),findings TEXT,is_demo BOOLEAN DEFAULT TRUE,created_at TIMESTAMPTZ DEFAULT NOW(),updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS notifications(id UUID PRIMARY KEY,recipient_id UUID REFERENCES users(id),application_id UUID REFERENCES applications(id),compliance_id UUID REFERENCES compliance_records(id),type TEXT,message TEXT,dedupe_key TEXT UNIQUE,read_at TIMESTAMPTZ,acknowledged_at TIMESTAMPTZ,created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS audit_logs(id UUID PRIMARY KEY,actor_id UUID REFERENCES users(id),action TEXT NOT NULL,entity_type TEXT NOT NULL,entity_id TEXT,previous_state JSONB,new_state JSONB,reason TEXT,request_id TEXT,created_at TIMESTAMPTZ DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_apps_stage_status ON applications(current_stage,status);
CREATE INDEX IF NOT EXISTS idx_apps_due ON applications(due_date);
CREATE INDEX IF NOT EXISTS idx_compliance_dates ON compliance_records(due_date,expiry_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(recipient_id,created_at DESC);
`);}
