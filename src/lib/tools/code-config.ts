export const CODE_FORMAT_LANGUAGES = [
  "javascript", "typescript", "json", "html", "css", "markdown", "yaml", "python",
  "java", "c", "cpp", "csharp", "go", "rust", "sql", "shell"
] as const;

export const CODE_MINIFY_LANGUAGES = ["javascript", "json", "css", "html"] as const;

export const CODE_EXAMPLES: Record<string, string> = {
  javascript: "function greet(name){console.log(`Hello, ${name}!`)}\ngreet('Infinity')",
  typescript: "type User={name:string;active:boolean}\nconst user:User={name:'Infinity',active:true}",
  json: '{"name":"Infinity","features":["local","private"]}',
  html: '<main><h1>Developer Tools</h1><p>Local and private.</p></main>',
  css: ".toolbox{display:grid;gap:16px;color:#111827}",
  markdown: "# Developer Tools\n- local\n- private",
  yaml: "name: Developer Tools\nfeatures:\n- local\n- private",
  python: "def greet(name):\n print(f'Hello, {name}!')\ngreet('Infinity')",
  java: "class Main{public static void main(String[]args){System.out.println(\"Hello\");}}",
  c: "#include <stdio.h>\nint main(){printf(\"Hello\\n\");return 0;}",
  cpp: "#include <iostream>\nint main(){std::cout<<\"Hello\"<<std::endl;return 0;}",
  csharp: "class Program{static void Main(){System.Console.WriteLine(\"Hello\");}}",
  go: "package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"Hello\")}",
  rust: "fn main(){println!(\"Hello\");}",
  sql: "select id,name from users where active=true order by name;",
  shell: "#!/bin/sh\nif [ -n \"$USER\" ];then echo \"Hello $USER\";fi"
};
