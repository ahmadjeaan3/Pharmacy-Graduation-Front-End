import { LibraryBig } from "lucide-react";

import { PageHeader } from "../../../shared/components/PageHeader";

export function MedicinePageHeader({ title, description, actions }) {
  return (
    <PageHeader
      eyebrow="الدليل الدوائي المركزي"
      title={title}
      description={description}
      icon={LibraryBig}
      action={actions}
      className="mb-7"
    />
  );
}
