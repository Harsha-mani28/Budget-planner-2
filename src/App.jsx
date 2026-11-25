
import React, { useEffect, useState } from "react";
import {
  Wallet, LayoutDashboard, ArrowLeftRight, PieChart,
  Target, Lightbulb, Settings, LogOut, Plus, Trash2,
  TrendingUp, TrendingDown, IndianRupee, Users
} from "lucide-react";
import {
  ResponsiveContainer, PieChart as RePieChart, Pie,
  Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import "./style.css";

const ADMIN_EMAIL = "admin@budget.com";
const ADMIN_PASSWORD = "admin123";

const getData = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  const [users, setUsers] = useState(() => getData("users", []));
  const [transactions, setTransactions] = useState(() => getData("transactions", []));
  const [goals, setGoals] = useState(() => getData("goals", []));
  const [currentUser, setCurrentUser] = useState(() => getData("currentUser", null));
  const [budget, setBudget] = useState(() => getData("budget", 10000));
  const [page, setPage] = useState("Dashboard");
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");

  const [auth, setAuth] = useState({ name: "", email: "", password: "" });
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "Expense",
    category: "Food",
    date: new Date().toISOString().slice(0, 10)
  });
  const [goalForm, setGoalForm] = useState({ name: "", target: "" });

  useEffect(() => localStorage.setItem("users", JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem("transactions", JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem("goals", JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem("budget", JSON.stringify(budget)), [budget]);

  useEffect(() => {
    if (currentUser) localStorage.setItem("currentUser", JSON.stringify(currentUser));
    else localStorage.removeItem("currentUser");
  }, [currentUser]);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  const myTransactions = transactions.filter(
    t => t.userEmail === currentUser?.email
  );

  const income = myTransactions
    .filter(t => t.type === "Income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const expenses = myTransactions
    .filter(t => t.type === "Expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const balance = income - expenses;

  const myGoals = goals.filter(
    g => g.userEmail === currentUser?.email
  );

  const categories = [
    "Food", "Transport", "Shopping", "Education",
    "Entertainment", "Bills", "Health", "Other"
  ];

  const notify = text => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const login = e => {
    e.preventDefault();

    if (auth.email === ADMIN_EMAIL && auth.password === ADMIN_PASSWORD) {
      setCurrentUser({ name: "Administrator", email: ADMIN_EMAIL });
      setPage("Admin");
      return;
    }

    const found = users.find(
      u => u.email === auth.email && u.password === auth.password
    );

    if (!found) return notify("Invalid email or password");

    setCurrentUser(found);
    setPage("Dashboard");
  };

  const signup = e => {
    e.preventDefault();

    if (!auth.name.trim() || !auth.email.trim() || !auth.password.trim()) {
      return notify("Fill all fields");
    }

    if (
      auth.email === ADMIN_EMAIL ||
      users.some(u => u.email === auth.email)
    ) {
      return notify("Email already registered");
    }

    const newUser = { ...auth };
    setUsers(old => [...old, newUser]);
    setCurrentUser(newUser);
    setPage("Dashboard");
  };

  // ADD TRANSACTION - UPDATED AMOUNT VALIDATION
  const addTransaction = e => {
    e.preventDefault();

    const amount = Number(form.amount);

    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) {
      return notify("Enter valid transaction details");
    }

    const item = {
      ...form,
      id: Date.now(),
      amount,
      userEmail: currentUser.email
    };

    setTransactions(old => [item, ...old]);

    setForm({
      title: "",
      amount: "",
      type: "Expense",
      category: "Food",
      date: new Date().toISOString().slice(0, 10)
    });

    notify("Transaction added successfully");
  };

  const deleteTransaction = id => {
    setTransactions(old => old.filter(t => t.id !== id));
    notify("Transaction deleted");
  };

  const addGoal = e => {
    e.preventDefault();

    if (!goalForm.name.trim() || Number(goalForm.target) <= 0) {
      return notify("Enter a valid goal");
    }

    setGoals(old => [
      ...old,
      {
        id: Date.now(),
        name: goalForm.name,
        target: Number(goalForm.target),
        saved: 0,
        userEmail: currentUser.email
      }
    ]);

    setGoalForm({ name: "", target: "" });
    notify("Savings goal created");
  };

  const addSavings = id => {
    const amount = Number(prompt("Enter amount to add to savings:"));

    if (!Number.isFinite(amount) || amount <= 0) return;

    setGoals(old =>
      old.map(g =>
        g.id === id ? { ...g, saved: g.saved + amount } : g
      )
    );

    notify("Savings updated");
  };

  const categoryData = categories
    .map(category => ({
      name: category,
      value: myTransactions
        .filter(t => t.type === "Expense" && t.category === category)
        .reduce((s, t) => s + Number(t.amount), 0)
    }))
    .filter(item => item.value > 0);

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));

    const key =
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const monthTransactions = myTransactions.filter(
      t => t.date?.startsWith(key)
    );

    return {
      month: d.toLocaleString("en", { month: "short" }),
      Income: monthTransactions
        .filter(t => t.type === "Income")
        .reduce((s, t) => s + Number(t.amount), 0),
      Expenses: monthTransactions
        .filter(t => t.type === "Expense")
        .reduce((s, t) => s + Number(t.amount), 0)
    };
  });

  if (!currentUser) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand-icon"><Wallet size={30} /></div>
          <h1>Smart Budget Planner</h1>
          <p className="muted">
            Take control of your money, one step at a time.
          </p>

          <div className="auth-tabs">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={mode === "signup" ? "active" : ""}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={mode === "login" ? login : signup}>
            {mode === "signup" && (
              <input
                placeholder="Full name"
                value={auth.name}
                onChange={e => setAuth({ ...auth, name: e.target.value })}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={auth.email}
              onChange={e => setAuth({ ...auth, email: e.target.value })}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={auth.password}
              onChange={e => setAuth({ ...auth, password: e.target.value })}
              required
            />

            <button className="primary-btn full">
              {mode === "login" ? "Login to Dashboard" : "Create Account"}
            </button>
          </form>

          <p className="muted small">
            Admin demo: admin@budget.com / admin123
          </p>

          {message && <p className="notice">{message}</p>}
        </div>
      </div>
    );
  }

  const menu = isAdmin
    ? [{ name: "Admin", icon: Users }]
    : [
        { name: "Dashboard", icon: LayoutDashboard },
        { name: "Transactions", icon: ArrowLeftRight },
        { name: "Analytics", icon: PieChart },
        { name: "Savings Goals", icon: Target },
        { name: "Smart Insights", icon: Lightbulb },
        { name: "Settings", icon: Settings }
      ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon"><Wallet /></span>
          <span>Budget<span className="blue">Wise</span></span>
        </div>

        <p className="side-label">MENU</p>

        {menu.map(item => (
          <button
            key={item.name}
            className={`nav-item ${page === item.name ? "selected" : ""}`}
            onClick={() => setPage(item.name)}
          >
            <item.icon size={19} />
            {item.name}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">
              {currentUser.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <b>{currentUser.name}</b>
              <small>{isAdmin ? "Administrator" : "User Account"}</small>
            </div>
          </div>

          <button
            className="nav-item logout"
            onClick={() => setCurrentUser(null)}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>{page}</h2>
            <p className="muted">Welcome back, {currentUser.name}!</p>
          </div>
          <div className="top-avatar">
            {currentUser.name?.[0]?.toUpperCase()}
          </div>
        </header>

        {message && <div className="notice">{message}</div>}

        {page === "Dashboard" && !isAdmin && (
          <>
            <section className="welcome-banner">
              <div>
                <span className="eyebrow">YOUR FINANCIAL OVERVIEW</span>
                <h1>Manage money.<br />Build your future.</h1>
                <p>Track your spending and reach your financial goals.</p>
              </div>
              <div className="banner-art"><Wallet size={100} /></div>
            </section>

            <div className="stats-grid">
              <Stat title="Total Income" amount={income} icon={<TrendingUp />} color="green" />
              <Stat title="Total Expenses" amount={expenses} icon={<TrendingDown />} color="red" />
              <Stat title="Available Balance" amount={balance} icon={<Wallet />} color="blue" />
              <Stat title="Monthly Budget" amount={budget} icon={<IndianRupee />} color="purple" />
            </div>

            <section className="content-grid">
              <div className="panel">
                <div className="panel-heading">
                  <h3>Income vs Expenses</h3>
                  <span className="muted">Last 6 months</span>
                </div>

                <div className="chart-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="Income" fill="#16a36a" radius={[5, 5, 0, 0]} />
                      <Bar dataKey="Expenses" fill="#4779ed" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading"><h3>Budget Usage</h3></div>
                <h2 className="budget-number">₹{expenses.toLocaleString("en-IN")}</h2>
                <p className="muted">
                  Spent out of ₹{Number(budget).toLocaleString("en-IN")}
                </p>
                <div className="progress">
                  <span style={{
                    width: `${Math.min(100, budget > 0 ? expenses / budget * 100 : 0)}%`
                  }} />
                </div>
                <p className="muted">
                  {budget > 0 ? Math.round(expenses / budget * 100) : 0}% of your budget used
                </p>
                {expenses > budget && (
                  <p className="warning">You have exceeded your budget!</p>
                )}
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <h3>Recent Transactions</h3>
                <button className="text-btn" onClick={() => setPage("Transactions")}>
                  View all
                </button>
              </div>
              <TransactionList items={myTransactions.slice(0, 5)} onDelete={deleteTransaction} />
            </section>
          </>
        )}

        {page === "Transactions" && !isAdmin && (
          <>
            <section className="panel">
              <h3>Add New Transaction</h3>

              <form className="transaction-form" onSubmit={addTransaction}>
                <input
                  placeholder="Description"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />

                {/* FIX: step="0.01" allows whole rupee and decimal amounts */}
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Amount (₹)"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  required
                />

                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  <option>Expense</option>
                  <option>Income</option>
                </select>

                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>

                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  required
                />

                <button className="primary-btn">
                  <Plus size={17} /> Add Transaction
                </button>
              </form>
            </section>

            <section className="panel">
              <h3>All Transactions</h3>
              <TransactionList items={myTransactions} onDelete={deleteTransaction} />
            </section>
          </>
        )}

        {page === "Analytics" && !isAdmin && (
          <>
            <section className="content-grid">
              <div className="panel">
                <h3>Expenses by Category</h3>
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                        label
                      >
                        {categoryData.map((entry, i) => (
                          <Cell
                            key={entry.name}
                            fill={["#4779ed", "#16a36a", "#f5a623", "#8b5cf6", "#ed6480", "#22a6b3", "#e17b35", "#64748b"][i % 8]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="panel">
                <h3>Financial Summary</h3>
                <div className="summary-row">
                  <span>Total Income</span>
                  <b className="green-text">₹{income.toLocaleString("en-IN")}</b>
                </div>
                <div className="summary-row">
                  <span>Total Expenses</span>
                  <b className="red-text">₹{expenses.toLocaleString("en-IN")}</b>
                </div>
                <div className="summary-row">
                  <span>Net Balance</span>
                  <b>₹{balance.toLocaleString("en-IN")}</b>
                </div>
              </div>
            </section>

            <section className="panel">
              <h3>Monthly Comparison</h3>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Income" fill="#16a36a" />
                    <Bar dataKey="Expenses" fill="#4779ed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        )}

        {page === "Savings Goals" && !isAdmin && (
          <>
            <section className="panel">
              <h3>Create a Savings Goal</h3>
              <form className="goal-form" onSubmit={addGoal}>
                <input
                  placeholder="Goal name (e.g. New Laptop)"
                  value={goalForm.name}
                  onChange={e => setGoalForm({ ...goalForm, name: e.target.value })}
                  required
                />
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Target amount (₹)"
                  value={goalForm.target}
                  onChange={e => setGoalForm({ ...goalForm, target: e.target.value })}
                  required
                />
                <button className="primary-btn">
                  <Plus size={17} /> Create Goal
                </button>
              </form>
            </section>

            <div className="goal-grid">
              {myGoals.map(g => (
                <div className="panel goal-card" key={g.id}>
                  <div className="goal-icon"><Target /></div>
                  <h3>{g.name}</h3>
                  <h2>
                    ₹{g.saved.toLocaleString("en-IN")}
                    <small> / ₹{g.target.toLocaleString("en-IN")}</small>
                  </h2>
                  <div className="progress">
                    <span style={{ width: `${Math.min(100, g.saved / g.target * 100)}%` }} />
                  </div>
                  <p className="muted">
                    {Math.min(100, Math.round(g.saved / g.target * 100))}% completed
                  </p>
                  <button className="primary-btn full" onClick={() => addSavings(g.id)}>
                    Add Savings
                  </button>
                </div>
              ))}
            </div>

            {myGoals.length === 0 && (
              <div className="empty-state">
                No savings goals yet. Create your first goal!
              </div>
            )}
          </>
        )}

        {page === "Smart Insights" && !isAdmin && (
          <div className="insight-grid">
            <div className="panel insight-card">
              <div className="insight-icon"><Lightbulb /></div>
              <h3>Budget Alert</h3>
              <p>
                {expenses > budget
                  ? "You have crossed your monthly budget. Reduce non-essential spending."
                  : `You have ₹${Math.max(0, budget - expenses).toLocaleString("en-IN")} remaining in your budget.`}
              </p>
            </div>

            <div className="panel insight-card">
              <div className="insight-icon"><TrendingUp /></div>
              <h3>Spending Pattern</h3>
              <p>
                {categoryData.length
                  ? `You are spending across ${categoryData.length} expense categories. Review your biggest spending areas.`
                  : "Add expenses to discover your spending patterns."}
              </p>
            </div>

            <div className="panel insight-card">
              <div className="insight-icon"><Target /></div>
              <h3>Savings Advice</h3>
              <p>
                {balance > 0
                  ? `Your current balance is ₹${balance.toLocaleString("en-IN")}. Consider saving a part of it.`
                  : "Try to keep expenses lower than income to build savings."}
              </p>
            </div>
          </div>
        )}

        {page === "Settings" && !isAdmin && (
          <section className="panel settings-panel">
            <h3>Monthly Budget Settings</h3>
            <p className="muted">Set a spending limit for your budget.</p>
            <form onSubmit={e => {
              e.preventDefault();
              notify("Monthly budget updated");
            }}>
              <label>Monthly Budget (₹)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
              />
              <button className="primary-btn">Save Budget</button>
            </form>
          </section>
        )}

        {page === "Admin" && isAdmin && (
          <>
            <div className="stats-grid">
              <Stat title="Registered Users" amount={users.length} icon={<Users />} color="blue" />
              <Stat title="All Transactions" amount={transactions.length} icon={<ArrowLeftRight />} color="purple" />
              <Stat
                title="Total Income"
                amount={transactions.filter(t => t.type === "Income").reduce((s, t) => s + Number(t.amount), 0)}
                icon={<TrendingUp />}
                color="green"
              />
              <Stat
                title="Total Expenses"
                amount={transactions.filter(t => t.type === "Expense").reduce((s, t) => s + Number(t.amount), 0)}
                icon={<TrendingDown />}
                color="red"
              />
            </div>

            <section className="panel">
              <h3>Registered Users</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Name</th><th>Email</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.email}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel">
              <h3>All User Transactions</h3>
              <TransactionList items={transactions} onDelete={deleteTransaction} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ title, amount, icon, color }) {
  return (
    <div className="stat-card">
      <div>
        <p>{title}</p>
        <h2>₹{Number(amount).toLocaleString("en-IN")}</h2>
      </div>
      <div className={`stat-icon ${color}`}>{icon}</div>
    </div>
  );
}

function TransactionList({ items, onDelete }) {
  if (!items.length) {
    return (
      <div className="empty-state">
        No transactions yet. Add your first transaction!
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Category</th>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map(t => (
            <tr key={t.id}>
              <td><b>{t.title}</b></td>
              <td>{t.category}</td>
              <td>{t.date}</td>
              <td>
                <span className={t.type === "Income" ? "tag-income" : "tag-expense"}>
                  {t.type}
                </span>
              </td>
              <td className={t.type === "Income" ? "green-text" : "red-text"}>
                {t.type === "Income" ? "+" : "-"}₹{Number(t.amount).toLocaleString("en-IN")}
              </td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => onDelete(t.id)}
                  title="Delete transaction"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
