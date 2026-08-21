export type ToolCategory =
  | "json"
  | "structured-data"
  | "encoding"
  | "color"
  | "jwt"
  | "hash"
  | "datetime"
  | "code"
  | "text";

export type ToolAction = "format" | "minify" | "validate" | "convert" | "decode" | "encode" | "generate" | "hash";

export type ToolDefinition = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  tags: string[];
  aliases: string[];
  priority: number;
  localOnly: true;
  actions: ToolAction[];
  inputLanguage: string;
  outputLanguage: string;
  countUsage: boolean;
  example: string;
};

export type ToolResult = {
  ok: true;
  output: string;
  language: string;
  summary: string;
  warnings?: string[];
};

export type ToolFailure = {
  ok: false;
  message: string;
  line?: number;
  column?: number;
};

export type ToolExecution = ToolResult | ToolFailure;

export type ToolOptions = {
  indent?: "2" | "4" | "tab";
  recursiveSort?: boolean;
  typeName?: string;
  mode?: string;
  secret?: string;
  keyEncoding?: string;
  outputEncoding?: string;
  bytes?: number;
  codeLanguage?: string;
};
