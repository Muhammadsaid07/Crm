import { ArrowRight, ShoppingCart, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your inventory and sales dashboard. Start by adding products and tracking sales.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/products"
          className="bg-card border border-border rounded-lg p-8 shadow-sm hover:shadow-md hover:border-primary transition-all group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="bg-blue-100 p-3 rounded-lg mb-4 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Products</h3>
              <p className="text-muted-foreground text-sm mt-2">
                Manage your inventory, stock, and pricing
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        <Link
          to="/sales"
          className="bg-card border border-border rounded-lg p-8 shadow-sm hover:shadow-md hover:border-primary transition-all group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="bg-purple-100 p-3 rounded-lg mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Sales</h3>
              <p className="text-muted-foreground text-sm mt-2">
                View and manage all sales transactions
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
      </div>

      <div className="bg-accent bg-opacity-10 border border-accent border-opacity-30 rounded-lg p-8">
        <h2 className="text-xl font-bold text-foreground mb-2">Get Started</h2>
        <p className="text-foreground opacity-75">
          Your dashboard is ready to use. Start by adding products with cost and selling prices, then track your sales and profits.
        </p>
      </div>
    </div>
  );
}
