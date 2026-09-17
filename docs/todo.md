# TODO

Updated: 2026-03-09

## High Priority

- Optimize article route bundle size.
  - Lazy-load code highlighting only when an article contains fenced code blocks.
  - Lazy-load the comment section after initial article content renders.
  - Re-check whether the markdown/rendering stack can be slimmed further.

- Review homepage on real devices.
  - Check spacing and visual rhythm on mobile widths.
  - Check whether hero proof cards wrap cleanly on smaller screens.
  - Verify that the new project/contact layouts still feel balanced on tablet widths.

## Medium Priority

- Refine loading experience for route transitions.
  - Replace plain `Loading...` fallback with a small branded loading state.

- Revisit English copy polish.
  - Confirm tone and phrasing for recruiter-facing English copy.
  - Check terminology consistency across hero, project, and contact sections.

- Update build warning dependency.
  - Refresh `baseline-browser-mapping` if the team wants a clean build log.

## Nice To Have

- Add a real resume asset if the site still needs a resume download path.
- Consider moving `ContentMap` fully into the articles page if homepage density becomes too high.
- Add screenshots or richer media for more than one featured project.
