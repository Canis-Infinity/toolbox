declare module "prettier2/standalone.js" {
  type FormatOptions = {
    parser: string;
    plugins: object[];
  };

  const prettier: {
    format(source: string, options: FormatOptions): string;
  };

  export default prettier;
}
