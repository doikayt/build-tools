import { findMarkers, parseHeadings } from "@datalackey/tooling-core";
import GithubSlugger from "github-slugger";

const MARKER_COMPONENTS_START = "<!-- UML:components:START -->";
const MARKER_COMPONENTS_END = "<!-- UML:components:END -->";
const MARKER_COMPONENTS_TABLE_START = "<!-- UML:components-table:START -->";
const MARKER_COMPONENTS_TABLE_END = "<!-- UML:components-table:END -->";
const MARKER_COMPONENT_DETAILS_START = "<!-- UML:component-details:START -->";
const MARKER_COMPONENT_DETAILS_END = "<!-- UML:component-details:END -->";

export const UML_MARKERS = {
  COMPONENTS_START: MARKER_COMPONENTS_START,
  COMPONENTS_END: MARKER_COMPONENTS_END,
  COMPONENTS_TABLE_START: MARKER_COMPONENTS_TABLE_START,
  COMPONENTS_TABLE_END: MARKER_COMPONENTS_TABLE_END,
  COMPONENT_DETAILS_START: MARKER_COMPONENT_DETAILS_START,
  COMPONENT_DETAILS_END: MARKER_COMPONENT_DETAILS_END,
} as const;

export interface UmlSections {
  components: string;
  componentsTable: string;
  componentDetails: string;
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
 * Warns via onWarn if any generated component heading anchor (#### <component>)
 * collides with an existing heading slug OUTSIDE the component-details
 * marker region. Headings inside the component-details region are ones we
 * generated ourselves on a previous run and are not real collisions.
 */
export function injectUmlSections(
  content: string,
  sections: UmlSections,
  componentNames: string[],
  onWarn?: (message: string) => void
): string {
  const pairs = [
    { startMarker: MARKER_COMPONENTS_START, endMarker: MARKER_COMPONENTS_END },
    {
      startMarker: MARKER_COMPONENTS_TABLE_START,
      endMarker: MARKER_COMPONENTS_TABLE_END,
    },
    {
      startMarker: MARKER_COMPONENT_DETAILS_START,
      endMarker: MARKER_COMPONENT_DETAILS_END,
    },
  ];

  const locations = findMarkers(content, pairs);

  // Anchor collision check — only check headings outside component-details region
  if (componentNames.length > 0 && onWarn !== undefined) {
    const detailsLoc = locations.get(MARKER_COMPONENT_DETAILS_START);
    const contentForHeadingCheck =
      detailsLoc !== undefined
        ? content.substring(0, detailsLoc.startIndex) +
          content.substring(detailsLoc.endIndex)
        : content;

    const headings = parseHeadings(contentForHeadingCheck);
    const slugger = new GithubSlugger();
    const existingSlugs = new Set(headings.map((h) => slugger.slug(h.rawText)));

    for (const component of componentNames) {
      if (existingSlugs.has(component)) {
        onWarn(
          `Warning: heading anchor "#${component}" collides with an existing heading in the document — components-table link may navigate to the wrong section`
        );
      }
    }
  }

  // Rebuild string by applying injections from end to start so indexes stay valid
  const orderedLocations = [
    { key: MARKER_COMPONENT_DETAILS_START, content: sections.componentDetails },
    { key: MARKER_COMPONENTS_TABLE_START, content: sections.componentsTable },
    { key: MARKER_COMPONENTS_START, content: sections.components },
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
