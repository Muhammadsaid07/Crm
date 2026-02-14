import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, X, ShoppingCart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  costPrice: number;
  sellingPrice: number;
  discountedPrice: number;
  stock: number;
  originalStock: number;
}

interface SaleRecord {
  productId: number;
  quantity: number;
  price: number;
  date: string;
}

const PRODUCTS_STORAGE_KEY = "crm_products";
const SALES_STORAGE_KEY = "crm_sales";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showSellModal, setShowSellModal] = useState<number | null>(null);
  const [sellQuantity, setSellQuantity] = useState("");
  const [sellPrice, setSellPrice] = useState<"normal" | "discounted">("normal");
  const [formData, setFormData] = useState({
    name: "",
    costPrice: "",
    sellingPrice: "",
    discountedPrice: "",
    stock: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    const savedSales = localStorage.getItem(SALES_STORAGE_KEY);

    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (e) {
        console.error("Failed to load products", e);
      }
    }
    if (savedSales) {
      try {
        setSales(JSON.parse(savedSales));
      } catch (e) {
        console.error("Failed to load sales", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
  }, [sales]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0)
      newErrors.costPrice = "Valid cost price is required";
    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0)
      newErrors.sellingPrice = "Valid selling price is required";
    if (
      !formData.discountedPrice ||
      parseFloat(formData.discountedPrice) <= 0
    )
      newErrors.discountedPrice = "Valid discounted price is required";
    if (parseFloat(formData.sellingPrice) <= parseFloat(formData.costPrice))
      newErrors.sellingPrice = "Selling price must be higher than cost price";
    if (
      parseFloat(formData.discountedPrice) <= parseFloat(formData.costPrice)
    )
      newErrors.discountedPrice =
        "Discounted price must be higher than cost price";
    if (!formData.stock || parseInt(formData.stock) < 0)
      newErrors.stock = "Valid stock is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = () => {
    if (!validateForm()) return;

    const stockQty = parseInt(formData.stock);
    const newProduct: Product = {
      id: Math.max(...products.map((p) => p.id), 0) + 1,
      name: formData.name,
      costPrice: parseFloat(formData.costPrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      discountedPrice: parseFloat(formData.discountedPrice),
      stock: stockQty,
      originalStock: stockQty,
    };
    setProducts([...products, newProduct]);
    resetForm();
    setShowForm(false);
  };

  const handleEditProduct = (id: number) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      setFormData({
        name: product.name,
        costPrice: product.costPrice.toString(),
        sellingPrice: product.sellingPrice.toString(),
        discountedPrice: product.discountedPrice.toString(),
        stock: product.stock.toString(),
      });
      setEditingId(id);
      setShowForm(true);
    }
  };

  const handleUpdateProduct = () => {
    if (!validateForm()) return;
    const newStockQty = parseInt(formData.stock);
    setProducts(
      products.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: formData.name,
              costPrice: parseFloat(formData.costPrice),
              sellingPrice: parseFloat(formData.sellingPrice),
              discountedPrice: parseFloat(formData.discountedPrice),
              stock: newStockQty,
              originalStock: newStockQty,
            }
          : p
      )
    );
    resetForm();
    setShowForm(false);
  };

  const handleSellProduct = (id: number) => {
    if (!sellQuantity || parseInt(sellQuantity) <= 0) return;
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const qty = parseInt(sellQuantity);
    if (qty > product.stock) return;

    const price = sellPrice === "normal" ? product.sellingPrice : product.discountedPrice;
    
    // Record the sale
    setSales([
      ...sales,
      {
        productId: id,
        quantity: qty,
        price: price,
        date: new Date().toISOString(),
      },
    ]);

    // Update stock
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, stock: p.stock - qty } : p
      )
    );
    
    setShowSellModal(null);
    setSellQuantity("");
    setSellPrice("normal");
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
    // Also delete all sales records for this product
    setSales(sales.filter((s) => s.productId !== id));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      costPrice: "",
      sellingPrice: "",
      discountedPrice: "",
      stock: "",
    });
    setErrors({});
    setEditingId(null);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const calculateBudget = (costPrice: number, stock: number) => {
    return costPrice * stock;
  };

  const inventoryCost = products.reduce(
    (sum, p) => sum + calculateBudget(p.costPrice, p.stock),
    0
  );

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.quantity * sale.price), 0);

  // Calculate total original investment (cost of all products purchased)
  const totalOriginalCost = products.reduce((sum, product) => {
    return sum + (product.costPrice * product.originalStock);
  }, 0);

  // Profit = Total Revenue - Total Original Cost (not just remaining cost)
  const profit = totalRevenue - totalOriginalCost;

  // Calculate total products sold and total original stock
  const totalProductsSold = products.reduce((sum, p) => sum + (p.originalStock - p.stock), 0);
  const totalOriginalStock = products.reduce((sum, p) => sum + p.originalStock, 0);
  const allProductsSold = totalOriginalStock > 0 && totalOriginalStock === totalProductsSold;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your products and track your profit
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-primary-foreground font-medium px-4 py-2 rounded-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Budget Summary */}
      <div className="space-y-4">
        {allProductsSold && totalOriginalStock > 0 && (
          <div className="bg-accent bg-opacity-10 border border-accent border-opacity-30 rounded-lg p-4">
            <p className="text-foreground font-medium text-lg">
              ✓ {totalOriginalStock} out of {totalOriginalStock} products sold!
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <p className="text-muted-foreground text-sm font-medium">
              Total Investment
            </p>
            <p className="text-2xl font-bold text-destructive mt-2">
              -{totalOriginalCost.toLocaleString()} сўм
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Total cost of all purchased products
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <p className="text-muted-foreground text-sm font-medium">
              Remaining Stock Value
            </p>
            <p className="text-2xl font-bold text-destructive mt-2">
              -{inventoryCost.toLocaleString()} сўм
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Cost of unsold inventory
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <p className="text-muted-foreground text-sm font-medium">
              Profit / Loss
            </p>
            <p className={`text-2xl font-bold mt-2 ${profit >= 0 ? 'text-accent' : 'text-destructive'}`}>
              {profit >= 0 ? '+' : ''}{profit.toLocaleString()} сўм
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Revenue minus total investment
            </p>
          </div>
        </div>

        {totalRevenue > 0 && (
          <div className="bg-accent bg-opacity-10 border border-accent border-opacity-30 rounded-lg p-4">
            <p className="text-foreground font-medium">
              Total Revenue from Sales: <span className="text-accent font-bold">{totalRevenue.toLocaleString()} сўм</span>
            </p>
          </div>
        )}
      </div>


      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full border border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Product" : "Add New Product"}
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
                  Product Name *
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
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-destructive text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Cost Price (сўм) *
                </label>
                <input
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, costPrice: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${
                    errors.costPrice
                      ? "border-destructive bg-destructive bg-opacity-5"
                      : "border-border focus:border-primary"
                  }`}
                  placeholder="0"
                  step="1"
                />
                {errors.costPrice && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.costPrice}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Selling Price (сўм) *
                </label>
                <input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${
                    errors.sellingPrice
                      ? "border-destructive bg-destructive bg-opacity-5"
                      : "border-border focus:border-primary"
                  }`}
                  placeholder="0"
                  step="1"
                />
                {errors.sellingPrice && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.sellingPrice}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Discounted Price (сўм) *
                </label>
                <input
                  type="number"
                  value={formData.discountedPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountedPrice: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${
                    errors.discountedPrice
                      ? "border-destructive bg-destructive bg-opacity-5"
                      : "border-border focus:border-primary"
                  }`}
                  placeholder="0"
                  step="1"
                />
                {errors.discountedPrice && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.discountedPrice}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${
                    errors.stock
                      ? "border-destructive bg-destructive bg-opacity-5"
                      : "border-border focus:border-primary"
                  }`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.stock}
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
                  onClick={editingId ? handleUpdateProduct : handleAddProduct}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-opacity-90 text-primary-foreground rounded-lg transition-all font-medium"
                >
                  {editingId ? "Update" : "Add"} Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full border border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Sell Product</h2>
              <button
                onClick={() => {
                  setShowSellModal(null);
                  setSellQuantity("");
                  setSellPrice("normal");
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantity to Sell *
                </label>
                <input
                  type="number"
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary transition-colors"
                  placeholder="0"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Selling Price *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors" style={{borderColor: sellPrice === "normal" ? "var(--primary)" : ""}}>
                    <input
                      type="radio"
                      name="price"
                      value="normal"
                      checked={sellPrice === "normal"}
                      onChange={(e) => setSellPrice(e.target.value as "normal")}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 text-sm font-medium">Regular Price</span>
                  </label>
                  <label className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors" style={{borderColor: sellPrice === "discounted" ? "var(--primary)" : ""}}>
                    <input
                      type="radio"
                      name="price"
                      value="discounted"
                      checked={sellPrice === "discounted"}
                      onChange={(e) => setSellPrice(e.target.value as "discounted")}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 text-sm font-medium">Discounted Price</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowSellModal(null);
                    setSellQuantity("");
                    setSellPrice("normal");
                  }}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSellProduct(showSellModal)}
                  className="flex-1 px-4 py-2 bg-accent hover:bg-opacity-90 text-accent-foreground rounded-lg transition-all font-medium"
                >
                  Confirm Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Table - Desktop */}
      <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground text-sm">
                  Product Name
                </th>
                <th className="text-right px-4 py-3 font-semibold text-foreground text-sm">
                  Cost Price
                </th>
                <th className="text-right px-4 py-3 font-semibold text-foreground text-sm">
                  Selling Price
                </th>
                <th className="text-right px-4 py-3 font-semibold text-foreground text-sm">
                  Discounted Price
                </th>
                <th className="text-right px-4 py-3 font-semibold text-foreground text-sm">
                  Stock
                </th>
                <th className="text-right px-4 py-3 font-semibold text-foreground text-sm">
                  Budget
                </th>
                <th className="text-center px-4 py-3 font-semibold text-foreground text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr
                  key={product.id}
                  className={`border-b border-border hover:bg-muted transition-colors ${
                    index % 2 === 0 ? "bg-card" : "bg-muted bg-opacity-30"
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground text-sm">
                      {product.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-foreground text-sm">
                      {product.costPrice.toLocaleString()} сўм
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-accent font-medium text-sm">
                      {product.sellingPrice.toLocaleString()} сўм
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-accent font-medium text-sm">
                      {product.discountedPrice.toLocaleString()} сўм
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-medium text-sm ${
                        product.stock > 10
                          ? "text-green-600"
                          : product.stock > 0
                            ? "text-orange-600"
                            : "text-destructive"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-destructive font-medium text-sm">
                      -{calculateBudget(
                        product.costPrice,
                        product.stock
                      ).toLocaleString()} сўм
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setShowSellModal(product.id)}
                        disabled={product.stock === 0}
                        className="disabled:opacity-50 disabled:cursor-not-allowed text-accent hover:text-accent hover:opacity-75 transition-opacity p-2 rounded hover:bg-muted"
                        title="Sell product"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className="text-primary hover:text-primary hover:opacity-75 transition-opacity p-2 rounded hover:bg-muted"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
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

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No products yet. Click the "Add Product" button to create your
              first product.
            </p>
          </div>
        )}
      </div>

      {/* Products Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-card border border-border rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-foreground text-base">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowSellModal(product.id)}
                    disabled={product.stock === 0}
                    className="disabled:opacity-50 disabled:cursor-not-allowed text-accent hover:text-accent hover:opacity-75 transition-opacity p-2 rounded hover:bg-muted"
                    title="Sell product"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditProduct(product.id)}
                    className="text-primary hover:text-primary hover:opacity-75 transition-opacity p-2 rounded hover:bg-muted"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-destructive hover:opacity-75 transition-opacity p-2 rounded hover:bg-destructive hover:bg-opacity-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost Price:</span>
                  <span className="font-medium">
                    {product.costPrice.toLocaleString()} сўм
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selling Price:</span>
                  <span className="font-medium text-accent">
                    {product.sellingPrice.toLocaleString()} сўм
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discounted Price:</span>
                  <span className="font-medium text-accent">
                    {product.discountedPrice.toLocaleString()} сўм
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="text-muted-foreground">Stock:</span>
                  <span
                    className={`font-medium ${
                      product.stock > 10
                        ? "text-green-600"
                        : product.stock > 0
                          ? "text-orange-600"
                          : "text-destructive"
                    }`}
                  >
                    {product.stock}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-medium text-destructive">
                    -{calculateBudget(
                      product.costPrice,
                      product.stock
                    ).toLocaleString()} сўм
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No products yet. Click the "Add Product" button to create your
              first product.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
