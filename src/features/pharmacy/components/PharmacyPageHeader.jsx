import { Building2 } from "lucide-react";

import { PageHeader } from "../../../shared/components/PageHeader";

export function PharmacyPageHeader({ eyebrow, title, description, actions }) {
  return (
    <PageHeader
      eyebrow={eyebrow}
      title={title}
      description={description}
      icon={Building2}
      action={actions}
      className="mb-7"
    />
  );
}
