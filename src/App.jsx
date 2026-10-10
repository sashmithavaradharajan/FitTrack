import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Scale,
  Sparkles,
  Target,
  TrendingUp,
  Trash2,
  Trophy,
  Waves,
  Weight,
  X,
} from "lucide-react";
import usePersistentState from "./hooks/usePersistentState.js";

const initialWorkouts = [
  {
    id: 1,
    day: "MON",
    date: "05",
    name: "Upper body strength",
    type: "STRENGTH",
    duration: 45,
    done: true,
    color: "mint",
  },
  {
    id: 2,
    day: "TUE",
    date: "06",
    name: "Easy morning run",
    type: "CARDIO",
    duration: 32,
    done: true,
    color: "peach",
  },
  {
    id: 3,
    day: "WED",
    date: "07",
    name: "Lower body strength",
    type: "STRENGTH",
    duration: 50,
    done: false,
    color: "lavender",
  },
  {
    id: 4,
    day: "THU",
    date: "08",
    name: "Recovery & mobility",
    type: "RECOVERY",
    duration: 25,
    done: false,
    color: "blue",
  },
  {
    id: 5,
    day: "FRI",
    date: "09",
    name: "Full body circuit",
    type: "STRENGTH",
    duration: 40,
    done: false,
    color: "mint",
  },
  {
    id: 6,
    day: "SAT",
    date: "10",
    name: "Long walk outside",
    type: "CARDIO",
    duration: 60,
    done: false,
    color: "peach",
  },
  {
    id: 7,
    day: "SUN",
    date: "11",
    name: "Rest day",
    type: "RECOVERY",
    duration: 0,
    done: false,
    color: "blue",
  },
];
const weeklyActivity = [52, 68, 44, 84, 61, 93, 36];
const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

async function hashPassword(password) {
  const encodedPassword = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", encodedPassword);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export default function App() {
  const [page, setPage] = useState("Overview");
  const [signedIn, setSignedIn] = usePersistentState(
    "fittrack-session-v2",
    false,
  );
  const [accounts, setAccounts] = usePersistentState("fittrack-accounts", []);
  const [profile, setProfile] = usePersistentState("fittrack-profile", {
    name: "SASH",
  });
  const [workouts, setWorkouts] = usePersistentState(
    "fittrack-workouts",
    initialWorkouts,
  );
  const [metrics, setMetrics] = usePersistentState("fittrack-metrics", {
      weight: "68.4",
      goal: "65.0",
      sessions: "12",
      water: "2.1",
  });
  const [modal, setModal] = useState("");
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const completed = useMemo(
    () => workouts.filter((w) => w.done && w.type !== "RECOVERY").length,
    [workouts],
  );
  const isOldDemoName = /^alex(?: morgan)?$/i.test(profile.name?.trim() || "");
  const displayName = isOldDemoName ? "SASH" : profile.name || "SASH";
  const firstName = displayName.trim().split(/\s+/)[0];
  useEffect(() => {
    if (isOldDemoName) setProfile({ ...profile, name: "SASH" });
  }, [isOldDemoName, profile, setProfile]);
  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }
  function updateMetric(key, value) {
    setMetrics((m) => ({ ...m, [key]: value }));
    notify("Progress saved");
  }
  function toggleWorkout(id) {
    setWorkouts((list) =>
      list.map((w) => (w.id === id ? { ...w, done: !w.done } : w)),
    );
  }
  function addWorkout(name, type, duration) {
    const d = new Date();
    const colors = { CARDIO: "peach", RECOVERY: "blue", STRENGTH: "mint" };
    setWorkouts((list) => [
      ...list,
      {
        id: Date.now(),
        day: weekdays[(d.getDay() + 6) % 7],
        date: String(d.getDate()).padStart(2, "0"),
        name,
        type,
        duration: Number(duration) || 30,
        done: false,
        color: colors[type],
      },
    ]);
    setModal("");
    notify("Workout added to your plan");
  }
  function saveWorkout(id, name, type, duration) {
    if (!id) {
      addWorkout(name, type, duration);
      return;
    }

    const colors = { CARDIO: "peach", RECOVERY: "blue", STRENGTH: "mint" };
    setWorkouts((list) =>
      list.map((workout) =>
        workout.id === id
          ? { ...workout, name, type, duration: Number(duration), color: colors[type] }
          : workout,
      ),
    );
    setModal("");
    setEditingWorkout(null);
    notify("Workout updated");
  }
  function deleteWorkout(id) {
    const workout = workouts.find((item) => item.id === id);
    if (!workout || !window.confirm(`Delete ${workout.name}?`)) return;

    setWorkouts((list) => list.filter((item) => item.id !== id));
    notify("Workout deleted");
  }
  function registerAccount(account) {
    setAccounts((savedAccounts) => [...savedAccounts, account]);
    signInAccount(account);
  }
  function signInAccount(account) {
    const { passwordHash, ...profileDetails } = account;
    setProfile(profileDetails);
    setSignedIn(true);
  }
  if (!signedIn)
    return (
      <Auth
        accounts={accounts}
        onRegister={registerAccount}
        onLogin={signInAccount}
      />
    );
  return (
    <div className="shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <button className="brand" onClick={() => setPage("Overview")}>
          <span className="brand-icon">
            <Activity size={19} />
          </span>
          fittrack<span className="green-dot">.</span>
        </button>
        <div className="side-label">WORKSPACE</div>
        <nav>
          {[
            [LayoutDashboard, "Overview"],
            [Dumbbell, "My workouts"],
            [TrendingUp, "Progress"],
          ].map(([Icon, label]) => (
            <button
              key={label}
              className={`nav-link ${page === label ? "selected" : ""}`}
              onClick={() => {
                setPage(label);
                setMobileMenu(false);
              }}
            >
              <Icon size={17} />
              {label}
              {label === "My workouts" && (
                <span className="nav-count">
                  {
                    workouts.filter((w) => !w.done && w.type !== "RECOVERY")
                      .length
                  }
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="side-label tool-label">YOUR TOOLS</div>
        <button
          className="nav-link tool-link"
          onClick={() => setModal("calculator")}
        >
          <Scale size={17} />
          Fitness calculator
          <ArrowRight size={14} className="tool-arrow" />
        </button>
        <div className="sidebar-bottom">
          <div className="coach-note">
            <span className="coach-icon">
              <Sparkles size={15} />
            </span>
            <p>
              Small steps, <b>strong habits.</b>
            </p>
            <span>You’re building something good.</span>
            <div className="mini-track">
              <i
                style={{ width: `${Math.min((completed / 4) * 100, 100)}%` }}
              />
            </div>
            <small>{completed} of 4 sessions this week</small>
          </div>
          <div className="profile-row">
            <span className="avatar">{firstName[0]?.toUpperCase()}</span>
            <span className="profile-info">
              <b>{displayName}</b>
              <small>Free plan</small>
            </span>
            <button
              className="icon-btn signout"
              onClick={() => setSignedIn(false)}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
      {mobileMenu && (
        <button
          className="scrim"
          aria-label="Close menu"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <Menu size={20} />
          </button>
          <div className="crumb">
            Workspace <ChevronRight size={13} />
            <b>{page}</b>
          </div>
          <div className="top-actions">
            <span className="date-label">
              <i />
              Friday, October 9
            </span>
            <button
              className="icon-btn notification"
              aria-label="Notifications"
            >
              <Bell size={17} />
              <i />
            </button>
            <button
              className="avatar top-avatar"
              aria-label="Log out"
              onClick={() => setSignedIn(false)}
            >
              {firstName[0]?.toUpperCase()}
            </button>
          </div>
        </header>
        <div className="content">
          {page === "Overview" && (
            <Overview
              firstName={firstName}
              workouts={workouts}
              completed={completed}
              metrics={metrics}
              onToggle={toggleWorkout}
              onPage={setPage}
              onCalculator={() => setModal("calculator")}
            />
          )}
          {page === "My workouts" && (
            <Planner
              workouts={workouts}
              completed={completed}
              onToggle={toggleWorkout}
              onAdd={() => {
                setEditingWorkout(null);
                setModal("add");
              }}
              onEdit={(workout) => {
                setEditingWorkout(workout);
                setModal("edit");
              }}
              onDelete={deleteWorkout}
            />
          )}
          {page === "Progress" && (
            <Progress
              metrics={metrics}
              onChange={updateMetric}
              completed={completed}
            />
          )}
        </div>
        <footer className="footer">
          <span>© 2026 FitTrack</span>
          <span>
            Made for your pace <Heart size={12} />
          </span>
        </footer>
      </main>
      {modal === "calculator" && <Calculator onClose={() => setModal("")} />}
      {(modal === "add" || modal === "edit") && (
        <AddWorkout
          workout={editingWorkout}
          onClose={() => {
            setModal("");
            setEditingWorkout(null);
          }}
          onSave={saveWorkout}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={15} />
          {toast}
        </div>
      )}
    </div>
  );
}

function Overview({
  firstName,
  workouts,
  completed,
  metrics,
  onToggle,
  onPage,
  onCalculator,
}) {
  const focus =
    workouts.find((w) => !w.done && w.type !== "RECOVERY") ||
    workouts.find((w) => w.type !== "RECOVERY");
  const stats = [
    [
      Dumbbell,
      "WORKOUTS THIS WEEK",
      completed,
      "sessions",
      "+2",
      "vs. last week",
      "mint",
    ],
    [Flame, "ACTIVE MINUTES", "186", "min", "+18%", "vs. last week", "peach"],
    [
      Footprints,
      "DAILY STEPS",
      "8,420",
      "steps",
      "On track",
      "of 10,000 daily",
      "lilac",
    ],
    [
      Heart,
      "CURRENT WEIGHT",
      metrics.weight || "68.4",
      "kg",
      "−0.6",
      "this month",
      "blue",
    ],
  ];
  return (
    <>
      <div className="welcome">
        <div>
          <span className="eyebrow">
            <i />
            FRIDAY, OCTOBER 9
          </span>
          <h1>
            Good morning, {firstName}
            <b>.</b>
          </h1>
          <p>A new week to show up for yourself. Let’s make it count.</p>
        </div>
        <button className="outline-btn calc-shortcut" onClick={onCalculator}>
          <Scale size={15} />
          Fitness calculator
        </button>
      </div>
      <section className="week-card">
        <div className="week-top">
          <span>
            <CalendarDays size={16} />
            <b>Your week</b>
            <small>Oct 5 — 11</small>
          </span>
          <div className="week-arrows">
            <button aria-label="Previous week">
              <ChevronLeft size={15} />
            </button>
            <button aria-label="Next week">
              <ChevronRight size={15} />
            </button>
          </div>
          <div className="week-days">
            {weekdays.map((day, i) => (
              <div
                className={`week-day ${i < 2 ? "done" : ""} ${i === 4 ? "today" : ""}`}
                key={day}
              >
                <span>{day[0]}</span>
                <b>{String(i + 5).padStart(2, "0")}</b>
                <i>{i < 2 ? <Check size={11} /> : null}</i>
              </div>
            ))}
          </div>
        </div>
        <div className="week-message">
          <Sparkles size={14} />
          <span>
            You’re{" "}
            <b>
              {completed} {completed === 1 ? "session" : "sessions"}
            </b>{" "}
            into your weekly goal. Keep your rhythm.
          </span>
          <ArrowRight size={14} />
        </div>
      </section>
      <div className="section-title">
        <div>
          <h2>Your snapshot</h2>
          <p>Small wins add up. Here’s where you are.</p>
        </div>
        <button className="text-link" onClick={() => onPage("Progress")}>
          View progress <ArrowRight size={14} />
        </button>
      </div>
      <div className="stats-grid">
        {stats.map(([Icon, label, value, unit, trend, note, color]) => (
          <article className="stat-card" key={label}>
            <div className="stat-label">
              <span className={`stat-icon ${color}`}>
                <Icon size={16} />
              </span>
              {label}
            </div>
            <div className="stat-number">
              {value}
              <small>{unit}</small>
            </div>
            <div className="stat-note">
              <b>
                <ArrowUpRight size={12} />
                {trend}
              </b>
              {note}
            </div>
          </article>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel activity-panel">
          <PanelTitle
            title="Activity overview"
            subtitle="Your movement, day by day"
            right={
              <button className="select-btn">
                This week <ChevronDown size={13} />
              </button>
            }
          />
          <div className="chart-summary">
            <b>
              186 <small>min</small>
            </b>
            <span>
              <ArrowUpRight size={13} />
              14% <i>vs. last week</i>
            </span>
          </div>
          <div className="chart">
            <div className="chart-y">
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>
            <div className="chart-bars">
              {weeklyActivity.map((v, i) => (
                <div className="bar-col" key={weekdays[i]}>
                  <i style={{ height: `${v}%` }} />
                  <span>{weekdays[i]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-foot">
            <span>
              <i />
              Active minutes
            </span>
            <span>
              Goal <b>200 min</b>
            </span>
          </div>
        </section>
        <section className="panel focus-panel">
          <PanelTitle
            title="Today’s focus"
            subtitle="One session at a time"
            right={
              <span className="focus-icon">
                <Target size={17} />
              </span>
            }
          />
          {focus ? (
            <>
              <span className="workout-type">{focus.type}</span>
              <h3>{focus.name}</h3>
              <div className="focus-meta">
                <span>
                  <Clock3 size={14} />
                  {focus.duration} min
                </span>
                <span>
                  <Dumbbell size={14} />
                  {focus.type === "STRENGTH" ? "Strength" : "Cardio"}
                </span>
              </div>
              <div className="focus-divider" />
              <div className="encouragement">
                <Sparkles size={15} />
                <span>
                  <b>Keep it simple.</b>
                  <br />
                  You only have to start.
                </span>
              </div>
              <button
                className={`primary-btn focus-cta ${focus.done ? "already-done" : ""}`}
                onClick={() => onToggle(focus.id)}
              >
                {focus.done ? (
                  <>
                    <Check size={15} />
                    Session complete
                  </>
                ) : (
                  <>
                    Let’s get moving <ArrowRight size={15} />
                  </>
                )}
              </button>
            </>
          ) : (
            <p className="empty-text">Plan a session to get moving.</p>
          )}
        </section>
      </div>
      <section className="panel upcoming-panel">
        <PanelTitle
          title="Coming up"
          subtitle="Your next sessions, at a glance"
          right={
            <button className="text-link" onClick={() => onPage("My workouts")}>
              Full planner <ArrowRight size={14} />
            </button>
          }
        />
        {workouts
          .filter((w) => !w.done)
          .slice(0, 3)
          .map((item) => (
            <WorkoutRow key={item.id} item={item} onToggle={onToggle} compact />
          ))}
        {workouts.filter((w) => !w.done).length === 0 && (
          <p className="empty-text">
            You’re all caught up. Add another session when you’re ready.
          </p>
        )}
      </section>
    </>
  );
}

function PanelTitle({ title, subtitle, right }) {
  return (
    <div className="panel-title">
      <div>
        <h3>{title}</h3>
        <span>{subtitle}</span>
      </div>
      {right}
    </div>
  );
}
function WorkoutRow({ item, onToggle, onEdit, onDelete, compact = false }) {
  return (
    <div
      className={`workout-row ${compact ? "compact" : ""} ${item.done ? "completed" : ""}`}
    >
      <span className={`workout-date ${item.color}`}>
        <small>{item.day}</small>
        <b>{item.date}</b>
      </span>
      <span className="workout-info">
        <small>{item.type}</small>
        <b>{item.name}</b>
        <small className="duration">
          <Clock3 size={12} />
          {item.duration ? `${item.duration} min` : "Rest & recharge"}
        </small>
      </span>
      <span className="row-end">
        <span className="row-actions">
          {onEdit && (
            <button
              className="row-action-btn"
              aria-label={`Edit ${item.name}`}
              title="Edit workout"
              onClick={() => onEdit(item)}
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              className="row-action-btn delete-action"
              aria-label={`Delete ${item.name}`}
              title="Delete workout"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 size={14} />
            </button>
          )}
          {item.done ? (
            <span className="done-label">
              <Check size={13} />
              Done
            </span>
          ) : (
            <button
              className="check-btn"
              aria-label={`Complete ${item.name}`}
              onClick={() => onToggle(item.id)}
            >
              <Check size={15} />
            </button>
          )}
        </span>
      </span>
    </div>
  );
}
function Planner({ workouts, completed, onToggle, onAdd, onEdit, onDelete }) {
  const planned = workouts.filter((w) => !w.done).length;
  return (
    <>
      <div className="welcome page-welcome">
        <div>
          <span className="eyebrow">
            <i />
            YOUR ROUTINE
          </span>
          <h1>
            My workouts<b>.</b>
          </h1>
          <p>A plan that works with your life, not against it.</p>
        </div>
        <button className="primary-btn add-btn" onClick={onAdd}>
          <Plus size={16} />
          Add a workout
        </button>
      </div>
      <section className="planner-summary">
        <div>
          <span className="summary-icon">
            <CalendarDays size={17} />
          </span>
          <span>
            <b>{planned} sessions planned</b>
            <small>This week · October 5–11</small>
          </span>
        </div>
        <div>
          <span className="summary-icon peach">
            <Trophy size={17} />
          </span>
          <span>
            <b>{completed} sessions completed</b>
            <small>You’re making it happen</small>
          </span>
        </div>
        <div>
          <span className="goal-ring">
            {Math.min(Math.round((completed / 4) * 100), 100)}
            <small>%</small>
          </span>
          <span>
            <b>Weekly goal</b>
            <small>{completed} of 4 workouts</small>
          </span>
        </div>
      </section>
      <div className="section-title planner-heading">
        <div>
          <h2>This week</h2>
          <p>Your sessions, in order</p>
        </div>
        <span className="date-range">OCTOBER 5 — 11</span>
      </div>
      <section className="panel planner-list">
        {workouts.map((item) => (
          <WorkoutRow
            key={item.id}
            item={item}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {!workouts.length && (
          <p className="empty-text">
            Your week is wide open. Add your first workout to get started.
          </p>
        )}
      </section>
      <div className="planner-tip">
        <Sparkles size={16} />
        <p>
          <b>A little reminder</b> Rest is part of the plan, too. The best
          routine is the one you can return to.
        </p>
      </div>
    </>
  );
}
function Progress({ metrics, onChange, completed }) {
  const fields = [
    [Weight, "weight", "Current weight", "kg", "mint"],
    [Target, "goal", "Target weight", "kg", "peach"],
    [Dumbbell, "sessions", "Workouts this month", "sessions", "lilac"],
    [Waves, "water", "Daily water", "L", "blue"],
  ];
  return (
    <>
      <div className="welcome page-welcome">
        <div>
          <span className="eyebrow">
            <i />
            YOUR JOURNEY
          </span>
          <h1>
            Progress<b>.</b>
          </h1>
          <p>Notice how far you’ve come, one day at a time.</p>
        </div>
        <span className="streak">
          <Flame size={16} />4 week streak
        </span>
      </div>
      <section className="progress-hero">
        <div>
          <span className="hero-kicker">
            <TrendingUp size={14} />
            YOUR MOMENTUM
          </span>
          <h2>
            You’re showing up.
            <br />
            <em>That’s what counts.</em>
          </h2>
          <p>
            {completed
              ? `You’ve completed ${completed} sessions in your plan. Keep building at your own pace.`
              : "Your next small step is waiting. Every entry is a start."}
          </p>
          <div className="hero-track">
            <i style={{ width: `${Math.min((completed / 4) * 100, 100)}%` }} />
          </div>
          <small>{completed} of 4 sessions this week</small>
        </div>
        <div className="progress-orbit">
          <span>
            <Sparkles size={17} />
            <b>{Math.min(Math.round((completed / 4) * 100), 100)}%</b>
            <small>weekly goal</small>
          </span>
          <i />
          <i />
        </div>
      </section>
      <div className="section-title">
        <div>
          <h2>Your measurements</h2>
          <p>Update any time. It’s your journey.</p>
        </div>
        <span className="saved-note">
          <Check size={13} />
          Saved automatically
        </span>
      </div>
      <div className="metrics-grid">
        {fields.map(([Icon, key, label, unit, color]) => (
          <label className="metric-card" key={key}>
            <span className={`stat-icon ${color}`}>
              <Icon size={16} />
            </span>
            <span>{label}</span>
            <div>
              <input
                aria-label={label}
                type="number"
                min="0"
                step={key === "sessions" ? "1" : "0.1"}
                value={metrics[key]}
                onChange={(e) => onChange(key, e.target.value)}
              />
              <small>{unit}</small>
            </div>
            <small className="metric-hint">Tap to update</small>
          </label>
        ))}
      </div>
      <section className="panel progress-chart-panel">
        <PanelTitle
          title="Weekly activity"
          subtitle="Your movement across the week"
          right={
            <span className="chart-legend">
              <i />
              Minutes active
            </span>
          }
        />
        <div className="progress-chart">
          {weeklyActivity.map((value, i) => (
            <div key={weekdays[i]}>
              <span>
                {value}
                <small> min</small>
              </span>
              <i>
                <b style={{ height: `${value}%` }} />
              </i>
              <small>{weekdays[i]}</small>
            </div>
          ))}
        </div>
        <p className="chart-caption">
          A few active minutes are always better than none.
        </p>
      </section>
    </>
  );
}
function Auth({ accounts, onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    const existingAccount = accounts.find(
      (account) => account.email === normalizedEmail,
    );

    if (mode === "register") {
      if (existingAccount) {
        setError("An account with this email already exists. Sign in instead.");
        return;
      }

      const passwordHash = await hashPassword(password);
      onRegister({
        id: crypto.randomUUID(),
        name: name.trim() || "SASH",
        email: normalizedEmail,
        passwordHash,
      });
      return;
    }

    if (!existingAccount) {
      setError("No account found with that email. Create an account first.");
      return;
    }

    if ((await hashPassword(password)) !== existingAccount.passwordHash) {
      setError("That password is incorrect.");
      return;
    }

    onLogin(existingAccount);
  }
  return (
    <main className="auth-screen">
      <section className="auth-art">
        <span className="auth-brand">
          <span className="brand-icon">
            <Activity size={19} />
          </span>
          fittrack<span className="green-dot">.</span>
        </span>
        <div className="auth-copy">
          <span className="hero-kicker">
            <i />
            YOUR PACE. YOUR PROGRESS.
          </span>
          <h1>
            Make space
            <br />
            for <em>stronger</em>
            <br />
            days.
          </h1>
          <p>
            A little more movement. A little more you. Start where you are and
            see what grows.
          </p>
        </div>
        <div className="auth-quote">
          <span>“</span>
          <p>
            Some days it’s a personal best.
            <br />
            Some days you just show up. Both count.
          </p>
        </div>
        <div className="auth-orbit one" />
        <div className="auth-orbit two" />
      </section>
      <section className="auth-side">
        <div className="auth-box">
          <span className="auth-mobile-logo">
            <span className="brand-icon">
              <Activity size={18} />
            </span>
            fittrack<span className="green-dot">.</span>
          </span>
          <span className="eyebrow">
            {mode === "login" ? "WELCOME BACK" : "A FRESH START"}
          </span>
          <h2>
            {mode === "login" ? "Good to have you." : "Let’s get started."}
          </h2>
          <p>
            {mode === "login"
              ? "Pick up right where you left off."
              : "Your next chapter starts with a single step."}
          </p>
          <form onSubmit={submit}>
            {mode === "register" && (
              <label>
                Your name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SASH"
                  autoComplete="name"
                />
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                minLength="6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
            </label>
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <button className="primary-btn auth-submit">
              {mode === "login" ? "Sign in" : "Create your account"}
              <ArrowRight size={15} />
            </button>
          </form>
          <div className="auth-switch">
            {mode === "login" ? "New to FitTrack?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setError("");
                setMode(mode === "login" ? "register" : "login");
              }}
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </div>
          <small className="auth-footnote">
            By continuing, you agree to take things one day at a time.
          </small>
        </div>
      </section>
    </main>
  );
}
function Calculator({ onClose }) {
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("68");
  const [age, setAge] = useState("28");
  const [activityLevel, setActivityLevel] = useState("1.375");
  const [sex, setSex] = useState("female");
  const [show, setShow] = useState(false);
  useEffect(() => {
    function key(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);
  const h = Number(height);
  const w = Number(weight);
  const a = Number(age);
  const bmi = h > 0 && w > 0 ? w / (h / 100) ** 2 : 0;
  const bmr =
    sex === "female"
      ? 10 * w + 6.25 * h - 5 * a - 161
      : 10 * w + 6.25 * h - 5 * a + 5;
  const calories = bmr * Number(activityLevel);
  const bmiText =
    bmi < 18.5
      ? "Below range"
      : bmi < 25
        ? "In a typical range"
        : bmi < 30
          ? "Above typical range"
          : "Higher range";
  return (
    <div
      className="backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calc-title"
      >
        <div className="modal-top">
          <span className="modal-icon">
            <Scale size={18} />
          </span>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <span className="eyebrow">
          <i />
          YOUR PERSONAL NUMBERS
        </span>
        <h2 id="calc-title">
          Fitness calculator<span>.</span>
        </h2>
        <p className="modal-subtitle">
          A helpful estimate for a little more context. Your body is more than a
          number.
        </p>
        <div className="calc-form">
          <div className="field-row">
            <label>
              Height
              <span className="unit-input">
                <input
                  type="number"
                  min="90"
                  max="250"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
                <i>cm</i>
              </span>
            </label>
            <label>
              Weight
              <span className="unit-input">
                <input
                  type="number"
                  min="25"
                  max="300"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                <i>kg</i>
              </span>
            </label>
          </div>
          <div className="field-row">
            <label>
              Age
              <span className="unit-input">
                <input
                  type="number"
                  min="13"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
                <i>years</i>
              </span>
            </label>
            <label>
              Sex for estimate
              <span className="select-wrap">
                <select value={sex} onChange={(e) => setSex(e.target.value)}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
                <ChevronDown size={14} />
              </span>
            </label>
          </div>
          <label>
            Usual activity level
            <span className="select-wrap">
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
              >
                <option value="1.2">Mostly sitting, little exercise</option>
                <option value="1.375">Light activity, 1–3 days per week</option>
                <option value="1.55">
                  Moderate activity, 3–5 days per week
                </option>
                <option value="1.725">Very active, 6–7 days per week</option>
              </select>
              <ChevronDown size={14} />
            </span>
          </label>
        </div>
        <button
          className="primary-btn calc-submit"
          onClick={() => setShow(true)}
        >
          <Activity size={15} />
          Calculate my estimates
        </button>
        {show && (
          <div className="calc-results">
            <div>
              <small>
                <Scale size={14} />
                BMI estimate
              </small>
              <b>
                {bmi.toFixed(1)}
                <i>{bmiText}</i>
              </b>
            </div>
            <div>
              <small>
                <Flame size={14} />
                Daily energy estimate
              </small>
              <b>
                {Math.round(calories).toLocaleString()}
                <i>calories / day</i>
              </b>
            </div>
          </div>
        )}
        <p className="disclaimer">
          Estimates only. Not medical advice or a prescribed calorie target.
        </p>
      </section>
    </div>
  );
}
function AddWorkout({ workout, onClose, onSave }) {
  const [name, setName] = useState(workout?.name || "");
  const [type, setType] = useState(workout?.type || "STRENGTH");
  const [duration, setDuration] = useState(String(workout?.duration || 30));
  useEffect(() => {
    function key(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <div
      className="backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className="modal add-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-title"
      >
        <div className="modal-top">
          <span className="modal-icon peach-icon">
            <Dumbbell size={18} />
          </span>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <span className="eyebrow">
          <i />
          MAKE IT YOURS
        </span>
        <h2 id="add-title">
          {workout ? "Edit workout" : "Add a workout"}<span>.</span>
        </h2>
        <p className="modal-subtitle">
          A plan is a promise to yourself. Keep it kind.
        </p>
        <form
          className="calc-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) onSave(workout?.id, name.trim(), type, duration);
          }}
        >
          <label>
            What are you doing?
            <input
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Evening yoga"
            />
          </label>
          <div className="field-row">
            <label>
              Workout type
              <span className="select-wrap">
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="STRENGTH">Strength</option>
                  <option value="CARDIO">Cardio</option>
                  <option value="RECOVERY">Recovery</option>
                </select>
                <ChevronDown size={14} />
              </span>
            </label>
            <label>
              Duration
              <span className="unit-input">
                <input
                  type="number"
                  min="0"
                  max="600"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
                <i>min</i>
              </span>
            </label>
          </div>
          <button className="primary-btn calc-submit">
            <Plus size={15} />
            {workout ? "Save changes" : "Add to my week"}
          </button>
        </form>
      </section>
    </div>
  );
}
