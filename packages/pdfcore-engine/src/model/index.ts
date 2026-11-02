/**
 * `model/` — the in-memory annotation/form edit model. CRUD mutates these
 * stores while a document is open; `PdfDoc.save()` commits them to real PDF
 * objects (DEC-39). The Forms and Annotate adapters populate the commit
 * wiring; the stores themselves are complete.
 */
export { AnnotationModel } from "./annotations.js";
export { FormModel } from "./forms.js";
