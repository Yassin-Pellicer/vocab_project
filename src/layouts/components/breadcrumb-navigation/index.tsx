import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbNavigation } from "./hook";

export function BreadcrumbNavigation() {
  const { breadcrumbItems } = useBreadcrumbNavigation();

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <>
            <BreadcrumbItem key={item.label}>
              {item.url ? (
                <BreadcrumbLink asChild>
                  <Link to={item.url}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && (
              <BreadcrumbSeparator key={`sep-${index}`} />
            )}
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
