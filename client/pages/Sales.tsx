import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface Order {
  id: number;
  orderId: string;
  customer: string;
  product: string;
  quantity: number;
  total: number;
  date: string;
}

const STORAGE_KEY = "crm_sales";

export default function Sales() {
  const [orders, setOrders] = useState<Order[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem(STORAGE_KEY);
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error("Failed to load orders from localStorage", e);
      }
    }
  }, []);

  // Save to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const handleDeleteOrder = (id: number) => {
    setOrders(orders.filter((o) => o.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Orders</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all customer orders
          </p>
        </div>
        <div className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold">
          Total Revenue: ${totalRevenue.toLocaleString()}
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Order ID
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Customer
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Product
                </th>
                <th className="text-right px-6 py-4 font-semibold text-foreground">
                  Quantity
                </th>
                <th className="text-right px-6 py-4 font-semibold text-foreground">
                  Total
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Date
                </th>
                <th className="text-center px-6 py-4 font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={order.id}
                  className={`border-b border-border hover:bg-muted transition-colors ${
                    index % 2 === 0 ? "bg-card" : "bg-muted bg-opacity-30"
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className="font-semibold text-primary">
                      {order.orderId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">
                      {order.customer}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground">{order.product}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-foreground">{order.quantity}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-foreground">
                      ${order.total.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-muted-foreground text-sm">
                      {formatDate(order.date)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-destructive hover:opacity-75 transition-opacity p-2 rounded hover:bg-destructive hover:bg-opacity-10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
