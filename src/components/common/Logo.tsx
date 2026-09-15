import { Wrench } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
        <Wrench size={21} />
      </span>
      <span>
        <span className="block text-lg font-extrabold leading-none text-slate-900">Karm<span className="text-brand-600">iq</span></span>
        <span className="hidden text-[10px] font-medium text-slate-400 sm:block">Verified Skills. Fair Work.</span>
      </span>
    </Link>
  );
}