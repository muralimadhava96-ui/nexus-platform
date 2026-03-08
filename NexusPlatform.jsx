// ═══════════════════════════════════════════════════════════════════════════
//  NEXUS — AI-Powered Productivity SaaS Platform
//  Architecture: Zustand stores · Service layer · Modular components
//  Stack: React · Zustand · Framer Motion · Recharts · @dnd-kit · Anthropic AI
//  UI: Premium glassmorphism dark theme · Geist Mono + Syne typography
// ═══════════════════════════════════════════════════════════════════════════

import {
  useState, useEffect, useCallback, useReducer, useRef, useMemo, createContext, useContext
} from "react";
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadialBarChart, RadialBar,
} from "recharts";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragOverlay, KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Sparkles, Brain, Calendar, BarChart3, Command, Users, Zap,
  Plus, Trash2, CheckCircle2, Circle, Pencil, X, Search,
  ChevronRight, ChevronDown, GripVertical, Bell, Settings,
  Home, ListTodo, TrendingUp, Clock, Target, Star, Tag, Flag,
  ArrowUpDown, Filter, Hash, Briefcase, Heart, BookOpen,
  DollarSign, Layers, CheckSquare, CalendarDays, Inbox,
  Send, Loader2, MessageSquare, Cpu, Activity, Award,
  ChevronLeft, Menu, Moon, Sun, ArrowRight, Lightbulb,
  Play, Pause, RotateCcw, Eye, EyeOff, Link, Copy,
  AlertCircle, Check, Info, Wand2, Rocket, Flame,
  LayoutGrid, List, SlidersHorizontal, RefreshCw, Globe,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
//  DESIGN TOKENS & THEME
// ═══════════════════════════════════════════════════════════════════════════
const T = {
  // Core palette — deep midnight with electric accents
  bg:        "#080B14",
  bgCard:    "#0D1117",
  bgGlass:   "rgba(255,255,255,0.04)",
  bgGlass2:  "rgba(255,255,255,0.07)",
  border:    "rgba(255,255,255,0.08)",
  border2:   "rgba(255,255,255,0.12)",
  primary:   "#6EE7B7",   // emerald
  primary2:  "#34D399",
  accent:    "#818CF8",   // violet
  accent2:   "#A78BFA",
  warning:   "#FCD34D",
  danger:    "#F87171",
  text:      "#F1F5F9",
  textMuted: "#64748B",
  textDim:   "#334155",
  // Gradients
  grad1: "linear-gradient(135deg, #6EE7B7 0%, #818CF8 100%)",
  grad2: "linear-gradient(135deg, #F472B6 0%, #FB923C 100%)",
  grad3: "linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)",
  grad4: "linear-gradient(135deg, #6EE7B7 0%, #3B82F6 50%, #8B5CF6 100%)",
};

// Theme copies — swapped at runtime by AppShell on darkMode toggle
const DARK_TOKENS = { ...T };
const LIGHT_TOKENS = {
  bg:"#F8FAFC",    bgCard:"#FFFFFF",  bgGlass:"rgba(0,0,0,0.03)",  bgGlass2:"rgba(0,0,0,0.06)",
  border:"rgba(0,0,0,0.08)", border2:"rgba(0,0,0,0.13)",
  primary:"#059669",  primary2:"#10B981",  accent:"#6366F1",  accent2:"#818CF8",
  warning:"#D97706",  danger:"#DC2626",
  text:"#0F172A",   textMuted:"#64748B",  textDim:"#94A3B8",
  grad1:"linear-gradient(135deg,#059669 0%,#6366F1 100%)",
  grad2:"linear-gradient(135deg,#DB2777 0%,#EA580C 100%)",
  grad3:"linear-gradient(135deg,#0284C7 0%,#6366F1 100%)",
  grad4:"linear-gradient(135deg,#059669 0%,#2563EB 50%,#7C3AED 100%)",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Geist+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
  html, body, #root { height:100%; background:${T.bg}; color:${T.text}; }
  body { font-family: 'Syne', 'Segoe UI', sans-serif; overflow:hidden; }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:${T.border2}; border-radius:99px; }
  ::selection { background:rgba(110,231,183,0.2); }
  input, textarea, select { font-family:'Syne','Segoe UI',sans-serif; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(0.5); cursor:pointer; }
  * { -webkit-tap-highlight-color:transparent; }
`;

// ═══════════════════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
const CATEGORIES = [
  { id:"work",     label:"Work",     color:"#818CF8", emoji:"💼" },
  { id:"personal", label:"Personal", color:"#F472B6", emoji:"🏠" },
  { id:"health",   label:"Health",   color:"#6EE7B7", emoji:"💪" },
  { id:"learning", label:"Learning", color:"#FCD34D", emoji:"📚" },
  { id:"finance",  label:"Finance",  color:"#38BDF8", emoji:"💰" },
  { id:"ideas",    label:"Ideas",    color:"#FB923C", emoji:"💡" },
];

const PRIORITIES = [
  { id:"critical", label:"Critical", color:"#F87171", rank:0 },
  { id:"high",     label:"High",     color:"#FB923C", rank:1 },
  { id:"medium",   label:"Medium",   color:"#818CF8", rank:2 },
  { id:"low",      label:"Low",      color:"#6EE7B7", rank:3 },
];

const NAV_ITEMS = [
  { id:"home",      label:"Overview",   icon:Home         },
  { id:"tasks",     label:"Tasks",      icon:ListTodo     },
  { id:"calendar",  label:"Calendar",   icon:Calendar     },
  { id:"analytics", label:"Analytics",  icon:BarChart3    },
  { id:"ai",        label:"AI Assist",  icon:Brain        },
  { id:"collab",    label:"Team",       icon:Users        },
];

const SEED_TASKS = [
  { id:"t1", text:"Design system for Q1 product launch",     cat:"work",     pri:"critical", done:false, createdAt:Date.now()-7*86400000, dueDate:addDays(12), tags:["design","urgent"],        aiGenerated:false, subtasks:["Define color tokens","Component library","Documentation"],  effort:8, completedAt:null },
  { id:"t2", text:"Implement OAuth2 authentication flow",     cat:"work",     pri:"high",     done:false, createdAt:Date.now()-5*86400000, dueDate:addDays(10), tags:["backend","security"],      aiGenerated:false, subtasks:["Google OAuth","GitHub OAuth","Session mgmt"],              effort:5, completedAt:null },
  { id:"t3", text:"Morning run 5km — track with Strava",      cat:"health",   pri:"medium",   done:true,  createdAt:Date.now()-2*86400000, dueDate:today(),      tags:["fitness"],                 aiGenerated:false, subtasks:[],                                                         effort:2, completedAt:Date.now()-3600000 },
  { id:"t4", text:"Read 'Shape Up' by Basecamp",              cat:"learning", pri:"low",      done:false, createdAt:Date.now()-86400000,   dueDate:addDays(17), tags:["books","product"],        aiGenerated:false, subtasks:["Ch1–3","Ch4–6","Summary notes"],                          effort:3, completedAt:null },
  { id:"t5", text:"Quarterly tax filing & bookkeeping",       cat:"finance",  pri:"high",     done:false, createdAt:Date.now()-3600000,    dueDate:addDays(23), tags:["taxes","important"],      aiGenerated:false, subtasks:["Gather receipts","Update spreadsheet","Submit forms"],    effort:4, completedAt:null },
  { id:"t6", text:"Fix memory leak in React dashboard",       cat:"work",     pri:"critical", done:true,  createdAt:Date.now()-900000,     dueDate:today(),      tags:["bug","performance"],      aiGenerated:false, subtasks:["Profile with DevTools","Identify culprit","Write test"],  effort:3, completedAt:Date.now()-1800000 },
  { id:"t7", text:"Brainstorm SaaS pricing strategy",         cat:"ideas",    pri:"medium",   done:false, createdAt:Date.now()-600000,     dueDate:null,         tags:["strategy","pricing"],     aiGenerated:true,  subtasks:[],                                                         effort:2, completedAt:null },
  { id:"t8", text:"Weekly team retrospective meeting",        cat:"work",     pri:"medium",   done:false, createdAt:Date.now()-300000,     dueDate:tomorrow(),   tags:["meeting","team"],         aiGenerated:false, subtasks:["Prepare agenda","Collect feedback","Action items"],       effort:2, completedAt:null },
];

const ONLINE_USERS = [
  { id:"u1", name:"Alex Chen",    avatar:"AC", color:"#6EE7B7", status:"active",  cursor:{x:340,y:180} },
  { id:"u2", name:"Sarah Kim",    avatar:"SK", color:"#818CF8", status:"active",  cursor:{x:680,y:290} },
  { id:"u3", name:"Marcus Liu",   avatar:"ML", color:"#F472B6", status:"away",    cursor:null },
];

const PALETTE_COMMANDS = [
  { id:"add",      label:"Add new task",         shortcut:"A",     icon:Plus,       action:"addTask"    },
  { id:"search",   label:"Search tasks",          shortcut:"F",     icon:Search,     action:"search"     },
  { id:"home",     label:"Go to Overview",        shortcut:"G H",   icon:Home,       action:"nav:home"   },
  { id:"tasks",    label:"Go to Tasks",           shortcut:"G T",   icon:ListTodo,   action:"nav:tasks"  },
  { id:"calendar", label:"Go to Calendar",        shortcut:"G C",   icon:Calendar,   action:"nav:calendar"},
  { id:"analytics",label:"Go to Analytics",       shortcut:"G A",   icon:BarChart3,  action:"nav:analytics"},
  { id:"ai",       label:"Open AI Assistant",     shortcut:"G I",   icon:Brain,      action:"nav:ai"     },
  { id:"collab",   label:"Go to Team",            shortcut:"G U",   icon:Users,      action:"nav:collab" },
  { id:"theme",    label:"Toggle theme",          shortcut:"T",     icon:Moon,       action:"theme"      },
  { id:"focus",    label:"Start focus timer",     shortcut:"P",     icon:Play,       action:"focus"      },
];

const WEEKLY_PRODUCTIVITY = [
  { day:"Mon", completed:6,  added:8,  focus:120 },
  { day:"Tue", completed:9,  added:11, focus:180 },
  { day:"Wed", completed:4,  added:6,  focus:60  },
  { day:"Thu", completed:12, added:10, focus:240 },
  { day:"Fri", completed:8,  added:9,  focus:150 },
  { day:"Sat", completed:3,  added:2,  focus:45  },
  { day:"Sun", completed:2,  added:4,  focus:30  },
];

const INSIGHT_MESSAGES = [
  "You complete 73% more tasks before noon — try front-loading your day.",
  "Your 'work' category has 5 overdue items. Consider splitting them into subtasks.",
  "You've been on a 4-day streak! Keep the momentum going.",
  "High-priority tasks take you 2.3× longer than estimated. Add buffer time.",
  "Tuesday is your most productive day. Schedule deep work then.",
];

// ═══════════════════════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════════════════════
function today()    { return new Date().toISOString().split("T")[0]; }
function tomorrow() { const d=new Date(); d.setDate(d.getDate()+1); return d.toISOString().split("T")[0]; }
function genId()    { return `id_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; }
function addDays(n) { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0]; }
const getCat  = id => CATEGORIES.find(c=>c.id===id)||CATEGORIES[0];
const getPri  = id => PRIORITIES.find(p=>p.id===id)||PRIORITIES[2];

function formatDate(s) {
  if (!s) return null;
  const t = today();
  const d = new Date(s+"T00:00:00");
  if (s===t)         return { label:"Today",    urgent:true  };
  if (s===tomorrow())return { label:"Tomorrow", urgent:false };
  if (s<t)           return { label:`Overdue · ${d.toLocaleDateString("en-US",{month:"short",day:"numeric"})}`, overdue:true };
  return { label:d.toLocaleDateString("en-US",{month:"short",day:"numeric"}), urgent:false };
}

function getStats(tasks) {
  const t     = today();
  const total = tasks.length;
  const done  = tasks.filter(x=>x.done).length;
  const active= total-done;
  const overdue=tasks.filter(x=>!x.done&&x.dueDate&&x.dueDate<t).length;
  const dueToday=tasks.filter(x=>!x.done&&x.dueDate===t).length;
  const streak = (() => {
    const doneDays = new Set(
      tasks.filter(x=>x.completedAt)
           .map(x=>new Date(x.completedAt).toISOString().split("T")[0])
    );
    let count=0, d=new Date();
    while (doneDays.has(d.toISOString().split("T")[0])) { count++; d.setDate(d.getDate()-1); }
    return count;
  })();
  const productivity = total>0?Math.round((done/total)*100):0;

  const byCat = CATEGORIES.map(c=>({
    name:c.label, value:tasks.filter(x=>x.cat===c.id).length,
    done:tasks.filter(x=>x.cat===c.id&&x.done).length, color:c.color,
  })).filter(c=>c.value>0);

  const byPri = PRIORITIES.map(p=>({
    name:p.label,
    total:tasks.filter(x=>x.pri===p.id).length,
    done:tasks.filter(x=>x.pri===p.id&&x.done).length,
    color:p.color,
  }));

  const completionRate = WEEKLY_PRODUCTIVITY.map(d=>({
    day:d.day, rate:Math.round((d.completed/d.added)*100),
  }));

  return { total, done, active, overdue, dueToday, streak, productivity, byCat, byPri, completionRate };
}

// ═══════════════════════════════════════════════════════════════════════════
//  ZUSTAND-STYLE STATE (implemented with React context + useReducer)
//  (Zustand itself isn't available as a CDN, so this mirrors its API exactly)
// ═══════════════════════════════════════════════════════════════════════════
const StoreCtx = createContext(null);

function useStore() { return useContext(StoreCtx); }

function storeReducer(state, action) {
  switch(action.type) {
    case "SET_VIEW":     return { ...state, view: action.v };
    case "SET_TASKS":    return { ...state, tasks: action.tasks };
    case "ADD_TASK":     return { ...state, tasks: [action.task, ...state.tasks] };
    case "UPDATE_TASK":  return { ...state, tasks: state.tasks.map(t=>t.id===action.id?{...t,...action.data}:t) };
    case "DELETE_TASK":  return { ...state, tasks: state.tasks.filter(t=>t.id!==action.id) };
    case "REORDER":      return { ...state, tasks: action.tasks };
    case "SET_PALETTE":  return { ...state, paletteOpen: action.open };
    case "SET_SEARCH":   return { ...state, search: action.q };
    case "SET_FILTER":   return { ...state, filter: action.f };
    case "SET_SORT":     return { ...state, sortBy: action.s };
    case "SET_FOCUS":    return { ...state, focusMode: action.v };
    case "SET_THEME":    return { ...state, darkMode: !state.darkMode };
    case "SET_COLLAPSED":return { ...state, sidebarCollapsed: action.v };
    case "SET_NOTIF":    return { ...state, notification: action.notif };
    case "SET_AI_MSGS":  return { ...state, aiMessages: action.msgs };
    case "ADD_AI_MSG":   return { ...state, aiMessages: [...state.aiMessages, action.msg] };
    case "SET_AI_LOADING": return { ...state, aiLoading: action.v };
    case "SET_CAL_DATE": return { ...state, calDate: action.d };
    case "SET_ONLINE":   return { ...state, onlineUsers: action.users };
    default: return state;
  }
}

function StoreProvider({ children }) {
  // Load from localStorage
  const savedTasks = (() => {
    try { const s=localStorage.getItem("nexus_tasks"); return s?JSON.parse(s):SEED_TASKS; } catch { return SEED_TASKS; }
  })();

  const initialState = {
    tasks: savedTasks,
    view: "home",
    paletteOpen: false,
    search: "",
    filter: "All",
    sortBy: "created",
    focusMode: false,
    focusSeconds: 25*60,
    focusActive: false,
    darkMode: true,
    sidebarCollapsed: false,
    notification: null,
    aiMessages: [
      { role:"assistant", content:"👋 Hi! I'm your AI productivity assistant. I can help you break down tasks, suggest priorities, plan your day, and analyze your workflow. What would you like to work on?" }
    ],
    aiLoading: false,
    calDate: today(),
    onlineUsers: ONLINE_USERS,
  };

  const [state, dispatch] = useReducer(storeReducer, initialState);

  // Persist tasks to localStorage
  useEffect(() => {
    try { localStorage.setItem("nexus_tasks", JSON.stringify(state.tasks)); } catch {}
  }, [state.tasks]);

  // Dispatch wrapper that also returns state
  const act = useCallback((action) => {
    dispatch(action);
  }, []);

  // Notify helper
  const notify = useCallback((msg, type="success") => {
    act({ type:"SET_NOTIF", notif:{ msg, notifType:type, id:genId() } });
    setTimeout(() => act({ type:"SET_NOTIF", notif:null }), 3500);
  }, [act]);

  return (
    <StoreCtx.Provider value={{ state, act, notify }}>
      {children}
    </StoreCtx.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  AI SERVICE  — calls Anthropic API via artifact bridge
// ═══════════════════════════════════════════════════════════════════════════
async function callAI(messages, systemPrompt) {
  let resp;
  try {
    resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.filter(m=>m.role!=="assistant"||m.content).map(m=>({
          role: m.role, content: m.content
        })),
      }),
    });
  } catch {
    throw new Error("Network error — check your connection and try again.");
  }
  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw new Error(`API error ${resp.status}: ${errData?.error?.message || resp.statusText}`);
  }
  const data = await resp.json();
  return data.content?.[0]?.text || "Sorry, I couldn't process that.";
}

async function parseTaskWithAI(input) {
  const text = await callAI([{ role:"user", content:`Parse this task request and return ONLY valid JSON (no markdown): "${input}"\nSchema: { text:string, cat:"work"|"personal"|"health"|"learning"|"finance"|"ideas", pri:"critical"|"high"|"medium"|"low", dueDate:string|null (YYYY-MM-DD), tags:string[], subtasks:string[] }` }],
    "You are a task parser. Return ONLY raw JSON, no markdown fences, no explanation.");
  try {
    const clean = text.replace(/```json\n?|```/g,"").trim();
    const parsed = JSON.parse(clean);
    const validCats = ["work","personal","health","learning","finance","ideas"];
    const validPris = ["critical","high","medium","low"];
    if (!parsed.text || !validCats.includes(parsed.cat) || !validPris.includes(parsed.pri)) return null;
    if (!Array.isArray(parsed.tags))     parsed.tags = [];
    if (!Array.isArray(parsed.subtasks)) parsed.subtasks = [];
    return parsed;
  } catch { return null; }
}

async function chatWithAI(messages, tasks) {
  const taskSummary = `User has ${tasks.length} tasks. Done: ${tasks.filter(t=>t.done).length}. Overdue: ${tasks.filter(t=>!t.done&&t.dueDate&&t.dueDate<today()).length}. High priority active: ${tasks.filter(t=>!t.done&&(t.pri==="critical"||t.pri==="high")).length}.`;
  return callAI(
    messages.filter(m=>m.role!=="system"),
    `You are Nexus AI, an expert productivity assistant built into a SaaS task management app. Be concise, actionable, and insightful. Current user context: ${taskSummary}. Format responses with markdown when helpful. Keep answers under 200 words unless deep analysis is requested.`
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MICRO UI PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════

// Glassmorphism card
function GlassCard({ children, className="", style={}, onClick, hover=false, ...props }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y:-2, boxShadow:`0 20px 60px rgba(0,0,0,0.4)` } : undefined}
      className={className}
      style={{
        background: T.bgGlass,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        backdropFilter: "blur(12px)",
        ...style,
      }}
      {...props}>
      {children}
    </motion.div>
  );
}

// Animated progress ring
function ProgressRing({ value, size=64, stroke=6, color=T.primary }) {
  const r   = (size-stroke*2)/2;
  const circ= 2*Math.PI*r;
  const off = circ*(1-value/100);
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border2} strokeWidth={stroke}/>
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{strokeDashoffset:circ}}
        animate={{strokeDashoffset:off}}
        transition={{duration:1.2, ease:"easeOut"}}/>
    </svg>
  );
}

// Gradient badge
function Badge({ children, color, style={} }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding:"2px 8px", borderRadius:99,
      background:`${color}18`, color, border:`1px solid ${color}30`,
      fontSize:11, fontWeight:600, fontFamily:"'Geist Mono',monospace",
      ...style,
    }}>
      {children}
    </span>
  );
}

// Toast notification
function Toast({ notif }) {
  if (!notif) return null;
  const icons = { success:<Check size={14}/>, error:<AlertCircle size={14}/>, info:<Info size={14}/> };
  const colors = { success:T.primary, error:T.danger, info:T.accent };
  const c = colors[notif.notifType]||T.primary;
  return (
    <AnimatePresence>
      <motion.div
        initial={{opacity:0,y:20,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:0.95}}
        style={{
          position:"fixed", bottom:24, right:24, zIndex:9999,
          display:"flex", alignItems:"center", gap:10,
          padding:"12px 16px", borderRadius:12,
          background:T.bgCard, border:`1px solid ${c}40`,
          boxShadow:`0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${c}20`,
          color:T.text, fontSize:13, fontFamily:"'Syne',sans-serif",
        }}>
        <span style={{color:c}}>{icons[notif.notifType]||icons.success}</span>
        {notif.msg}
      </motion.div>
    </AnimatePresence>
  );
}

// Animated number
function AnimNumber({ value, suffix="" }) {
  const spring = useSpring(0, {stiffness:80,damping:20});
  useEffect(()=>{ spring.set(value); },[value,spring]);
  const display = useTransform(spring, v=>`${Math.round(v)}${suffix}`);
  return <motion.span>{display}</motion.span>;
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMMAND PALETTE
// ═══════════════════════════════════════════════════════════════════════════
function CommandPalette() {
  const { state, act, notify } = useStore();
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  useEffect(()=>{
    if(state.paletteOpen) { setQuery(""); setSel(0); setTimeout(()=>inputRef.current?.focus(),50); }
  },[state.paletteOpen]);

  useEffect(()=>{
    const handler = e => {
      if((e.metaKey||e.ctrlKey)&&e.key==="k"){ e.preventDefault(); act({type:"SET_PALETTE",open:!state.paletteOpen}); }
      if(e.key==="Escape") act({type:"SET_PALETTE",open:false});
    };
    window.addEventListener("keydown",handler);
    return ()=>window.removeEventListener("keydown",handler);
  },[state.paletteOpen,act]);

  const filtered = useMemo(()=>
    PALETTE_COMMANDS.filter(c=>c.label.toLowerCase().includes(query.toLowerCase()))
  ,[query]);

  const run = cmd => {
    act({type:"SET_PALETTE",open:false});
    if(cmd.action.startsWith("nav:")) act({type:"SET_VIEW",v:cmd.action.replace("nav:","")});
    else if(cmd.action==="search") act({type:"SET_VIEW",v:"tasks"});
    else if(cmd.action==="focus") notify("Focus timer started! 🎯");
    else if(cmd.action==="theme") act({type:"SET_THEME"});
  };

  const handleKey = e => {
    if(e.key==="ArrowDown") setSel(s=>Math.min(s+1,filtered.length-1));
    if(e.key==="ArrowUp")   setSel(s=>Math.max(s-1,0));
    if(e.key==="Enter"&&filtered[sel]) run(filtered[sel]);
  };

  return (
    <AnimatePresence>
      {state.paletteOpen && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",zIndex:10000,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:120}}
          onClick={()=>act({type:"SET_PALETTE",open:false})}>
          <motion.div initial={{opacity:0,y:-20,scale:0.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-20,scale:0.96}}
            transition={{type:"spring",stiffness:400,damping:30}}
            onClick={e=>e.stopPropagation()}
            style={{width:520,borderRadius:20,overflow:"hidden",
              background:T.bgCard,border:`1px solid ${T.border2}`,
              boxShadow:"0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)"}}>

            {/* Search input */}
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 20px",borderBottom:`1px solid ${T.border}`}}>
              <Command size={16} style={{color:T.textMuted,flexShrink:0}}/>
              <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={handleKey}
                placeholder="Type a command or search…"
                style={{flex:1,background:"transparent",border:"none",outline:"none",
                  color:T.text,fontSize:14,fontFamily:"'Syne',sans-serif"}}/>
              <kbd style={{padding:"2px 8px",borderRadius:6,background:T.border,color:T.textMuted,fontSize:11,fontFamily:"'Geist Mono',monospace"}}>ESC</kbd>
            </div>

            {/* Results */}
            <div style={{maxHeight:320,overflowY:"auto",padding:8}}>
              {filtered.length===0
                ? <div style={{textAlign:"center",padding:32,color:T.textMuted,fontSize:13}}>No commands found</div>
                : filtered.map((cmd,i)=>{
                  const Icon=cmd.icon;
                  return (
                    <motion.button key={cmd.id}
                      whileHover={{background:T.bgGlass2}}
                      onClick={()=>run(cmd)}
                      style={{
                        width:"100%",display:"flex",alignItems:"center",gap:12,
                        padding:"10px 12px",borderRadius:10,border:"none",cursor:"pointer",
                        background:sel===i?T.bgGlass2:"transparent",
                        color:T.text,textAlign:"left",
                      }}>
                      <div style={{width:32,height:32,borderRadius:8,background:T.bgGlass2,
                        display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <Icon size={15} style={{color:T.accent}}/>
                      </div>
                      <span style={{flex:1,fontSize:13,fontFamily:"'Syne',sans-serif"}}>{cmd.label}</span>
                      <kbd style={{padding:"2px 8px",borderRadius:6,background:T.border,color:T.textMuted,fontSize:11,fontFamily:"'Geist Mono',monospace"}}>{cmd.shortcut}</kbd>
                    </motion.button>
                  );
                })
              }
            </div>

            <div style={{padding:"8px 16px",borderTop:`1px solid ${T.border}`,display:"flex",gap:16,alignItems:"center"}}>
              {[["↑↓","navigate"],["↵","run"],["⌘K","close"]].map(([k,l])=>(
                <span key={k} style={{fontSize:11,color:T.textMuted,display:"flex",gap:6,alignItems:"center",fontFamily:"'Syne',sans-serif"}}>
                  <kbd style={{padding:"1px 6px",borderRadius:4,background:T.border,fontFamily:"'Geist Mono',monospace"}}>{k}</kbd> {l}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════
function Sidebar() {
  const { state, act } = useStore();
  const { view, sidebarCollapsed: col, tasks } = state;
  const stats = getStats(tasks);

  return (
    <motion.aside animate={{width:col?60:220}} transition={{type:"spring",stiffness:300,damping:30}}
      style={{height:"100%",flexShrink:0,display:"flex",flexDirection:"column",overflow:"hidden",
        background:T.bgCard,borderRight:`1px solid ${T.border}`,position:"relative",zIndex:10}}>

      {/* Logo */}
      <div style={{padding:"20px 16px",display:"flex",alignItems:"center",gap:12}}>
        <motion.div whileHover={{scale:1.06}}
          style={{width:36,height:36,borderRadius:10,flexShrink:0,
            background:T.grad1,display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 4px 16px rgba(110,231,183,0.3)`}}>
          <Sparkles size={18} color="#080B14"/>
        </motion.div>
        <AnimatePresence>
          {!col && (
            <motion.div initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-8}}>
              <div style={{fontWeight:800,fontSize:16,letterSpacing:"-0.5px",background:T.grad1,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Nexus</div>
              <div style={{fontSize:10,color:T.textMuted,fontFamily:"'Geist Mono',monospace",marginTop:1}}>AI Workspace</div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={()=>act({type:"SET_COLLAPSED",v:!col})}
          style={{marginLeft:"auto",background:"transparent",border:"none",cursor:"pointer",color:T.textMuted,padding:4,flexShrink:0}}>
          {col?<ChevronRight size={13}/>:<ChevronLeft size={13}/>}
        </button>
      </div>

      {/* Command palette trigger */}
      {!col && (
        <div style={{padding:"0 12px 12px"}}>
          <motion.button whileHover={{background:T.bgGlass2}}
            onClick={()=>act({type:"SET_PALETTE",open:true})}
            style={{width:"100%",display:"flex",alignItems:"center",gap:8,
              padding:"8px 10px",borderRadius:10,border:`1px solid ${T.border}`,
              background:T.bgGlass,cursor:"pointer",color:T.textMuted,fontSize:12,fontFamily:"'Syne',sans-serif"}}>
            <Command size={12}/> <span style={{flex:1,textAlign:"left"}}>Search…</span>
            <kbd style={{fontFamily:"'Geist Mono',monospace",fontSize:10,padding:"1px 5px",borderRadius:4,background:T.border}}>⌘K</kbd>
          </motion.button>
        </div>
      )}

      {/* Nav */}
      <nav style={{flex:1,padding:"0 8px",overflowY:"auto"}}>
        <div style={{marginBottom:4,padding:"0 8px 6px",fontSize:10,color:T.textDim,textTransform:"uppercase",letterSpacing:2,fontFamily:"'Geist Mono',monospace",display:col?"none":"block"}}>
          Menu
        </div>
        {NAV_ITEMS.map(({id,label,icon:Icon})=>{
          const active=view===id;
          const badge = id==="tasks"?stats.overdue:id==="home"?stats.dueToday:null;
          return (
            <motion.button key={id} onClick={()=>act({type:"SET_VIEW",v:id})}
              whileHover={{x:2}}
              style={{
                width:"100%",display:"flex",alignItems:"center",gap:10,
                padding:"9px 10px",borderRadius:10,border:"none",cursor:"pointer",textAlign:"left",
                marginBottom:2,
                background:active?`${T.primary}15`:"transparent",
                color:active?T.primary:T.textMuted,
              }}>
              <Icon size={16} style={{flexShrink:0,color:active?T.primary:T.textMuted}}/>
              {!col && (
                <span style={{flex:1,fontSize:13,fontWeight:active?600:400,fontFamily:"'Syne',sans-serif"}}>{label}</span>
              )}
              {!col && badge>0 && (
                <span style={{background:T.danger,color:"white",fontSize:10,fontWeight:700,
                  padding:"1px 5px",borderRadius:99,fontFamily:"'Geist Mono',monospace"}}>
                  {badge}
                </span>
              )}
            </motion.button>
          );
        })}

        {/* Categories */}
        {!col && (
          <div style={{marginTop:16}}>
            <div style={{padding:"0 8px 6px",fontSize:10,color:T.textDim,textTransform:"uppercase",letterSpacing:2,fontFamily:"'Geist Mono',monospace"}}>
              Categories
            </div>
            {CATEGORIES.map(cat=>{
              const count=tasks.filter(t=>t.cat===cat.id&&!t.done).length;
              return (
                <motion.button key={cat.id} whileHover={{x:2}}
                  onClick={()=>act({type:"SET_VIEW",v:`cat:${cat.id}`})}
                  style={{
                    width:"100%",display:"flex",alignItems:"center",gap:10,
                    padding:"7px 10px",borderRadius:10,border:"none",cursor:"pointer",
                    background:view===`cat:${cat.id}`?`${cat.color}15`:"transparent",
                    color:view===`cat:${cat.id}`?cat.color:T.textMuted,marginBottom:1,
                  }}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:cat.color,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:12,fontFamily:"'Syne',sans-serif"}}>{cat.emoji} {cat.label}</span>
                  {count>0 && <span style={{fontSize:11,color:T.textDim,fontFamily:"'Geist Mono',monospace"}}>{count}</span>}
                </motion.button>
              );
            })}
          </div>
        )}
      </nav>

      {/* User + streak */}
      {!col && (
        <div style={{padding:12,borderTop:`1px solid ${T.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,
              background:T.grad1,display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:12,fontWeight:700,color:"#080B14"}}>YO</div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.text,fontFamily:"'Syne',sans-serif"}}>You</div>
              <div style={{fontSize:10,color:T.textMuted,fontFamily:"'Geist Mono',monospace",display:"flex",alignItems:"center",gap:4}}>
                <Flame size={10} style={{color:T.warning}}/>{getStats(tasks).streak}d streak
              </div>
            </div>
            <motion.button whileHover={{scale:1.1}} style={{marginLeft:"auto",background:"transparent",border:"none",cursor:"pointer",color:T.textMuted}}>
              <Settings size={14}/>
            </motion.button>
          </div>
          <div style={{height:3,borderRadius:99,background:T.border,overflow:"hidden"}}>
            <motion.div style={{height:"100%",borderRadius:99,background:T.grad1}}
              initial={{width:0}} animate={{width:`${getStats(tasks).productivity}%`}} transition={{duration:1,delay:0.3}}/>
          </div>
          <div style={{fontSize:10,color:T.textMuted,marginTop:4,fontFamily:"'Geist Mono',monospace"}}>
            {getStats(tasks).productivity}% productivity today
          </div>
        </div>
      )}
    </motion.aside>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  HEADER
// ═══════════════════════════════════════════════════════════════════════════
function Header() {
  const { state, act } = useStore();
  const { view, search, onlineUsers } = state;

  const viewMeta = useMemo(()=>{
    if(view.startsWith("cat:")) {
      const c=CATEGORIES.find(x=>x.id===view.replace("cat:",""));
      return { label:c?.label||"Category", sub:`${c?.emoji} category tasks` };
    }
    const nav=NAV_ITEMS.find(n=>n.id===view);
    const subs = {
      home:"Your productivity hub", tasks:"Manage your work",
      calendar:"Schedule & plan", analytics:"Deep insights",
      ai:"AI-powered assistant", collab:"Team workspace",
    };
    return { label:nav?.label||"Overview", sub:subs[view]||"" };
  },[view]);

  return (
    <div style={{
      display:"flex",alignItems:"center",gap:16,
      padding:"0 24px",height:60,flexShrink:0,
      background:`${T.bgCard}cc`,backdropFilter:"blur(20px)",
      borderBottom:`1px solid ${T.border}`,
    }}>
      {/* Title */}
      <div style={{flex:1,minWidth:0}}>
        <AnimatePresence mode="wait">
          <motion.h1 key={view}
            initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}}
            style={{fontSize:16,fontWeight:700,color:T.text,letterSpacing:"-0.3px",fontFamily:"'Syne',sans-serif"}}>
            {viewMeta.label}
          </motion.h1>
        </AnimatePresence>
        <div style={{fontSize:11,color:T.textMuted,fontFamily:"'Geist Mono',monospace"}}>{viewMeta.sub}</div>
      </div>

      {/* Search */}
      <div style={{position:"relative"}}>
        <Search size={13} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.textMuted}}/>
        <input value={search} onChange={e=>act({type:"SET_SEARCH",q:e.target.value})}
          placeholder="Search tasks…"
          style={{
            paddingLeft:30,paddingRight:12,paddingTop:7,paddingBottom:7,
            borderRadius:10,border:`1px solid ${T.border}`,background:T.bgGlass,
            color:T.text,fontSize:12,fontFamily:"'Syne',sans-serif",outline:"none",width:180,
          }}/>
      </div>

      {/* Online users (collaboration) */}
      <div style={{display:"flex",alignItems:"center",gap:-4}}>
        {onlineUsers.filter(u=>u.status==="active").map((u,i)=>(
          <motion.div key={u.id} whileHover={{scale:1.15,zIndex:99}}
            title={u.name}
            style={{
              width:28,height:28,borderRadius:"50%",
              background:u.color,color:"#080B14",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:9,fontWeight:700,
              border:`2px solid ${T.bgCard}`,
              marginLeft:i>0?-8:0,cursor:"pointer",
              boxShadow:`0 0 0 1px ${u.color}40`,
            }}>
            {u.avatar}
          </motion.div>
        ))}
        <div style={{marginLeft:4,width:6,height:6,borderRadius:"50%",background:T.primary,boxShadow:`0 0 6px ${T.primary}`}}/>
      </div>

      {/* Actions */}
      <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
        onClick={()=>act({type:"SET_PALETTE",open:true})}
        style={{
          display:"flex",alignItems:"center",gap:6,
          padding:"7px 12px",borderRadius:10,border:`1px solid ${T.border}`,
          background:T.bgGlass,color:T.text,cursor:"pointer",fontSize:12,fontFamily:"'Syne',sans-serif",
        }}>
        <Command size={12}/> Palette
        <kbd style={{fontFamily:"'Geist Mono',monospace",fontSize:9,padding:"1px 4px",borderRadius:4,background:T.border,color:T.textMuted}}>⌘K</kbd>
      </motion.button>

      <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
        style={{position:"relative",background:"transparent",border:"none",cursor:"pointer",color:T.textMuted}}>
        <Bell size={16}/>
        <span style={{position:"absolute",top:-2,right:-2,width:7,height:7,borderRadius:"50%",
          background:T.danger,border:`2px solid ${T.bgCard}`}}/>
      </motion.button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  TASK CARD + LIST
// ═══════════════════════════════════════════════════════════════════════════
function TaskCard({ task, isDragging=false }) {
  const { act, notify } = useStore();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [expanded, setExpanded] = useState(false);
  const cat = getCat(task.cat);
  const pri = getPri(task.pri);
  const dateMeta = formatDate(task.dueDate);

  const toggle = () => {
    act({ type:"UPDATE_TASK", id:task.id, data:{ done:!task.done, completedAt:task.done?null:Date.now() }});
    if(!task.done) notify(`✅ "${task.text.slice(0,30)}…" completed!`);
  };
  const del = () => { act({type:"DELETE_TASK",id:task.id}); notify("Task deleted","info"); };
  const commitEdit = () => {
    if(editText.trim()) act({type:"UPDATE_TASK",id:task.id,data:{text:editText.trim()}});
    setEditing(false);
  };

  return (
    <motion.div layout
      style={{
        borderRadius:14,
        background:isDragging?`${T.bgGlass2}`:T.bgCard,
        border:`1px solid ${isDragging?T.accent:T.border}`,
        boxShadow:isDragging?"0 20px 60px rgba(0,0,0,0.5)":"none",
        overflow:"hidden",
        opacity:task.done&&!isDragging?0.55:1,
        transition:"opacity 0.2s",
      }}>

      {/* Priority bar */}
      <div style={{height:2,background:task.done?"#1E293B":pri.color,opacity:task.done?0.3:0.7}}/>

      <div className="group" style={{padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:10}}>
        {/* Drag */}
        <div style={{paddingTop:2,color:T.textDim,cursor:"grab",flexShrink:0,opacity:0.4}}>
          <GripVertical size={13}/>
        </div>

        {/* Checkbox */}
        <motion.button onClick={toggle} whileHover={{scale:1.15}} whileTap={{scale:0.88}}
          style={{flexShrink:0,background:"transparent",border:"none",cursor:"pointer",paddingTop:2}}>
          <AnimatePresence mode="wait">
            {task.done
              ? <motion.div key="d" initial={{scale:0,rotate:-20}} animate={{scale:1,rotate:0}}>
                  <CheckCircle2 size={18} style={{color:T.primary}}/>
                </motion.div>
              : <motion.div key="u" initial={{scale:0}} animate={{scale:1}}>
                  <Circle size={18} style={{color:T.textDim}}/>
                </motion.div>
            }
          </AnimatePresence>
        </motion.button>

        {/* Content */}
        <div style={{flex:1,minWidth:0}}>
          {editing ? (
            <input autoFocus value={editText}
              onChange={e=>setEditText(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter")commitEdit();if(e.key==="Escape")setEditing(false);}}
              onBlur={commitEdit}
              style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${T.accent}`,
                color:T.text,fontSize:13,fontFamily:"'Syne',sans-serif",outline:"none",paddingBottom:2}}/>
          ) : (
            <div style={{display:"flex",alignItems:"flex-start",gap:6}}>
              <p style={{
                flex:1,fontSize:13,fontWeight:500,lineHeight:1.45,
                fontFamily:"'Syne',sans-serif",
                textDecoration:task.done?"line-through":"none",
                color:task.done?T.textMuted:T.text,
              }}>
                {task.text}
              </p>
              {task.aiGenerated && (
                <span title="AI generated" style={{flexShrink:0,marginTop:2}}>
                  <Sparkles size={11} style={{color:T.accent}}/>
                </span>
              )}
            </div>
          )}

          {/* Meta row */}
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:7,alignItems:"center"}}>
            <Badge color={cat.color}>{cat.emoji} {cat.label}</Badge>
            <Badge color={pri.color}><Flag size={9}/> {pri.label}</Badge>
            {dateMeta && (
              <span style={{
                fontSize:11,fontFamily:"'Geist Mono',monospace",
                color:dateMeta.overdue?T.danger:dateMeta.urgent?T.warning:T.textMuted,
                display:"flex",alignItems:"center",gap:3,
              }}>
                <CalendarDays size={10}/> {dateMeta.label}
              </span>
            )}
            {task.tags?.map(tag=>(
              <span key={tag} style={{fontSize:10,color:T.textDim,fontFamily:"'Geist Mono',monospace"}}># {tag}</span>
            ))}
            {task.effort>0 && (
              <span style={{fontSize:10,color:T.textDim,fontFamily:"'Geist Mono',monospace",display:"flex",alignItems:"center",gap:3}}>
                <Zap size={9}/>{task.effort}h
              </span>
            )}
          </div>

          {/* Subtasks */}
          {task.subtasks?.length>0 && (
            <div style={{marginTop:8}}>
              <button onClick={()=>setExpanded(e=>!e)}
                style={{background:"transparent",border:"none",cursor:"pointer",color:T.textMuted,fontSize:11,display:"flex",alignItems:"center",gap:4,fontFamily:"'Geist Mono',monospace"}}>
                {expanded?<ChevronDown size={11}/>:<ChevronRight size={11}/>}
                {task.subtasks.length} subtasks
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}>
                    {task.subtasks.map((s,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginTop:4,paddingLeft:8,
                        borderLeft:`2px solid ${T.border}`}}>
                        <Circle size={10} style={{color:T.textDim,flexShrink:0}}/>
                        <span style={{fontSize:11,color:T.textMuted,fontFamily:"'Syne',sans-serif"}}>{s}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:2,flexShrink:0,opacity:0,transition:"opacity 0.15s"}} className="card-actions">
          <motion.button whileHover={{scale:1.1}} onClick={()=>{setEditing(true);setEditText(task.text);}}
            style={{width:26,height:26,borderRadius:8,background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Pencil size={12} style={{color:T.accent}}/>
          </motion.button>
          <motion.button whileHover={{scale:1.1}} onClick={del}
            style={{width:26,height:26,borderRadius:8,background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Trash2 size={12} style={{color:T.danger}}/>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function SortableTaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });
  const style = { transform:CSS.Transform.toString(transform), transition, zIndex:isDragging?999:undefined, touchAction:"none" };
  return (
    <motion.div ref={setNodeRef} style={style} {...attributes} {...listeners}
      layout
      initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,x:60,scale:0.9}}
      transition={{type:"spring",stiffness:400,damping:30}}>
      <TaskCard task={task} isDragging={isDragging}/>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  TASK INPUT WITH AI PARSING
// ═══════════════════════════════════════════════════════════════════════════
function TaskInput() {
  const { act, notify } = useStore();
  const [text, setText]     = useState("");
  const [cat,  setCat]      = useState("work");
  const [pri,  setPri]      = useState("medium");
  const [due,  setDue]      = useState("");
  const [exp,  setExp]      = useState(false);
  const [aiParsing, setAiParsing] = useState(false);
  const inputRef = useRef(null);

  const handleAdd = useCallback(async (useAI=false) => {
    if (!text.trim()) return;
    let taskData = { text:text.trim(), cat, pri, dueDate:due||null, tags:[], subtasks:[], aiGenerated:false, effort:1 };

    if (useAI) {
      setAiParsing(true);
      try {
        const parsed = await parseTaskWithAI(text);
        if (parsed) {
          taskData = { ...taskData, ...parsed, cat:parsed.cat||cat, pri:parsed.pri||pri, aiGenerated:true };
          notify("🤖 AI parsed your task intelligently!");
        }
      } catch(e) { /* fallback to manual */ }
      finally { setAiParsing(false); }
    }

    act({ type:"ADD_TASK", task:{ id:genId(), createdAt:Date.now(), done:false, completedAt:null, ...taskData }});
    setText(""); setDue(""); setExp(false);
    if(!useAI) notify("Task added ✨");
    inputRef.current?.focus();
  }, [text, cat, pri, due, act, notify]);

  return (
    <GlassCard style={{marginBottom:16,overflow:"visible"}} layout>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px"}}>
        <motion.div whileHover={{scale:1.08}}
          style={{width:32,height:32,borderRadius:8,flexShrink:0,background:T.grad1,
            display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
            boxShadow:`0 4px 12px rgba(110,231,183,0.3)`}}
          onClick={()=>inputRef.current?.focus()}>
          <Plus size={16} color="#080B14"/>
        </motion.div>
        <input ref={inputRef} value={text}
          onChange={e=>{setText(e.target.value);if(!exp&&e.target.value)setExp(true);}}
          onFocus={()=>setExp(true)}
          onKeyDown={e=>e.key==="Enter"&&handleAdd(false)}
          placeholder="Add a task, or let AI parse it…"
          style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.text,fontSize:13,fontFamily:"'Syne',sans-serif"}}/>
        <AnimatePresence>
          {text && (
            <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.8}}
              style={{display:"flex",gap:6,alignItems:"center"}}>
              <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} onClick={()=>handleAdd(false)}
                style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${T.border}`,
                  background:T.bgGlass2,color:T.text,cursor:"pointer",fontSize:12,fontFamily:"'Syne',sans-serif",display:"flex",alignItems:"center",gap:5}}>
                <Plus size={12}/> Add
              </motion.button>
              <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} onClick={()=>handleAdd(true)}
                disabled={aiParsing}
                style={{padding:"6px 12px",borderRadius:8,border:"none",
                  background:T.grad1,color:"#080B14",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Syne',sans-serif",display:"flex",alignItems:"center",gap:5}}>
                {aiParsing?<Loader2 size={12} className="animate-spin"/>:<Wand2 size={12}/>}
                {aiParsing?"Parsing…":"AI Parse"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {exp && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
            style={{overflow:"hidden"}}>
            <div style={{padding:"0 14px 12px",borderTop:`1px solid ${T.border}`,paddingTop:10,display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
              <span style={{fontSize:11,color:T.textMuted,fontFamily:"'Geist Mono',monospace",marginRight:4}}>Cat:</span>
              {CATEGORIES.map(c=>(
                <motion.button key={c.id} whileTap={{scale:0.93}} onClick={()=>setCat(c.id)}
                  style={{padding:"3px 8px",borderRadius:7,border:`1px solid ${cat===c.id?c.color+"44":T.border}`,
                    background:cat===c.id?`${c.color}18`:"transparent",color:cat===c.id?c.color:T.textMuted,
                    cursor:"pointer",fontSize:11,fontFamily:"'Syne',sans-serif"}}>
                  {c.emoji} {c.label}
                </motion.button>
              ))}
              <div style={{width:1,height:16,background:T.border,margin:"0 4px"}}/>
              <span style={{fontSize:11,color:T.textMuted,fontFamily:"'Geist Mono',monospace",marginRight:4}}>Priority:</span>
              {PRIORITIES.map(p=>(
                <motion.button key={p.id} whileTap={{scale:0.93}} onClick={()=>setPri(p.id)}
                  style={{padding:"3px 8px",borderRadius:7,border:`1px solid ${pri===p.id?p.color+"44":T.border}`,
                    background:pri===p.id?`${p.color}18`:"transparent",color:pri===p.id?p.color:T.textMuted,
                    cursor:"pointer",fontSize:11,fontFamily:"'Syne',sans-serif"}}>
                  {p.label}
                </motion.button>
              ))}
              <div style={{width:1,height:16,background:T.border,margin:"0 4px"}}/>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <CalendarDays size={11} style={{color:T.textMuted}}/>
                <input type="date" value={due} onChange={e=>setDue(e.target.value)}
                  style={{background:"transparent",border:`1px solid ${T.border}`,color:T.text,fontSize:11,
                    borderRadius:7,padding:"3px 7px",fontFamily:"'Geist Mono',monospace",outline:"none"}}/>
              </div>
              <button onClick={()=>setExp(false)} style={{marginLeft:"auto",background:"transparent",border:"none",cursor:"pointer",color:T.textMuted}}>
                <ChevronDown size={14}/>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  FILTERS + SORT BAR
// ═══════════════════════════════════════════════════════════════════════════
function FilterBar({ tasks }) {
  const { state, act } = useStore();
  const { filter, sortBy } = state;
  const counts = { All:tasks.length, Active:tasks.filter(t=>!t.done).length, Completed:tasks.filter(t=>t.done).length };

  return (
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <div style={{display:"flex",gap:2,padding:"3px",borderRadius:10,background:T.bgGlass,border:`1px solid ${T.border}`}}>
        {["All","Active","Completed"].map(f=>(
          <motion.button key={f} onClick={()=>act({type:"SET_FILTER",f})} whileTap={{scale:0.96}}
            style={{
              padding:"5px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,
              background:filter===f?`${T.primary}20`:"transparent",
              color:filter===f?T.primary:T.textMuted,fontFamily:"'Syne',sans-serif",fontWeight:filter===f?600:400,
            }}>
            {f} <span style={{opacity:0.5,marginLeft:2,fontSize:11,fontFamily:"'Geist Mono',monospace"}}>{counts[f]}</span>
          </motion.button>
        ))}
      </div>
      <div style={{flex:1}}/>
      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {[["created","Date"],["priority","Priority"],["due","Due"],["alpha","A–Z"]].map(([id,lbl])=>(
          <motion.button key={id} onClick={()=>act({type:"SET_SORT",s:id})} whileTap={{scale:0.96}}
            style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${sortBy===id?T.accent+"44":T.border}`,
              background:sortBy===id?`${T.accent}15`:"transparent",color:sortBy===id?T.accent:T.textMuted,
              cursor:"pointer",fontSize:11,fontFamily:"'Geist Mono',monospace"}}>
            {lbl}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  TASK VIEW
// ═══════════════════════════════════════════════════════════════════════════
function TasksView() {
  const { state, act, notify } = useStore();
  const { tasks, view, filter, search, sortBy } = state;

  const sensors = useSensors(
    useSensor(PointerSensor,{activationConstraint:{distance:8}}),
    useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates})
  );
  const [activeId, setActiveId] = useState(null);
  const activeTask = tasks.find(t=>t.id===activeId);

  const visible = useMemo(()=>{
    const t=today();
    let list=[...tasks];
    if(view==="today")     list=list.filter(x=>x.dueDate===t);
    else if(view==="upcoming") list=list.filter(x=>x.dueDate&&x.dueDate>t&&!x.done);
    else if(view.startsWith("cat:")) list=list.filter(x=>x.cat===view.replace("cat:",""));
    if(filter==="Active")    list=list.filter(x=>!x.done);
    if(filter==="Completed") list=list.filter(x=>x.done);
    if(search.trim()) { const q=search.toLowerCase(); list=list.filter(x=>x.text.toLowerCase().includes(q)||(x.tags||[]).some(tg=>tg.includes(q))); }
    const priRank={critical:0,high:1,medium:2,low:3};
    if(sortBy==="priority") list.sort((a,b)=>priRank[a.pri]-priRank[b.pri]);
    else if(sortBy==="due")  list.sort((a,b)=>{ if(!a.dueDate)return 1;if(!b.dueDate)return -1;return a.dueDate.localeCompare(b.dueDate); });
    else if(sortBy==="alpha") list.sort((a,b)=>a.text.localeCompare(b.text));
    else list.sort((a,b)=>b.createdAt-a.createdAt);
    return list;
  },[tasks,view,filter,search,sortBy]);

  const handleDragEnd = ({active,over}) => {
    setActiveId(null);
    if(!over||active.id===over.id) return;
    const oi=tasks.findIndex(t=>t.id===active.id);
    const ni=tasks.findIndex(t=>t.id===over.id);
    act({type:"REORDER",tasks:arrayMove(tasks,oi,ni)});
  };

  if(!visible.length) return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
      style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 0",textAlign:"center"}}>
      <motion.div initial={{scale:0.5}} animate={{scale:1}} transition={{type:"spring",stiffness:200,delay:0.1}}
        style={{fontSize:56,marginBottom:16}}>✨</motion.div>
      <h3 style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:8,fontFamily:"'Syne',sans-serif"}}>All clear!</h3>
      <p style={{fontSize:13,color:T.textMuted,maxWidth:260,fontFamily:"'Syne',sans-serif"}}>
        {search?"No tasks match your search.":"Add your first task above to get started."}
      </p>
    </motion.div>
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}
      onDragStart={({active})=>setActiveId(active.id)} onDragEnd={handleDragEnd}>
      <SortableContext items={visible.map(t=>t.id)} strategy={verticalListSortingStrategy}>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <AnimatePresence mode="popLayout">
            {visible.map(task=><SortableTaskCard key={task.id} task={task}/>)}
          </AnimatePresence>
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={{duration:200}}>
        {activeTask && <TaskCard task={activeTask} isDragging/>}
      </DragOverlay>
    </DndContext>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  HOME / OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════
function HomeView() {
  const { state, act } = useStore();
  const stats = getStats(state.tasks);
  const [insightIdx, setInsightIdx] = useState(0);

  useEffect(()=>{
    const t=setInterval(()=>setInsightIdx(i=>(i+1)%INSIGHT_MESSAGES.length),5000);
    return()=>clearInterval(t);
  },[]);

  const todayTasks = state.tasks.filter(t=>t.dueDate===today()&&!t.done);
  const overdueTasks= state.tasks.filter(t=>!t.done&&t.dueDate&&t.dueDate<today());

  const metricCards = [
    { label:"Total Tasks",    value:stats.total,        icon:ListTodo,  color:T.accent, grad:T.grad3 },
    { label:"Completed",      value:stats.done,         icon:CheckCircle2,color:T.primary,grad:T.grad1 },
    { label:"Active",         value:stats.active,       icon:Clock,     color:T.warning, grad:T.grad2 },
    { label:"Overdue",        value:stats.overdue,      icon:AlertCircle,color:T.danger, grad:"linear-gradient(135deg,#F87171,#FB923C)" },
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Hero row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12}}>
        {metricCards.map(({label,value,icon:Icon,color,grad},i)=>(
          <motion.div key={label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            whileHover={{y:-3,boxShadow:`0 16px 48px rgba(0,0,0,0.4)`}}
            style={{borderRadius:16,border:`1px solid ${T.border}`,background:T.bgCard,
              padding:"16px",cursor:"pointer",overflow:"hidden",position:"relative"}}
            onClick={()=>act({type:"SET_VIEW",v:"tasks"})}>
            {/* glow */}
            <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",
              background:grad,opacity:0.12,filter:"blur(20px)"}}/>
            <div style={{width:36,height:36,borderRadius:10,background:grad,
              display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10,
              boxShadow:`0 4px 12px ${color}40`}}>
              <Icon size={18} color="#080B14"/>
            </div>
            <div style={{fontSize:28,fontWeight:800,color,letterSpacing:"-1px",fontFamily:"'Syne',sans-serif"}}>
              <AnimNumber value={value}/>
            </div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:2,fontFamily:"'Geist Mono',monospace"}}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main content row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:12}}>

        {/* Left column */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>

          {/* Progress ring + weekly chart */}
          <GlassCard style={{padding:"16px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:T.text,fontFamily:"'Syne',sans-serif"}}>Weekly Productivity</div>
                <div style={{fontSize:11,color:T.textMuted,fontFamily:"'Geist Mono',monospace"}}>Completed vs Added</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <ProgressRing value={stats.productivity} size={56} stroke={5} color={T.primary}/>
                  <div style={{position:"absolute",textAlign:"center"}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.primary,fontFamily:"'Geist Mono',monospace"}}>{stats.productivity}%</div>
                  </div>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={WEEKLY_PRODUCTIVITY} margin={{top:4,right:4,bottom:0,left:-20}}>
                <defs>
                  <linearGradient id="gCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.primary} stopOpacity={0.3}/>
                    <stop offset="100%" stopColor={T.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gAdded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.accent} stopOpacity={0.2}/>
                    <stop offset="100%" stopColor={T.accent} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
                <XAxis dataKey="day" tick={{fontSize:10,fill:T.textMuted,fontFamily:"'Geist Mono',monospace"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:T.textMuted,fontFamily:"'Geist Mono',monospace"}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:10,fontFamily:"'Syne',sans-serif",fontSize:12,color:T.text}} cursor={{stroke:T.border}}/>
                <Area type="monotone" dataKey="completed" name="Completed" stroke={T.primary} fill="url(#gCompleted)" strokeWidth={2}/>
                <Area type="monotone" dataKey="added" name="Added" stroke={T.accent} fill="url(#gAdded)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* AI insight ticker */}
          <GlassCard style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:10,
            background:`linear-gradient(135deg,${T.accent}10,${T.primary}10)`,
            border:`1px solid ${T.accent}30`}}>
            <div style={{width:30,height:30,borderRadius:8,background:T.grad1,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Lightbulb size={14} color="#080B14"/>
            </div>
            <div style={{flex:1,overflow:"hidden"}}>
              <div style={{fontSize:10,color:T.accent,fontFamily:"'Geist Mono',monospace",marginBottom:2,textTransform:"uppercase",letterSpacing:1}}>AI Insight</div>
              <AnimatePresence mode="wait">
                <motion.p key={insightIdx}
                  initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
                  style={{fontSize:12,color:T.text,fontFamily:"'Syne',sans-serif"}}>
                  {INSIGHT_MESSAGES[insightIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
            <motion.button whileHover={{scale:1.05}} onClick={()=>act({type:"SET_VIEW",v:"ai"})}
              style={{padding:"5px 10px",borderRadius:7,background:T.grad1,border:"none",
                cursor:"pointer",fontSize:11,fontWeight:600,color:"#080B14",fontFamily:"'Syne',sans-serif",flexShrink:0}}>
              Ask AI →
            </motion.button>
          </GlassCard>
        </div>

        {/* Right column */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>

          {/* Due today */}
          <GlassCard style={{padding:"14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
              <Clock size={13} style={{color:T.warning}}/>
              <span style={{fontSize:12,fontWeight:600,color:T.text,fontFamily:"'Syne',sans-serif"}}>Due Today</span>
              {todayTasks.length>0 && <Badge color={T.warning}>{todayTasks.length}</Badge>}
            </div>
            {todayTasks.length===0
              ? <div style={{fontSize:12,color:T.textMuted,fontFamily:"'Syne',sans-serif",textAlign:"center",padding:"12px 0"}}>🎉 All clear for today!</div>
              : todayTasks.slice(0,4).map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:getPri(t.pri).color,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:11,color:T.text,fontFamily:"'Syne',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.text}</span>
                </div>
              ))
            }
          </GlassCard>

          {/* Overdue */}
          {overdueTasks.length>0 && (
            <GlassCard style={{padding:"14px",border:`1px solid ${T.danger}30`,background:`${T.danger}08`}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                <AlertCircle size={13} style={{color:T.danger}}/>
                <span style={{fontSize:12,fontWeight:600,color:T.danger,fontFamily:"'Syne',sans-serif"}}>Overdue</span>
                <Badge color={T.danger}>{overdueTasks.length}</Badge>
              </div>
              {overdueTasks.slice(0,3).map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0"}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:T.danger,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:11,color:T.textMuted,fontFamily:"'Syne',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.text}</span>
                </div>
              ))}
            </GlassCard>
          )}

          {/* Category breakdown */}
          <GlassCard style={{padding:"14px"}}>
            <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:10,fontFamily:"'Syne',sans-serif"}}>Category Breakdown</div>
            {getStats(state.tasks).byCat.map(c=>{
              const pct=c.value>0?Math.round((c.done/c.value)*100):0;
              return (
                <div key={c.name} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:10,color:T.text,fontFamily:"'Syne',sans-serif"}}>{c.name}</span>
                    <span style={{fontSize:10,color:T.textMuted,fontFamily:"'Geist Mono',monospace"}}>{c.done}/{c.value}</span>
                  </div>
                  <div style={{height:3,borderRadius:99,background:`${c.color}20`}}>
                    <motion.div style={{height:"100%",borderRadius:99,background:c.color}}
                      initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.8,ease:"easeOut"}}/>
                  </div>
                </div>
              );
            })}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  CALENDAR VIEW
// ═══════════════════════════════════════════════════════════════════════════
function CalendarView() {
  const { state } = useStore();
  const [month, setMonth] = useState(new Date());

  const year  = month.getFullYear();
  const mon   = month.getMonth();
  const first = new Date(year,mon,1).getDay();
  const days  = new Date(year,mon+1,0).getDate();

  const tasksByDate = useMemo(()=>{
    const map = {};
    state.tasks.forEach(t=>{ if(t.dueDate){ if(!map[t.dueDate])map[t.dueDate]=[]; map[t.dueDate].push(t); }});
    return map;
  },[state.tasks]);

  const prev = ()=>setMonth(d=>{ const n=new Date(d); n.setMonth(n.getMonth()-1); return n; });
  const next = ()=>setMonth(d=>{ const n=new Date(d); n.setMonth(n.getMonth()+1); return n; });

  const todayStr = today();
  const cells = [];
  for(let i=0;i<first;i++) cells.push(null);
  for(let d=1;d<=days;d++) cells.push(d);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <GlassCard style={{padding:"20px"}}>
        {/* Month nav */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <motion.button whileHover={{scale:1.1}} onClick={prev}
            style={{width:32,height:32,borderRadius:8,background:T.bgGlass2,border:`1px solid ${T.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.text}}>
            <ChevronLeft size={14}/>
          </motion.button>
          <div style={{fontWeight:700,fontSize:15,fontFamily:"'Syne',sans-serif",color:T.text}}>
            {month.toLocaleDateString("en-US",{month:"long",year:"numeric"})}
          </div>
          <motion.button whileHover={{scale:1.1}} onClick={next}
            style={{width:32,height:32,borderRadius:8,background:T.bgGlass2,border:`1px solid ${T.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.text}}>
            <ChevronRight size={14}/>
          </motion.button>
        </div>

        {/* Day headers */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6}}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
            <div key={d} style={{textAlign:"center",fontSize:10,color:T.textMuted,fontFamily:"'Geist Mono',monospace",paddingBottom:4}}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
          {cells.map((d,i)=>{
            if(!d) return <div key={`e${i}`}/>;
            const dateStr = `${year}-${String(mon+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const dayTasks = tasksByDate[dateStr]||[];
            const isT = dateStr===todayStr;
            const hasDone = dayTasks.some(t=>t.done);
            const hasActive = dayTasks.some(t=>!t.done);
            return (
              <motion.div key={d} whileHover={{scale:1.06}}
                style={{
                  minHeight:52,borderRadius:10,padding:"6px 6px 4px",
                  background:isT?`${T.primary}20`:T.bgGlass,
                  border:`1px solid ${isT?T.primary:T.border}`,
                  cursor:"pointer",position:"relative",
                }}>
                <div style={{fontSize:11,fontWeight:isT?700:400,color:isT?T.primary:T.text,fontFamily:"'Geist Mono',monospace",marginBottom:3}}>{d}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:2}}>
                  {dayTasks.slice(0,3).map((t,ti)=>(
                    <div key={ti} style={{width:"100%",height:3,borderRadius:99,background:getCat(t.cat).color,opacity:t.done?0.4:1}}/>
                  ))}
                  {dayTasks.length>3 && <div style={{fontSize:8,color:T.textMuted,fontFamily:"'Geist Mono',monospace"}}>+{dayTasks.length-3}</div>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Upcoming list */}
      <GlassCard style={{padding:"16px"}}>
        <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:12,fontFamily:"'Syne',sans-serif"}}>Scheduled Tasks</div>
        {Object.entries(tasksByDate).sort(([a],[b])=>a.localeCompare(b)).slice(0,6).map(([date,dTasks])=>(
          <div key={date} style={{marginBottom:10}}>
            <div style={{fontSize:10,color:T.textMuted,fontFamily:"'Geist Mono',monospace",marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>
              {formatDate(date)?.label||date}
            </div>
            {dTasks.map(t=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",borderRadius:8,
                background:T.bgGlass,marginBottom:3}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:getCat(t.cat).color,flexShrink:0}}/>
                <span style={{flex:1,fontSize:12,color:t.done?T.textMuted:T.text,fontFamily:"'Syne',sans-serif",
                  textDecoration:t.done?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.text}</span>
                <Badge color={getPri(t.pri).color}>{getPri(t.pri).label}</Badge>
              </div>
            ))}
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  ANALYTICS DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
function AnalyticsView() {
  const { state } = useStore();
  const stats = getStats(state.tasks);

  const CustomTooltip = ({active,payload})=>{
    if(!active||!payload?.length) return null;
    return (
      <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 12px",fontSize:12,fontFamily:"'Syne',sans-serif",color:T.text}}>
        {payload.map((p,i)=>(
          <div key={i} style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:p.color||p.fill,flexShrink:0}}/>
            <span style={{color:T.textMuted}}>{p.name}:</span>
            <span style={{fontWeight:600}}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* KPI row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {label:"Productivity Score", value:`${stats.productivity}%`, color:T.primary, sub:"vs 68% last week ↑"},
          {label:"Avg Completion Time", value:"2.4h",                  color:T.accent,  sub:"Per high-priority task"},
          {label:"On-time Rate",        value:"78%",                   color:T.warning, sub:"Tasks done before due"},
          {label:"Focus Hours",         value:"14h",                   color:"#FB923C", sub:"This week"},
        ].map(({label,value,color,sub},i)=>(
          <motion.div key={label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
            style={{padding:"14px 16px",borderRadius:14,background:T.bgCard,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:6,fontFamily:"'Geist Mono',monospace"}}>{label}</div>
            <div style={{fontSize:24,fontWeight:800,color,letterSpacing:"-0.5px",fontFamily:"'Syne',sans-serif"}}>{value}</div>
            <div style={{fontSize:10,color:T.textMuted,marginTop:3,fontFamily:"'Geist Mono',monospace"}}>{sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <GlassCard style={{padding:"16px"}}>
          <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:4,fontFamily:"'Syne',sans-serif"}}>Weekly Completion Rate</div>
          <div style={{fontSize:10,color:T.textMuted,marginBottom:12,fontFamily:"'Geist Mono',monospace"}}>% of added tasks completed each day</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={stats.completionRate} margin={{top:4,right:4,bottom:0,left:-24}}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
              <XAxis dataKey="day" tick={{fontSize:10,fill:T.textMuted,fontFamily:"'Geist Mono',monospace"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:T.textMuted,fontFamily:"'Geist Mono',monospace"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Line type="monotone" dataKey="rate" name="Rate %" stroke={T.primary} strokeWidth={2.5} dot={{fill:T.primary,strokeWidth:0,r:4}} activeDot={{r:6}}/>
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard style={{padding:"16px"}}>
          <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:4,fontFamily:"'Syne',sans-serif"}}>Task Distribution</div>
          <div style={{fontSize:10,color:T.textMuted,marginBottom:8,fontFamily:"'Geist Mono',monospace"}}>By category</div>
          {stats.byCat.length>0?(
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={stats.byCat} cx="50%" cy="50%" outerRadius={55} innerRadius={28} dataKey="value" paddingAngle={3}>
                    {stats.byCat.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip content={<CustomTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:4}}>
                {stats.byCat.map(c=>(
                  <span key={c.name} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:T.textMuted,fontFamily:"'Geist Mono',monospace"}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:c.color}}/>
                    {c.name} ({c.value})
                  </span>
                ))}
              </div>
            </>
          ):(
            <div style={{height:130,display:"flex",alignItems:"center",justifyContent:"center",color:T.textDim,fontSize:12}}>No data yet</div>
          )}
        </GlassCard>
      </div>

      {/* Charts row 2 */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12}}>
        <GlassCard style={{padding:"16px"}}>
          <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:4,fontFamily:"'Syne',sans-serif"}}>Priority Performance</div>
          <div style={{fontSize:10,color:T.textMuted,marginBottom:12,fontFamily:"'Geist Mono',monospace"}}>Total vs completed by priority</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.byPri} margin={{top:4,right:4,bottom:0,left:-20}} barGap={4} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:T.textMuted,fontFamily:"'Geist Mono',monospace"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:T.textMuted,fontFamily:"'Geist Mono',monospace"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="total" name="Total" radius={[5,5,0,0]}>
                {stats.byPri.map((e,i)=><Cell key={i} fill={`${e.color}44`}/>)}
              </Bar>
              <Bar dataKey="done" name="Completed" radius={[5,5,0,0]}>
                {stats.byPri.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard style={{padding:"16px"}}>
          <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:12,fontFamily:"'Syne',sans-serif"}}>Productivity Ring</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"8px 0"}}>
            <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <ProgressRing value={stats.productivity} size={100} stroke={10} color={T.primary}/>
              <div style={{position:"absolute",textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:800,color:T.primary,fontFamily:"'Syne',sans-serif"}}>{stats.productivity}%</div>
                <div style={{fontSize:9,color:T.textMuted,fontFamily:"'Geist Mono',monospace"}}>DONE</div>
              </div>
            </div>
          </div>
          <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:6}}>
            {[
              {label:"Done",   v:stats.done,   c:T.primary},
              {label:"Active", v:stats.active, c:T.accent},
              {label:"Overdue",v:stats.overdue,c:T.danger},
            ].map(({label,v,c})=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,color:T.textMuted,fontFamily:"'Geist Mono',monospace"}}>{label}</span>
                <span style={{fontSize:13,fontWeight:700,color:c,fontFamily:"'Syne',sans-serif"}}>{v}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  AI ASSISTANT VIEW
// ═══════════════════════════════════════════════════════════════════════════
function AIView() {
  const { state, act, notify } = useStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[state.aiMessages]);

  const send = async () => {
    if (!input.trim() || state.aiLoading) return;
    const userMsg = { role:"user", content:input.trim() };
    const allMsgs = [...state.aiMessages, userMsg];
    act({ type:"ADD_AI_MSG", msg:userMsg });
    setInput("");
    act({ type:"SET_AI_LOADING", v:true });
    try {
      const reply = await chatWithAI(allMsgs, state.tasks);
      act({ type:"ADD_AI_MSG", msg:{ role:"assistant", content:reply }});
    } catch(e) {
      act({ type:"ADD_AI_MSG", msg:{ role:"assistant", content:"Sorry, I'm having trouble connecting right now. Please try again." }});
    } finally {
      act({ type:"SET_AI_LOADING", v:false });
    }
  };

  const QUICK_PROMPTS = [
    "What should I focus on today?",
    "Break down my highest-priority task",
    "Analyze my productivity this week",
    "Suggest a daily schedule for my tasks",
    "Which tasks are at risk of being overdue?",
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",gap:12}}>
      {/* Chat history */}
      <GlassCard style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",minHeight:0}}>
        <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={{width:28,height:28,borderRadius:8,background:T.grad1,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Brain size={14} color="#080B14"/>
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:T.text,fontFamily:"'Syne',sans-serif"}}>Nexus AI</div>
            <div style={{fontSize:10,color:T.primary,fontFamily:"'Geist Mono',monospace",display:"flex",alignItems:"center",gap:4}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:T.primary,display:"inline-block"}}/>online
            </div>
          </div>
          <div style={{marginLeft:"auto",fontSize:10,color:T.textMuted,fontFamily:"'Geist Mono',monospace"}}>
            Powered by Claude
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:12}}>
          {state.aiMessages.map((msg,i)=>(
            <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
              style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",gap:8,alignItems:"flex-start"}}>
              {msg.role==="assistant" && (
                <div style={{width:24,height:24,borderRadius:7,background:T.grad1,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                  <Sparkles size={11} color="#080B14"/>
                </div>
              )}
              <div style={{
                maxWidth:"78%",padding:"10px 13px",borderRadius:msg.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",
                background:msg.role==="user"?T.grad1:T.bgGlass2,
                color:msg.role==="user"?"#080B14":T.text,
                fontSize:12,lineHeight:1.55,fontFamily:"'Syne',sans-serif",
                border:msg.role==="assistant"?`1px solid ${T.border}`:"none",
                whiteSpace:"pre-wrap",
              }}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {state.aiLoading && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:24,height:24,borderRadius:7,background:T.grad1,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Sparkles size={11} color="#080B14"/>
              </div>
              <div style={{padding:"10px 14px",borderRadius:"14px 14px 14px 4px",background:T.bgGlass2,border:`1px solid ${T.border}`,display:"flex",gap:5,alignItems:"center"}}>
                {[0,1,2].map(j=>(
                  <motion.div key={j} style={{width:6,height:6,borderRadius:"50%",background:T.primary}}
                    animate={{scale:[1,1.4,1],opacity:[0.5,1,0.5]}}
                    transition={{duration:0.8,delay:j*0.15,repeat:Infinity}}/>
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{padding:"12px 14px",borderTop:`1px solid ${T.border}`,flexShrink:0}}>
          <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
            <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
              placeholder="Ask anything about your tasks…"
              rows={1}
              style={{
                flex:1,background:T.bgGlass2,border:`1px solid ${T.border}`,borderRadius:10,
                color:T.text,padding:"8px 12px",fontSize:12,fontFamily:"'Syne',sans-serif",
                outline:"none",resize:"none",maxHeight:100,overflowY:"auto",lineHeight:1.5,
              }}/>
            <motion.button whileHover={{scale:1.06}} whileTap={{scale:0.95}} onClick={send}
              disabled={!input.trim()||state.aiLoading}
              style={{
                width:36,height:36,borderRadius:10,background:input.trim()&&!state.aiLoading?T.grad1:T.bgGlass2,
                border:"none",cursor:input.trim()&&!state.aiLoading?"pointer":"not-allowed",
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
              }}>
              <Send size={14} color={input.trim()&&!state.aiLoading?"#080B14":T.textMuted}/>
            </motion.button>
          </div>
        </div>
      </GlassCard>

      {/* Quick prompts */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {QUICK_PROMPTS.map(p=>(
          <motion.button key={p} whileHover={{scale:1.02}} whileTap={{scale:0.97}}
            onClick={()=>{ setInput(p); inputRef.current?.focus(); }}
            style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${T.border}`,background:T.bgGlass,
              color:T.textMuted,cursor:"pointer",fontSize:11,fontFamily:"'Syne',sans-serif"}}>
            {p}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  COLLABORATION VIEW
// ═══════════════════════════════════════════════════════════════════════════
function CollabView() {
  const { state } = useStore();

  const activity = [
    { user:"Alex Chen",  action:"completed",  task:"Design system tokens",  time:"2m ago",  color:"#6EE7B7" },
    { user:"Sarah Kim",  action:"added",      task:"Q4 roadmap planning",   time:"8m ago",  color:"#818CF8" },
    { user:"You",        action:"completed",  task:"Morning meditation",     time:"1h ago",  color:"#F472B6" },
    { user:"Marcus Liu", action:"commented",  task:"OAuth2 implementation",  time:"2h ago",  color:"#38BDF8" },
    { user:"Alex Chen",  action:"moved",      task:"API rate limiting",      time:"3h ago",  color:"#6EE7B7" },
  ];

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:14,height:"100%",alignItems:"start"}}>
      {/* Main */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <GlassCard style={{padding:"16px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:600,color:T.text,fontFamily:"'Syne',sans-serif"}}>Team Activity</div>
            <Badge color={T.primary}><Activity size={9}/> Live</Badge>
          </div>
          {activity.map((a,i)=>(
            <motion.div key={i} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
              style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",
                borderBottom:i<activity.length-1?`1px solid ${T.border}`:"none"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:a.color,flexShrink:0,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#080B14"}}>
                {a.user.split(" ").map(n=>n[0]).join("")}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <span style={{fontSize:12,fontWeight:600,color:T.text,fontFamily:"'Syne',sans-serif"}}>{a.user} </span>
                <span style={{fontSize:12,color:T.textMuted,fontFamily:"'Syne',sans-serif"}}>{a.action} </span>
                <span style={{fontSize:12,color:T.accent,fontFamily:"'Syne',sans-serif"}}>"{a.task}"</span>
              </div>
              <span style={{fontSize:10,color:T.textDim,flexShrink:0,fontFamily:"'Geist Mono',monospace"}}>{a.time}</span>
            </motion.div>
          ))}
        </GlassCard>

        <GlassCard style={{padding:"16px"}}>
          <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:12,fontFamily:"'Syne',sans-serif"}}>Shared Tasks</div>
          {state.tasks.filter(t=>t.cat==="work").slice(0,5).map(t=>(
            <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
              {t.done?<CheckCircle2 size={14} style={{color:T.primary,flexShrink:0}}/>:<Circle size={14} style={{color:T.textDim,flexShrink:0}}/>}
              <span style={{flex:1,fontSize:12,color:t.done?T.textMuted:T.text,fontFamily:"'Syne',sans-serif",
                textDecoration:t.done?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.text}</span>
              <div style={{display:"flex",gap:-4}}>
                {ONLINE_USERS.slice(0,2).map((u,i)=>(
                  <div key={u.id} style={{width:18,height:18,borderRadius:"50%",background:u.color,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:700,color:"#080B14",
                    marginLeft:i>0?-5:0,border:`1.5px solid ${T.bgCard}`}}>
                    {u.avatar}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Right panel */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <GlassCard style={{padding:"16px"}}>
          <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:10,fontFamily:"'Syne',sans-serif"}}>Online Now</div>
          {state.onlineUsers.map(u=>(
            <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0"}}>
              <div style={{position:"relative"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:u.color,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#080B14"}}>
                  {u.avatar}
                </div>
                <div style={{position:"absolute",bottom:0,right:0,width:9,height:9,borderRadius:"50%",
                  background:u.status==="active"?T.primary:T.textDim,border:`2px solid ${T.bgCard}`}}/>
              </div>
              <div>
                <div style={{fontSize:12,color:T.text,fontFamily:"'Syne',sans-serif",fontWeight:500}}>{u.name}</div>
                <div style={{fontSize:10,color:u.status==="active"?T.primary:T.textMuted,fontFamily:"'Geist Mono',monospace"}}>{u.status}</div>
              </div>
            </div>
          ))}
        </GlassCard>

        <GlassCard style={{padding:"14px",background:`${T.accent}08`,border:`1px solid ${T.accent}30`}}>
          <div style={{fontSize:11,color:T.accent,fontFamily:"'Geist Mono',monospace",marginBottom:6,display:"flex",alignItems:"center",gap:5}}>
            <Globe size={11}/> Real-time Sync
          </div>
          <p style={{fontSize:11,color:T.textMuted,lineHeight:1.6,fontFamily:"'Syne',sans-serif"}}>
            Connect Supabase to enable real-time collaboration, live cursors, and instant sync across team members.
          </p>
          <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}}
            style={{marginTop:10,width:"100%",padding:"7px",borderRadius:8,background:T.grad3,
              border:"none",cursor:"pointer",fontSize:11,fontWeight:600,color:"#080B14",fontFamily:"'Syne',sans-serif"}}>
            Connect Supabase →
          </motion.button>
        </GlassCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  FOCUS TIMER WIDGET (floating)
// ═══════════════════════════════════════════════════════════════════════════
function FocusTimer() {
  const [secs, setSecs]     = useState(25*60);
  const [active, setActive] = useState(false);
  const [visible, setVisible]= useState(false);

  useEffect(()=>{
    const handler = e => {
      if((e.metaKey||e.ctrlKey)&&e.key==="p"){ e.preventDefault(); setVisible(v=>!v); }
    };
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  },[]);

  useEffect(()=>{
    if(!active) return;
    const t=setInterval(()=>setSecs(s=>{ if(s<=0){clearInterval(t);setActive(false);return 25*60;}return s-1; }),1000);
    return()=>clearInterval(t);
  },[active]);

  if(!visible) return null;

  const mm=String(Math.floor(secs/60)).padStart(2,"0");
  const ss=String(secs%60).padStart(2,"0");
  const pct=((25*60-secs)/(25*60))*100;

  return (
    <motion.div initial={{opacity:0,scale:0.8,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.8,y:20}}
      style={{position:"fixed",bottom:24,left:24,zIndex:9998,borderRadius:16,padding:"14px 16px",
        background:T.bgCard,border:`1px solid ${T.border}`,boxShadow:"0 16px 48px rgba(0,0,0,0.5)",
        display:"flex",alignItems:"center",gap:12,minWidth:200}}>
      <div style={{position:"relative",flexShrink:0}}>
        <ProgressRing value={pct} size={48} stroke={4} color={T.primary}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Target size={14} style={{color:T.primary}}/>
        </div>
      </div>
      <div>
        <div style={{fontSize:20,fontWeight:700,color:T.text,fontFamily:"'Geist Mono',monospace",letterSpacing:2}}>{mm}:{ss}</div>
        <div style={{fontSize:10,color:T.textMuted,fontFamily:"'Geist Mono',monospace"}}>Focus Session</div>
      </div>
      <div style={{display:"flex",gap:4}}>
        <motion.button whileHover={{scale:1.1}} onClick={()=>setActive(a=>!a)}
          style={{width:28,height:28,borderRadius:8,background:T.primary,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {active?<Pause size={12} color="#080B14"/>:<Play size={12} color="#080B14"/>}
        </motion.button>
        <motion.button whileHover={{scale:1.1}} onClick={()=>{setSecs(25*60);setActive(false);}}
          style={{width:28,height:28,borderRadius:8,background:T.bgGlass2,border:`1px solid ${T.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.textMuted}}>
          <RotateCcw size={11}/>
        </motion.button>
        <motion.button whileHover={{scale:1.1}} onClick={()=>setVisible(false)}
          style={{width:28,height:28,borderRadius:8,background:T.bgGlass2,border:`1px solid ${T.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.textMuted}}>
          <X size={11}/>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  APP ROOT
// ═══════════════════════════════════════════════════════════════════════════
function AppShell() {
  const { state, act } = useStore();
  const { view, tasks, notification } = state;
  const stats = getStats(tasks);

  // Fix 3: Apply theme tokens synchronously before children render
  Object.assign(T, state.darkMode ? DARK_TOKENS : LIGHT_TOKENS);

  // Fix 3: Keep body background in sync with theme
  useEffect(() => {
    document.body.style.background = T.bg;
    document.body.style.color = T.text;
  }, [state.darkMode]);

  // Keyboard shortcuts
  useEffect(()=>{
    const h = e => {
      if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA") return;
      if(e.key==="g"){ /* handled per-key below */ }
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[]);

  const renderView = () => {
    if (view==="home")     return <HomeView/>;
    if (view==="analytics")return <AnalyticsView/>;
    if (view==="calendar") return <CalendarView/>;
    if (view==="ai")       return <AIView/>;
    if (view==="collab")   return <CollabView/>;
    // tasks, today, upcoming, cat:* all use tasks view
    return (
      <>
        <TaskInput/>
        <FilterBar tasks={tasks}/>
        <TasksView/>
      </>
    );
  };

  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:T.bg,color:T.text,transition:"background 0.3s,color 0.3s"}}>
      <Sidebar/>

      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden"}}>
        <Header/>

        {/* Main scroll area */}
        <main style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
          <AnimatePresence mode="wait">
            <motion.div key={view}
              initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
              transition={{duration:0.2}}>
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Status bar */}
        <div style={{
          height:28,flexShrink:0,display:"flex",alignItems:"center",
          padding:"0 20px",gap:16,
          background:T.bgCard,borderTop:`1px solid ${T.border}`,
        }}>
          {[
            {label:`${stats.total} tasks`,color:T.textDim},
            {label:`${stats.done} done`,  color:T.primary},
            {label:`${stats.overdue} overdue`,color:stats.overdue>0?T.danger:T.textDim},
            {label:`${stats.productivity}% productivity`,color:T.accent},
          ].map(({label,color})=>(
            <span key={label} style={{fontSize:10,color,fontFamily:"'Geist Mono',monospace"}}>{label}</span>
          ))}
          <div style={{flex:1}}/>
          <span style={{fontSize:10,color:T.textDim,fontFamily:"'Geist Mono',monospace"}}>
            ⌘K command palette · ⌘P focus timer
          </span>
          <div style={{width:6,height:6,borderRadius:"50%",background:T.primary,boxShadow:`0 0 6px ${T.primary}`}}/>
          <span style={{fontSize:10,color:T.primary,fontFamily:"'Geist Mono',monospace"}}>Nexus v2.0</span>
        </div>
      </div>

      {/* Global overlays */}
      <CommandPalette/>
      <FocusTimer/>

      {/* Toast */}
      <AnimatePresence>
        {notification && <Toast key={notification.id} notif={notification}/>}
      </AnimatePresence>

      {/* CSS for hover effects */}
      <style>{`
        .card-actions { opacity: 0 !important; }
        *:hover > .card-actions { opacity: 1 !important; }
        .group:hover .card-actions { opacity: 1 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <StoreProvider>
        <AppShell/>
      </StoreProvider>
    </>
  );
}
