import { Helmet } from "react-helmet-async";

interface PageSEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = "Awaz";
const DEFAULT_IMAGE = "/og-default.jpg";

export function PageSEO({
  title,
  description,
  image,
  url,
  type = "website",
  noIndex = false,
  jsonLd,
}: PageSEOProps) {
  const fullTitle = title.includes("Awaz") ? title : `${title} | ${SITE_NAME}`;
  const canonical = url || (typeof window !== "undefined" ? window.location.href : "");
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : `${typeof window !== "undefined" ? window.location.origin : ""}${image}`
    : `${typeof window !== "undefined" ? window.location.origin : ""}${DEFAULT_IMAGE}`;
  const safeDesc = description.replace(/<[^>]*>/g, "").slice(0, 160);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={safeDesc} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={safeDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={safeDesc} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
