import React, { useState, useEffect } from "react";
import axios from "axios";
import "../pages/Income.css";

export default function Income() {
  const [incomeList, setIncomeList] = useState([]);
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [editId, setEditId] = useState(null);

  const API_URL = `${import.meta.env.VITE_API_URL}/api/incomes`;

  useEffect(() => {
    fetchIncome();
  }, []);

  const fetchIncome = async () => {
    const res = await axios.get(API_URL);
    setIncomeList(res.data);
  };

  const addOrUpdateIncome = async () => {
    if (!source || !amount) return;
    const payload = { source, amount: parseFloat(amount) };

    if (editId) {
      // Update existing income
      await axios.put(`${API_URL}/${editId}`, payload);
      setIncomeList(
        incomeList.map((item) =>
          item.id === editId ? { ...item, ...payload } : item
        )
      );
      setEditId(null);
    } else {
      // Add new income
      const res = await axios.post(API_URL, payload);
      setIncomeList([...incomeList, res.data]);
    }

    setSource("");
    setAmount("");
  };

  const handleEdit = (item) => {
    setSource(item.source);
    setAmount(item.amount);
    setEditId(item.id);
  };

  const deleteIncome = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    setIncomeList(incomeList.filter((item) => item.id !== id));
  };

  const totalIncome = incomeList.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="income-container">
      <h2 className="income-title">💰 Income tracker</h2>

      <div className="income-form">
        <input
          type="text"
          placeholder="Source (e.g., Salary, Freelancing)"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={addOrUpdateIncome}>
          {editId ? "Update Income" : "+ Add Income"}
        </button>
        {editId && (
          <button
            onClick={() => {
              setSource("");
              setAmount("");
              setEditId(null);
            }}
            style={{ marginLeft: "10px", backgroundColor: "#ffc107" }}
          >
            Cancel
          </button>
        )}
      </div>

      <table className="income-table">
        <thead>
          <tr>
            <th>Source</th>
            <th>Amount (₹)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {incomeList.map((item) => (
            <tr key={item.id}>
              <td>{item.source}</td>
              <td>₹ {item.amount}</td>
              <td>
                <button onClick={() => handleEdit(item)}>✏️ Edit</button>
                <button
                  className="delete-btn"
                  onClick={() => deleteIncome(item.id)}
                  style={{ marginLeft: "5px" }}
                >
                  ❌ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="income-summary">
        <h3>Total Income: ₹ {totalIncome}</h3>
      </div>
    </div>
  );
}
