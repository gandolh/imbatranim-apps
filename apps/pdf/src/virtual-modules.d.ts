/** The build's plugin (packages/shared/src/build/pdfjsWasm.ts) provides it. */
declare module "virtual:pdfjs-wasm-dir" {
  /** The directory URL, ending in `/`, of pdf.js's JPEG2000, JBIG2 and colour-management decoders. */
  const url: string;
  export default url;
}
