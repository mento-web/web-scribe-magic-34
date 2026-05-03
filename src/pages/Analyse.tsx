import { useSearchParams, useNavigate } from "react-router-dom";
import BmiAnalysis from "@/components/BmiAnalysis";

const Analyse = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const height = Number(params.get("height")) || 0;
  const weight = Number(params.get("weight")) || 0;
  const gender = params.get("gender") || "women";

  return (
    <BmiAnalysis
      height={height}
      weight={weight}
      gender={gender}
      onContinue={() => navigate(`/survey/${gender}`)}
      onBack={() => navigate(-1)}
    />
  );
};

export default Analyse;
