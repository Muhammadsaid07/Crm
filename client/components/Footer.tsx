export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-lg">Business CRM</h3>
            <p className="text-sm opacity-75">
              Professional customer relationship management
            </p>
          </div>

          <div className="text-center text-sm opacity-75">
            &copy; {currentYear} Business CRM. All rights reserved.
          </div>

          <div className="flex gap-4 text-sm opacity-75">
            <a href="#" className="hover:opacity-100 transition-opacity">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:opacity-100 transition-opacity">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
