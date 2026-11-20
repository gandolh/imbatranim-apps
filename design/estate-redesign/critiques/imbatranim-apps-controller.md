# imbatranim-apps: the controller's rulings (2026-11-13)

## After the critic (critiques/imbatranim-apps.md, fix): round 2

Do all of the critic's regressions 1-3 and priority issues 1-7 as written there, plus the rest of the file's fixes: the Notes glyph `notebook-text` with a soft pressed state, the inspector hint at 12/16, and the Open sticky naming the theme-option check for Univer and SuperDoc. The rulings below settle what the critic left to the controller.

1. **The inspector below 1100 px window width opens as a popover** (264 px, anchored to its strip icon, radius 14, `shadow-menu`) over the desk's right edge. The panel docks only at 1100+. This is RESULT ruling 1's "selecting opens it", not a clash. Draw the 1280 artboards in today's 958 px window with the popover open on Slides' selected state. The maximized extra keeps the docked panel.
2. **PDF gets the same idle fold** (the 48 px strip while `Select / text` is current). It opens at 232 px when a markup tool is picked or the toggle is pressed, and follows rule 1 below 1100.
3. **Honest scale.** Draw every page as a fixed sheet scaled with `transform`, never reflowed. Each zoom readout shows the true scale of the sheet as drawn: Docs either at 816 px (100%) or at the zoom that fits. No text may be cut by a page's `overflow`.
4. **Docs keeps its status band** (RESULT ruling 5; one status band across all four apps is a strength the critic named). The app bar goes to 40 px in all four apps, and Docs' desk top margin to 12.
5. **Ruling 4 is desktop-only.** On the phone, Download sits in More, labelled there. Present stays on the phone bar.
6. **Dark depth:** the desk goes to `surface-container-lowest` in dark, in the apps' role mapping only. The OS tokens don't change.
7. **The frame:** desktop at `100vh`, window at viewport minus taskbar minus 8, at every width you shoot.
8. **Re-run the Floor from scratch,** with the clip, text-in-column and gap checks, plus an empty-band check (no band over 48 px between content and the frame's edge or the next band, in any app at any width). Report these, at 1280 (958 window), 1024, 768, 390 and 360:
   - the slide's width idle and with the inspector or popover open;
   - the PDF page's width and its readout;
   - Docs' page width and its readout;
   - the thumbnails' size.
