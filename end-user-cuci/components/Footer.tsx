export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-600 dark:text-slate-300 flex flex-col md:flex-row items-center justify-between gap-2">
        <span>© 2025 Laundry Service. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="mailto:info@laundry.com" className="hover:text-primary">
            Contact
          </a>
          <a href="/docs" className="hover:text-primary">
            Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
