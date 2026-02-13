--
-- PostgreSQL database dump
--

\restrict qxiIbRv60ZewdzXgTKtsRSBrL7eXOSHpQZKUklpKOfuwZtoQMNYIQEU4Oda2gPU

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg12+1)
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.sys_users DROP CONSTRAINT IF EXISTS sys_users_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.project_zones DROP CONSTRAINT IF EXISTS project_zones_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.project_users DROP CONSTRAINT IF EXISTS project_users_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.project_users DROP CONSTRAINT IF EXISTS project_users_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.project_companies DROP CONSTRAINT IF EXISTS project_companies_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.project_companies DROP CONSTRAINT IF EXISTS project_companies_company_id_fkey;
ALTER TABLE IF EXISTS ONLY public.device_beacons DROP CONSTRAINT IF EXISTS device_beacons_zone_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_worker_users DROP CONSTRAINT IF EXISTS daily_worker_users_worker_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_worker_users DROP CONSTRAINT IF EXISTS daily_worker_users_plan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_worker_locations DROP CONSTRAINT IF EXISTS daily_worker_locations_zone_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_worker_locations DROP CONSTRAINT IF EXISTS daily_worker_locations_worker_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_worker_locations DROP CONSTRAINT IF EXISTS daily_worker_locations_beacon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_work_plans DROP CONSTRAINT IF EXISTS daily_work_plans_zone_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_work_plans DROP CONSTRAINT IF EXISTS daily_work_plans_work_info_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_work_plans DROP CONSTRAINT IF EXISTS daily_work_plans_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_violations DROP CONSTRAINT IF EXISTS daily_violations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_violations DROP CONSTRAINT IF EXISTS daily_violations_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_safety_logs DROP CONSTRAINT IF EXISTS daily_safety_logs_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_safety_logs DROP CONSTRAINT IF EXISTS daily_safety_logs_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_safety_logs DROP CONSTRAINT IF EXISTS daily_safety_logs_plan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_notices DROP CONSTRAINT IF EXISTS daily_notices_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_notice_reads DROP CONSTRAINT IF EXISTS daily_notice_reads_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_notice_reads DROP CONSTRAINT IF EXISTS daily_notice_reads_notice_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_danger_zones DROP CONSTRAINT IF EXISTS daily_danger_zones_zone_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_danger_zones DROP CONSTRAINT IF EXISTS daily_danger_zones_reporter_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_danger_zones DROP CONSTRAINT IF EXISTS daily_danger_zones_danger_info_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_danger_images DROP CONSTRAINT IF EXISTS daily_danger_images_danger_zone_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_attendance DROP CONSTRAINT IF EXISTS daily_attendance_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_attendance DROP CONSTRAINT IF EXISTS daily_attendance_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.content_work_safety_map DROP CONSTRAINT IF EXISTS content_work_safety_map_work_info_id_fkey;
ALTER TABLE IF EXISTS ONLY public.content_work_safety_map DROP CONSTRAINT IF EXISTS content_work_safety_map_safety_info_id_fkey;
ALTER TABLE IF EXISTS ONLY public.content_work_gear_map DROP CONSTRAINT IF EXISTS content_work_gear_map_work_info_id_fkey;
ALTER TABLE IF EXISTS ONLY public.content_work_gear_map DROP CONSTRAINT IF EXISTS content_work_gear_map_resource_id_fkey;
DROP INDEX IF EXISTS public.ix_sys_users_username;
DROP INDEX IF EXISTS public.ix_sys_users_id;
DROP INDEX IF EXISTS public.ix_sys_companies_name;
DROP INDEX IF EXISTS public.ix_sys_companies_id;
DROP INDEX IF EXISTS public.ix_project_zones_id;
DROP INDEX IF EXISTS public.ix_project_users_id;
DROP INDEX IF EXISTS public.ix_project_master_id;
DROP INDEX IF EXISTS public.ix_project_companies_id;
DROP INDEX IF EXISTS public.ix_device_beacons_uuid;
DROP INDEX IF EXISTS public.ix_device_beacons_id;
DROP INDEX IF EXISTS public.ix_daily_worker_users_id;
DROP INDEX IF EXISTS public.ix_daily_worker_locations_id;
DROP INDEX IF EXISTS public.ix_daily_work_plans_id;
DROP INDEX IF EXISTS public.ix_daily_work_plans_date;
DROP INDEX IF EXISTS public.ix_daily_weather_id;
DROP INDEX IF EXISTS public.ix_daily_violations_id;
DROP INDEX IF EXISTS public.ix_daily_safety_logs_id;
DROP INDEX IF EXISTS public.ix_daily_safety_info_id;
DROP INDEX IF EXISTS public.ix_daily_safety_info_date;
DROP INDEX IF EXISTS public.ix_daily_notices_id;
DROP INDEX IF EXISTS public.ix_daily_notices_date;
DROP INDEX IF EXISTS public.ix_daily_notice_reads_id;
DROP INDEX IF EXISTS public.ix_daily_danger_zones_id;
DROP INDEX IF EXISTS public.ix_daily_danger_images_id;
DROP INDEX IF EXISTS public.ix_daily_attendance_id;
DROP INDEX IF EXISTS public.ix_daily_attendance_date;
DROP INDEX IF EXISTS public.ix_content_work_safety_map_id;
DROP INDEX IF EXISTS public.ix_content_work_info_id;
DROP INDEX IF EXISTS public.ix_content_work_gear_map_id;
DROP INDEX IF EXISTS public.ix_content_safety_info_id;
DROP INDEX IF EXISTS public.ix_content_safety_gear_id;
DROP INDEX IF EXISTS public.ix_content_danger_info_id;
DROP INDEX IF EXISTS public.ix_content_accidents_id;
DROP INDEX IF EXISTS public.ix_content_accidents_external_id;
DROP INDEX IF EXISTS public.ix_content_accidents_category;
ALTER TABLE IF EXISTS ONLY public.content_work_gear_map DROP CONSTRAINT IF EXISTS uq_content_gear;
ALTER TABLE IF EXISTS ONLY public.sys_users DROP CONSTRAINT IF EXISTS sys_users_pkey;
ALTER TABLE IF EXISTS ONLY public.sys_companies DROP CONSTRAINT IF EXISTS sys_companies_pkey;
ALTER TABLE IF EXISTS ONLY public.project_zones DROP CONSTRAINT IF EXISTS project_zones_pkey;
ALTER TABLE IF EXISTS ONLY public.project_users DROP CONSTRAINT IF EXISTS project_users_pkey;
ALTER TABLE IF EXISTS ONLY public.project_master DROP CONSTRAINT IF EXISTS project_master_pkey;
ALTER TABLE IF EXISTS ONLY public.project_companies DROP CONSTRAINT IF EXISTS project_companies_pkey;
ALTER TABLE IF EXISTS ONLY public.device_beacons DROP CONSTRAINT IF EXISTS device_beacons_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_worker_users DROP CONSTRAINT IF EXISTS daily_worker_users_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_worker_locations DROP CONSTRAINT IF EXISTS daily_worker_locations_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_work_plans DROP CONSTRAINT IF EXISTS daily_work_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_weather DROP CONSTRAINT IF EXISTS daily_weather_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_weather DROP CONSTRAINT IF EXISTS daily_weather_date_key;
ALTER TABLE IF EXISTS ONLY public.daily_violations DROP CONSTRAINT IF EXISTS daily_violations_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_safety_logs DROP CONSTRAINT IF EXISTS daily_safety_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_safety_info DROP CONSTRAINT IF EXISTS daily_safety_info_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_notices DROP CONSTRAINT IF EXISTS daily_notices_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_notice_reads DROP CONSTRAINT IF EXISTS daily_notice_reads_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_danger_zones DROP CONSTRAINT IF EXISTS daily_danger_zones_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_danger_images DROP CONSTRAINT IF EXISTS daily_danger_images_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_attendance DROP CONSTRAINT IF EXISTS daily_attendance_pkey;
ALTER TABLE IF EXISTS ONLY public.content_work_safety_map DROP CONSTRAINT IF EXISTS content_work_safety_map_pkey;
ALTER TABLE IF EXISTS ONLY public.content_work_info DROP CONSTRAINT IF EXISTS content_work_info_work_type_key;
ALTER TABLE IF EXISTS ONLY public.content_work_info DROP CONSTRAINT IF EXISTS content_work_info_pkey;
ALTER TABLE IF EXISTS ONLY public.content_work_gear_map DROP CONSTRAINT IF EXISTS content_work_gear_map_pkey;
ALTER TABLE IF EXISTS ONLY public.content_safety_info DROP CONSTRAINT IF EXISTS content_safety_info_pkey;
ALTER TABLE IF EXISTS ONLY public.content_safety_gear DROP CONSTRAINT IF EXISTS content_safety_gear_pkey;
ALTER TABLE IF EXISTS ONLY public.content_danger_info DROP CONSTRAINT IF EXISTS content_danger_info_pkey;
ALTER TABLE IF EXISTS ONLY public.content_danger_info DROP CONSTRAINT IF EXISTS content_danger_info_danger_type_key;
ALTER TABLE IF EXISTS ONLY public.content_accidents DROP CONSTRAINT IF EXISTS content_accidents_pkey;
ALTER TABLE IF EXISTS public.sys_users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sys_companies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.project_zones ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.project_users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.project_master ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.project_companies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.device_beacons ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.daily_worker_users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.daily_worker_locations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.daily_work_plans ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.daily_weather ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.daily_violations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.daily_safety_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.daily_safety_info ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.daily_notices ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.daily_notice_reads ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.daily_danger_zones ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.daily_danger_images ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.daily_attendance ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_work_safety_map ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_work_info ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_work_gear_map ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_safety_info ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_safety_gear ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_danger_info ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_accidents ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.sys_users_id_seq;
DROP TABLE IF EXISTS public.sys_users;
DROP SEQUENCE IF EXISTS public.sys_companies_id_seq;
DROP TABLE IF EXISTS public.sys_companies;
DROP SEQUENCE IF EXISTS public.project_zones_id_seq;
DROP TABLE IF EXISTS public.project_zones;
DROP SEQUENCE IF EXISTS public.project_users_id_seq;
DROP TABLE IF EXISTS public.project_users;
DROP SEQUENCE IF EXISTS public.project_master_id_seq;
DROP TABLE IF EXISTS public.project_master;
DROP SEQUENCE IF EXISTS public.project_companies_id_seq;
DROP TABLE IF EXISTS public.project_companies;
DROP SEQUENCE IF EXISTS public.device_beacons_id_seq;
DROP TABLE IF EXISTS public.device_beacons;
DROP SEQUENCE IF EXISTS public.daily_worker_users_id_seq;
DROP TABLE IF EXISTS public.daily_worker_users;
DROP SEQUENCE IF EXISTS public.daily_worker_locations_id_seq;
DROP TABLE IF EXISTS public.daily_worker_locations;
DROP SEQUENCE IF EXISTS public.daily_work_plans_id_seq;
DROP TABLE IF EXISTS public.daily_work_plans;
DROP SEQUENCE IF EXISTS public.daily_weather_id_seq;
DROP TABLE IF EXISTS public.daily_weather;
DROP SEQUENCE IF EXISTS public.daily_violations_id_seq;
DROP TABLE IF EXISTS public.daily_violations;
DROP SEQUENCE IF EXISTS public.daily_safety_logs_id_seq;
DROP TABLE IF EXISTS public.daily_safety_logs;
DROP SEQUENCE IF EXISTS public.daily_safety_info_id_seq;
DROP TABLE IF EXISTS public.daily_safety_info;
DROP SEQUENCE IF EXISTS public.daily_notices_id_seq;
DROP TABLE IF EXISTS public.daily_notices;
DROP SEQUENCE IF EXISTS public.daily_notice_reads_id_seq;
DROP TABLE IF EXISTS public.daily_notice_reads;
DROP SEQUENCE IF EXISTS public.daily_danger_zones_id_seq;
DROP TABLE IF EXISTS public.daily_danger_zones;
DROP SEQUENCE IF EXISTS public.daily_danger_images_id_seq;
DROP TABLE IF EXISTS public.daily_danger_images;
DROP SEQUENCE IF EXISTS public.daily_attendance_id_seq;
DROP TABLE IF EXISTS public.daily_attendance;
DROP SEQUENCE IF EXISTS public.content_work_safety_map_id_seq;
DROP TABLE IF EXISTS public.content_work_safety_map;
DROP SEQUENCE IF EXISTS public.content_work_info_id_seq;
DROP TABLE IF EXISTS public.content_work_info;
DROP SEQUENCE IF EXISTS public.content_work_gear_map_id_seq;
DROP TABLE IF EXISTS public.content_work_gear_map;
DROP SEQUENCE IF EXISTS public.content_safety_info_id_seq;
DROP TABLE IF EXISTS public.content_safety_info;
DROP SEQUENCE IF EXISTS public.content_safety_gear_id_seq;
DROP TABLE IF EXISTS public.content_safety_gear;
DROP SEQUENCE IF EXISTS public.content_danger_info_id_seq;
DROP TABLE IF EXISTS public.content_danger_info;
DROP SEQUENCE IF EXISTS public.content_accidents_id_seq;
DROP TABLE IF EXISTS public.content_accidents;
DROP EXTENSION IF EXISTS vector;
--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: content_accidents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_accidents (
    id integer NOT NULL,
    data_source character varying NOT NULL,
    external_id character varying,
    category character varying,
    title character varying NOT NULL,
    description text,
    cause text,
    location character varying,
    occurred_at date,
    summary text,
    embedding public.vector(768),
    created_at timestamp without time zone
);


ALTER TABLE public.content_accidents OWNER TO postgres;

--
-- Name: COLUMN content_accidents.data_source; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_accidents.data_source IS '데이터 출처 (CSI, KOSHA_CASE 등)';


--
-- Name: COLUMN content_accidents.external_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_accidents.external_id IS '외부기관 관리 ID';


--
-- Name: COLUMN content_accidents.category; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_accidents.category IS '사고 유형 (추락, 붕괴 등)';


--
-- Name: COLUMN content_accidents.title; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_accidents.title IS '사고명';


--
-- Name: COLUMN content_accidents.description; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_accidents.description IS '상세 사고 경위 및 내용';


--
-- Name: COLUMN content_accidents.cause; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_accidents.cause IS '사고 원인';


--
-- Name: COLUMN content_accidents.location; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_accidents.location IS '발생 지역/장소';


--
-- Name: COLUMN content_accidents.occurred_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_accidents.occurred_at IS '사고 발생 일자';


--
-- Name: COLUMN content_accidents.summary; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_accidents.summary IS 'Gemini AI가 가공한 근로자용 친절한 요약 메시지';


--
-- Name: COLUMN content_accidents.embedding; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_accidents.embedding IS '벡터 검색을 위한 임베딩 데이터 (768차원)';


--
-- Name: content_accidents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_accidents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_accidents_id_seq OWNER TO postgres;

--
-- Name: content_accidents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.content_accidents_id_seq OWNED BY public.content_accidents.id;


--
-- Name: content_danger_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_danger_info (
    id integer NOT NULL,
    danger_type character varying NOT NULL,
    icon character varying,
    color character varying,
    description text,
    safety_guidelines json,
    risk_level integer
);


ALTER TABLE public.content_danger_info OWNER TO postgres;

--
-- Name: COLUMN content_danger_info.danger_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_danger_info.danger_type IS '위험 유형 (중장비, 화재, 낙하물, 감전 등)';


--
-- Name: COLUMN content_danger_info.icon; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_danger_info.icon IS '아이콘 이름';


--
-- Name: COLUMN content_danger_info.color; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_danger_info.color IS '표시 색상 (hex)';


--
-- Name: COLUMN content_danger_info.description; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_danger_info.description IS '위험 요소 설명';


--
-- Name: COLUMN content_danger_info.safety_guidelines; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_danger_info.safety_guidelines IS '안전 수칙';


--
-- Name: COLUMN content_danger_info.risk_level; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_danger_info.risk_level IS '기본 위험도 (1-5)';


--
-- Name: content_danger_info_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_danger_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_danger_info_id_seq OWNER TO postgres;

--
-- Name: content_danger_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.content_danger_info_id_seq OWNED BY public.content_danger_info.id;


--
-- Name: content_safety_gear; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_safety_gear (
    id integer NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL,
    icon character varying,
    safety_rules json
);


ALTER TABLE public.content_safety_gear OWNER TO postgres;

--
-- Name: COLUMN content_safety_gear.type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_safety_gear.type IS 'PPE, HEAVY, TOOL';


--
-- Name: content_safety_gear_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_safety_gear_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_safety_gear_id_seq OWNER TO postgres;

--
-- Name: content_safety_gear_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.content_safety_gear_id_seq OWNED BY public.content_safety_gear.id;


--
-- Name: content_safety_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_safety_info (
    id integer NOT NULL,
    category character varying NOT NULL,
    title character varying NOT NULL,
    description text,
    checklist json,
    risk_factors json,
    safety_measures json,
    required_ppe json,
    summary text,
    embedding json
);


ALTER TABLE public.content_safety_info OWNER TO postgres;

--
-- Name: COLUMN content_safety_info.category; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_safety_info.category IS '카테고리 (예: 고소작업, 밀폐공간, 중장비)';


--
-- Name: COLUMN content_safety_info.title; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_safety_info.title IS '표준 제목';


--
-- Name: COLUMN content_safety_info.description; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_safety_info.description IS '상세 설명';


--
-- Name: COLUMN content_safety_info.checklist; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_safety_info.checklist IS '점검 항목 리스트';


--
-- Name: COLUMN content_safety_info.risk_factors; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_safety_info.risk_factors IS '주요 위험 요소';


--
-- Name: COLUMN content_safety_info.safety_measures; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_safety_info.safety_measures IS '안전 조치 사항';


--
-- Name: COLUMN content_safety_info.required_ppe; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_safety_info.required_ppe IS '필수 보호구';


--
-- Name: COLUMN content_safety_info.summary; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_safety_info.summary IS 'Gemini AI가 요약한 핵심 지문 (임베딩 대상)';


--
-- Name: COLUMN content_safety_info.embedding; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_safety_info.embedding IS 'AI 임베딩 벡터값 (Vector 타입과 매핑)';


--
-- Name: content_safety_info_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_safety_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_safety_info_id_seq OWNER TO postgres;

--
-- Name: content_safety_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.content_safety_info_id_seq OWNED BY public.content_safety_info.id;


--
-- Name: content_work_gear_map; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_work_gear_map (
    id integer NOT NULL,
    work_info_id integer NOT NULL,
    resource_id integer NOT NULL
);


ALTER TABLE public.content_work_gear_map OWNER TO postgres;

--
-- Name: content_work_gear_map_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_work_gear_map_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_work_gear_map_id_seq OWNER TO postgres;

--
-- Name: content_work_gear_map_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.content_work_gear_map_id_seq OWNED BY public.content_work_gear_map.id;


--
-- Name: content_work_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_work_info (
    id integer NOT NULL,
    work_type character varying NOT NULL,
    base_risk_score integer,
    checklist_items json
);


ALTER TABLE public.content_work_info OWNER TO postgres;

--
-- Name: COLUMN content_work_info.work_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_work_info.work_type IS '작업종류 (예: 고소작업)';


--
-- Name: COLUMN content_work_info.checklist_items; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.content_work_info.checklist_items IS '표준 필수 점검사항';


--
-- Name: content_work_info_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_work_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_work_info_id_seq OWNER TO postgres;

--
-- Name: content_work_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.content_work_info_id_seq OWNED BY public.content_work_info.id;


--
-- Name: content_work_safety_map; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_work_safety_map (
    id integer NOT NULL,
    work_info_id integer NOT NULL,
    safety_info_id integer NOT NULL
);


ALTER TABLE public.content_work_safety_map OWNER TO postgres;

--
-- Name: content_work_safety_map_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_work_safety_map_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_work_safety_map_id_seq OWNER TO postgres;

--
-- Name: content_work_safety_map_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.content_work_safety_map_id_seq OWNED BY public.content_work_safety_map.id;


--
-- Name: daily_attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_attendance (
    id integer NOT NULL,
    user_id integer NOT NULL,
    project_id integer NOT NULL,
    date date NOT NULL,
    check_in_time timestamp without time zone,
    check_out_time timestamp without time zone,
    status character varying
);


ALTER TABLE public.daily_attendance OWNER TO postgres;

--
-- Name: daily_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_attendance_id_seq OWNER TO postgres;

--
-- Name: daily_attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_attendance_id_seq OWNED BY public.daily_attendance.id;


--
-- Name: daily_danger_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_danger_images (
    id integer NOT NULL,
    danger_zone_id integer NOT NULL,
    danger_info_id integer,
    image_url character varying NOT NULL,
    note character varying,
    created_at timestamp without time zone
);


ALTER TABLE public.daily_danger_images OWNER TO postgres;

--
-- Name: COLUMN daily_danger_images.danger_info_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.daily_danger_images.danger_info_id IS '경로 생성을 위한 위험 요소 ID (De-normalization)';


--
-- Name: COLUMN daily_danger_images.image_url; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.daily_danger_images.image_url IS '저장된 파일의 최종 이름 또는 부분 경로';


--
-- Name: COLUMN daily_danger_images.note; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.daily_danger_images.note IS '사진 설명';


--
-- Name: daily_danger_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_danger_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_danger_images_id_seq OWNER TO postgres;

--
-- Name: daily_danger_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_danger_images_id_seq OWNED BY public.daily_danger_images.id;


--
-- Name: daily_danger_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_danger_zones (
    id integer NOT NULL,
    zone_id integer NOT NULL,
    danger_info_id integer,
    date date NOT NULL,
    risk_type character varying,
    description character varying,
    status character varying,
    reporter_id integer
);


ALTER TABLE public.daily_danger_zones OWNER TO postgres;

--
-- Name: COLUMN daily_danger_zones.danger_info_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.daily_danger_zones.danger_info_id IS '위험 요소 템플릿';


--
-- Name: COLUMN daily_danger_zones.risk_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.daily_danger_zones.risk_type IS '커스텀 위험 유형 (danger_info_id 없을 시)';


--
-- Name: COLUMN daily_danger_zones.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.daily_danger_zones.status IS 'PENDING(신고됨), APPROVED(승인됨), DIRECT(관리자직등록)';


--
-- Name: COLUMN daily_danger_zones.reporter_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.daily_danger_zones.reporter_id IS '최초 신고자/등록자';


--
-- Name: daily_danger_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_danger_zones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_danger_zones_id_seq OWNER TO postgres;

--
-- Name: daily_danger_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_danger_zones_id_seq OWNED BY public.daily_danger_zones.id;


--
-- Name: daily_notice_reads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_notice_reads (
    id integer NOT NULL,
    notice_id integer NOT NULL,
    user_id integer NOT NULL,
    read_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.daily_notice_reads OWNER TO postgres;

--
-- Name: daily_notice_reads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_notice_reads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_notice_reads_id_seq OWNER TO postgres;

--
-- Name: daily_notice_reads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_notice_reads_id_seq OWNED BY public.daily_notice_reads.id;


--
-- Name: daily_notices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_notices (
    id integer NOT NULL,
    project_id integer NOT NULL,
    date date NOT NULL,
    title character varying NOT NULL,
    content text NOT NULL,
    notice_type character varying(50),
    notice_role character varying(50),
    created_by integer,
    created_at timestamp without time zone
);


ALTER TABLE public.daily_notices OWNER TO postgres;

--
-- Name: daily_notices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_notices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_notices_id_seq OWNER TO postgres;

--
-- Name: daily_notices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_notices_id_seq OWNED BY public.daily_notices.id;


--
-- Name: daily_safety_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_safety_info (
    id integer NOT NULL,
    date date NOT NULL,
    title character varying NOT NULL,
    content text,
    is_read_by_worker text,
    created_at timestamp without time zone
);


ALTER TABLE public.daily_safety_info OWNER TO postgres;

--
-- Name: COLUMN daily_safety_info.is_read_by_worker; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.daily_safety_info.is_read_by_worker IS '읽은 작업자 ID 목록 (CSV)';


--
-- Name: daily_safety_info_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_safety_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_safety_info_id_seq OWNER TO postgres;

--
-- Name: daily_safety_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_safety_info_id_seq OWNED BY public.daily_safety_info.id;


--
-- Name: daily_safety_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_safety_logs (
    id integer NOT NULL,
    project_id integer NOT NULL,
    user_id integer NOT NULL,
    log_type character varying NOT NULL,
    note text,
    plan_id integer,
    checklist_data json,
    created_at timestamp without time zone
);


ALTER TABLE public.daily_safety_logs OWNER TO postgres;

--
-- Name: COLUMN daily_safety_logs.checklist_data; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.daily_safety_logs.checklist_data IS '체크리스트 상세 내역';


--
-- Name: daily_safety_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_safety_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_safety_logs_id_seq OWNER TO postgres;

--
-- Name: daily_safety_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_safety_logs_id_seq OWNED BY public.daily_safety_logs.id;


--
-- Name: daily_violations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_violations (
    id integer NOT NULL,
    user_id integer NOT NULL,
    project_id integer NOT NULL,
    violation_type character varying NOT NULL,
    description text,
    penalty_point integer,
    created_at timestamp without time zone
);


ALTER TABLE public.daily_violations OWNER TO postgres;

--
-- Name: daily_violations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_violations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_violations_id_seq OWNER TO postgres;

--
-- Name: daily_violations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_violations_id_seq OWNED BY public.daily_violations.id;


--
-- Name: daily_weather; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_weather (
    id integer NOT NULL,
    date date NOT NULL,
    temperature double precision,
    condition character varying
);


ALTER TABLE public.daily_weather OWNER TO postgres;

--
-- Name: daily_weather_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_weather_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_weather_id_seq OWNER TO postgres;

--
-- Name: daily_weather_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_weather_id_seq OWNED BY public.daily_weather.id;


--
-- Name: daily_work_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_work_plans (
    id integer NOT NULL,
    project_id integer NOT NULL,
    zone_id integer NOT NULL,
    work_info_id integer,
    date date NOT NULL,
    description character varying,
    calculated_risk_score integer,
    status character varying,
    created_at timestamp without time zone
);


ALTER TABLE public.daily_work_plans OWNER TO postgres;

--
-- Name: daily_work_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_work_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_work_plans_id_seq OWNER TO postgres;

--
-- Name: daily_work_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_work_plans_id_seq OWNED BY public.daily_work_plans.id;


--
-- Name: daily_worker_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_worker_locations (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    tracking_mode character varying,
    lat double precision,
    lng double precision,
    beacon_id integer,
    rssi integer,
    distance double precision,
    zone_id integer,
    "timestamp" timestamp without time zone
);


ALTER TABLE public.daily_worker_locations OWNER TO postgres;

--
-- Name: COLUMN daily_worker_locations.tracking_mode; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.daily_worker_locations.tracking_mode IS 'GPS, BLE';


--
-- Name: COLUMN daily_worker_locations.beacon_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.daily_worker_locations.beacon_id IS '감지된 비콘 ID';


--
-- Name: COLUMN daily_worker_locations.zone_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.daily_worker_locations.zone_id IS '최종 판별 구역';


--
-- Name: daily_worker_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_worker_locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_worker_locations_id_seq OWNER TO postgres;

--
-- Name: daily_worker_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_worker_locations_id_seq OWNED BY public.daily_worker_locations.id;


--
-- Name: daily_worker_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_worker_users (
    id integer NOT NULL,
    plan_id integer NOT NULL,
    worker_id integer NOT NULL
);


ALTER TABLE public.daily_worker_users OWNER TO postgres;

--
-- Name: daily_worker_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_worker_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_worker_users_id_seq OWNER TO postgres;

--
-- Name: daily_worker_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_worker_users_id_seq OWNED BY public.daily_worker_users.id;


--
-- Name: device_beacons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.device_beacons (
    id integer NOT NULL,
    uuid character varying NOT NULL,
    major integer NOT NULL,
    minor integer NOT NULL,
    zone_id integer,
    description character varying,
    mac_address character varying
);


ALTER TABLE public.device_beacons OWNER TO postgres;

--
-- Name: COLUMN device_beacons.uuid; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.device_beacons.uuid IS '비콘 UUID';


--
-- Name: COLUMN device_beacons.major; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.device_beacons.major IS '그룹 식별자 (Major ID)';


--
-- Name: COLUMN device_beacons.minor; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.device_beacons.minor IS '개별 식별자 (Minor ID)';


--
-- Name: COLUMN device_beacons.zone_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.device_beacons.zone_id IS '설치 구역';


--
-- Name: COLUMN device_beacons.description; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.device_beacons.description IS '상세 위치 설명 (예: 1-C3 기둥)';


--
-- Name: COLUMN device_beacons.mac_address; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.device_beacons.mac_address IS 'MAC 주소 (선택)';


--
-- Name: device_beacons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.device_beacons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.device_beacons_id_seq OWNER TO postgres;

--
-- Name: device_beacons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.device_beacons_id_seq OWNED BY public.device_beacons.id;


--
-- Name: project_companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_companies (
    id integer NOT NULL,
    project_id integer NOT NULL,
    company_id integer NOT NULL,
    role character varying
);


ALTER TABLE public.project_companies OWNER TO postgres;

--
-- Name: project_companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_companies_id_seq OWNER TO postgres;

--
-- Name: project_companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_companies_id_seq OWNED BY public.project_companies.id;


--
-- Name: project_master; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_master (
    id integer NOT NULL,
    name character varying NOT NULL,
    status character varying,
    location_address character varying,
    lat double precision,
    lng double precision,
    grid_cols integer,
    grid_rows integer,
    grid_spacing double precision,
    floors_above integer,
    floors_below integer,
    budget integer,
    description character varying,
    client_company character varying,
    constructor_company character varying,
    start_date date,
    end_date date,
    created_at timestamp without time zone,
    grid_angle double precision DEFAULT 0.0
);


ALTER TABLE public.project_master OWNER TO postgres;

--
-- Name: project_master_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_master_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_master_id_seq OWNER TO postgres;

--
-- Name: project_master_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_master_id_seq OWNED BY public.project_master.id;


--
-- Name: project_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_users (
    id integer NOT NULL,
    project_id integer NOT NULL,
    user_id integer NOT NULL,
    role_name character varying,
    status character varying,
    joined_at timestamp without time zone
);


ALTER TABLE public.project_users OWNER TO postgres;

--
-- Name: project_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_users_id_seq OWNER TO postgres;

--
-- Name: project_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_users_id_seq OWNED BY public.project_users.id;


--
-- Name: project_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_zones (
    id integer NOT NULL,
    project_id integer NOT NULL,
    name character varying NOT NULL,
    level character varying NOT NULL,
    row_index integer,
    col_index integer,
    zone_type character varying,
    lat double precision,
    lng double precision
);


ALTER TABLE public.project_zones OWNER TO postgres;

--
-- Name: project_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_zones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_zones_id_seq OWNER TO postgres;

--
-- Name: project_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_zones_id_seq OWNED BY public.project_zones.id;


--
-- Name: sys_companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sys_companies (
    id integer NOT NULL,
    name character varying NOT NULL,
    type character varying,
    trade_type character varying,
    created_at timestamp without time zone
);


ALTER TABLE public.sys_companies OWNER TO postgres;

--
-- Name: sys_companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sys_companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sys_companies_id_seq OWNER TO postgres;

--
-- Name: sys_companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sys_companies_id_seq OWNED BY public.sys_companies.id;


--
-- Name: sys_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sys_users (
    id integer NOT NULL,
    username character varying,
    hashed_password character varying NOT NULL,
    full_name character varying,
    role character varying,
    job_title character varying,
    company_id integer,
    phone character varying,
    created_at timestamp without time zone
);


ALTER TABLE public.sys_users OWNER TO postgres;

--
-- Name: COLUMN sys_users.job_title; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.sys_users.job_title IS '작업자 직종 (예: 토목공, 목수, 전기공)';


--
-- Name: sys_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sys_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sys_users_id_seq OWNER TO postgres;

--
-- Name: sys_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sys_users_id_seq OWNED BY public.sys_users.id;


--
-- Name: content_accidents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_accidents ALTER COLUMN id SET DEFAULT nextval('public.content_accidents_id_seq'::regclass);


--
-- Name: content_danger_info id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_danger_info ALTER COLUMN id SET DEFAULT nextval('public.content_danger_info_id_seq'::regclass);


--
-- Name: content_safety_gear id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_safety_gear ALTER COLUMN id SET DEFAULT nextval('public.content_safety_gear_id_seq'::regclass);


--
-- Name: content_safety_info id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_safety_info ALTER COLUMN id SET DEFAULT nextval('public.content_safety_info_id_seq'::regclass);


--
-- Name: content_work_gear_map id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_work_gear_map ALTER COLUMN id SET DEFAULT nextval('public.content_work_gear_map_id_seq'::regclass);


--
-- Name: content_work_info id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_work_info ALTER COLUMN id SET DEFAULT nextval('public.content_work_info_id_seq'::regclass);


--
-- Name: content_work_safety_map id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_work_safety_map ALTER COLUMN id SET DEFAULT nextval('public.content_work_safety_map_id_seq'::regclass);


--
-- Name: daily_attendance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_attendance ALTER COLUMN id SET DEFAULT nextval('public.daily_attendance_id_seq'::regclass);


--
-- Name: daily_danger_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_danger_images ALTER COLUMN id SET DEFAULT nextval('public.daily_danger_images_id_seq'::regclass);


--
-- Name: daily_danger_zones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_danger_zones ALTER COLUMN id SET DEFAULT nextval('public.daily_danger_zones_id_seq'::regclass);


--
-- Name: daily_notice_reads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_notice_reads ALTER COLUMN id SET DEFAULT nextval('public.daily_notice_reads_id_seq'::regclass);


--
-- Name: daily_notices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_notices ALTER COLUMN id SET DEFAULT nextval('public.daily_notices_id_seq'::regclass);


--
-- Name: daily_safety_info id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_safety_info ALTER COLUMN id SET DEFAULT nextval('public.daily_safety_info_id_seq'::regclass);


--
-- Name: daily_safety_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_safety_logs ALTER COLUMN id SET DEFAULT nextval('public.daily_safety_logs_id_seq'::regclass);


--
-- Name: daily_violations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_violations ALTER COLUMN id SET DEFAULT nextval('public.daily_violations_id_seq'::regclass);


--
-- Name: daily_weather id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_weather ALTER COLUMN id SET DEFAULT nextval('public.daily_weather_id_seq'::regclass);


--
-- Name: daily_work_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_work_plans ALTER COLUMN id SET DEFAULT nextval('public.daily_work_plans_id_seq'::regclass);


--
-- Name: daily_worker_locations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_worker_locations ALTER COLUMN id SET DEFAULT nextval('public.daily_worker_locations_id_seq'::regclass);


--
-- Name: daily_worker_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_worker_users ALTER COLUMN id SET DEFAULT nextval('public.daily_worker_users_id_seq'::regclass);


--
-- Name: device_beacons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_beacons ALTER COLUMN id SET DEFAULT nextval('public.device_beacons_id_seq'::regclass);


--
-- Name: project_companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_companies ALTER COLUMN id SET DEFAULT nextval('public.project_companies_id_seq'::regclass);


--
-- Name: project_master id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_master ALTER COLUMN id SET DEFAULT nextval('public.project_master_id_seq'::regclass);


--
-- Name: project_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_users ALTER COLUMN id SET DEFAULT nextval('public.project_users_id_seq'::regclass);


--
-- Name: project_zones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_zones ALTER COLUMN id SET DEFAULT nextval('public.project_zones_id_seq'::regclass);


--
-- Name: sys_companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sys_companies ALTER COLUMN id SET DEFAULT nextval('public.sys_companies_id_seq'::regclass);


--
-- Name: sys_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sys_users ALTER COLUMN id SET DEFAULT nextval('public.sys_users_id_seq'::regclass);


--
-- Data for Name: content_accidents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_accidents (id, data_source, external_id, category, title, description, cause, location, occurred_at, summary, embedding, created_at) FROM stdin;
\.


--
-- Data for Name: content_danger_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_danger_info (id, danger_type, icon, color, description, safety_guidelines, risk_level) FROM stdin;
1	굴착 (Excavation)	AlertTriangle	#FF0000	깊은 굴착부 추락 위험	\N	4
2	개구부 (Opening)	Skull	#FF4D4D	슬래브 개구부 추락 위험	\N	4
3	화기 (Fire)	Flame	#FFA500	용접 작업 중 화재 위험	\N	4
\.


--
-- Data for Name: content_safety_gear; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_safety_gear (id, name, type, icon, safety_rules) FROM stdin;
\.


--
-- Data for Name: content_safety_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_safety_info (id, category, title, description, checklist, risk_factors, safety_measures, required_ppe, summary, embedding) FROM stdin;
\.


--
-- Data for Name: content_work_gear_map; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_work_gear_map (id, work_info_id, resource_id) FROM stdin;
\.


--
-- Data for Name: content_work_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_work_info (id, work_type, base_risk_score, checklist_items) FROM stdin;
1	철근조립	30	["안전모", "발판", "결속"]
2	거푸집 설치	40	["동바리", "수평", "추락방지망"]
3	비계 설치	50	["결속력", "난간", "바닥고정"]
4	전기 배선	20	["절연장갑", "차단기", "전선정리"]
\.


--
-- Data for Name: content_work_safety_map; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_work_safety_map (id, work_info_id, safety_info_id) FROM stdin;
\.


--
-- Data for Name: daily_attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_attendance (id, user_id, project_id, date, check_in_time, check_out_time, status) FROM stdin;
1	5	1	2026-02-13	2026-02-13 07:00:00	\N	PRESENT
2	6	1	2026-02-13	2026-02-13 06:32:00	\N	PRESENT
3	8	1	2026-02-13	2026-02-13 06:56:00	\N	PRESENT
4	9	1	2026-02-13	2026-02-13 08:48:00	\N	PRESENT
5	12	1	2026-02-13	2026-02-13 06:48:00	\N	PRESENT
6	14	1	2026-02-13	2026-02-13 08:57:00	\N	PRESENT
7	32	1	2026-02-13	2026-02-13 08:45:00	\N	PRESENT
8	20	1	2026-02-13	2026-02-13 08:03:00	\N	PRESENT
9	21	1	2026-02-13	2026-02-13 08:47:00	\N	PRESENT
10	22	1	2026-02-13	2026-02-13 07:06:00	\N	PRESENT
11	23	1	2026-02-13	2026-02-13 08:19:00	\N	PRESENT
12	24	1	2026-02-13	2026-02-13 08:04:00	\N	PRESENT
13	25	1	2026-02-13	2026-02-13 08:48:00	\N	PRESENT
14	27	1	2026-02-13	2026-02-13 06:55:00	\N	PRESENT
15	39	2	2026-02-13	2026-02-13 15:15:15.793876	\N	IN
\.


--
-- Data for Name: daily_danger_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_danger_images (id, danger_zone_id, danger_info_id, image_url, note, created_at) FROM stdin;
1	1	\N	63_47953b434dcb434a97251c5f5709847d.jpg	굴착 현장 전경	\N
2	1	\N	64_de9e241c775042648face74266581eaf.jpg	굴착 하부 작업구역	\N
3	2	\N	66_6fa95652fcec454495e9ed669dbbe9fe.png	개구부 미조치 방치 현장	\N
4	2	\N	67_39772e2930bf4fb5bca8497b9a3b44b3.jpg	개구부 주변 안전띠 미설치	\N
5	3	1	3_6654fa599c0f4cc1baa316c58e29e988.png	\N	2026-02-13 06:24:55.480409
\.


--
-- Data for Name: daily_danger_zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_danger_zones (id, zone_id, danger_info_id, date, risk_type, description, status, reporter_id) FROM stdin;
1	32	1	2026-02-13	\N	A동 방면 터파기 굴착부 - 추락 주의 및 접근 금지	APPROVED	1
2	38	2	2026-02-13	\N	슬래브 중합 개구부 덮개 불량 및 탈락 위험	APPROVED	1
3	114	1	2026-02-13	굴착 (Excavation)	\N	APPROVED	1
\.


--
-- Data for Name: daily_notice_reads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_notice_reads (id, notice_id, user_id, read_at) FROM stdin;
\.


--
-- Data for Name: daily_notices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_notices (id, project_id, date, title, content, notice_type, notice_role, created_by, created_at) FROM stdin;
1	1	2026-02-13	오후 강풍 주의보 발생	오후 2시부터 강풍이 예상됩니다. 고소 작업 시 안전고리 체결을 철저히 하고 자재 비산에 주의하십시오.	EMERGENCY	\N	1	\N
2	1	2026-02-13	현장 정리정돈 및 통로 확보	금일 작업 종료 후 통로 내 적재된 자재를 정리하여 안전 통로를 확보해주시기 바랍니다.	NORMAL	\N	1	\N
\.


--
-- Data for Name: daily_safety_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_safety_info (id, date, title, content, is_read_by_worker, created_at) FROM stdin;
\.


--
-- Data for Name: daily_safety_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_safety_logs (id, project_id, user_id, log_type, note, plan_id, checklist_data, created_at) FROM stdin;
1	1	5	TBM	작업 전 안전점검 완료	\N	\N	2026-02-13 07:18:00
2	1	6	TBM	작업 전 안전점검 완료	\N	\N	2026-02-13 06:42:00
3	1	8	TBM	작업 전 안전점검 완료	\N	\N	2026-02-13 07:08:00
4	1	9	TBM	작업 전 안전점검 완료	\N	\N	2026-02-13 09:03:00
5	1	12	TBM	작업 전 안전점검 완료	\N	\N	2026-02-13 07:04:00
6	1	14	TBM	작업 전 안전점검 완료	\N	\N	2026-02-13 09:06:00
7	1	32	TBM	작업 전 안전점검 완료	\N	\N	2026-02-13 09:01:00
8	1	21	TBM	작업 전 안전점검 완료	\N	\N	2026-02-13 09:01:00
9	1	22	TBM	작업 전 안전점검 완료	\N	\N	2026-02-13 07:21:00
10	1	23	TBM	작업 전 안전점검 완료	\N	\N	2026-02-13 08:32:00
11	1	24	TBM	작업 전 안전점검 완료	\N	\N	2026-02-13 08:19:00
12	1	25	TBM	작업 전 안전점검 완료	\N	\N	2026-02-13 09:00:00
13	1	27	TBM	작업 전 안전점검 완료	\N	\N	2026-02-13 07:12:00
\.


--
-- Data for Name: daily_violations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_violations (id, user_id, project_id, violation_type, description, penalty_point, created_at) FROM stdin;
\.


--
-- Data for Name: daily_weather; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_weather (id, date, temperature, condition) FROM stdin;
\.


--
-- Data for Name: daily_work_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_work_plans (id, project_id, zone_id, work_info_id, date, description, calculated_risk_score, status, created_at) FROM stdin;
1	1	26	1	2026-02-13	1F-A1 구역 기둥 철근 배근	\N	IN_PROGRESS	\N
2	1	32	2	2026-02-13	1F-B2 구역 보 거푸집 조립	\N	IN_PROGRESS	\N
3	1	38	4	2026-02-13	1F-C3 구역 1층 메인 배선	\N	IN_PROGRESS	\N
4	2	110	1	2026-02-13	잠실 1층 A1 철근 작업	\N	IN_PROGRESS	\N
5	2	114	1	2026-02-13	잠실 1층 B2 거푸집 작업	\N	IN_PROGRESS	\N
6	2	112	2	2026-02-13		50	PLANNED	\N
\.


--
-- Data for Name: daily_worker_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_worker_locations (id, worker_id, tracking_mode, lat, lng, beacon_id, rssi, distance, zone_id, "timestamp") FROM stdin;
\.


--
-- Data for Name: daily_worker_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_worker_users (id, plan_id, worker_id) FROM stdin;
1	1	32
2	4	39
3	5	40
4	6	39
\.


--
-- Data for Name: device_beacons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.device_beacons (id, uuid, major, minor, zone_id, description, mac_address) FROM stdin;
\.


--
-- Data for Name: project_companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_companies (id, project_id, company_id, role) FROM stdin;
1	1	1	CLIENT
2	1	2	CONSTRUCTOR
3	1	3	PARTNER
4	1	4	PARTNER
5	2	5	CLIENT
6	2	6	CONSTRUCTOR
7	2	7	PARTNER
\.


--
-- Data for Name: project_master; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_master (id, name, status, location_address, lat, lng, grid_cols, grid_rows, grid_spacing, floors_above, floors_below, budget, description, client_company, constructor_company, start_date, end_date, created_at, grid_angle) FROM stdin;
1	건설안전 가산디지털 현장	ACTIVE	\N	37.4771284614306	126.88371237542226	5	5	10	3	1	\N	\N	\N	\N	\N	\N	\N	109
2	잠실 스마트 시큐리티 타워	ACTIVE	\N	37.5133	127.1001	3	3	10	2	1	\N	\N	\N	\N	\N	\N	\N	15
\.


--
-- Data for Name: project_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_users (id, project_id, user_id, role_name, status, joined_at) FROM stdin;
1	1	1	admin	ACTIVE	\N
2	1	2	manager	ACTIVE	\N
3	1	3	safety_manager	ACTIVE	\N
4	1	4	client	ACTIVE	\N
5	1	5	worker	ACTIVE	\N
6	1	6	worker	ACTIVE	\N
7	1	7	worker	ACTIVE	\N
8	1	8	worker	ACTIVE	\N
9	1	9	worker	ACTIVE	\N
10	1	10	worker	ACTIVE	\N
11	1	11	worker	ACTIVE	\N
12	1	12	worker	ACTIVE	\N
13	1	13	worker	ACTIVE	\N
14	1	14	worker	ACTIVE	\N
15	1	32	worker	ACTIVE	\N
16	1	20	worker	ACTIVE	\N
17	1	21	worker	ACTIVE	\N
18	1	22	worker	ACTIVE	\N
19	1	23	worker	ACTIVE	\N
20	1	24	worker	ACTIVE	\N
21	1	25	worker	ACTIVE	\N
22	1	26	worker	ACTIVE	\N
23	1	27	worker	ACTIVE	\N
24	1	15	worker	PENDING	\N
25	1	16	worker	PENDING	\N
26	1	17	worker	PENDING	\N
27	1	18	worker	PENDING	\N
28	1	19	worker	PENDING	\N
29	1	28	worker	PENDING	\N
30	1	29	worker	PENDING	\N
31	1	30	worker	PENDING	\N
32	1	31	worker	PENDING	\N
33	1	33	worker	PENDING	\N
34	1	34	worker	PENDING	\N
35	1	35	worker	PENDING	\N
36	1	36	worker	PENDING	\N
37	1	37	worker	PENDING	\N
38	2	38	manager	ACTIVE	\N
39	2	39	worker	ACTIVE	\N
40	2	40	worker	ACTIVE	\N
\.


--
-- Data for Name: project_zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_zones (id, project_id, name, level, row_index, col_index, zone_type, lat, lng) FROM stdin;
1	1	B1-A1	B1	0	0	\N	\N	\N
2	1	B1-A2	B1	0	1	\N	\N	\N
3	1	B1-A3	B1	0	2	\N	\N	\N
4	1	B1-A4	B1	0	3	\N	\N	\N
5	1	B1-A5	B1	0	4	\N	\N	\N
6	1	B1-B1	B1	1	0	\N	\N	\N
7	1	B1-B2	B1	1	1	\N	\N	\N
8	1	B1-B3	B1	1	2	\N	\N	\N
9	1	B1-B4	B1	1	3	\N	\N	\N
10	1	B1-B5	B1	1	4	\N	\N	\N
11	1	B1-C1	B1	2	0	\N	\N	\N
12	1	B1-C2	B1	2	1	\N	\N	\N
13	1	B1-C3	B1	2	2	\N	\N	\N
14	1	B1-C4	B1	2	3	\N	\N	\N
15	1	B1-C5	B1	2	4	\N	\N	\N
16	1	B1-D1	B1	3	0	\N	\N	\N
17	1	B1-D2	B1	3	1	\N	\N	\N
18	1	B1-D3	B1	3	2	\N	\N	\N
19	1	B1-D4	B1	3	3	\N	\N	\N
20	1	B1-D5	B1	3	4	\N	\N	\N
21	1	B1-E1	B1	4	0	\N	\N	\N
22	1	B1-E2	B1	4	1	\N	\N	\N
23	1	B1-E3	B1	4	2	\N	\N	\N
24	1	B1-E4	B1	4	3	\N	\N	\N
25	1	B1-E5	B1	4	4	\N	\N	\N
26	1	1F-A1	1F	0	0	\N	\N	\N
27	1	1F-A2	1F	0	1	\N	\N	\N
28	1	1F-A3	1F	0	2	\N	\N	\N
29	1	1F-A4	1F	0	3	\N	\N	\N
30	1	1F-A5	1F	0	4	\N	\N	\N
31	1	1F-B1	1F	1	0	\N	\N	\N
32	1	1F-B2	1F	1	1	\N	\N	\N
33	1	1F-B3	1F	1	2	\N	\N	\N
34	1	1F-B4	1F	1	3	\N	\N	\N
35	1	1F-B5	1F	1	4	\N	\N	\N
36	1	1F-C1	1F	2	0	\N	\N	\N
37	1	1F-C2	1F	2	1	\N	\N	\N
38	1	1F-C3	1F	2	2	\N	\N	\N
39	1	1F-C4	1F	2	3	\N	\N	\N
40	1	1F-C5	1F	2	4	\N	\N	\N
41	1	1F-D1	1F	3	0	\N	\N	\N
42	1	1F-D2	1F	3	1	\N	\N	\N
43	1	1F-D3	1F	3	2	\N	\N	\N
44	1	1F-D4	1F	3	3	\N	\N	\N
45	1	1F-D5	1F	3	4	\N	\N	\N
46	1	1F-E1	1F	4	0	\N	\N	\N
47	1	1F-E2	1F	4	1	\N	\N	\N
48	1	1F-E3	1F	4	2	\N	\N	\N
49	1	1F-E4	1F	4	3	\N	\N	\N
50	1	1F-E5	1F	4	4	\N	\N	\N
51	1	2F-A1	2F	0	0	\N	\N	\N
52	1	2F-A2	2F	0	1	\N	\N	\N
53	1	2F-A3	2F	0	2	\N	\N	\N
54	1	2F-A4	2F	0	3	\N	\N	\N
55	1	2F-A5	2F	0	4	\N	\N	\N
56	1	2F-B1	2F	1	0	\N	\N	\N
57	1	2F-B2	2F	1	1	\N	\N	\N
58	1	2F-B3	2F	1	2	\N	\N	\N
59	1	2F-B4	2F	1	3	\N	\N	\N
60	1	2F-B5	2F	1	4	\N	\N	\N
61	1	2F-C1	2F	2	0	\N	\N	\N
62	1	2F-C2	2F	2	1	\N	\N	\N
63	1	2F-C3	2F	2	2	\N	\N	\N
64	1	2F-C4	2F	2	3	\N	\N	\N
65	1	2F-C5	2F	2	4	\N	\N	\N
66	1	2F-D1	2F	3	0	\N	\N	\N
67	1	2F-D2	2F	3	1	\N	\N	\N
68	1	2F-D3	2F	3	2	\N	\N	\N
69	1	2F-D4	2F	3	3	\N	\N	\N
70	1	2F-D5	2F	3	4	\N	\N	\N
71	1	2F-E1	2F	4	0	\N	\N	\N
72	1	2F-E2	2F	4	1	\N	\N	\N
73	1	2F-E3	2F	4	2	\N	\N	\N
74	1	2F-E4	2F	4	3	\N	\N	\N
75	1	2F-E5	2F	4	4	\N	\N	\N
76	1	3F-A1	3F	0	0	\N	\N	\N
77	1	3F-A2	3F	0	1	\N	\N	\N
78	1	3F-A3	3F	0	2	\N	\N	\N
79	1	3F-A4	3F	0	3	\N	\N	\N
80	1	3F-A5	3F	0	4	\N	\N	\N
81	1	3F-B1	3F	1	0	\N	\N	\N
82	1	3F-B2	3F	1	1	\N	\N	\N
83	1	3F-B3	3F	1	2	\N	\N	\N
84	1	3F-B4	3F	1	3	\N	\N	\N
85	1	3F-B5	3F	1	4	\N	\N	\N
86	1	3F-C1	3F	2	0	\N	\N	\N
87	1	3F-C2	3F	2	1	\N	\N	\N
88	1	3F-C3	3F	2	2	\N	\N	\N
89	1	3F-C4	3F	2	3	\N	\N	\N
90	1	3F-C5	3F	2	4	\N	\N	\N
91	1	3F-D1	3F	3	0	\N	\N	\N
92	1	3F-D2	3F	3	1	\N	\N	\N
93	1	3F-D3	3F	3	2	\N	\N	\N
94	1	3F-D4	3F	3	3	\N	\N	\N
95	1	3F-D5	3F	3	4	\N	\N	\N
96	1	3F-E1	3F	4	0	\N	\N	\N
97	1	3F-E2	3F	4	1	\N	\N	\N
98	1	3F-E3	3F	4	2	\N	\N	\N
99	1	3F-E4	3F	4	3	\N	\N	\N
100	1	3F-E5	3F	4	4	\N	\N	\N
101	2	B1-A1	B1	0	0	\N	\N	\N
102	2	B1-A2	B1	0	1	\N	\N	\N
103	2	B1-A3	B1	0	2	\N	\N	\N
104	2	B1-B1	B1	1	0	\N	\N	\N
105	2	B1-B2	B1	1	1	\N	\N	\N
106	2	B1-B3	B1	1	2	\N	\N	\N
107	2	B1-C1	B1	2	0	\N	\N	\N
108	2	B1-C2	B1	2	1	\N	\N	\N
109	2	B1-C3	B1	2	2	\N	\N	\N
110	2	1F-A1	1F	0	0	\N	\N	\N
111	2	1F-A2	1F	0	1	\N	\N	\N
112	2	1F-A3	1F	0	2	\N	\N	\N
113	2	1F-B1	1F	1	0	\N	\N	\N
114	2	1F-B2	1F	1	1	\N	\N	\N
115	2	1F-B3	1F	1	2	\N	\N	\N
116	2	1F-C1	1F	2	0	\N	\N	\N
117	2	1F-C2	1F	2	1	\N	\N	\N
118	2	1F-C3	1F	2	2	\N	\N	\N
119	2	2F-A1	2F	0	0	\N	\N	\N
120	2	2F-A2	2F	0	1	\N	\N	\N
121	2	2F-A3	2F	0	2	\N	\N	\N
122	2	2F-B1	2F	1	0	\N	\N	\N
123	2	2F-B2	2F	1	1	\N	\N	\N
124	2	2F-B3	2F	1	2	\N	\N	\N
125	2	2F-C1	2F	2	0	\N	\N	\N
126	2	2F-C2	2F	2	1	\N	\N	\N
127	2	2F-C3	2F	2	2	\N	\N	\N
\.


--
-- Data for Name: sys_companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sys_companies (id, name, type, trade_type, created_at) FROM stdin;
1	서울도시공사	CLIENT	공공기관/발주처	\N
2	스마트종합건설	CONSTRUCTOR	종합건설	\N
3	강철토공	PARTNER	토공/철근콘크리트	\N
4	번개전기	PARTNER	전기/소방	\N
5	잠실도시공사	CLIENT	공공기관/발주처	\N
6	롯데건설	CONSTRUCTOR	종합건설	\N
7	잠실철강	PARTNER	철근콘크리트	\N
\.


--
-- Data for Name: sys_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sys_users (id, username, hashed_password, full_name, role, job_title, company_id, phone, created_at) FROM stdin;
1	a	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	관리자	admin	시스템관리자	2	\N	\N
2	m	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	이소장	manager	현장소장	2	\N	\N
3	sm	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	김안전	safety_manager	안전관리자	2	\N	\N
4	client_user	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	박발주	client	감독관	1	\N	\N
5	p1_w_1	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	강철_1	worker	형틀공	3	\N	\N
6	p1_w_2	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	강철_2	worker	형틀공	3	\N	\N
7	p1_w_3	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	강철_3	worker	형틀공	3	\N	\N
8	p1_w_4	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	강철_4	worker	형틀공	3	\N	\N
9	p1_w_5	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	강철_5	worker	형틀공	3	\N	\N
10	p1_w_6	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	강철_6	worker	형틀공	3	\N	\N
11	p1_w_7	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	강철_7	worker	형틀공	3	\N	\N
12	p1_w_8	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	강철_8	worker	형틀공	3	\N	\N
13	p1_w_9	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	강철_9	worker	형틀공	3	\N	\N
14	p1_w_10	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	강철_10	worker	형틀공	3	\N	\N
15	p1_w_11	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	강철_11	worker	형틀공	3	\N	\N
16	p1_w_12	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	강철_12	worker	형틀공	3	\N	\N
17	p1_w_13	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	강철_13	worker	형틀공	3	\N	\N
18	p1_w_14	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	강철_14	worker	형틀공	3	\N	\N
19	p1_w_15	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	강철_15	worker	형틀공	3	\N	\N
20	p2_w_1	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	번개_1	worker	전기공	4	\N	\N
21	p2_w_2	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	번개_2	worker	전기공	4	\N	\N
22	p2_w_3	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	번개_3	worker	전기공	4	\N	\N
23	p2_w_4	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	번개_4	worker	전기공	4	\N	\N
24	p2_w_5	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	번개_5	worker	전기공	4	\N	\N
25	p2_w_6	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	번개_6	worker	전기공	4	\N	\N
26	p2_w_7	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	번개_7	worker	전기공	4	\N	\N
27	p2_w_8	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	번개_8	worker	전기공	4	\N	\N
28	p2_w_9	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	번개_9	worker	전기공	4	\N	\N
29	p2_w_10	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	번개_10	worker	전기공	4	\N	\N
30	p2_w_11	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	번개_11	worker	전기공	4	\N	\N
31	p2_w_12	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	번개_12	worker	전기공	4	\N	\N
32	w	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	박팀장	worker	팀장	3	\N	\N
33	pending_1	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	대기자_1	worker	미지정	3	\N	\N
34	pending_2	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	대기자_2	worker	미지정	3	\N	\N
35	pending_3	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	대기자_3	worker	미지정	3	\N	\N
36	pending_4	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	대기자_4	worker	미지정	3	\N	\N
37	pending_5	$2b$12$E22ryMdOlNllRVnW8AW2de.YlDwDApPrj1kSxnaAVBHXdhtIg13gW	대기자_5	worker	미지정	3	\N	\N
38	m1	$2b$12$Q4RQjHs14kNb/samth4NwOmXrrV/a5xvfHz1bPPj6T7hvDrFxZWgW	잠실 이소장	manager	현장소장	6	\N	\N
39	w1	$2b$12$Q4RQjHs14kNb/samth4NwOmXrrV/a5xvfHz1bPPj6T7hvDrFxZWgW	잠실 박팀장	worker	팀장	7	\N	\N
40	sys_user	$2b$12$Q4RQjHs14kNb/samth4NwOmXrrV/a5xvfHz1bPPj6T7hvDrFxZWgW	시스템사용자	worker	기능공	7	\N	\N
\.


--
-- Name: content_accidents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_accidents_id_seq', 1, false);


--
-- Name: content_danger_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_danger_info_id_seq', 3, true);


--
-- Name: content_safety_gear_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_safety_gear_id_seq', 1, false);


--
-- Name: content_safety_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_safety_info_id_seq', 1, false);


--
-- Name: content_work_gear_map_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_work_gear_map_id_seq', 1, false);


--
-- Name: content_work_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_work_info_id_seq', 4, true);


--
-- Name: content_work_safety_map_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_work_safety_map_id_seq', 1, false);


--
-- Name: daily_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_attendance_id_seq', 15, true);


--
-- Name: daily_danger_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_danger_images_id_seq', 5, true);


--
-- Name: daily_danger_zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_danger_zones_id_seq', 3, true);


--
-- Name: daily_notice_reads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_notice_reads_id_seq', 1, false);


--
-- Name: daily_notices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_notices_id_seq', 2, true);


--
-- Name: daily_safety_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_safety_info_id_seq', 1, false);


--
-- Name: daily_safety_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_safety_logs_id_seq', 13, true);


--
-- Name: daily_violations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_violations_id_seq', 1, false);


--
-- Name: daily_weather_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_weather_id_seq', 1, false);


--
-- Name: daily_work_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_work_plans_id_seq', 6, true);


--
-- Name: daily_worker_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_worker_locations_id_seq', 1, false);


--
-- Name: daily_worker_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_worker_users_id_seq', 4, true);


--
-- Name: device_beacons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.device_beacons_id_seq', 1, false);


--
-- Name: project_companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_companies_id_seq', 7, true);


--
-- Name: project_master_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_master_id_seq', 2, true);


--
-- Name: project_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_users_id_seq', 40, true);


--
-- Name: project_zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_zones_id_seq', 127, true);


--
-- Name: sys_companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sys_companies_id_seq', 7, true);


--
-- Name: sys_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sys_users_id_seq', 40, true);


--
-- Name: content_accidents content_accidents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_accidents
    ADD CONSTRAINT content_accidents_pkey PRIMARY KEY (id);


--
-- Name: content_danger_info content_danger_info_danger_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_danger_info
    ADD CONSTRAINT content_danger_info_danger_type_key UNIQUE (danger_type);


--
-- Name: content_danger_info content_danger_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_danger_info
    ADD CONSTRAINT content_danger_info_pkey PRIMARY KEY (id);


--
-- Name: content_safety_gear content_safety_gear_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_safety_gear
    ADD CONSTRAINT content_safety_gear_pkey PRIMARY KEY (id);


--
-- Name: content_safety_info content_safety_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_safety_info
    ADD CONSTRAINT content_safety_info_pkey PRIMARY KEY (id);


--
-- Name: content_work_gear_map content_work_gear_map_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_work_gear_map
    ADD CONSTRAINT content_work_gear_map_pkey PRIMARY KEY (id);


--
-- Name: content_work_info content_work_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_work_info
    ADD CONSTRAINT content_work_info_pkey PRIMARY KEY (id);


--
-- Name: content_work_info content_work_info_work_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_work_info
    ADD CONSTRAINT content_work_info_work_type_key UNIQUE (work_type);


--
-- Name: content_work_safety_map content_work_safety_map_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_work_safety_map
    ADD CONSTRAINT content_work_safety_map_pkey PRIMARY KEY (id);


--
-- Name: daily_attendance daily_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_attendance
    ADD CONSTRAINT daily_attendance_pkey PRIMARY KEY (id);


--
-- Name: daily_danger_images daily_danger_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_danger_images
    ADD CONSTRAINT daily_danger_images_pkey PRIMARY KEY (id);


--
-- Name: daily_danger_zones daily_danger_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_danger_zones
    ADD CONSTRAINT daily_danger_zones_pkey PRIMARY KEY (id);


--
-- Name: daily_notice_reads daily_notice_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_notice_reads
    ADD CONSTRAINT daily_notice_reads_pkey PRIMARY KEY (id);


--
-- Name: daily_notices daily_notices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_notices
    ADD CONSTRAINT daily_notices_pkey PRIMARY KEY (id);


--
-- Name: daily_safety_info daily_safety_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_safety_info
    ADD CONSTRAINT daily_safety_info_pkey PRIMARY KEY (id);


--
-- Name: daily_safety_logs daily_safety_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_safety_logs
    ADD CONSTRAINT daily_safety_logs_pkey PRIMARY KEY (id);


--
-- Name: daily_violations daily_violations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_violations
    ADD CONSTRAINT daily_violations_pkey PRIMARY KEY (id);


--
-- Name: daily_weather daily_weather_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_weather
    ADD CONSTRAINT daily_weather_date_key UNIQUE (date);


--
-- Name: daily_weather daily_weather_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_weather
    ADD CONSTRAINT daily_weather_pkey PRIMARY KEY (id);


--
-- Name: daily_work_plans daily_work_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_work_plans
    ADD CONSTRAINT daily_work_plans_pkey PRIMARY KEY (id);


--
-- Name: daily_worker_locations daily_worker_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_worker_locations
    ADD CONSTRAINT daily_worker_locations_pkey PRIMARY KEY (id);


--
-- Name: daily_worker_users daily_worker_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_worker_users
    ADD CONSTRAINT daily_worker_users_pkey PRIMARY KEY (id);


--
-- Name: device_beacons device_beacons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_beacons
    ADD CONSTRAINT device_beacons_pkey PRIMARY KEY (id);


--
-- Name: project_companies project_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_companies
    ADD CONSTRAINT project_companies_pkey PRIMARY KEY (id);


--
-- Name: project_master project_master_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_master
    ADD CONSTRAINT project_master_pkey PRIMARY KEY (id);


--
-- Name: project_users project_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_pkey PRIMARY KEY (id);


--
-- Name: project_zones project_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_zones
    ADD CONSTRAINT project_zones_pkey PRIMARY KEY (id);


--
-- Name: sys_companies sys_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sys_companies
    ADD CONSTRAINT sys_companies_pkey PRIMARY KEY (id);


--
-- Name: sys_users sys_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sys_users
    ADD CONSTRAINT sys_users_pkey PRIMARY KEY (id);


--
-- Name: content_work_gear_map uq_content_gear; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_work_gear_map
    ADD CONSTRAINT uq_content_gear UNIQUE (work_info_id, resource_id);


--
-- Name: ix_content_accidents_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_content_accidents_category ON public.content_accidents USING btree (category);


--
-- Name: ix_content_accidents_external_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_content_accidents_external_id ON public.content_accidents USING btree (external_id);


--
-- Name: ix_content_accidents_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_content_accidents_id ON public.content_accidents USING btree (id);


--
-- Name: ix_content_danger_info_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_content_danger_info_id ON public.content_danger_info USING btree (id);


--
-- Name: ix_content_safety_gear_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_content_safety_gear_id ON public.content_safety_gear USING btree (id);


--
-- Name: ix_content_safety_info_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_content_safety_info_id ON public.content_safety_info USING btree (id);


--
-- Name: ix_content_work_gear_map_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_content_work_gear_map_id ON public.content_work_gear_map USING btree (id);


--
-- Name: ix_content_work_info_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_content_work_info_id ON public.content_work_info USING btree (id);


--
-- Name: ix_content_work_safety_map_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_content_work_safety_map_id ON public.content_work_safety_map USING btree (id);


--
-- Name: ix_daily_attendance_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_daily_attendance_date ON public.daily_attendance USING btree (date);


--
-- Name: ix_daily_attendance_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_daily_attendance_id ON public.daily_attendance USING btree (id);


--
-- Name: ix_daily_danger_images_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_daily_danger_images_id ON public.daily_danger_images USING btree (id);


--
-- Name: ix_daily_danger_zones_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_daily_danger_zones_id ON public.daily_danger_zones USING btree (id);


--
-- Name: ix_daily_notice_reads_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_daily_notice_reads_id ON public.daily_notice_reads USING btree (id);


--
-- Name: ix_daily_notices_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_daily_notices_date ON public.daily_notices USING btree (date);


--
-- Name: ix_daily_notices_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_daily_notices_id ON public.daily_notices USING btree (id);


--
-- Name: ix_daily_safety_info_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_daily_safety_info_date ON public.daily_safety_info USING btree (date);


--
-- Name: ix_daily_safety_info_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_daily_safety_info_id ON public.daily_safety_info USING btree (id);


--
-- Name: ix_daily_safety_logs_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_daily_safety_logs_id ON public.daily_safety_logs USING btree (id);


--
-- Name: ix_daily_violations_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_daily_violations_id ON public.daily_violations USING btree (id);


--
-- Name: ix_daily_weather_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_daily_weather_id ON public.daily_weather USING btree (id);


--
-- Name: ix_daily_work_plans_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_daily_work_plans_date ON public.daily_work_plans USING btree (date);


--
-- Name: ix_daily_work_plans_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_daily_work_plans_id ON public.daily_work_plans USING btree (id);


--
-- Name: ix_daily_worker_locations_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_daily_worker_locations_id ON public.daily_worker_locations USING btree (id);


--
-- Name: ix_daily_worker_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_daily_worker_users_id ON public.daily_worker_users USING btree (id);


--
-- Name: ix_device_beacons_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_device_beacons_id ON public.device_beacons USING btree (id);


--
-- Name: ix_device_beacons_uuid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_device_beacons_uuid ON public.device_beacons USING btree (uuid);


--
-- Name: ix_project_companies_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_project_companies_id ON public.project_companies USING btree (id);


--
-- Name: ix_project_master_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_project_master_id ON public.project_master USING btree (id);


--
-- Name: ix_project_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_project_users_id ON public.project_users USING btree (id);


--
-- Name: ix_project_zones_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_project_zones_id ON public.project_zones USING btree (id);


--
-- Name: ix_sys_companies_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sys_companies_id ON public.sys_companies USING btree (id);


--
-- Name: ix_sys_companies_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sys_companies_name ON public.sys_companies USING btree (name);


--
-- Name: ix_sys_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sys_users_id ON public.sys_users USING btree (id);


--
-- Name: ix_sys_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_sys_users_username ON public.sys_users USING btree (username);


--
-- Name: content_work_gear_map content_work_gear_map_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_work_gear_map
    ADD CONSTRAINT content_work_gear_map_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.content_safety_gear(id) ON DELETE CASCADE;


--
-- Name: content_work_gear_map content_work_gear_map_work_info_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_work_gear_map
    ADD CONSTRAINT content_work_gear_map_work_info_id_fkey FOREIGN KEY (work_info_id) REFERENCES public.content_work_info(id) ON DELETE CASCADE;


--
-- Name: content_work_safety_map content_work_safety_map_safety_info_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_work_safety_map
    ADD CONSTRAINT content_work_safety_map_safety_info_id_fkey FOREIGN KEY (safety_info_id) REFERENCES public.content_safety_info(id) ON DELETE CASCADE;


--
-- Name: content_work_safety_map content_work_safety_map_work_info_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_work_safety_map
    ADD CONSTRAINT content_work_safety_map_work_info_id_fkey FOREIGN KEY (work_info_id) REFERENCES public.content_work_info(id) ON DELETE CASCADE;


--
-- Name: daily_attendance daily_attendance_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_attendance
    ADD CONSTRAINT daily_attendance_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_master(id) ON DELETE CASCADE;


--
-- Name: daily_attendance daily_attendance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_attendance
    ADD CONSTRAINT daily_attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.sys_users(id) ON DELETE CASCADE;


--
-- Name: daily_danger_images daily_danger_images_danger_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_danger_images
    ADD CONSTRAINT daily_danger_images_danger_zone_id_fkey FOREIGN KEY (danger_zone_id) REFERENCES public.daily_danger_zones(id) ON DELETE CASCADE;


--
-- Name: daily_danger_zones daily_danger_zones_danger_info_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_danger_zones
    ADD CONSTRAINT daily_danger_zones_danger_info_id_fkey FOREIGN KEY (danger_info_id) REFERENCES public.content_danger_info(id) ON DELETE SET NULL;


--
-- Name: daily_danger_zones daily_danger_zones_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_danger_zones
    ADD CONSTRAINT daily_danger_zones_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.sys_users(id) ON DELETE SET NULL;


--
-- Name: daily_danger_zones daily_danger_zones_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_danger_zones
    ADD CONSTRAINT daily_danger_zones_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.project_zones(id) ON DELETE CASCADE;


--
-- Name: daily_notice_reads daily_notice_reads_notice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_notice_reads
    ADD CONSTRAINT daily_notice_reads_notice_id_fkey FOREIGN KEY (notice_id) REFERENCES public.daily_notices(id) ON DELETE CASCADE;


--
-- Name: daily_notice_reads daily_notice_reads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_notice_reads
    ADD CONSTRAINT daily_notice_reads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.sys_users(id) ON DELETE CASCADE;


--
-- Name: daily_notices daily_notices_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_notices
    ADD CONSTRAINT daily_notices_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_master(id) ON DELETE CASCADE;


--
-- Name: daily_safety_logs daily_safety_logs_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_safety_logs
    ADD CONSTRAINT daily_safety_logs_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.daily_work_plans(id) ON DELETE SET NULL;


--
-- Name: daily_safety_logs daily_safety_logs_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_safety_logs
    ADD CONSTRAINT daily_safety_logs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_master(id) ON DELETE CASCADE;


--
-- Name: daily_safety_logs daily_safety_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_safety_logs
    ADD CONSTRAINT daily_safety_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.sys_users(id) ON DELETE CASCADE;


--
-- Name: daily_violations daily_violations_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_violations
    ADD CONSTRAINT daily_violations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_master(id);


--
-- Name: daily_violations daily_violations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_violations
    ADD CONSTRAINT daily_violations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.sys_users(id);


--
-- Name: daily_work_plans daily_work_plans_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_work_plans
    ADD CONSTRAINT daily_work_plans_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_master(id) ON DELETE CASCADE;


--
-- Name: daily_work_plans daily_work_plans_work_info_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_work_plans
    ADD CONSTRAINT daily_work_plans_work_info_id_fkey FOREIGN KEY (work_info_id) REFERENCES public.content_work_info(id) ON DELETE SET NULL;


--
-- Name: daily_work_plans daily_work_plans_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_work_plans
    ADD CONSTRAINT daily_work_plans_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.project_zones(id) ON DELETE CASCADE;


--
-- Name: daily_worker_locations daily_worker_locations_beacon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_worker_locations
    ADD CONSTRAINT daily_worker_locations_beacon_id_fkey FOREIGN KEY (beacon_id) REFERENCES public.device_beacons(id);


--
-- Name: daily_worker_locations daily_worker_locations_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_worker_locations
    ADD CONSTRAINT daily_worker_locations_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.sys_users(id);


--
-- Name: daily_worker_locations daily_worker_locations_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_worker_locations
    ADD CONSTRAINT daily_worker_locations_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.project_zones(id) ON DELETE SET NULL;


--
-- Name: daily_worker_users daily_worker_users_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_worker_users
    ADD CONSTRAINT daily_worker_users_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.daily_work_plans(id) ON DELETE CASCADE;


--
-- Name: daily_worker_users daily_worker_users_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_worker_users
    ADD CONSTRAINT daily_worker_users_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.sys_users(id) ON DELETE CASCADE;


--
-- Name: device_beacons device_beacons_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_beacons
    ADD CONSTRAINT device_beacons_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.project_zones(id) ON DELETE SET NULL;


--
-- Name: project_companies project_companies_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_companies
    ADD CONSTRAINT project_companies_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.sys_companies(id) ON DELETE CASCADE;


--
-- Name: project_companies project_companies_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_companies
    ADD CONSTRAINT project_companies_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_master(id) ON DELETE CASCADE;


--
-- Name: project_users project_users_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_master(id) ON DELETE CASCADE;


--
-- Name: project_users project_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.sys_users(id) ON DELETE CASCADE;


--
-- Name: project_zones project_zones_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_zones
    ADD CONSTRAINT project_zones_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_master(id) ON DELETE CASCADE;


--
-- Name: sys_users sys_users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sys_users
    ADD CONSTRAINT sys_users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.sys_companies(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict qxiIbRv60ZewdzXgTKtsRSBrL7eXOSHpQZKUklpKOfuwZtoQMNYIQEU4Oda2gPU

