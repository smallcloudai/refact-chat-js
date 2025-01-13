import { MemdbSubEvent, MemoRecord } from "../events";

export const STUB_MEMORIES: MemoRecord[] = [
  {
    memid: "7666487b81",
    m_type: "proj-fact",
    m_goal: "compile",
    m_project: "proj1",
    m_payload: "Looks like proj1 is written in fact in Rust.",
    m_origin: "local-committed",
    mstat_correct: 1,
    mstat_relevant: -1,
    mstat_times_used: 1,
  },
  {
    memid: "cdec854819",
    m_type: "seq-of-acts",
    m_goal: "compile",
    m_project: "proj2",
    m_payload: "Wow, running cargo build on proj2 was successful!",
    m_origin: "local-committed",
    mstat_correct: 0,
    mstat_relevant: 0,
    mstat_times_used: 0,
  },
  {
    memid: "eb1d64684b",
    m_type: "proj-fact",
    m_goal: "compile",
    m_project: "proj2",
    m_payload: "Looks like proj2 is written in fact in Rust.",
    m_origin: "local-committed",
    mstat_correct: 0,
    mstat_relevant: 0,
    mstat_times_used: 0,
  },

  {
    memid: "eb1d64684c",
    m_type: "proj-fact",
    m_goal:
      "Long goal Long goal Long goal Long goal Long goal Long goal Long goal Long goal Long goal Long goal",
    m_project: "proj2",
    m_payload: "Looks like proj2 is written in fact in Rust.",
    m_origin: "local-committed",
    mstat_correct: 0,
    mstat_relevant: 0,
    mstat_times_used: 0,
  },
];

export const STUB_SUB_RESPONSE: MemdbSubEvent[] = [
  {
    pubevent_id: 19,
    pubevent_action: "INSERT",
    pubevent_json:
      '{"memid":"66a072d699","m_type":"seq-of-acts","m_goal":"compile","m_project":"proj1","m_payload":"Wow, running cargo build on proj1 was successful!","m_origin":"local-committed","mstat_correct":0.0,"mstat_relevant":0.0,"mstat_times_used":0}',
  },
  {
    pubevent_id: 26,
    pubevent_action: "INSERT",
    pubevent_json:
      '{"memid":"d688925823","m_type":"proj-fact","m_goal":"compile","m_project":"proj1","m_payload":"Looks like proj1 is written in fact in Rust.","m_origin":"local-committed","mstat_correct":0.0,"mstat_relevant":0.0,"mstat_times_used":0}',
  },
  {
    pubevent_id: 27,
    pubevent_action: "INSERT",
    pubevent_json:
      '{"memid":"08f9374753","m_type":"seq-of-acts","m_goal":"compile","m_project":"proj2","m_payload":"Wow, running cargo build on proj2 was successful!","m_origin":"local-committed","mstat_correct":0.0,"mstat_relevant":0.0,"mstat_times_used":0}',
  },
  {
    pubevent_id: 28,
    pubevent_action: "INSERT",
    pubevent_json:
      '{"memid":"c9cefe3ff4","m_type":"proj-fact","m_goal":"compile","m_project":"proj2","m_payload":"Looks like proj2 is written in fact in Rust.","m_origin":"local-committed","mstat_correct":0.0,"mstat_relevant":0.0,"mstat_times_used":0}',
  },
  {
    pubevent_id: 29,
    pubevent_action: "UPDATE",
    pubevent_json:
      '{"memid":"d688925823","m_type":"proj-fact","m_goal":"compile","m_project":"proj1","m_payload":"Looks like proj1 is written in fact in Rust.","m_origin":"local-committed","mstat_correct":1.0,"mstat_relevant":-1.0,"mstat_times_used":1}',
  },
  {
    pubevent_id: 30,
    pubevent_action: "DELETE",
    pubevent_json: '{"memid":"9d2a679b09"}',
  },
];
