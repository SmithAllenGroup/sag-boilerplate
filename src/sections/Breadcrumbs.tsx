interface BreadcrumbsProps {
  path?: string;
}

interface Breadcrumb {
  label: string;
  href: string;
}

export default function Breadcrumbs({ path = '' }: BreadcrumbsProps) {
  const segments = path.split('/').filter(Boolean);

  const breadcrumbs: Breadcrumb[] = segments.map((segment, index) => ({
    label: segment.replace(/-/g, ' '),
    href: '/' + segments.slice(0, index + 1).join('/'),
  }));

  return (
    <nav className="text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
      <ol className="inline-flex list-none p-0 space-x-1">
        <li>
          <a href="/" className="hover:text-primary-600 font-medium">
            Home
          </a>
          <span className="mx-2">/</span>
        </li>
        {breadcrumbs.map((crumb, index) => (
          <li key={index}>
            {index !== breadcrumbs.length - 1 ? (
              <span>
                <a href={crumb.href} className="hover:text-primary-600 capitalize">
                  {crumb.label}
                </a>
                <span className="mx-2">/</span>
              </span>
            ) : (
              <span className="capitalize text-gray-400">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}