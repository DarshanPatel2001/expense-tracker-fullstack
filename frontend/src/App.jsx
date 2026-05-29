import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import api from "./services/api";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    type: "expense",
  });

  const [subscriptionForm, setSubscriptionForm] = useState({
    serviceName: "",
    amount: "",
    billingDay: "",
    category: "",
  });

  // ---------------- TRANSACTIONS ----------------

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/transactions");
      setTransactions(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/transactions", {
        ...formData,
        amount: parseFloat(formData.amount),
      });

      fetchTransactions();

      setFormData({
        title: "",
        amount: "",
        category: "",
        type: "expense",
      });
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------- SUBSCRIPTIONS ----------------

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get("/subscriptions");

      setSubscriptions(response.data);

      localStorage.setItem(
        "subscriptions",
        JSON.stringify(response.data)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubscriptionSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/subscriptions", {
        service_name: subscriptionForm.serviceName,
        amount: parseFloat(subscriptionForm.amount),
        billing_day: parseInt(subscriptionForm.billingDay),
        category: subscriptionForm.category,
      });

      fetchSubscriptions();

      setSubscriptionForm({
        serviceName: "",
        amount: "",
        billingDay: "",
        category: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteSubscription = async (id) => {
    try {
      await api.delete(`/subscriptions/${id}`);

      fetchSubscriptions();
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------- LOAD DATA ----------------

  useEffect(() => {
    fetchTransactions();
    fetchSubscriptions();

    const savedSubscriptions = localStorage.getItem("subscriptions");

    if (savedSubscriptions) {
      setSubscriptions(JSON.parse(savedSubscriptions));
    }
  }, []);

  // ---------------- DASHBOARD CALCULATIONS ----------------

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSubscriptionCost = subscriptions.reduce(
    (sum, sub) => sum + sub.amount,
    0
  );

  const balance =
    totalIncome - totalExpense - totalSubscriptionCost;

  const chartData = [
    {
      name: "Income",
      value: totalIncome,
    },
    {
      name: "Expenses",
      value: totalExpense,
    },
    {
      name: "Subscriptions",
      value: totalSubscriptionCost,
    },
  ];

  const today = new Date().getDate();

  const upcomingBills = subscriptions.filter(
    (sub) => sub.billing_day >= today
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>Expense Tracker</h1>

      {/* NAVIGATION */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button onClick={() => setActiveTab("dashboard")}>
          Dashboard
        </button>

        <button onClick={() => setActiveTab("transactions")}>
          Transactions
        </button>

        <button onClick={() => setActiveTab("subscriptions")}>
          Subscriptions
        </button>
      </div>

      {/* DASHBOARD */}

      {activeTab === "dashboard" && (
        <div>
          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                border: "1px solid gray",
                padding: "15px",
              }}
            >
              <h3>Total Income</h3>
              <p>${totalIncome.toFixed(2)}</p>
            </div>

            <div
              style={{
                border: "1px solid gray",
                padding: "15px",
              }}
            >
              <h3>Total Expenses</h3>
              <p>${totalExpense.toFixed(2)}</p>
            </div>

            <div
              style={{
                border: "1px solid gray",
                padding: "15px",
              }}
            >
              <h3>Subscriptions</h3>
              <p>${totalSubscriptionCost.toFixed(2)}</p>
            </div>

            <div
              style={{
                border: "1px solid gray",
                padding: "15px",
              }}
            >
              <h3>Balance</h3>
              <p>${balance.toFixed(2)}</p>
            </div>
          </div>

          {/* CHART */}

          <div style={{ width: "100%", height: 400 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* UPCOMING BILLS */}

          <h2>Upcoming Bills</h2>

          {upcomingBills.length === 0 ? (
            <p>No upcoming bills.</p>
          ) : (
            upcomingBills.map((sub) => (
              <div
                key={sub.id}
                style={{
                  border: "1px solid gray",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >
                <h3>{sub.service_name}</h3>

                <p>${sub.amount}</p>

                <p>Billing Day: {sub.billing_day}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* TRANSACTIONS */}

      {activeTab === "transactions" && (
        <div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value,
                })
              }
            />

            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value,
                })
              }
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            <button type="submit">Add Transaction</button>
          </form>

          <h2>Transactions</h2>

          {transactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                style={{
                  border: "1px solid gray",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >
                <h3>{transaction.title}</h3>

                <p>${transaction.amount}</p>

                <p>{transaction.category}</p>

                <p>{transaction.type}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUBSCRIPTIONS */}

      {activeTab === "subscriptions" && (
        <div>
          <form onSubmit={handleSubscriptionSubmit}>
            <input
              type="text"
              placeholder="Service Name"
              value={subscriptionForm.serviceName}
              onChange={(e) =>
                setSubscriptionForm({
                  ...subscriptionForm,
                  serviceName: e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Monthly Cost"
              value={subscriptionForm.amount}
              onChange={(e) =>
                setSubscriptionForm({
                  ...subscriptionForm,
                  amount: e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Billing Day"
              value={subscriptionForm.billingDay}
              onChange={(e) =>
                setSubscriptionForm({
                  ...subscriptionForm,
                  billingDay: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Category"
              value={subscriptionForm.category}
              onChange={(e) =>
                setSubscriptionForm({
                  ...subscriptionForm,
                  category: e.target.value,
                })
              }
            />

            <button type="submit">
              Add Subscription
            </button>
          </form>

          <h2>Subscriptions</h2>

          {subscriptions.length === 0 ? (
            <p>No subscriptions found.</p>
          ) : (
            subscriptions.map((sub) => (
              <div
                key={sub.id}
                style={{
                  border: "1px solid gray",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >
                <h3>{sub.service_name}</h3>

                <p>${sub.amount}</p>

                <p>Billing Day: {sub.billing_day}</p>

                <p>{sub.category}</p>

                <button
                  onClick={() =>
                    deleteSubscription(sub.id)
                  }
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;