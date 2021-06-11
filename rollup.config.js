import {nodeResolve} from "@rollup/plugin-node-resolve";
import {terser} from "rollup-plugin-terser";
import * as meta from "./package.json";

const distName = meta.name.replace('@', '').replace('/', '-');
const config = {
  input: "src/index.js",
  external: Object.keys(meta.dependencies || {}).filter(key => /^@agen/.test(key)),
  output: {
    file: `dist/${distName}.cjs`,
    name: "agen",
    format: "umd",
    indent: false,
    extend: true,
    banner: `// ${meta.homepage} v${meta.version} Copyright ${(new Date).getFullYear()} ${meta.author.name}`,
    globals: Object.assign({}, ...Object.keys(meta.dependencies || {}).filter(key => /^@agen/.test(key)).map(key => ({[key]: "agen"})))
  },
  plugins: [
    nodeResolve()
  ]
};

export default [
  config,
  {
    ...config,
    output: {
      ...config.output,
      file: `dist/${distName}.min.cjs`
    },
    plugins: [
      ...config.plugins,
      terser({
        output: {
          preamble: config.output.banner
        }
      })
    ]
  }
];
