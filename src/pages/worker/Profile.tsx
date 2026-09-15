import {useEffect,useState} from "react";
import {BadgeCheck,Briefcase,FileCheck2,Star,ShieldCheck} from "lucide-react";
import {api} from "../../services/api";

export default function WorkerProfile(){
  const[w,setW]=useState<any>();
  const[verifying,setVerifying]=useState(false);

  useEffect(()=>{
    api.getWorkerMe().then(setW)
  },[]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const updated = await api.verifySelf();
      setW(updated);
    } catch (e) {
      alert("Failed to verify profile");
    } finally {
      setVerifying(false);
    }
  };

  if(!w)return <div>Loading profile…</div>;
  const u=w.userId;
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="section-title">Worker Profile</h1>
      <div className="card mt-6 p-6">
        <div className="flex items-center gap-5">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-brand-100 text-2xl font-black text-brand-700">
            {u?.name?.split(" ").map((n:string)=>n[0]).join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black">{u?.name}</h2>
              <BadgeCheck className="text-brand-600"/>
            </div>
            <p className="text-slate-500">{w.skills?.join(", ")} • {w.experience} years</p>
            <p className="mt-2 text-sm font-bold">
              <Star className="mr-1 inline text-amber-400" size={15}/>{w.rating?.toFixed?.(1)||"0"} • <Briefcase className="mr-1 inline" size={15}/>{w.totalJobs} jobs
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-bold">Skills</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {w.skills?.map((s:string)=><span key={s} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold">{s}</span>)}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-bold">Verification</h3>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-50 p-4">
            <div className="flex items-center gap-3">
              <FileCheck2 className="text-brand-600"/>
              <span className="text-sm font-bold">{w.verificationStatus}</span>
            </div>
            {w.verificationStatus !== "VERIFIED" && (
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="btn-primary flex items-center gap-1 px-3 py-1.5 text-xs"
              >
                <ShieldCheck size={14}/>
                {verifying ? "Verifying…" : "Verify Account"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}