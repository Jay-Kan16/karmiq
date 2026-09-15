import { CheckCircle2, Star } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { submitRating } from "../../services/api";
import { useApp } from "../../context/AppContext";
import type { TranslationKey } from "../../data/translations";

const ratingTags: { id: string; key: TranslationKey }[] = [
  { id: "Professional", key: "tagProfessional" },
  { id: "On Time", key: "tagOnTime" },
  { id: "Good Work", key: "tagGoodWork" },
  { id: "Friendly", key: "tagFriendly" },
  { id: "Affordable", key: "tagAffordable" }
];

export default function Rating() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useApp();
  const [stars, setStars] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    await submitRating({ id: `R${Date.now()}`, bookingId: id!, stars, tags: selected, comment });
    setDone(true);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="card p-8">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-brand-600">
            <CheckCircle2 />
          </span>
          <h1 className="mt-5 text-2xl font-black">{t("thanksFeedback")}</h1>
          <p className="mt-2 text-sm text-slate-500">{t("ratingHelps")}</p>
          <button onClick={() => navigate("/customer")} className="btn-primary mt-6 w-full">
            {t("backToHome")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="card p-7 text-center">
        <h1 className="text-3xl font-black">{t("howWasYourExperience")}</h1>
        <p className="mt-2 text-sm text-slate-500">{t("bookingDetails")} #{id}</p>
        <div className="mt-7 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setStars(n)} aria-label={`${n} stars`}>
              <Star size={34} className={n <= stars ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
            </button>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {ratingTags.map(({ id: tagId, key }) => (
            <button
              key={tagId}
              onClick={() => setSelected(s => (s.includes(tagId) ? s.filter(x => x !== tagId) : [...s, tagId]))}
              className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                selected.includes(tagId)
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="input mt-5 min-h-28"
          placeholder={t("tellUsMore")}
        />
        <button onClick={submit} className="btn-primary mt-4 w-full">
          {t("submitRating")}
        </button>
      </div>
    </div>
  );
}