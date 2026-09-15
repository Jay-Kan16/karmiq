import { SearchX } from "lucide-react";

export default function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="card grid place-items-center px-6 py-16 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400"><SearchX /></span>
      <h3 className="font-bold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>
    </div>
  );
}