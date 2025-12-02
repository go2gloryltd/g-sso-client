--
-- PostgreSQL database dump
--

\restrict EfRNibBEvseAfRfquAX3Y9juf14M5lj8TA9WDc5ZK1qAcfA8ekD3gYtQ977fFVt

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-11-28 16:12:14

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 32818)
-- Name: authentications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentications (
    id integer NOT NULL,
    user_wallet_address character varying(42) NOT NULL,
    user_id integer,
    client_id character varying(255) NOT NULL,
    client_domain character varying(255),
    status character varying(20) NOT NULL,
    failure_reason character varying(100),
    response_time_ms integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    nonce_hash character varying(66),
    signature_hash character varying(66),
    user_agent text,
    ip_address character varying(64),
    metadata jsonb,
    chain_type character varying(20) DEFAULT 'ethereum'::character varying,
    CONSTRAINT check_chain_type_auth CHECK (((chain_type)::text = ANY ((ARRAY['ethereum'::character varying, 'solana'::character varying, 'bitcoin'::character varying, 'polkadot'::character varying, 'cardano'::character varying])::text[])))
);


ALTER TABLE public.authentications OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 32817)
-- Name: authentications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.authentications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.authentications_id_seq OWNER TO postgres;

--
-- TOC entry 4960 (class 0 OID 0)
-- Dependencies: 217
-- Name: authentications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.authentications_id_seq OWNED BY public.authentications.id;


--
-- TOC entry 224 (class 1259 OID 32876)
-- Name: blockchain_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blockchain_queue (
    id integer NOT NULL,
    period_start timestamp without time zone NOT NULL,
    period_end timestamp without time zone NOT NULL,
    total_connections integer NOT NULL,
    successful_connections integer NOT NULL,
    failed_attempts integer NOT NULL,
    avg_response_time integer NOT NULL,
    uptime_percentage integer NOT NULL,
    wallet_details jsonb,
    client_details jsonb,
    status character varying(20) DEFAULT 'pending'::character varying,
    attempts integer DEFAULT 0,
    last_attempt timestamp without time zone,
    error_message text,
    tx_hash character varying(66),
    block_number bigint,
    gas_used bigint,
    created_at timestamp without time zone DEFAULT now(),
    completed_at timestamp without time zone
);


ALTER TABLE public.blockchain_queue OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 32875)
-- Name: blockchain_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blockchain_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blockchain_queue_id_seq OWNER TO postgres;

--
-- TOC entry 4961 (class 0 OID 0)
-- Dependencies: 223
-- Name: blockchain_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blockchain_queue_id_seq OWNED BY public.blockchain_queue.id;


--
-- TOC entry 220 (class 1259 OID 32844)
-- Name: client_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_metrics (
    client_id character varying(255) NOT NULL,
    client_domain character varying(255),
    total_authentications integer DEFAULT 0,
    successful_authentications integer DEFAULT 0,
    failed_authentications integer DEFAULT 0,
    unique_wallets integer DEFAULT 0,
    first_seen timestamp without time zone,
    last_seen timestamp without time zone,
    metadata jsonb,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.client_metrics OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 32857)
-- Name: client_registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_registrations (
    id integer NOT NULL,
    client_id character varying(255) NOT NULL,
    client_domain character varying(255) NOT NULL,
    is_public boolean DEFAULT true,
    registered_at timestamp without time zone DEFAULT now(),
    api_key_hash character varying(66),
    contact_email character varying(255),
    company_name character varying(255),
    rate_limit integer DEFAULT 100,
    tier character varying(50) DEFAULT 'free'::character varying,
    created_at timestamp without time zone,
    request_limit bigint,
    registration_date timestamp without time zone
);


ALTER TABLE public.client_registrations OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 32856)
-- Name: client_registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.client_registrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_registrations_id_seq OWNER TO postgres;

--
-- TOC entry 4962 (class 0 OID 0)
-- Dependencies: 221
-- Name: client_registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_registrations_id_seq OWNED BY public.client_registrations.id;


--
-- TOC entry 226 (class 1259 OID 32890)
-- Name: health_checks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.health_checks (
    id integer NOT NULL,
    status character varying(20) NOT NULL,
    response_time_ms integer,
    error_message text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.health_checks OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 32889)
-- Name: health_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.health_checks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.health_checks_id_seq OWNER TO postgres;

--
-- TOC entry 4963 (class 0 OID 0)
-- Dependencies: 225
-- Name: health_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.health_checks_id_seq OWNED BY public.health_checks.id;


--
-- TOC entry 228 (class 1259 OID 32901)
-- Name: mainnet_commitments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mainnet_commitments (
    id integer NOT NULL,
    data_hash character varying(66) NOT NULL,
    l2_block_number bigint NOT NULL,
    network character varying(50) NOT NULL,
    tx_hash character varying(66),
    snapshot_data jsonb,
    error_message text,
    committed_at timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.mainnet_commitments OWNER TO postgres;

--
-- TOC entry 4964 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE mainnet_commitments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.mainnet_commitments IS 'Daily commitments to mainnet contract';


--
-- TOC entry 227 (class 1259 OID 32900)
-- Name: mainnet_commitments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mainnet_commitments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mainnet_commitments_id_seq OWNER TO postgres;

--
-- TOC entry 4965 (class 0 OID 0)
-- Dependencies: 227
-- Name: mainnet_commitments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mainnet_commitments_id_seq OWNED BY public.mainnet_commitments.id;


--
-- TOC entry 230 (class 1259 OID 32918)
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    session_token text NOT NULL,
    wallet_address character varying(42) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone NOT NULL,
    last_activity timestamp without time zone DEFAULT now(),
    ip_address character varying(45),
    user_agent text,
    is_active boolean DEFAULT true,
    chain_type character varying(20) DEFAULT 'ethereum'::character varying,
    CONSTRAINT check_chain_type_sessions CHECK (((chain_type)::text = ANY ((ARRAY['ethereum'::character varying, 'solana'::character varying, 'bitcoin'::character varying, 'polkadot'::character varying, 'cardano'::character varying])::text[])))
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 32917)
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sessions_id_seq OWNER TO postgres;

--
-- TOC entry 4966 (class 0 OID 0)
-- Dependencies: 229
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- TOC entry 219 (class 1259 OID 32832)
-- Name: wallet_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallet_metrics (
    wallet_address character varying(42) NOT NULL,
    total_authentications integer DEFAULT 0,
    successful_authentications integer DEFAULT 0,
    failed_authentications integer DEFAULT 0,
    first_seen timestamp without time zone,
    last_seen timestamp without time zone,
    unique_clients integer DEFAULT 0,
    metadata jsonb,
    updated_at timestamp without time zone DEFAULT now(),
    chain_type character varying(20) DEFAULT 'ethereum'::character varying NOT NULL,
    CONSTRAINT check_chain_type_metrics CHECK (((chain_type)::text = ANY ((ARRAY['ethereum'::character varying, 'solana'::character varying, 'bitcoin'::character varying, 'polkadot'::character varying, 'cardano'::character varying])::text[])))
);


ALTER TABLE public.wallet_metrics OWNER TO postgres;

--
-- TOC entry 4728 (class 2604 OID 32821)
-- Name: authentications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentications ALTER COLUMN id SET DEFAULT nextval('public.authentications_id_seq'::regclass);


--
-- TOC entry 4747 (class 2604 OID 32879)
-- Name: blockchain_queue id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blockchain_queue ALTER COLUMN id SET DEFAULT nextval('public.blockchain_queue_id_seq'::regclass);


--
-- TOC entry 4742 (class 2604 OID 32860)
-- Name: client_registrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_registrations ALTER COLUMN id SET DEFAULT nextval('public.client_registrations_id_seq'::regclass);


--
-- TOC entry 4751 (class 2604 OID 32893)
-- Name: health_checks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_checks ALTER COLUMN id SET DEFAULT nextval('public.health_checks_id_seq'::regclass);


--
-- TOC entry 4753 (class 2604 OID 32904)
-- Name: mainnet_commitments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mainnet_commitments ALTER COLUMN id SET DEFAULT nextval('public.mainnet_commitments_id_seq'::regclass);


--
-- TOC entry 4756 (class 2604 OID 32921)
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- TOC entry 4765 (class 2606 OID 32826)
-- Name: authentications authentications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentications
    ADD CONSTRAINT authentications_pkey PRIMARY KEY (id);


--
-- TOC entry 4789 (class 2606 OID 32886)
-- Name: blockchain_queue blockchain_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blockchain_queue
    ADD CONSTRAINT blockchain_queue_pkey PRIMARY KEY (id);


--
-- TOC entry 4779 (class 2606 OID 32855)
-- Name: client_metrics client_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_metrics
    ADD CONSTRAINT client_metrics_pkey PRIMARY KEY (client_id);


--
-- TOC entry 4781 (class 2606 OID 32872)
-- Name: client_registrations client_registrations_client_domain_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_registrations
    ADD CONSTRAINT client_registrations_client_domain_key UNIQUE (client_domain);


--
-- TOC entry 4783 (class 2606 OID 32870)
-- Name: client_registrations client_registrations_client_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_registrations
    ADD CONSTRAINT client_registrations_client_id_key UNIQUE (client_id);


--
-- TOC entry 4785 (class 2606 OID 32868)
-- Name: client_registrations client_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_registrations
    ADD CONSTRAINT client_registrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4793 (class 2606 OID 32898)
-- Name: health_checks health_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_checks
    ADD CONSTRAINT health_checks_pkey PRIMARY KEY (id);


--
-- TOC entry 4798 (class 2606 OID 32910)
-- Name: mainnet_commitments mainnet_commitments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mainnet_commitments
    ADD CONSTRAINT mainnet_commitments_pkey PRIMARY KEY (id);


--
-- TOC entry 4806 (class 2606 OID 32928)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4808 (class 2606 OID 32941)
-- Name: sessions sessions_session_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_session_token_key UNIQUE (session_token);


--
-- TOC entry 4775 (class 2606 OID 32967)
-- Name: wallet_metrics wallet_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_metrics
    ADD CONSTRAINT wallet_metrics_pkey PRIMARY KEY (wallet_address, chain_type);


--
-- TOC entry 4777 (class 2606 OID 32914)
-- Name: wallet_metrics wallet_metrics_wallet_address_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_metrics
    ADD CONSTRAINT wallet_metrics_wallet_address_key UNIQUE (wallet_address);


--
-- TOC entry 4766 (class 1259 OID 32831)
-- Name: idx_auth_client_domain; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_client_domain ON public.authentications USING btree (client_domain);


--
-- TOC entry 4767 (class 1259 OID 32828)
-- Name: idx_auth_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_client_id ON public.authentications USING btree (client_id);


--
-- TOC entry 4768 (class 1259 OID 32829)
-- Name: idx_auth_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_created_at ON public.authentications USING btree (created_at);


--
-- TOC entry 4769 (class 1259 OID 32830)
-- Name: idx_auth_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_status ON public.authentications USING btree (status);


--
-- TOC entry 4770 (class 1259 OID 32827)
-- Name: idx_auth_wallet_address; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_wallet_address ON public.authentications USING btree (user_wallet_address);


--
-- TOC entry 4771 (class 1259 OID 32973)
-- Name: idx_authentications_chain_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_authentications_chain_type ON public.authentications USING btree (chain_type);


--
-- TOC entry 4772 (class 1259 OID 32974)
-- Name: idx_authentications_wallet_chain; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_authentications_wallet_chain ON public.authentications USING btree (user_wallet_address, chain_type);


--
-- TOC entry 4786 (class 1259 OID 32873)
-- Name: idx_client_domain; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_domain ON public.client_registrations USING btree (client_domain);


--
-- TOC entry 4787 (class 1259 OID 32874)
-- Name: idx_client_public; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_public ON public.client_registrations USING btree (is_public);


--
-- TOC entry 4794 (class 1259 OID 32899)
-- Name: idx_health_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_health_created_at ON public.health_checks USING btree (created_at);


--
-- TOC entry 4795 (class 1259 OID 32911)
-- Name: idx_mainnet_commitments_committed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mainnet_commitments_committed_at ON public.mainnet_commitments USING btree (committed_at DESC);


--
-- TOC entry 4796 (class 1259 OID 32912)
-- Name: idx_mainnet_commitments_tx_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mainnet_commitments_tx_hash ON public.mainnet_commitments USING btree (tx_hash);


--
-- TOC entry 4790 (class 1259 OID 32888)
-- Name: idx_queue_period; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_queue_period ON public.blockchain_queue USING btree (period_start, period_end);


--
-- TOC entry 4791 (class 1259 OID 32887)
-- Name: idx_queue_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_queue_status ON public.blockchain_queue USING btree (status);


--
-- TOC entry 4799 (class 1259 OID 32939)
-- Name: idx_sessions_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_active ON public.sessions USING btree (is_active, expires_at);


--
-- TOC entry 4800 (class 1259 OID 32975)
-- Name: idx_sessions_chain_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_chain_type ON public.sessions USING btree (chain_type);


--
-- TOC entry 4801 (class 1259 OID 32938)
-- Name: idx_sessions_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_expires ON public.sessions USING btree (expires_at);


--
-- TOC entry 4802 (class 1259 OID 32942)
-- Name: idx_sessions_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_token ON public.sessions USING btree (session_token);


--
-- TOC entry 4803 (class 1259 OID 32937)
-- Name: idx_sessions_wallet; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_wallet ON public.sessions USING btree (wallet_address);


--
-- TOC entry 4804 (class 1259 OID 32976)
-- Name: idx_sessions_wallet_chain; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_wallet_chain ON public.sessions USING btree (wallet_address, chain_type);


--
-- TOC entry 4773 (class 1259 OID 32977)
-- Name: idx_wallet_metrics_chain_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wallet_metrics_chain_type ON public.wallet_metrics USING btree (chain_type);


--
-- TOC entry 4809 (class 2606 OID 32968)
-- Name: sessions fk_wallet_chain; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT fk_wallet_chain FOREIGN KEY (wallet_address, chain_type) REFERENCES public.wallet_metrics(wallet_address, chain_type) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-11-28 16:12:14

--
-- PostgreSQL database dump complete
--

\unrestrict EfRNibBEvseAfRfquAX3Y9juf14M5lj8TA9WDc5ZK1qAcfA8ekD3gYtQ977fFVt

