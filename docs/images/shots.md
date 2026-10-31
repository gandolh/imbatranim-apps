# README images

How each image was made, so the next refresh is a re-run. Take an image again when the app it shows changes.

| File        | Shows                                               | How to reach that state                                                                              | Viewport                                 | Data                                 | Taken      |
| ----------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------ | ---------- |
| docs.webp   | Docs with `garden-plan.docx`                        | File Manager → Documents → double-click the file, wait for the window, screenshot the window element | 1440×900 @2x, window at its default size | `demo-docs.py`                       | 2026-10-31 |
| sheets.webp | Sheets with `garden-harvest.xlsx`, totals computed  | same, with that file                                                                                 | 1440×900 @2x                             | `demo-docs.py`                       | 2026-10-31 |
| slides.webp | Slides with `garden-season.pptx` on its title slide | same, with that file                                                                                 | 1440×900 @2x                             | `demo-docs.py`                       | 2026-10-31 |
| pdf.webp    | PDF with `garden-plan.pdf`                          | same, with that file                                                                                 | 1440×900 @2x                             | `demo-docs.py`, PDF from LibreOffice | 2026-10-31 |
| cad.webp    | CAD with `apartment.dxf`                            | same, with that file                                                                                 | 1440×900 @2x                             | `apps/cad/fixtures/apartment.dxf`    | 2026-10-31 |

## Setup

The windows come from a local imbatranimOS with this repo installed from a checkout at `440c510`, as [os/README.md](../../os/README.md#installing-from-a-local-checkout) describes: a `file://` descriptor and `MARKETPLACE_ALLOW_LOCAL_REPOS=true`. On 2026-10-31 the OS ran on the host instead of its container, as a Linux user named `imbatranim`; the files were the same either way.

1. `python3 docs/images/demo-docs.py /tmp/office-demo`, then copy the four files and `apps/cad/fixtures/apartment.dxf` into `~/Documents` of the OS user.
2. Settings → Marketplace → Office → Install, and wait for the build.
3. For each file: close every window, open File Manager, open Documents, double-click the file, wait about 12 seconds for the app and the suite's server, and screenshot the `[data-app-id^="office-"]` window element with Playwright.
4. Convert: `ffmpeg -i shot.png -c:v libwebp -quality 82 <app>.webp`.

Each image was checked for personal data: the documents are made up, and no window shows a user name.
