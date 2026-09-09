export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 px-6 py-4 text-xs text-zinc-500 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <span>
          © {new Date().getFullYear()} Mebabl Platform
        </span>

        <span>
          Console V1
        </span>
      </div>
    </footer>
  );
}