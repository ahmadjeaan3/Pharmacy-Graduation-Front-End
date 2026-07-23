import { useQuery } from "@tanstack/react-query";
import { Building2, Megaphone } from "lucide-react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  donationKeys,
  getActiveCampaigns,
  getApprovedOrganizations,
} from "../api/donationsApi";

export function DonationTargetPicker({
  organizationId,
  campaignId,
  purpose,
  onOrganizationChange,
  onCampaignChange,
}) {
  const organizations = useQuery({
    queryKey: donationKeys.organizations,
    queryFn: getApprovedOrganizations,
  });
  const campaigns = useQuery({
    queryKey: donationKeys.campaigns(organizationId, purpose),
    queryFn: () => getActiveCampaigns(organizationId),
    enabled: Boolean(organizationId),
  });
  const availableCampaigns = (campaigns.data || []).filter(
    (campaign) => purpose !== "offer" || campaign.acceptsPublicDonations,
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label>
        <span className="form-label">المنظمة المستفيدة</span>
        <div className="field-control">
          <select
            className="form-input has-field-icon appearance-none"
            required
            value={organizationId}
            disabled={organizations.isLoading}
            onChange={(event) => {
              onOrganizationChange(event.target.value);
              onCampaignChange("");
            }}
          >
            <option value="">
              {organizations.isLoading
                ? "جاري تحميل المنظمات..."
                : "اختر منظمة معتمدة"}
            </option>
            {(organizations.data || []).map((organization) => (
              <option
                key={organization.organizationId}
                value={organization.organizationId}
              >
                {organization.organizationName} — {organization.city}
              </option>
            ))}
          </select>
          <span className="field-icon-shell">
            <Building2 size={17} />
          </span>
        </div>
        {organizations.isError && (
          <p className="mt-2 text-xs font-bold text-rose-600">
            {getApiErrorMessage(organizations.error)}
          </p>
        )}
      </label>
      <label>
        <span className="form-label">
          الحملة المرتبطة{" "}
          <small className="font-medium text-[#9aabad]">(اختياري)</small>
        </span>
        <div className="field-control">
          <select
            className="form-input has-field-icon appearance-none"
            value={campaignId}
            disabled={!organizationId || campaigns.isLoading}
            onChange={(event) => onCampaignChange(event.target.value)}
          >
            <option value="">
              {!organizationId
                ? "اختر المنظمة أولًا"
                : campaigns.isLoading
                  ? "جاري تحميل الحملات..."
                  : "دون حملة محددة"}
            </option>
            {availableCampaigns.map((campaign) => (
              <option key={campaign.campaignId} value={campaign.campaignId}>
                {campaign.title}
                {campaign.isUrgent ? " — عاجلة" : ""}
              </option>
            ))}
          </select>
          <span className="field-icon-shell">
            <Megaphone size={17} />
          </span>
        </div>
      </label>
      {!organizations.isLoading &&
        !organizations.isError &&
        organizations.data?.length === 0 && (
          <p className="md:col-span-2 rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-700">
            لا توجد منظمات معتمدة متاحة حاليًا لاستقبال الطلب.
          </p>
        )}
    </div>
  );
}
