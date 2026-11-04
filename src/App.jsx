import "./style.css";
import React, { useState, useEffect } from "react";
import "./style.css";

const ADMIN_EMAIL = "admin@budget.com";
const ADMIN_PASSWORD = "admin123";

export default function App() {
  const [users, setUsers] = useState(
    JSON.parse(localStorage.getItem("users") || "[]")
  );
  const [transactions, setTransactions] = useState(
    JSON.parse(localStorage.getItem("transactions") || "[]")
  );
  const [budgets, setBudgets] = useState(
    JSON.parse(localStorage.getItem("budgets") || "{}")
  );
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("currentUser") || "null")
  );

  const [page, setPage] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [budget, setBudget] = useState("");

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    if (user) localStorage.setItem("currentUser", JSON.stringify(user));
  }, [user]);

  function signup(e) {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === ADMIN_EMAIL)
      return alert("This email is reserved for admin.");

    if (users.some(u => u.email === cleanEmail))
      return alert("Account already exists!");

    const newUser = {
      name: name.trim(),
      email: cleanEmail,
      password
    };

    setUsers(old => [...old, newUser]);
    alert("Signup successful! Please login.");
    setPage("login");
    setName("");
    setEmail("");
    setPassword("");
  }

  function login(e) {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setUser({
        name: "Administrator",
        email: ADMIN_EMAIL,
        role: "admin"
      });
      return;
    }

    const found = users.find(
      u => u.email === cleanEmail && u.password === password
    );

    if (!found) return alert("Invalid email or password!");

    setUser({ ...found, role: "user" });
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("currentUser");
    setPage("login");
  }

  function addTransaction(e) {
    e.preventDefault();

    if (!description.trim() || Number(amount) <= 0)
      return alert("Enter valid details!");

    const newTransaction = {
      id: Date.now(),
      owner: user.email,
      description: description.trim(),
      amount: Number(amount),
      type,
      category,
      date: new Date().toLocaleDateString()
    };

    setTransactions(old => [...old, newTransaction]);
    setDescription("");
    setAmount("");
    alert("Transaction added successfully!");
  }

  function deleteTransaction(id) {
    if (window.confirm("Delete this transaction?")) {
      setTransactions(old => old.filter(t => t.id !== id));
    }
  }

  if (!user) {
    return (
      <div className="auth-page">
        <form
          className="auth-card"
          onSubmit={page === "signup" ? signup : login}
        >
          <h1>💰 Budget Planner</h1>
          <p>Manage your money smartly</p>

          {page === "signup" && (
            <input
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            {page === "signup" ? "Create Account" : "Login"}
          </button>

          <p>
            {page === "signup"
              ? "Already have an account?"
              : "New user?"}
            <span
              className="link"
              onClick={() => setPage(page === "signup" ? "login" : "signup")}
            >
              {page === "signup" ? " Login" : " Signup"}
            </span>
          </p>

          <small>Admin: admin@budget.com / admin123</small>
        </form>
      </div>
    );
  }

  const isAdmin = user.role === "admin";

  const myTransactions = isAdmin
    ? transactions
    : transactions.filter(t => t.owner === user.email);

  const income = myTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = myTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const myBudget = Number(budgets[user.email] || 0);
  const remaining = myBudget - expenses;
  const percent = myBudget
    ? Math.min((expenses / myBudget) * 100, 100)
    : 0;

  return (
    <div className="app">
      <header className="header">
        <h2>💰 Budget Planner</h2>
        <div>
          <span>{user.name}</span>
          <button className="logout" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="container">
        <h1>{isAdmin ? "Admin Dashboard" : "User Dashboard"}</h1>
        <p>Welcome, {user.name}!</p>

        {isAdmin ? (
          <>
            <section className="cards">
              <div className="card">
                <h3>Registered Users</h3>
                <h2>{users.length}</h2>
              </div>
              <div className="card">
                <h3>Total Income</h3>
                <h2 className="green">₹{income}</h2>
              </div>
              <div className="card">
                <h3>Total Expenses</h3>
                <h2 className="red">₹{expenses}</h2>
              </div>
              <div className="card">
                <h3>Transactions</h3>
                <h2>{transactions.length}</h2>
              </div>
            </section>

            <section className="panel">
              <h2>Registered Users</h2>
              {users.length === 0 && <p>No users registered.</p>}
              {users.map(u => (
                <p key={u.email}>{u.name} — {u.email}</p>
              ))}
            </section>

            <section className="panel">
              <h2>All Transactions</h2>
              {transactions.length === 0 && <p>No transactions available.</p>}
              {transactions.map(t => (
                <p key={t.id}>
                  {t.owner} — {t.description} — ₹{t.amount} ({t.type})
                </p>
              ))}
            </section>
          </>
        ) : (
          <>
            <section className="cards">
              <div className="card">
                <h3>Total Income</h3>
                <h2 className="green">₹{income}</h2>
              </div>
              <div className="card">
                <h3>Total Expenses</h3>
                <h2 className="red">₹{expenses}</h2>
              </div>
              <div className="card">
                <h3>Balance</h3>
                <h2>₹{income - expenses}</h2>
              </div>
              <div className="card">
                <h3>Budget Remaining</h3>
                <h2>₹{remaining}</h2>
              </div>
            </section>

            <section className="panel">
              <h2>Monthly Budget</h2>
              <form
                className="budget-form"
                onSubmit={e => {
                  e.preventDefault();
                  setBudgets(old => ({
                    ...old,
                    [user.email]: Number(budget)
                  }));
                  setBudget("");
                }}
              >
                <input
                  type="number"
                  min="1"
                  placeholder="Enter monthly budget"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  required
                />
                <button type="submit">Set Budget</button>
              </form>

              <p>Budget: ₹{myBudget}</p>
              <p>Expenses: ₹{expenses}</p>

              <div className="progress">
                <div style={{ width: percent + "%" }} />
              </div>

              {expenses > myBudget && myBudget > 0 && (
                <p className="red">Budget exceeded!</p>
              )}
            </section>

            <section className="panel">
              <h2>Add Transaction</h2>
              <form className="transaction-form" onSubmit={addTransaction}>
                <input
                  placeholder="Description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Amount (₹)"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />

                <select value={type} onChange={e => setType(e.target.value)}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>

                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Shopping</option>
                  <option>Education</option>
                  <option>Entertainment</option>
                  <option>Other</option>
                </select>

                <button type="submit">Add Transaction</button>
              </form>
            </section>

            <section className="panel">
              <h2>Transaction History</h2>

              {myTransactions.length === 0 && (
                <p>No transactions added yet.</p>
              )}

              {[...myTransactions].reverse().map(t => (
                <div className="transaction" key={t.id}>
                  <div>
                    <strong>{t.description}</strong>
                    <p>{t.category} | {t.date}</p>
                  </div>

                  <strong className={t.type === "income" ? "green" : "red"}>
                    {t.type === "income" ? "+" : "-"}₹{t.amount}
                  </strong>

                  <button
                    className="delete"
                    onClick={() => deleteTransaction(t.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
