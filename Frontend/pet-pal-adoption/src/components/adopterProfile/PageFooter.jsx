export default function PageFooter({ brand }) {
  return (
    <footer className="border-t border-black/5 bg-transparent">
      <div className="pa-container flex flex-col items-center justify-between gap-4 py-8 text-sm text-black/45 sm:flex-row">
        <div className="text-center sm:text-left">
          © {new Date().getFullYear()} {brand}. Connecting hearts with paws.
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <button type="button" className="hover:text-[rgb(var(--pa-primary))]">
            Privacy Policy
          </button>
          <button type="button" className="hover:text-[rgb(var(--pa-primary))]">
            Terms of Service
          </button>
          <button type="button" className="hover:text-[rgb(var(--pa-primary))]">
            Support
          </button>
        </div>
      </div>
    </footer>
  );
}

