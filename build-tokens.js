import { readFileSync } from "fs";
import StyleDictionary from "style-dictionary";
import {
  registerTransforms,
  permutateThemes,
} from "@tokens-studio/sd-transforms";

registerTransforms(StyleDictionary, {
  expand: {
    composition: true,
    typography: false,
    border: false,
    shadow: false,
  },
  excludeParentKeys: false,
});

// StyleDictionary.registerTransform({
//   name: "size/rem",
//   type: "value",
//   transformer: function (prop) {
//     if (prop.unit === "px") {
//       return `${prop.value / 16}rem`;
//     } else {
//       return prop.original;
//     }
//   },
// });

StyleDictionary.registerTransform({
  type: `value`,
  name: `scale/unit`,
  transitive: true,
  matcher: (token) => {
    return (
      token.type === "fontSizes"
      // ||
      // token.type === "spacing" ||
      // token.type === "borderRadius" ||
      // token.type === "sizing"
    );
  },
  transformer: (token) => {
    if (isNaN(token.value)) {
      throwSizeError(token.name, token.value, "rem");
    }
    if (token.value === 0) {
      return "0";
    }
    return `${(token.value / 16).toFixed(3)}rem`;
  },
});

// format helpers from style-dictionary
const { fileHeader, formattedVariables } = StyleDictionary.formatHelpers;

const $themes = JSON.parse(readFileSync("./tokens/$themes.json", "utf-8"));
const themes = permutateThemes($themes, { seperator: "_" });
const configs = Object.entries(themes).map(([name, tokensets]) => ({
  source: tokensets.map((tokenset) => `./tokens/${tokenset}.json`),
  platforms: {
    css: {
      buildPath: "platform_tokens/css/",
      prefix: "oc_",
      // transformGroup: "tokens-studio",
      transforms: [
        "attribute/cti",
        "name/cti/kebab",
        "time/seconds",
        "content/icon",
        "color/css",
        "scale/unit",
        // "width/px", //
        "ts/descriptionToComment",
        "ts/size/px",
        // "size/rem",
        "ts/opacity",
        "ts/size/lineheight",
        "ts/typography/fontWeight",
        "ts/resolveMath",
        "ts/size/css/letterspacing",
        "ts/typography/css/fontFamily",
        "ts/typography/css/shorthand",
        "ts/border/css/shorthand",
        "ts/shadow/css/shorthand",
        "ts/color/css/hexrgba",
        "ts/color/modifiers",
      ],
      options: {
        outputReferences: true,
      },
      files: [
        {
          destination: `_variables-${name}.css`,
          format: "css/variables",
        },
      ],
    },
    js: {
      buildPath: "platform_tokens/js/",
      prefix: "oc_",
      transformGroup: "tokens-studio",
      files: [
        {
          destination: `variables-${name}.js`,
          format: "javascript/es6",
        },
      ],
    },
    Android: {
      buildPath: "platform_tokens/",
      prefix: "oc_",
      transformGroup: "android",
      files: [
        {
          destination: `android/resource-${name}.xml`,
          format: "android/resources",
        },
      ],
    },
    ios: {
      buildPath: "platform_tokens/",
      prefix: "oc-",
      transformGroup: "ios",
      files: [
        {
          destination: `ios/static-${name}.h`,
          format: "ios/static.h",
        },
        {
          destination: `ios/static-${name}.m`,
          format: "ios/static.m",
        },
        {
          destination: `ios/singleton-${name}.h`,
          format: "ios/singleton.h",
        },
        {
          destination: `ios/singleton-${name}.m`,
          format: "ios/singleton.m",
        },
        {
          destination: "ios/plist",
          format: "ios/plist",
        },
        {
          destination: "ios/macros",
          format: "ios/macros",
        },
        {
          destination: `ios/colors-${name}.h`,
          format: "ios/colors.h",
        },
        {
          destination: `ios/colors-${name}.m`,
          format: "ios/colors.m",
        },
        {
          destination: `ios/strings-${name}.h`,
          format: "ios/strings.h",
        },
        {
          destination: `ios/strings-${name}.m`,
          format: "ios/strings.m",
        },
      ],
    },
    "ios-swift": {
      buildPath: "platform_tokens/",
      prefix: "oc_",
      transformGroup: "ios-swift",
      files: [
        {
          destination: `ios-swift/class-${name}.swift`,
          format: "ios-swift/class.swift",
        },
        {
          destination: `ios-swift/enum-${name}.swift`,
          format: "ios-swift/enum.swift",
        },
        {
          destination: `ios-swift/any-${name}.swift`,
          format: "ios-swift/any.swift",
        },
      ],
    },
  },
}));

configs.forEach((cfg) => {
  const sd = StyleDictionary.extend(cfg);
  sd.cleanAllPlatforms(); // optionally, cleanup files first..
  sd.buildAllPlatforms();
});
