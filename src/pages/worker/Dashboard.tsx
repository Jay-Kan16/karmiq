import {Briefcase,CircleDollarSign,Star,Wallet,MapPin} from "lucide-react";
import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import {useApp} from "../../context/AppContext";
import KpiCard from "../../components/dashboard/KpiCard";
import {api} from "../../services/api";

export default function WorkerDashboard(){
  const nav=useNavigate();
  const{user,workerOnline,setWorkerOnline,currentLocation}=useApp();
  const[w,setW]=useState<any>();

  const syncLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          api.setWorkerLocation(pos.coords.latitude, pos.coords.longitude).catch(() => {});
        },
        () => {
          if (currentLocation?.lat && currentLocation?.lng) {
            api.setWorkerLocation(currentLocation.lat, currentLocation.lng).catch(() => {});
          }
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else if (currentLocation?.lat && currentLocation?.lng) {
      api.setWorkerLocation(currentLocation.lat, currentLocation.lng).catch(() => {});
    }
  };

  useEffect(()=>{
    api.getWorkerMe().then((res)=>{
      setW(res);
      if(res){
        setWorkerOnline(res.availability==="online");
        if(res.availability==="online"){
          syncLocation();
        }
      }
    });
  },[]);

  const toggle=async()=>{
    const next=workerOnline?"offline":"online";
    await api.setWorkerAvailability(next);
    setWorkerOnline(!workerOnline);
    if(next==="online"){
      syncLocation();
    }
  };

  if(!w)return <div>Loading dashboard…</div>;
  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Good morning,</p>
          <h1 className="text-3xl font-black">{user?.name} 👋</h1>
        </div>
        <button
          onClick={toggle}
          className={`rounded-xl px-5 py-3 font-bold transition ${
            workerOnline ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "bg-slate-200 text-slate-700"
          }`}
        >
          {workerOnline ? "ONLINE" : "OFFLINE"}
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Today's Earnings" value={`₹${w.earnings?.today||0}`} icon={CircleDollarSign}/>
        <KpiCard label="Jobs Completed" value={String(w.totalJobs||0)} icon={Briefcase}/>
        <KpiCard label="Rating" value={`${(w.rating||0).toFixed?.(1)||"0"} ⭐`} icon={Star}/>
        <KpiCard label="Monthly Earnings" value={`₹${w.earnings?.month||0}`} icon={Wallet}/>
      </div>
      <div className="card p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Live availability</p>
        <h2 className="mt-2 text-2xl font-black">{workerOnline?"Available for nearby jobs":"Paused"}</h2>
        <p className="mt-2 text-sm text-slate-500">Matching uses your verified skills, availability, location, rating, experience and workload.</p>
        <div className="mt-5 flex gap-3">
          <button onClick={()=>nav("/worker/jobs")} className="btn-primary">View assigned jobs</button>
          {!workerOnline && (
            <button onClick={toggle} className="btn-secondary">Go Online Now</button>
          )}
        </div>
      </div>
    </div>
  );
}