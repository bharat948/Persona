# Detailed Project Plan — Agentic BI System (InsightScribe)

Below is a thorough, developer- and delivery-oriented project plan you can use to run the work in an Agile way. It’s organized into phased sprints (ordered sequence — **no time estimates included**), with tasks, owners/roles, dependencies, acceptance criteria, deliverables, risks and mitigations, and operational runbooks. Use this as the canonical plan to manage implementation, QA, and rollout.

---

## Project Goals (single-paragraph)

Build a production-ready, secure, and auditable **agentic BI layer** (InsightScribe) over your Java BI backend: a FastAPI Tool Abstraction Layer (TAL), a session-instantiated SuperAgent with short-/long-term memory (Mongo), dynamic tool loading from AppRepo, sub-agent orchestration (QueryGenerator, DashboardBuilder, ComplianceMonitor), streaming responses, RBAC and HIPAA-safe logging, and CI/CD + monitoring. Deliverables include production code, infra manifests, tests, and documentation.

---

# Project Phases (ordered; run phases as sprints)

> Each phase below is a sprint-sized unit of work. Execute sequentially; later phases depend on earlier ones. No durations given — run each sprint until Acceptance Criteria are satisfied.

---

## Phase 0 — Project Kickoff & Discovery

**Objective:** Align stakeholders, finalize scope, inventory Java APIs, and confirm security/compliance constraints.

**Tasks**

* Kickoff meeting with Product, Tech Lead, Security/Compliance, and Ops.
* Inventory Java BI APIs (endpoints, auth, rate limits, query languages).
* Capture AppRepo fields, required tool metadata, and policy governance.
* Define production, staging, and dev environments and secrets manager choice.
* Define success criteria/KPIs for MVP (e.g., correct MDX generation rate, latency SLA goals — specify later).

**Owners**

* Product Owner (PO), Tech Lead, Security Lead, DevOps Lead

**Dependencies**

* Availability of API documentation or API owners for the Java backend.

**Deliverables**

* API inventory document (endpoints, schemas, auth).
* AppRepo schema draft.
* Security requirements doc (HIPAA checklist).

**Acceptance Criteria**

* PO sign-off on scope and API inventory.
* Security lead confirms compliance requirements and required audit fields.

---

## Phase 1 — Infra & Developer Environment Setup

**Objective:** Create reproducible dev environment and minimal infra for services (FastAPI, Mongo, secrets).

**Tasks**

* Provision development infrastructure (K8s cluster or VMs) and CI/CD skeleton.
* Deploy MongoDB (dev) with TLS and create DB users.
* Configure Secrets Manager (Vault / AWS Secrets Manager).
* Create local Docker Compose for development (FastAPI, Mongo, mock Java API).
* Set up logging pipeline for dev (stack: ELK or local file logs).
* Establish repository structure and branching strategy (GitFlow or trunk-based).
* Create .env template and CI secrets configuration.

**Owners**

* DevOps, Backend Engineers, CI Engineer

**Dependencies**

* Access to cloud account and secrets manager.

**Deliverables**

* Docker Compose repo + K8s manifest templates.
* CI pipeline skeleton (lint/test/build/push).

**Acceptance Criteria**

* Devs can run the FastAPI service locally and hit a mock Java endpoint.
* CI passes basic lint + unit test.

---

## Phase 2 — Mongo CRUD Service (AppRepo + LTM)

**Objective:** Implement the Mongo-backed service that manages `AppRepo` and `long_term_memory`.

**Tasks**

* Implement FastAPI CRUD endpoints for `apprepo` and `long_term_memory` (create/get/update/delete).
* Use async Motor client and Pydantic models.
* Add indexes (app\_id, user\_id, TTL for sessions).
* Add input validation and basic rate limiting.
* Add audit logging for changes (who, when, what).
* Add tests: unit tests and integration tests against dev Mongo.

**Owners**

* Backend Engineers, QA

**Dependencies**

* Phase 1 completed (Mongo available).

**Deliverables**

* Running CRUD service (endpoints documented in OpenAPI/Swagger).
* Test suite and CI integration.

**Acceptance Criteria**

* CRUD endpoints exerciseable; tests passing.
* AppRepo retrieval returns configuration used later for tool loading.

---

## Phase 3 — Tool Abstraction Layer (TAL) & Registry

**Objective:** Build TAL that wraps Java REST APIs as agent tools and a dynamic tool registry.

**Tasks**

* Design tool interface and metadata schema (name, description, input schema, openapi fragment).
* Implement two initial tools: `GetCubeMetadataTool`, `ExecuteBIQueryTool`.
* Implement wrapper features: auth injection, retries, timeout, response normalization, PHI masking mode.
* Implement `tool_registry` collection and loader that fetches allowed tools per AppRepo.
* Add unit/integration tests using a mocked Java API.

**Owners**

* Backend Engineers, API Integration Engineer, QA

**Dependencies**

* Phase 2 (AppRepo) and Java API access.

**Deliverables**

* TAL module with tool wrappers, tool registry CRUD, and loader hooks.
* Tool wrapper test harness.

**Acceptance Criteria**

* Tool wrappers call Java API (mocked) and return normalized JSON & visualization hint.
* Tool loader dynamically returns only tools allowed by AppRepo.

---

## Phase 4 — Session Manager & SuperAgent Initialization

**Objective:** Implement session lifecycle, short-term memory store, and SuperAgent init endpoint.

**Tasks**

* Create `SessionManager` to create/load sessions and maintain `session_memory`.
* Implement `/superagent/init` endpoint to:

  * Validate user
  * Load AppRepo config
  * Load allowed tools and sub-agent configs
  * Preload top-k LTM context if enabled
* Implement STM policies: sliding window, TTL, Summarization fallback.
* Add unit tests for session creation and retrieval.

**Owners**

* Backend Engineers, ML Engineer (for summarizer stub), QA

**Dependencies**

* Phase 2 & Phase 3 complete.

**Deliverables**

* Working session init endpoint, session documents in Mongo.

**Acceptance Criteria**

* Initiated sessions produce valid `session_memory` docs with TTL.
* AppRepo-driven config (allowed tools/subagents) is attached to session runtime.

---

## Phase 5 — Core Agent Orchestration + Query Flow (NL → MDX → Execute)

**Objective:** Implement the SuperAgent orchestration flow and QueryGeneratorAgent.

**Tasks**

* Implement Orchestrator that can:

  * Build system prompt using AppRepo + LTM + short-term window.
  * Decide (planner) whether to call QueryGeneratorAgent or direct tool.
* Implement `QueryGeneratorAgent`:

  * Prompt templates (YAML) for deterministic MDX generation.
  * Use OpenAI Assistants API (or Chat Completion) with low temperature.
  * Validate output against cube metadata (from GetCubeMetadataTool).
* Wire Orchestrator to call QueryGeneratorAgent → ExecuteBIQueryTool → collect results.
* Implement result normalization & visualization hint generation.
* Add integration tests and golden examples (sample NL -> MDX -> result).

**Owners**

* ML Engineer, Backend Engineers, QA

**Dependencies**

* Phase 3 (tools), Phase 4 (sessions).

**Deliverables**

* Orchestrator + QueryGeneratorAgent working end-to-end with mocked Java API.
* Test cases for typical queries (top N lists, time filters).

**Acceptance Criteria**

* Natural language query produces valid executed query results (passes metadata validation).
* Orchestrator logs each decision and tool call.

---

## Phase 6 — Long-Term Memory (LTM) & RAG

**Objective:** Implement LTM write/read, embeddings pipeline, and RAG to augment prompts.

**Tasks**

* Implement summarization pipeline (LLM summarizer) for session summaries.
* Implement embedding flow:

  * Convert memory summaries to embeddings (OpenAI/other embeddings).
  * Store embeddings in LTM (Mongo document with vector field or external vector DB).
* Implement RAG retrieval step in SuperAgent:

  * Embed incoming query -> nearest neighbors -> inject top-k into prompt.
* Implement SuperAgent-controlled LTM write API and `propose-memory` flow for sub-agents.
* Add tests for retrieval relevance and integrity.

**Owners**

* ML Engineer, Backend Engineers, QA

**Dependencies**

* Phase 5 (orchestrator), OpenAI key & allowed usage.

**Deliverables**

* LTM documents with embeddings; retrieval API working.
* SuperAgent uses RAG in decisions.

**Acceptance Criteria**

* RAG retrieval improves response relevance in test scenarios.
* LTM writes only occur via SuperAgent unless explicitly approved.

---

## Phase 7 — Streaming Responses & Client Integration

**Objective:** Provide streaming capabilities and sample client integration.

**Tasks**

* Implement SSE or WebSocket streaming endpoint for `/superagent/stream`.
* Support incremental LLM token streaming and tool progress events.
* Create sample web client showing streaming tokens, progressive chart rendering.
* Ensure conversation appended to STM incrementally.

**Owners**

* Backend Engineers, Frontend Engineer, QA

**Dependencies**

* Phase 5 LLM pipeline must support streaming.

**Deliverables**

* Streaming endpoints + sample client.
* Tests for stream stability & reconnect semantics.

**Acceptance Criteria**

* Client receives chunked responses and final result; session logs reflect streaming events.

---

## Phase 8 — Security, RBAC, Auditing, & HIPAA Compliance

**Objective:** Harden the system per HIPAA and internal security standards.

**Tasks**

* Implement RBAC enforcement: AppRepo -> allowed\_tools -> policy engine.
* Integrate Secrets Manager for all credentials and rotate keys per policy.
* Add field-level logging redaction and encryption of PHI fields at rest.
* Implement immutable audit logs for every tool call and memory write.
* Run security review & remediation (SAST, dependency scanning).

**Owners**

* Security Lead, DevOps, Backend Engineers

**Dependencies**

* All feature phases.

**Deliverables**

* RBAC enforcement, encrypted secrets, audited logs, security test results.

**Acceptance Criteria**

* Security scan passed; RBAC enforced in tests; audit logs contain required fields without PHI leakage.

---

## Phase 9 — Observability, QA, Load & Hardening

**Objective:** Add monitoring, run large-scale tests and harden system.

**Tasks**

* Add metrics: LLM latency, tool latency, session concurrency, memory retrieval time.
* Configure dashboards (Grafana/Datadog).
* Create runbooks for common failures (LLM down, Java API timeouts).
* Run load tests and measure bottlenecks; add autoscaling rules.
* Integrate distributed tracing and log correlation.

**Owners**

* DevOps, QA, Backend Engineers

**Dependencies**

* All feature phases completed.

**Deliverables**

* Dashboards, runbooks, load test reports, scaling rules.

**Acceptance Criteria**

* System handles target concurrent session volume in load tests (as defined by PO).
* Runbook validated with simulated incidents.

---

## Phase 10 — Documentation, Handover & Release

**Objective:** Final docs, contributor guidelines, handover to operations and product.

**Tasks**

* Write ARCHITECTURE.md, API docs (OpenAPI), agent guides, and CONTRIBUTING.md.
* Create deployment playbook (k8s helm charts or manifests) and rollback plan.
* Run final security and compliance checklist and gather approvals.
* Hand over to Ops with runbooks and training session for support.

**Owners**

* Tech Lead, Documentation Lead, Ops

**Deliverables**

* Full docs in repo, release artifacts, production runbook.

**Acceptance Criteria**

* Documentation reviewed and signed-off by stakeholders.
* Production deployment performed by Ops following playbook.

---

# Backlog (compact tasks list)

* Infra: k8s + Mongo + secrets + CI
* Code: FastAPI CRUD, SessionManager, TAL wrappers, Orchestrator, Sub-agents
* ML: prompt templates, embeddings, summarizer flows
* Security & Compliance: RBAC, PHI redaction, audit logs
* Observability & Ops: metrics, traces, runbooks
* QA: unit, integration, contract, security, load tests
* Docs & Training

---

# Team Composition (recommended roles)

* **Tech Lead / Architect** — owns architecture and acceptance criteria
* **Backend Engineers (2–3)** — FastAPI, Microservices, TAL
* **ML Engineer (1–2)** — prompting, embeddings, RAG design
* **DevOps (1–2)** — infra, CI/CD, k8s, secrets
* **Frontend Engineer (1)** — sample UI & streaming client
* **QA Engineer (1–2)** — automated tests, security tests
* **Security/Compliance Lead (1)** — HIPAA controls & audits
* **Product Owner** — prioritization and stakeholders liaison

---

# QA & Testing Strategy

* Unit tests for all components (tools, session manager).
* Integration tests against a mocked Java API; contract tests for TAL vs Java API.
* End-to-end tests that validate NL->MDX->Execute flow.
* Security tests: SAST, dependency scanning, pen-testing focused on PHI leakage.
* Load tests: simulate LLM latencies and Java API latencies; measure autoscale behavior.
* Acceptance tests per Sprint must be executed and passed before merge.

---

# CI/CD & Release Rules

* PRs must include unit tests and pass CI.
* Merge gating: tests + security checks + 1+ reviewer.
* Canary deploy approach for production (traffic % cutover).
* Rollback: automated rollback policy via Helm or deployment pipelines.

---

# Monitoring & Runbooks (operational)

* Alerts: LLM errors, tool error rate > threshold, high LTM retrieval latency, session store failures.
* Runbook actions: check traces, failover to mock or cached responses, scale pilot pools.
* On-call rotation for incidents; link to audit logs and trace IDs.

---

# Risk Register (top items)

1. **PHI leakage in logs or prompts** — Mitigation: redact PHI, encrypt PII at rest, restrict access.
2. **LLM hallucinations in query generation** — Mitigation: low-temperature generation, validate MDX against cube metadata, unit tests with golden examples.
3. **Latency due to LLM calls** — Mitigation: cache frequent mappings; use smaller deterministic LLM for query gen; asynchronous workflows for heavy tasks.
4. **Java API instability** — Mitigation: circuit breakers, retries with backoff, cached last-known-good results for read-only calls.
5. **Cost overruns for LLM usage** — Mitigation: set token caps, use cheaper models for deterministic tasks, schedule model usage quotas.

---

# Governance & Compliance Checklist (minimum)

* Enforce RBAC tied to AppRepo.
* Audit trail for all operations that touch PHI.
* Encryption in transit and at rest.
* Data retention/TTL policy and deletion workflows.
* Periodic security reviews and compliance sign-off.

---

# Deliverable Templates (to reuse)

* Sprint acceptance checklist
* PR template (include test results and security checks)
* Incident report template
* Runbook for common failure modes

---

# Final Notes & Next Action

This plan is ready to be turned into JIRA/Trello cards or your project management tool. The next practical action is to **start Phase 0 and Phase 1 concurrently** (kickoff and infra/dev setup). From there follow the phase order and require acceptance criteria sign-off to unlock the next phase.

If you’d like, I can now:

* Convert this plan into a JIRA-ready backlog (exportable CSV) with tasks and acceptance criteria, or
* Generate the code scaffold for Phase 2 (FastAPI + Motor CRUD for AppRepo & LTM) so engineering can start coding immediately.

Tell me which you want me to produce next (JIRA backlog or code scaffold) and I’ll output it now.
