import { Navigate, useParams } from "react-router-dom";

export function LegacyPharmacyRequestRedirect() {
  const { requestId } = useParams();

  return <Navigate to={`/app/pharmacy/requests/${requestId}`} replace />;
}
