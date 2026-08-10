import { PageHeader } from "../../../shared/components/PageHeader";

export function OrganizationPageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
}) {
  return (
    <PageHeader
      eyebrow={eyebrow}
      title={title}
      description={description}
      icon={Icon}
      action={action}
    />
  );
}
