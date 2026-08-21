declare module "html-minifier-terser/dist/htmlminifier.esm.bundle" {
  type MinifyOptions = {
    collapseWhitespace?: boolean;
    removeComments?: boolean;
    removeRedundantAttributes?: boolean;
  };

  export function minify(source: string, options?: MinifyOptions): Promise<string>;
}
