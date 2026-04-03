import { findMarkers, parseHeadings } from "@datalackey/tooling-core";
import GithubSlugger from "github-slugger";

const MARKER_PACKAGES_START = "<!-- UML:packages:START -->";
const MARKER_PACKAGES_END = "<!-- UML:packages:END -->";
const MARKER_PACKAGES_TABLE_START = "<!-- UML:packages-table:START -->";
const MARKER_PACKAGES_TABLE_END = "<!-- UML:packages-table:END -->";
const MARKER_PACKAGE_DETAILS_START = "<!-- UML:package-details:START -->";
const MARKER_PACKAGE_DETAILS_END = "<!-- UML:package-details:END -->";

export const UML_MARKERS = {
  PACKAGES_START: MARKER_PACKAGES_START,
  PACKAGES_END: MARKER_PACKAGES_END,
  PACKAGES_TABLE_START: MARKER_PACKAGES_TABLE_START,
  PACKAGES_TABLE_END: MARKER_PACKAGES_TABLE_END,
  PACKAGE_DETAILS_START: MARKER_PACKAGE_DETAILS_START,
  PACKAGE_DETAILS_END: MARKER_PACKAGE_DETAILS_END,
} as const;

export interface UmlSections {
  packages: string;
  packagesTable: string;
  packageDetails: string;
}

/**
 * Injects UML-generated content into a Markdown file between the three
 * standard UML marker pairs. Uses findMarkers to locate all pairs in a
 * single pass.
 *
 * Missing marker pairs are silently skipped — not every document needs
 * all three sections. Duplicate or malformed marker pairs throw (via
 * findMarkers).
 *
 * Warns via onWarn if any generated package heading anchor (#### <pkg>)
 * collides with an existing heading slug OUTSIDE the package-details
 * marker region. Headings inside the package-details region are ones we
 * generated ourselves on a previous run and are not real collisions.
 */
export function injectUmlSections(
  content: string,
  sections: UmlSections,
  packageNames: string[],
  onWarn?: (message: string) => void
): string {
  const pairs = [
    { startMarker: MARKER_PACKAGES_START, endMarker: MARKER_PACKAGES_END },
    {
      startMarker: MARKER_PACKAGES_TABLE_START,
      endMarker: MARKER_PACKAGES_TABLE_END,
    },
    {
      startMarker: MARKER_PACKAGE_DETAILS_START,
      endMarker: MARKER_PACKAGE_DETAILS_END,
    },
  ];

  const locations = findMarkers(content, pairs);

  // Anchor collision check — only check headings outside package-details region
  if (packageNames.length > 0 && onWarn !== undefined) {
    const detailsLoc = locations.get(MARKER_PACKAGE_DETAILS_START);
    const contentForHeadingCheck =
      detailsLoc !== undefined
        ? content.substring(0, detailsLoc.startIndex) +
          content.substring(detailsLoc.endIndex)
        : content;

    const headings = parseHeadings(contentForHeadingCheck);
    const slugger = new GithubSlugger();
    const existingSlugs = new Set(headings.map((h) => slugger.slug(h.rawText)));

    for (const pkg of packageNames) {
      if (existingSlugs.has(pkg)) {
        onWarn(
          `Warning: heading anchor "#${pkg}" collides with an existing heading in the document — packages-table link may navigate to the wrong section`
        );
      }
    }
  }

  // Rebuild string by applying injections from end to start so indexes stay valid
  const orderedLocations = [
    { key: MARKER_PACKAGE_DETAILS_START, content: sections.packageDetails },
    { key: MARKER_PACKAGES_TABLE_START, content: sections.packagesTable },
    { key: MARKER_PACKAGES_START, content: sections.packages },
  ];

  let result = content;

  for (const { key, content: sectionContent } of orderedLocations) {
    const loc = locations.get(key);
    if (loc === undefined) continue;

    const before = result.substring(0, loc.startIndex);
    const after = result.substring(loc.endIndex);
    result = `${before}\n${sectionContent}\n${after}`;
  }

  return result;
}
