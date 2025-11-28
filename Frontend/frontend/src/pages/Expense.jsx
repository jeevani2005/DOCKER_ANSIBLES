import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

// 📊 import recharts components
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

const categories = ["Rent", "Food", "Transport", "Entertainment", "Utilities", "Healthcare","Education" "Other"];

// Pie chart colors
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f", "#d0ed57"];

const ExpenseComponent = () => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ name: "", amount: "", category: "", date: "" });
  const [editId, setEditId] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const API_URL = `${import.meta.env.VITE_API_URL}/api/expenses`;

  // helper: persist to localStorage and notify same-tab listeners
  const persistLocal = (items) => {
    try {
      localStorage.setItem("bp_expenses", JSON.stringify(items || []));
      window.dispatchEvent(new Event("bp_expenses_changed"));
    } catch (e) {
      console.error("Failed to persist local expenses", e);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(API_URL);
      const data = res.data || [];
      setExpenses(data);
      persistLocal(data);
    } catch (err) {
      console.warn("Fetch expenses failed, falling back to localStorage", err);
      try {
        const raw = localStorage.getItem("bp_expenses");
        if (raw) {
          const local = JSON.parse(raw);
          setExpenses(local);
        } else {
          setExpenses([]);
        }
      } catch (e) {
        console.error("Failed to read local expenses", e);
        setExpenses([]);
      }
    }
  };

  useEffect(() => {
    fetchExpenses();
    const onStorage = (e) => {
      if (e.key === "bp_expenses") {
        try {
          const arr = JSON.parse(e.newValue || "[]");
          setExpenses(arr);
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => setForm({ name: "", amount: "", category: "", date: "" });

  const handleSubmit = async () => {
    if (!form.name || !form.amount || !form.category || !form.date) {
      setAlert({ open: true, message: "Please fill all fields", severity: "error" });
      return;
    }

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, form);
        setAlert({ open: true, message: "Expense updated", severity: "success" });
      } else {
        await axios.post(API_URL, form);
        setAlert({ open: true, message: "Expense added", severity: "success" });
      }
      resetForm();
      setEditId(null);
      await fetchExpenses();
    } catch (err) {
      console.error("Server error - performing local fallback", err);
      setAlert({ open: true, message: "Server error. Saved locally.", severity: "warning" });

      try {
        const raw = localStorage.getItem("bp_expenses");
        const list = raw ? JSON.parse(raw) : [];
        if (editId) {
          const updated = list.map(i => (i.id === editId ? { ...i, ...form } : i));
          persistLocal(updated);
          setExpenses(updated);
        } else {
          const temp = { id: "local_" + Date.now(), ...form };
          const newList = [temp, ...list];
          persistLocal(newList);
          setExpenses(newList);
        }
        resetForm();
        setEditId(null);
      } catch (e) {
        console.error("Fallback persist failed", e);
      }
    }
  };

  const handleEdit = (expense) => {
    setForm({
      name: expense.name || "",
      amount: expense.amount || "",
      category: expense.category || "",
      date: expense.date ? expense.date.slice(0, 10) : "",
    });
    setEditId(expense.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setAlert({ open: true, message: "Expense deleted", severity: "info" });
      await fetchExpenses();
    } catch (err) {
      console.warn("Delete failed on server, deleting locally", err);
      try {
        const raw = localStorage.getItem("bp_expenses");
        const list = raw ? JSON.parse(raw) : [];
        const newList = list.filter(i => i.id !== id);
        persistLocal(newList);
        setExpenses(newList);
        setAlert({ open: true, message: "Deleted locally (server error)", severity: "warning" });
      } catch (e) {
        console.error("Delete fallback failed", e);
      }
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // 📊 Prepare data for PieChart
  const pieData = categories.map((cat) => {
    const total = expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return { name: cat, value: total };
  }).filter(d => d.value > 0);

  return (
    <div style={{ padding: 20 }}>
      <h2>Expense Tracker</h2>

      {/* Form */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <TextField label="Expense Name" name="name" value={form.name} onChange={handleChange} />
        <TextField label="Amount" type="number" name="amount" value={form.amount} onChange={handleChange} />
        <FormControl style={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select name="category" value={form.category} onChange={handleChange}>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField label="Date" type="date" name="date" value={form.date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          {editId ? "Update" : "Add"}
        </Button>
      </div>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Amount (₹)</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No expenses yet.</TableCell>
              </TableRow>
            )}
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.name}</TableCell>
                <TableCell>{expense.amount}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.date ? expense.date.slice(0, 10) : ""}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(expense)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(expense.id)} color="secondary">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <h3 style={{ marginTop: 20 }}>Total Expenses: ₹{totalExpenses}</h3>

      {/* 📊 Pie Chart */}
      <div style={{ width: "100%", height: 400, marginTop: 20 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={130}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default ExpenseComponent;
