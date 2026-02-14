import { useState } from "react";
import { Edit2, Trash2, Plus, X } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Valid email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCustomer = () => {
    if (!validateForm()) return;
    const newCustomer: Customer = {
      id: Math.max(...customers.map((c) => c.id), 0) + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };
    setCustomers([...customers, newCustomer]);
    resetForm();
    setShowForm(false);
  };

  const handleEditCustomer = (id: number) => {
    const customer = customers.find((c) => c.id === id);
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      });
      setEditingId(id);
      setShowForm(true);
    }
  };

  const handleUpdateCustomer = () => {
    if (!validateForm()) return;
    setCustomers(
      customers.map((c) =>
        c.id === editingId
          ? {
              ...c,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
            }
          : c
      )
    );
    resetForm();
    setShowForm(false);
  };

  const handleDeleteCustomer = (id: number) => {
    setCustomers(customers.filter((c) => c.id !== id));
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "" });
    setErrors({});
    setEditingId(null);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-2">
            Manage your customer database and contacts
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-primary-foreground font-medium px-4 py-2 rounded-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full border border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Customer" : "Add New Customer"}
              </h2>
              <button
                onClick={closeForm}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${
                    errors.name
                      ? "border-destructive bg-destructive bg-opacity-5"
                      : "border-border focus:border-primary"
                  }`}
                  placeholder="Enter customer name"
                />
                {errors.name && (
                  <p className="text-destructive text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${
                    errors.email
                      ? "border-destructive bg-destructive bg-opacity-5"
                      : "border-border focus:border-primary"
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${
                    errors.phone
                      ? "border-destructive bg-destructive bg-opacity-5"
                      : "border-border focus:border-primary"
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={closeForm}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    editingId ? handleUpdateCustomer : handleAddCustomer
                  }
                  className="flex-1 px-4 py-2 bg-primary hover:bg-opacity-90 text-primary-foreground rounded-lg transition-all font-medium"
                >
                  {editingId ? "Update" : "Add"} Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Name
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Email
                </th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">
                  Phone
                </th>
                <th className="text-center px-6 py-4 font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr
                  key={customer.id}
                  className={`border-b border-border hover:bg-muted transition-colors ${
                    index % 2 === 0 ? "bg-card" : "bg-muted bg-opacity-30"
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">
                      {customer.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground">{customer.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground">{customer.phone}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditCustomer(customer.id)}
                        className="text-primary hover:text-primary hover:opacity-75 transition-opacity p-2 rounded hover:bg-muted"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
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

        {customers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No customers yet. Click the "Add Customer" button to add your
              first customer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
