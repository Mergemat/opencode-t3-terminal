// @bun
// src/index.tsx
import { mergeProps as _$mergeProps2 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { effect as _$effect11 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { insert as _$insert10 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createTextNode as _$createTextNode5 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { insertNode as _$insertNode7 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createComponent as _$createComponent11 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { memo as _$memo10 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { setProp as _$setProp11 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { use as _$use6 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createElement as _$createElement11 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { Plugin } from "@opencode/plugin/tui";
import { Show as Show7, createSignal as createSignal14, onCleanup as onCleanup11, onMount as onMount5, untrack as untrack3 } from "opentui:runtime-module:solid-js";
import path9 from "path";

// src/sidebar.tsx
import { createTextNode as _$createTextNode2 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { insertNode as _$insertNode4 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { effect as _$effect6 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { insert as _$insert5 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createComponent as _$createComponent7 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { memo as _$memo6 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { setProp as _$setProp6 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createElement as _$createElement6 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { For, Show as Show3, createEffect as createEffect3, createMemo as createMemo2, createSignal as createSignal6, on, onCleanup as onCleanup3 } from "opentui:runtime-module:solid-js";
import path4 from "path";

// src/palette.ts
var fallback = {
  background: "#101219",
  raised: "#1e2330",
  text: "#e4f0fb",
  muted: "#8792ae",
  border: "#303747",
  success: "#5de4c7",
  info: "#add7ff",
  error: "#f087bd",
  warning: "#fffac2",
  accent: "#a0a7e6"
};
var theme;
function useTheme(context) {
  theme = context.theme;
}
var hex = (value, otherwise) => {
  if (typeof value === "string" && /^#[0-9a-f]{6}/i.test(value))
    return value.slice(0, 7);
  const ints = value?.toInts?.();
  if (!ints)
    return otherwise;
  return "#" + ints.slice(0, 3).map((part) => Math.max(0, Math.min(255, Math.round(part))).toString(16).padStart(2, "0")).join("");
};
var mix = (color, base, amount) => "#" + [1, 3, 5].map((start) => Math.round(parseInt(color.slice(start, start + 2), 16) * amount + parseInt(base.slice(start, start + 2), 16) * (1 - amount)).toString(16).padStart(2, "0")).join("");
var read = (path, otherwise) => {
  let value = theme;
  for (const key of path.split("."))
    value = value?.[key];
  return hex(value, otherwise);
};
var tokens = {
  get background() {
    return read("background.base", fallback.background);
  },
  get raised() {
    return read("background.raised.base", fallback.raised);
  },
  get text() {
    return read("text.base", fallback.text);
  },
  get muted() {
    return read("text.muted", fallback.muted);
  },
  get border() {
    return read("border.base", fallback.border);
  },
  get success() {
    return read("text.feedback.success.base", fallback.success);
  },
  get info() {
    return read("text.feedback.info.base", fallback.info);
  },
  get error() {
    return read("text.feedback.error.base", fallback.error);
  },
  get warning() {
    return read("text.feedback.warning.base", fallback.warning);
  },
  get accent() {
    return read("text.formfield.focused", fallback.accent);
  }
};
var colors = {
  get background() {
    return tokens.background;
  },
  get sidebar() {
    return tokens.background;
  },
  get surface() {
    return tokens.raised;
  },
  get hover() {
    return mix(tokens.raised, tokens.background, 0.55);
  },
  get composer() {
    return mix(tokens.raised, tokens.background, 0.6);
  },
  get composerBorder() {
    return mix(tokens.border, tokens.background, 0.7);
  },
  get border() {
    return mix(tokens.border, tokens.background, 0.8);
  },
  get snoozedBorder() {
    return mix(tokens.info, tokens.background, 0.25);
  },
  get text() {
    return tokens.text;
  },
  get secondary() {
    return mix(tokens.text, tokens.muted, 0.55);
  },
  get muted() {
    return tokens.muted;
  },
  get faint() {
    return mix(tokens.muted, tokens.background, 0.65);
  },
  get disabled() {
    return mix(tokens.muted, tokens.background, 0.45);
  },
  get mint() {
    return tokens.success;
  },
  get blue() {
    return tokens.info;
  },
  get indigo() {
    return tokens.accent;
  },
  get violet() {
    return mix(tokens.info, tokens.error, 0.5);
  },
  get pink() {
    return tokens.error;
  },
  get yellow() {
    return tokens.warning;
  }
};
var projectColors = ["#8792ae", "#f07a8f", "#f2a97f", "#e8c27a", "#fffac2", "#c4e6b4", "#9fe0a0", "#5de4c7", "#6fd3c2", "#89ddff", "#a6d8ee", "#add7ff", "#a0a7e6", "#bfa3e5", "#d2a6ff", "#e59cf0", "#f087bd", "#d0679d"];

// src/controls.tsx
import { createComponent as _$createComponent3 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { effect as _$effect3 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { insert as _$insert2 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { memo as _$memo3 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { setProp as _$setProp3 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { use as _$use2 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createElement as _$createElement3 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createSignal as createSignal2 } from "opentui:runtime-module:solid-js";
import { useRenderer as useRenderer2 } from "opentui:runtime-module:%40opentui%2Fsolid";

// src/single-line.tsx
import { effect as _$effect } from "opentui:runtime-module:%40opentui%2Fsolid";
import { insertNode as _$insertNode } from "opentui:runtime-module:%40opentui%2Fsolid";
import { insert as _$insert } from "opentui:runtime-module:%40opentui%2Fsolid";
import { memo as _$memo } from "opentui:runtime-module:%40opentui%2Fsolid";
import { setProp as _$setProp } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createElement as _$createElement } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createSignal } from "opentui:runtime-module:solid-js";
var graphemes = new Intl.Segmenter(undefined, {
  granularity: "grapheme"
});
function fitLabel(text, width) {
  if (width <= 0 || Bun.stringWidth(text) <= width)
    return text;
  let result = "";
  let used = 0;
  for (const {
    segment
  } of graphemes.segment(text)) {
    const cells = Bun.stringWidth(segment);
    if (used + cells > width - 1)
      break;
    result += segment;
    used += cells;
  }
  return result + "\u2026";
}
function fitTail(text, width) {
  if (width <= 0 || Bun.stringWidth(text) <= width)
    return text;
  const parts = [...graphemes.segment(text)].map((part) => part.segment);
  let result = "";
  let used = 0;
  for (let index = parts.length - 1;index >= 0; index--) {
    const cells = Bun.stringWidth(parts[index]);
    if (used + cells > width - 1)
      break;
    result = parts[index] + result;
    used += cells;
  }
  return "\u2026" + result;
}
function SingleLine(props) {
  const fit = (text, width2) => props.tail ? fitTail(text, width2) : fitLabel(text, width2);
  const [width, setWidth] = createSignal(0);
  return (() => {
    var _el$ = _$createElement("box"), _el$2 = _$createElement("box"), _el$3 = _$createElement("text");
    _$insertNode(_el$, _el$2);
    _$setProp(_el$, "height", 1);
    _$setProp(_el$, "flexShrink", 1);
    _$setProp(_el$, "minWidth", 0);
    _$setProp(_el$, "onSizeChange", function() {
      setWidth(this.width);
    });
    _$insertNode(_el$2, _el$3);
    _$setProp(_el$2, "height", 1);
    _$setProp(_el$2, "width", "100%");
    _$setProp(_el$2, "flexDirection", "row");
    _$setProp(_el$3, "selectable", false);
    _$setProp(_el$3, "height", 1);
    _$setProp(_el$3, "wrapMode", "none");
    _$insert(_el$3, (() => {
      var _c$ = _$memo(() => !!props.bold);
      return () => _c$() ? (() => {
        var _el$4 = _$createElement("b");
        _$insert(_el$4, () => fit(props.text, width()));
        return _el$4;
      })() : fit(props.text, width());
    })());
    _$effect((_p$) => {
      var { width: _v$, flexGrow: _v$2 } = props, _v$3 = props.align === "right" ? "flex-end" : "flex-start", _v$4 = props.color;
      _v$ !== _p$.e && (_p$.e = _$setProp(_el$, "width", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = _$setProp(_el$, "flexGrow", _v$2, _p$.t));
      _v$3 !== _p$.a && (_p$.a = _$setProp(_el$2, "justifyContent", _v$3, _p$.a));
      _v$4 !== _p$.o && (_p$.o = _$setProp(_el$3, "fg", _v$4, _p$.o));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined,
      o: undefined
    });
    return _el$;
  })();
}

// src/terminal-icon.tsx
import { createComponent as _$createComponent } from "opentui:runtime-module:%40opentui%2Fsolid";
import { memo as _$memo2 } from "opentui:runtime-module:%40opentui%2Fsolid";

// src/terminal-image.tsx
import { effect as _$effect2 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { use as _$use } from "opentui:runtime-module:%40opentui%2Fsolid";
import { setProp as _$setProp2 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createElement as _$createElement2 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createEffect, onCleanup } from "opentui:runtime-module:solid-js";
import { useRenderer } from "opentui:runtime-module:%40opentui%2Fsolid";
import { NativeImage, resolveRenderLib } from "opentui:runtime-module:%40opentui%2Fcore";
import { deflateSync } from "zlib";
var sources = new Map;
var pixels = new Map;
var nextImage = 400000;
var repaintEveryFrame = Object.keys(process.env).some((name) => name.startsWith("CMUX_"));
var command = (header, data = "") => `\x1B_G${header}${data ? ";" + data : ""}\x1B\\`;
var DEFAULT_ICON_SCALE = 0.62;
function iconBox(width, height, rows, scale, grid, align = "center") {
  const row = height / rows;
  const target = Math.min(row * scale, width * 0.9);
  const size = grid ? grid * Math.max(1, Math.round(target / grid)) : Math.max(1, Math.round(target));
  const center = height / 2 - row * 0.06;
  const badge = Math.min(row * 0.84, width * 0.9);
  const inset = Math.floor((width - badge) / 2);
  const left = align === "start" ? inset : align === "end" ? width - size - Math.round(row * 0.18) : Math.floor((width - size) / 2);
  return {
    size,
    left: Math.max(0, left),
    top: Math.max(0, Math.min(height - size, Math.round(center - size / 2)))
  };
}
function imageData(name, color, scale, width, height, rows, align) {
  const key = `${name}:${color}:${scale}:${width}:${height}:${rows}:${align}`;
  const cached = pixels.get(key);
  if (cached)
    return cached;
  const source = sources.get(name);
  if (!source)
    return;
  const grid = source.width <= 16 ? source.width : undefined;
  const {
    size,
    left,
    top
  } = iconBox(width, height, rows, scale, grid, align);
  const resized = source.resize({
    width: size,
    height: size,
    kernel: grid ? "nearest" : "default"
  });
  const raw = resized.raw();
  const data = new Uint8Array(width * height * 4);
  const rgb = color ? [1, 3, 5].map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16)) : [255, 255, 255];
  for (let y = 0;y < size; y++)
    for (let x = 0;x < size; x++) {
      const target = ((top + y) * width + left + x) * 4;
      const origin = y * raw.stride + x * 4;
      data[target] = Math.round(rgb[0] * raw.data[origin] / 255);
      data[target + 1] = Math.round(rgb[1] * raw.data[origin + 1] / 255);
      data[target + 2] = Math.round(rgb[2] * raw.data[origin + 2] / 255);
      data[target + 3] = raw.data[y * raw.stride + x * 4 + 3];
    }
  resized.dispose();
  const encoded = deflateSync(data).toString("base64");
  if (pixels.size >= 128)
    pixels.delete(pixels.keys().next().value);
  pixels.set(key, encoded);
  return encoded;
}
var layers = new WeakMap;
function createLayer(renderer) {
  const entries = new Set;
  const invalidate = () => {
    for (const entry of entries)
      entry.key = undefined;
  };
  const flush = () => {
    if (!renderer.capabilities?.kitty_graphics || !renderer.resolution)
      return;
    let output = "";
    for (const entry of entries) {
      const node = entry.node;
      const visible = entry.drawn && !node.isDestroyed && node.height > 0 && node.width > 0 && node.x >= 0 && node.y >= 0 && node.x + node.width <= renderer.width && node.y + node.height <= renderer.height && renderer.hitTest(node.x + Math.floor(node.width / 2), node.y) === node.num;
      entry.drawn = false;
      if (!visible) {
        if (entry.placed)
          output += command(`a=d,d=I,i=${entry.id},q=2`);
        entry.placed = false;
        entry.key = undefined;
        continue;
      }
      const key = `${node.x},${node.y},${node.width},${node.height},${entry.name()},${entry.color()},${entry.scale()},${entry.align()}`;
      if (entry.placed && entry.key === key && !repaintEveryFrame)
        continue;
      const width = Math.max(1, Math.round(node.width * renderer.resolution.width / renderer.terminalWidth));
      const height = Math.max(1, Math.round(node.height * renderer.resolution.height / renderer.terminalHeight));
      const encoded = imageData(entry.name(), entry.color(), entry.scale(), width, height, node.height, entry.align());
      if (!encoded)
        continue;
      if (entry.placed)
        output += command(`a=d,d=I,i=${entry.id},q=2`);
      entry.id = nextImage++;
      output += `\x1B[${node.y + 1};${node.x + 1}H`;
      for (let offset = 0;offset < encoded.length; offset += 4096) {
        const more = offset + 4096 < encoded.length ? 1 : 0;
        output += command(offset === 0 ? `a=T,f=32,o=z,t=d,q=2,i=${entry.id},p=1,s=${width},v=${height},c=${node.width},r=${node.height},z=1,C=1,m=${more}` : `m=${more}`, encoded.slice(offset, offset + 4096));
      }
      entry.placed = true;
      entry.key = key;
    }
    if (output)
      resolveRenderLib().writeOut(renderer.rendererPtr, "\x1B7" + output + "\x1B8");
  };
  renderer.on("frame", flush);
  renderer.on("resize", invalidate);
  return {
    add(entry) {
      entries.add(entry);
    },
    remove(entry) {
      entries.delete(entry);
      if (entry.placed && !renderer.isDestroyed)
        resolveRenderLib().writeOut(renderer.rendererPtr, command(`a=d,d=I,i=${entry.id},q=2`));
      if (!entries.size) {
        renderer.off("frame", flush);
        renderer.off("resize", invalidate);
        layers.delete(renderer);
      }
    }
  };
}
function TerminalImage(props) {
  const renderer = useRenderer();
  let entry;
  const layer = layers.get(renderer) ?? createLayer(renderer);
  layers.set(renderer, layer);
  createEffect(() => {
    const name = props.name;
    if (!sources.has(name))
      NativeImage.load(props.source).then((source) => {
        if (sources.has(name))
          source.dispose();
        else
          sources.set(name, source);
        renderer.requestRender();
      });
  });
  onCleanup(() => {
    if (entry)
      layer.remove(entry);
  });
  return (() => {
    var _el$ = _$createElement2("box");
    _$use((node) => {
      entry = {
        node,
        name: () => props.name,
        color: () => props.color,
        scale: () => props.scale ?? DEFAULT_ICON_SCALE,
        align: () => props.align ?? (props.width >= 3 ? "center" : "start"),
        drawn: false,
        placed: false,
        id: 0
      };
      node.t3Image = {
        name: () => props.name,
        color: () => props.color,
        source: () => props.source,
        scale: () => props.scale ?? DEFAULT_ICON_SCALE,
        align: () => props.align ?? (props.width >= 3 ? "center" : "start")
      };
      layer.add(entry);
      node.renderAfter = () => {
        if (entry)
          entry.drawn = true;
      };
    }, _el$);
    _$setProp2(_el$, "flexShrink", 0);
    _$effect2((_p$) => {
      var _v$ = props.width, _v$2 = props.height ?? 1;
      _v$ !== _p$.e && (_p$.e = _$setProp2(_el$, "width", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = _$setProp2(_el$, "height", _v$2, _p$.t));
      return _p$;
    }, {
      e: undefined,
      t: undefined
    });
    return _el$;
  })();
}

// src/terminal-icon.tsx
function TerminalIcon(props) {
  return _$createComponent(TerminalImage, {
    get name() {
      return props.name;
    },
    get source() {
      return new URL(`../assets/icons/${props.name}.png`, import.meta.url);
    },
    get color() {
      return props.color;
    },
    get width() {
      return props.width ?? 3;
    },
    get align() {
      return props.align;
    }
  });
}

// src/project-mark.tsx
import { createComponent as _$createComponent2 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createMemo } from "opentui:runtime-module:solid-js";
import { existsSync } from "fs";
import { Resvg } from "@resvg/resvg-js";

// src/project-badge.ts
function projectBadge(name, dim = false) {
  const normalized = name.normalize("NFKC").trim();
  const words = normalized.match(/[\p{L}\p{N}]+/gu) ?? [];
  const letters = Array.from(words[0] ?? "PR");
  const first = letters[0];
  const second = letters.slice(1).find((letter) => /\p{N}/u.test(letter)) ?? (words.length > 1 ? Array.from(words.at(-1))[0] : letters.at(-1)) ?? first;
  const label = Array.from(`${first}${second}`.toUpperCase()).slice(0, 2).join("");
  let index = 0;
  for (const letter of normalized.toLocaleLowerCase("en-US") || "project")
    index = (index * 31 + letter.codePointAt(0)) % projectColors.length;
  const tone = projectColors[index];
  const color = dim ? mix(colors.muted, colors.sidebar, 0.7) : tone;
  return {
    label,
    color,
    background: mix(dim ? colors.muted : tone, colors.sidebar, dim ? 0.1 : 0.14)
  };
}

// src/project-mark.tsx
var escapeXml = (text) => text.replace(/[&<>"']/g, (value) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;"
})[value]);
var fontFiles = ["/System/Library/Fonts/Supplemental/Arial Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", "/usr/share/fonts/liberation/LiberationSans-Bold.ttf"].filter((file) => existsSync(file));
var rendered = new Map;
function markPng(name, dim, key) {
  const cached = rendered.get(key);
  if (cached)
    return cached;
  const badge = projectBadge(name, dim);
  const png = new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <rect width="32" height="32" fill="${badge.background}"/>
    <text x="16" y="21" text-anchor="middle" font-family="Arial, DejaVu Sans, Liberation Sans, sans-serif" font-size="14" font-weight="700" fill="${badge.color}">${escapeXml(badge.label)}</text>
  </svg>`, {
    font: {
      loadSystemFonts: !fontFiles.length,
      fontFiles
    }
  }).render().asPng();
  rendered.set(key, png);
  return png;
}
function ProjectMark(props) {
  const key = createMemo(() => `project:${colors.sidebar}:${colors.muted}:${props.dim ? "dim:" : ""}${props.name}`);
  const source = createMemo(() => markPng(props.name, !!props.dim, key()));
  return _$createComponent2(TerminalImage, {
    get name() {
      return key();
    },
    get source() {
      return source();
    },
    width: 2,
    get height() {
      return props.height;
    },
    scale: 0.84
  });
}

// src/controls.tsx
var containsPointer = (node, event) => !!node && event.x >= node.x && event.x < node.x + node.width && event.y >= node.y && event.y < node.y + node.height;
function ownsPointer(node, event, renderer) {
  if (!containsPointer(node, event))
    return false;
  const hit = renderer.hitTest(event.x, event.y);
  const owns = (child) => child.num === hit || child.getChildren().some(owns);
  return owns(node);
}
function Button(props) {
  const renderer = useRenderer2();
  let node;
  let pressed = false;
  const [hovered, setHovered] = createSignal2(false);
  const color = () => props.disabled ? colors.disabled : hovered() ? colors.text : props.color ?? colors.muted;
  return (() => {
    var _el$ = _$createElement3("box");
    _$use2((value) => {
      node = value;
    }, _el$);
    _$setProp3(_el$, "height", 1);
    _$setProp3(_el$, "flexDirection", "row");
    _$setProp3(_el$, "flexShrink", 0);
    _$setProp3(_el$, "onMouseOver", () => setHovered(true));
    _$setProp3(_el$, "onMouseOut", (event) => {
      if (!ownsPointer(node, event, renderer)) {
        setHovered(false);
        pressed = false;
      }
    });
    _$setProp3(_el$, "onMouseDown", (event) => {
      event.stopPropagation();
      event.preventDefault();
      pressed = event.button === 0 && !props.disabled;
    });
    _$setProp3(_el$, "onMouseUp", (event) => {
      event.stopPropagation();
      const activate = pressed && event.button === 0 && !event.isDragging && containsPointer(node, event);
      pressed = false;
      if (activate)
        props.run(event);
    });
    _$insert2(_el$, (() => {
      var _c$ = _$memo3(() => !!props.mark);
      return () => _c$() && (() => {
        var _el$2 = _$createElement3("box");
        _$setProp3(_el$2, "width", 3);
        _$setProp3(_el$2, "height", 1);
        _$setProp3(_el$2, "flexShrink", 0);
        _$setProp3(_el$2, "paddingLeft", 1);
        _$insert2(_el$2, _$createComponent3(ProjectMark, {
          get name() {
            return props.mark;
          }
        }));
        return _el$2;
      })();
    })(), null);
    _$insert2(_el$, (() => {
      var _c$2 = _$memo3(() => !!props.icon);
      return () => _c$2() && _$createComponent3(TerminalIcon, {
        get name() {
          return props.icon;
        },
        get color() {
          return color();
        },
        get width() {
          return _$memo3(() => !!props.label)() ? props.iconWidth ?? 3 : _$memo3(() => typeof props.width === "number")() ? props.width : 3;
        },
        get align() {
          return props.label && props.iconGap === 0 ? "end" : undefined;
        }
      });
    })(), null);
    _$insert2(_el$, (() => {
      var _c$3 = _$memo3(() => !!props.label);
      return () => _c$3() && _$createComponent3(SingleLine, {
        get text() {
          return props.label;
        },
        get color() {
          return color();
        },
        get width() {
          return _$memo3(() => !!props.separator)() ? Bun.stringWidth(props.label) : undefined;
        },
        get flexGrow() {
          return props.separator ? 0 : 1;
        }
      });
    })(), null);
    _$insert2(_el$, (() => {
      var _c$4 = _$memo3(() => !!props.separator);
      return () => _c$4() && (() => {
        var _el$3 = _$createElement3("box");
        _$setProp3(_el$3, "flexGrow", 1);
        _$setProp3(_el$3, "minWidth", 1);
        _$setProp3(_el$3, "border", ["bottom"]);
        _$setProp3(_el$3, "height", 1);
        _$effect3((_$p) => _$setProp3(_el$3, "borderColor", props.separator, _$p));
        return _el$3;
      })();
    })(), null);
    _$insert2(_el$, (() => {
      var _c$5 = _$memo3(() => !!props.trailing);
      return () => _c$5() && _$createComponent3(TerminalIcon, {
        get name() {
          return props.trailing;
        },
        get color() {
          return color();
        },
        width: 2
      });
    })(), null);
    _$effect3((_p$) => {
      var _v$ = props.id, _v$2 = props.width ?? Bun.stringWidth(props.label) + (props.icon ? (props.iconWidth ?? 3) + (props.label ? props.iconGap ?? 1 : 0) : props.compact ? 0 : 2) + (props.trailing ? 3 : 0), _v$3 = props.icon && props.label ? props.iconGap ?? 1 : props.trailing ? 1 : 0, _v$4 = props.compact || props.icon ? 0 : 1, _v$5 = props.compact || props.icon ? 0 : 1, _v$6 = hovered() && !props.disabled ? colors.surface : props.background;
      _v$ !== _p$.e && (_p$.e = _$setProp3(_el$, "id", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = _$setProp3(_el$, "width", _v$2, _p$.t));
      _v$3 !== _p$.a && (_p$.a = _$setProp3(_el$, "gap", _v$3, _p$.a));
      _v$4 !== _p$.o && (_p$.o = _$setProp3(_el$, "paddingLeft", _v$4, _p$.o));
      _v$5 !== _p$.i && (_p$.i = _$setProp3(_el$, "paddingRight", _v$5, _p$.i));
      _v$6 !== _p$.n && (_p$.n = _$setProp3(_el$, "backgroundColor", _v$6, _p$.n));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined,
      o: undefined,
      i: undefined,
      n: undefined
    });
    return _el$;
  })();
}

// src/thread-card.tsx
import { createTextNode as _$createTextNode } from "opentui:runtime-module:%40opentui%2Fsolid";
import { insertNode as _$insertNode2 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { effect as _$effect4 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { insert as _$insert3 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createComponent as _$createComponent5 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { setProp as _$setProp4 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { spread as _$spread } from "opentui:runtime-module:%40opentui%2Fsolid";
import { mergeProps as _$mergeProps } from "opentui:runtime-module:%40opentui%2Fsolid";
import { memo as _$memo4 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createElement as _$createElement4 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { Show, createSignal as createSignal4 } from "opentui:runtime-module:solid-js";
import path2 from "path";

// src/provider-mark.ts
function providerIcon(provider) {
  switch (provider?.toLowerCase()) {
    case "opencode":
      return "opencode";
    case "openai":
      return "openai";
    case "anthropic":
      return "anthropic";
    case "google":
      return "google";
  }
}

// src/working-status.tsx
import { createEffect as createEffect2, createSignal as createSignal3, onCleanup as onCleanup2 } from "opentui:runtime-module:solid-js";
function createWorkingState(context) {
  const [state, update] = context.storage.memory("working", {
    initial: {
      started: {}
    }
  });
  const stops = [context.data.on("session.execution.started", (event) => update((draft) => {
    draft.started[event.data.sessionID] = event.created;
  })), ...["session.execution.succeeded", "session.execution.failed", "session.execution.interrupted", "session.deleted"].map((type) => context.data.on(type, (event) => update((draft) => {
    delete draft.started[event.data.sessionID];
  })))];
  onCleanup2(() => stops.forEach((stop) => stop()));
  const startedAt = (sessionID) => {
    if (state.started[sessionID] !== undefined)
      return state.started[sessionID];
    return context.data.session.message.list(sessionID).findLast((message) => message.type === "user")?.time.created;
  };
  return {
    startedAt
  };
}
function workingLabel(startedAt, now) {
  if (startedAt === undefined)
    return "Working";
  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  const minutes = Math.floor(seconds / 60);
  const duration = seconds < 60 ? `${seconds}s` : minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `Working ${duration}`;
}
function createWorkingClock(working) {
  const [now, setNow] = createSignal3(Date.now());
  createEffect2(() => {
    if (!working())
      return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    onCleanup2(() => clearInterval(timer));
  });
  return now;
}

// src/thread-lifecycle.ts
function orderActive(sessions, pinned, anchors) {
  return [...sessions].sort((a, b) => Number(!!pinned[b.id]) - Number(!!pinned[a.id]) || Math.max(b.time.created, anchors[b.id] ?? 0) - Math.max(a.time.created, anchors[a.id] ?? 0) || a.id.localeCompare(b.id));
}
function nextAfterPark(sessions, id) {
  const index = sessions.findIndex((session) => session.id === id);
  if (index < 0)
    return;
  return [...sessions.slice(index + 1), ...sessions.slice(0, index)].find((session) => session.id !== id)?.id;
}
function snoozePresets(now) {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  const evening = new Date(now);
  evening.setHours(18, 0, 0, 0);
  const monday = new Date(now);
  monday.setDate(monday.getDate() + ((8 - now.getDay()) % 7 || 7));
  monday.setHours(9, 0, 0, 0);
  return [{
    title: "In 1 hour",
    time: now.getTime() + 3600000
  }, {
    title: "In 3 hours",
    time: now.getTime() + 10800000
  }, ...evening.getTime() - now.getTime() > 3600000 ? [{
    title: "This evening",
    time: evening.getTime()
  }] : [], {
    title: "Tomorrow",
    time: tomorrow.getTime()
  }, ...monday.getTime() !== tomorrow.getTime() ? [{
    title: "Next week",
    time: monday.getTime()
  }] : []];
}
function parseWakeTime(input, now) {
  const duration = /^\s*(\d+(?:\.\d+)?)\s*(m|h|d)\s*$/i.exec(input);
  const time = duration ? now + Number(duration[1]) * {
    m: 60000,
    h: 3600000,
    d: 86400000
  }[duration[2].toLowerCase()] : Date.parse(input);
  return Number.isFinite(time) && time > now ? time : undefined;
}
function wakeLabel(until, now) {
  const minutes = Math.max(1, Math.ceil((until - now) / 60000));
  return minutes < 60 ? `${minutes}m` : minutes < 1440 ? `${Math.ceil(minutes / 60)}h` : `${Math.ceil(minutes / 1440)}d`;
}
var timeOfDay = (date) => date.toLocaleTimeString(undefined, {
  hour: "2-digit",
  minute: "2-digit"
});
function wakeDescription(until, now) {
  const wake = new Date(until);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const days = Math.floor((wake.getTime() - today.getTime()) / 86400000);
  if (days === 0)
    return timeOfDay(wake);
  if (days === 1)
    return `tomorrow ${timeOfDay(wake)}`;
  if (days < 7)
    return `${wake.toLocaleDateString(undefined, {
      weekday: "short"
    })} ${timeOfDay(wake)}`;
  return `${wake.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  })}, ${timeOfDay(wake)}`;
}

// src/thread-status.ts
function statusBadge(status) {
  switch (status) {
    case "Approval":
      return {
        icon: "shield-question",
        color: colors.yellow
      };
    case "Input":
      return {
        icon: "message-circle-question",
        color: colors.indigo
      };
    case "Working":
      return {
        icon: "circle-dashed",
        color: colors.blue
      };
    case "Failed":
      return {
        icon: "circle-alert",
        color: colors.pink
      };
    case "Woke":
      return {
        icon: "alarm-clock",
        color: colors.yellow
      };
    case "Done":
      return {
        icon: "circle-check",
        color: colors.mint
      };
  }
}
function shouldRecede(status, active) {
  return !active && (status === "Working" || status === "Approval" || status === "Idle");
}
function needsAttention(status) {
  return status === "Input" || status === "Woke" || status === "Done";
}
function age(timestamp, now) {
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60000));
  return minutes < 1 ? "now" : minutes < 60 ? `${minutes}m` : minutes < 1440 ? `${Math.floor(minutes / 60)}h` : `${Math.floor(minutes / 1440)}d`;
}

// src/request-badge.tsx
import { createComponent as _$createComponent4 } from "opentui:runtime-module:%40opentui%2Fsolid";
var presentation = {
  open: {
    icon: "git-pull-request",
    color: colors.mint
  },
  draft: {
    icon: "git-pull-request-draft",
    color: colors.muted
  },
  closed: {
    icon: "git-pull-request-closed",
    color: colors.pink
  },
  merged: {
    icon: "git-merge",
    color: colors.violet
  }
};
function requestPresentation(request) {
  return presentation[request.state === "open" && request.draft ? "draft" : request.state];
}
function RequestBadge(props) {
  const style = () => requestPresentation(props.request);
  return _$createComponent4(Button, {
    get id() {
      return props.id;
    },
    compact: true,
    get label() {
      return `#${props.request.number}`;
    },
    get icon() {
      return style().icon;
    },
    iconWidth: 2,
    iconGap: 0,
    get color() {
      return style().color;
    },
    run: () => props.run()
  });
}

// src/thread-menu.ts
import path from "path";
async function threadMenu(workspace, session) {
  const id = session.id;
  const snoozed = !!workspace.threads.state.snoozed[id];
  const settled = !!workspace.preferences.settled[id];
  const project = path.basename(session.location.directory);
  const scoped = workspace.scope() === session.location.directory;
  const choice = await workspace.context.ui.dialog.select({
    title: session.title || "New thread",
    options: [{
      title: workspace.threads.state.pinned[id] ? "Unpin thread" : "Pin thread",
      value: "pin"
    }, {
      title: "Rename thread",
      value: "rename"
    }, ...snoozed ? [{
      title: "Wake thread",
      value: "wake"
    }] : [{
      title: "Snooze\u2026",
      value: "snooze"
    }], {
      title: settled ? "Un-settle thread" : "Settle thread",
      value: "settle"
    }, ...!workspace.unread(id) ? [{
      title: "Mark unread",
      value: "unread"
    }] : [], {
      title: scoped ? "Show all projects" : `Filter by ${project}`,
      value: "scope"
    }, {
      title: "Pull / merge requests",
      value: "prs"
    }, {
      title: "Delete thread",
      value: "delete"
    }]
  });
  if (choice === "pin")
    await workspace.togglePin(id);
  if (choice === "rename")
    await workspace.rename(id);
  if (choice === "wake")
    await workspace.wake(id);
  if (choice === "snooze")
    await workspace.snooze(id);
  if (choice === "settle")
    await workspace.toggleSettle(id);
  if (choice === "unread")
    await workspace.markUnread(id);
  if (choice === "scope")
    workspace.toggleScope(session.location.directory);
  if (choice === "prs")
    await workspace.sourceControl.browse(session.location.directory, id);
  if (choice === "delete")
    await workspace.remove(id);
}

// src/thread-card.tsx
function usePointer(workspace, session) {
  let card;
  let pressed = false;
  const [hovered, setHovered] = createSignal4(false);
  return {
    hovered,
    props: {
      ref: (node) => {
        card = node;
      },
      onMouseOver: () => setHovered(true),
      onMouseMove: () => setHovered(true),
      onMouseOut: (event) => {
        if (!ownsPointer(card, event, workspace.context.renderer)) {
          setHovered(false);
          pressed = false;
        }
      },
      onMouseDown: (event) => {
        event.preventDefault();
        pressed = event.button === 0 || event.button === 2;
      },
      onMouseUp: (event) => {
        const activate = pressed && !event.isDragging && containsPointer(card, event);
        pressed = false;
        if (!activate)
          return;
        if (event.button === 2) {
          event.stopPropagation();
          threadMenu(workspace, session());
        } else if (event.button === 0)
          workspace.open(session().id);
      }
    }
  };
}
function ThreadCard(props) {
  const workspace = props.workspace;
  const pointer = usePointer(workspace, () => props.session);
  const active = () => workspace.active() === props.session.id;
  const status = () => workspace.status(props.session.id);
  const badge = () => statusBadge(status());
  const workingNow = createWorkingClock(() => status() === "Working");
  const name = () => path2.basename(props.session.location.directory);
  const pinned = () => !!workspace.threads.state.pinned[props.session.id];
  const recede = () => shouldRecede(status(), active());
  const request = () => workspace.sourceControl.get(props.session);
  const diff = () => workspace.diffStat(props.session);
  const branch = () => workspace.branch(props.session);
  const queued = () => workspace.context.data.session.pending.list(props.session.id).length > 0;
  const canSnooze = () => !["Approval", "Input"].includes(status()) && !queued();
  const canSettle = () => !["Working", "Approval", "Input"].includes(status()) && !queued();
  const hasActions = () => canSnooze() || canSettle();
  const showActions = () => pointer.hovered() && hasActions();
  const label = () => status() === "Working" ? workingLabel(workspace.working.startedAt(props.session.id), workingNow()) : badge() ? status() : age(workspace.activityAt(props.session), props.now);
  const actionsWidth = () => (canSnooze() ? 3 : 0) + (canSettle() ? 8 : 0);
  const titleColor = () => active() || needsAttention(status()) ? colors.text : recede() ? colors.muted : colors.secondary;
  return (() => {
    var _el$ = _$createElement4("box"), _el$2 = _$createElement4("box"), _el$4 = _$createElement4("box"), _el$5 = _$createElement4("box"), _el$6 = _$createElement4("box");
    _$insertNode2(_el$, _el$2);
    _$insertNode2(_el$, _el$4);
    _$insertNode2(_el$, _el$5);
    _$spread(_el$, _$mergeProps({
      get id() {
        return `t3-thread-${props.session.id}`;
      }
    }, () => pointer.props, {
      height: 5,
      flexShrink: 0,
      paddingLeft: 1,
      paddingRight: 1,
      paddingTop: 1,
      paddingBottom: 1,
      get backgroundColor() {
        return _$memo4(() => !!active())() ? colors.surface : _$memo4(() => !!pointer.hovered())() ? colors.hover : undefined;
      }
    }), true);
    _$setProp4(_el$2, "flexDirection", "row");
    _$setProp4(_el$2, "gap", 1);
    _$setProp4(_el$2, "height", 1);
    _$insert3(_el$2, _$createComponent5(ProjectMark, {
      get name() {
        return name();
      }
    }), null);
    _$insert3(_el$2, _$createComponent5(SingleLine, {
      get text() {
        return name();
      },
      get color() {
        return _$memo4(() => !!recede())() ? colors.faint : colors.muted;
      },
      flexGrow: 1
    }), null);
    _$insert3(_el$2, _$createComponent5(Show, {
      get when() {
        return pinned();
      },
      get children() {
        return _$createComponent5(Button, {
          get id() {
            return `t3-unpin-${props.session.id}`;
          },
          label: "",
          icon: "pin",
          width: 2,
          get color() {
            return colors.faint;
          },
          run: () => void workspace.togglePin(props.session.id)
        });
      }
    }), null);
    _$insert3(_el$2, _$createComponent5(Show, {
      get when() {
        return showActions();
      },
      get fallback() {
        return (() => {
          var _el$7 = _$createElement4("box");
          _$setProp4(_el$7, "height", 1);
          _$setProp4(_el$7, "flexShrink", 0);
          _$setProp4(_el$7, "flexDirection", "row");
          _$setProp4(_el$7, "gap", 1);
          _$insert3(_el$7, _$createComponent5(Show, {
            get when() {
              return badge();
            },
            children: (value) => status() === "Woke" ? _$createComponent5(Button, {
              get id() {
                return `t3-woke-${props.session.id}`;
              },
              compact: true,
              label: "Woke",
              icon: "alarm-clock",
              iconWidth: 2,
              iconGap: 0,
              get color() {
                return value().color;
              },
              run: () => void workspace.threads.acknowledge(props.session.id)
            }) : (() => {
              var _el$9 = _$createElement4("box"), _el$0 = _$createElement4("text");
              _$insertNode2(_el$9, _el$0);
              _$setProp4(_el$9, "flexDirection", "row");
              _$setProp4(_el$9, "height", 1);
              _$setProp4(_el$9, "flexShrink", 0);
              _$insert3(_el$9, _$createComponent5(TerminalIcon, {
                get name() {
                  return value().icon;
                },
                get color() {
                  return value().color;
                },
                width: 2,
                align: "end"
              }), _el$0);
              _$setProp4(_el$0, "selectable", false);
              _$insert3(_el$0, label);
              _$effect4((_$p) => _$setProp4(_el$0, "fg", value().color, _$p));
              return _el$9;
            })()
          }), null);
          _$insert3(_el$7, _$createComponent5(Show, {
            get when() {
              return !badge();
            },
            get children() {
              var _el$8 = _$createElement4("text");
              _$setProp4(_el$8, "selectable", false);
              _$insert3(_el$8, label);
              _$effect4((_$p) => _$setProp4(_el$8, "fg", colors.muted, _$p));
              return _el$8;
            }
          }), null);
          return _el$7;
        })();
      },
      get children() {
        var _el$3 = _$createElement4("box");
        _$setProp4(_el$3, "height", 1);
        _$setProp4(_el$3, "flexShrink", 0);
        _$setProp4(_el$3, "flexDirection", "row");
        _$setProp4(_el$3, "gap", 1);
        _$insert3(_el$3, _$createComponent5(Show, {
          get when() {
            return canSnooze();
          },
          get children() {
            return _$createComponent5(Button, {
              get id() {
                return `t3-snooze-${props.session.id}`;
              },
              label: "",
              icon: "clock",
              width: 2,
              compact: true,
              run: () => void workspace.snooze(props.session.id)
            });
          }
        }), null);
        _$insert3(_el$3, _$createComponent5(Show, {
          get when() {
            return canSettle();
          },
          get children() {
            return _$createComponent5(Button, {
              get id() {
                return `t3-settle-${props.session.id}`;
              },
              label: "Settle",
              icon: "check",
              iconWidth: 2,
              iconGap: 0,
              width: 8,
              compact: true,
              run: () => void workspace.toggleSettle(props.session.id)
            });
          }
        }), null);
        _$effect4((_$p) => _$setProp4(_el$3, "width", actionsWidth(), _$p));
        return _el$3;
      }
    }), null);
    _$setProp4(_el$4, "height", 1);
    _$insert3(_el$4, _$createComponent5(SingleLine, {
      get text() {
        return props.session.title || "New thread";
      },
      get color() {
        return titleColor();
      },
      get bold() {
        return _$memo4(() => !!needsAttention(status()))() && !active();
      },
      width: "100%"
    }));
    _$insertNode2(_el$5, _el$6);
    _$setProp4(_el$5, "height", 1);
    _$setProp4(_el$5, "flexDirection", "row");
    _$setProp4(_el$5, "gap", 1);
    _$setProp4(_el$6, "flexDirection", "row");
    _$setProp4(_el$6, "flexGrow", 1);
    _$setProp4(_el$6, "minWidth", 0);
    _$setProp4(_el$6, "gap", 1);
    _$insert3(_el$6, _$createComponent5(Show, {
      get when() {
        return branch();
      },
      get children() {
        return [_$createComponent5(TerminalIcon, {
          name: "git-branch",
          get color() {
            return colors.faint;
          },
          width: 2
        }), _$createComponent5(SingleLine, {
          get text() {
            return branch();
          },
          get color() {
            return colors.faint;
          },
          flexGrow: 1
        })];
      }
    }));
    _$insert3(_el$5, _$createComponent5(Show, {
      get when() {
        return request();
      },
      children: (value) => _$createComponent5(RequestBadge, {
        get request() {
          return value();
        },
        run: () => workspace.sourceControl.openRequest(props.session)
      })
    }), null);
    _$insert3(_el$5, _$createComponent5(Show, {
      get when() {
        return diff();
      },
      children: (value) => (() => {
        var _el$1 = _$createElement4("box"), _el$10 = _$createElement4("text"), _el$11 = _$createTextNode(`+`), _el$12 = _$createElement4("text"), _el$13 = _$createTextNode(` \u2212`);
        _$insertNode2(_el$1, _el$10);
        _$insertNode2(_el$1, _el$12);
        _$setProp4(_el$1, "flexDirection", "row");
        _$setProp4(_el$1, "flexShrink", 0);
        _$setProp4(_el$1, "height", 1);
        _$insertNode2(_el$10, _el$11);
        _$setProp4(_el$10, "selectable", false);
        _$insert3(_el$10, () => value().additions, null);
        _$insertNode2(_el$12, _el$13);
        _$setProp4(_el$12, "selectable", false);
        _$insert3(_el$12, () => value().deletions, null);
        _$effect4((_p$) => {
          var _v$ = colors.mint, _v$2 = colors.pink;
          _v$ !== _p$.e && (_p$.e = _$setProp4(_el$10, "fg", _v$, _p$.e));
          _v$2 !== _p$.t && (_p$.t = _$setProp4(_el$12, "fg", _v$2, _p$.t));
          return _p$;
        }, {
          e: undefined,
          t: undefined
        });
        return _el$1;
      })()
    }), null);
    _$insert3(_el$5, _$createComponent5(Show, {
      get when() {
        return providerIcon(props.session.model?.providerID);
      },
      children: (icon) => _$createComponent5(TerminalIcon, {
        get name() {
          return icon();
        },
        get color() {
          return colors.faint;
        },
        width: 2,
        align: "end"
      })
    }), null);
    return _el$;
  })();
}
function CompactThreadRow(props) {
  const workspace = props.workspace;
  const pointer = usePointer(workspace, () => props.session);
  const active = () => workspace.active() === props.session.id;
  const snoozed = () => props.kind === "snoozed";
  const until = () => workspace.threads.state.snoozed[props.session.id];
  const woke = () => !!workspace.threads.state.woke[props.session.id];
  const request = () => workspace.sourceControl.get(props.session);
  const label = () => snoozed() && until() ? wakeLabel(until(), props.now) : age(workspace.preferences.settled[props.session.id] ?? workspace.activityAt(props.session), props.now);
  return (() => {
    var _el$14 = _$createElement4("box"), _el$15 = _$createElement4("box");
    _$insertNode2(_el$14, _el$15);
    _$spread(_el$14, _$mergeProps({
      get id() {
        return `t3-thread-${props.session.id}`;
      }
    }, () => pointer.props, {
      height: 1,
      flexShrink: 0,
      paddingLeft: 1,
      paddingRight: 1,
      get backgroundColor() {
        return _$memo4(() => !!active())() ? colors.surface : _$memo4(() => !!pointer.hovered())() ? colors.hover : undefined;
      }
    }), true);
    _$setProp4(_el$15, "flexDirection", "row");
    _$setProp4(_el$15, "gap", 1);
    _$setProp4(_el$15, "height", 1);
    _$insert3(_el$15, _$createComponent5(ProjectMark, {
      get name() {
        return path2.basename(props.session.location.directory);
      },
      get dim() {
        return _$memo4(() => !!!active())() && !pointer.hovered();
      }
    }), null);
    _$insert3(_el$15, _$createComponent5(SingleLine, {
      get text() {
        return props.session.title || "New thread";
      },
      get color() {
        return _$memo4(() => !!(active() || pointer.hovered() || woke()))() ? colors.text : colors.muted;
      },
      flexGrow: 1
    }), null);
    _$insert3(_el$15, _$createComponent5(Show, {
      get when() {
        return workspace.threads.state.pinned[props.session.id];
      },
      get children() {
        return _$createComponent5(TerminalIcon, {
          name: "pin",
          get color() {
            return colors.faint;
          },
          width: 2
        });
      }
    }), null);
    _$insert3(_el$15, _$createComponent5(Show, {
      get when() {
        return request();
      },
      children: (value) => _$createComponent5(RequestBadge, {
        get request() {
          return value();
        },
        run: () => workspace.sourceControl.openRequest(props.session)
      })
    }), null);
    _$insert3(_el$15, _$createComponent5(Show, {
      get when() {
        return pointer.hovered();
      },
      get fallback() {
        return _$createComponent5(Show, {
          get when() {
            return woke();
          },
          get fallback() {
            return (() => {
              var _el$16 = _$createElement4("text");
              _$setProp4(_el$16, "selectable", false);
              _$setProp4(_el$16, "flexShrink", 0);
              _$insert3(_el$16, label);
              _$effect4((_$p) => _$setProp4(_el$16, "fg", snoozed() ? colors.blue : colors.faint, _$p));
              return _el$16;
            })();
          },
          get children() {
            return _$createComponent5(Button, {
              compact: true,
              label: "Woke",
              icon: "alarm-clock",
              iconWidth: 2,
              iconGap: 0,
              get color() {
                return colors.yellow;
              },
              run: () => void workspace.threads.acknowledge(props.session.id)
            });
          }
        });
      },
      get children() {
        return _$createComponent5(Button, {
          get id() {
            return `t3-${snoozed() ? "wake" : "restore"}-${props.session.id}`;
          },
          label: "",
          get icon() {
            return snoozed() ? "alarm-clock-off" : "undo-2";
          },
          width: 3,
          run: () => void (snoozed() ? workspace.wake(props.session.id) : workspace.toggleSettle(props.session.id))
        });
      }
    }), null);
    return _el$14;
  })();
}

// src/thread-draft-card.tsx
import { effect as _$effect5 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { insertNode as _$insertNode3 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { memo as _$memo5 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { insert as _$insert4 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createComponent as _$createComponent6 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { setProp as _$setProp5 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { use as _$use3 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createElement as _$createElement5 } from "opentui:runtime-module:%40opentui%2Fsolid";
import path3 from "path";
import { Show as Show2, createSignal as createSignal5 } from "opentui:runtime-module:solid-js";
function DraftCard(props) {
  let card;
  let pressed = false;
  const [hovered, setHovered] = createSignal5(false);
  const active = () => !props.workspace.active() && props.workspace.drafts.selected() === props.draft.id;
  const report = (error) => props.workspace.context.ui.toast.show({
    variant: "error",
    message: String(error)
  });
  return (() => {
    var _el$ = _$createElement5("box"), _el$2 = _$createElement5("box");
    _$insertNode3(_el$, _el$2);
    _$use3((node) => {
      card = node;
    }, _el$);
    _$setProp5(_el$, "height", 4);
    _$setProp5(_el$, "flexShrink", 0);
    _$setProp5(_el$, "padding", 1);
    _$setProp5(_el$, "onMouseOver", () => setHovered(true));
    _$setProp5(_el$, "onMouseMove", () => setHovered(true));
    _$setProp5(_el$, "onMouseOut", (event) => {
      if (!ownsPointer(card, event, props.workspace.context.renderer)) {
        pressed = false;
        setHovered(false);
      }
    });
    _$setProp5(_el$, "onMouseDown", (event) => {
      event.preventDefault();
      pressed = event.button === 0;
    });
    _$setProp5(_el$, "onMouseUp", (event) => {
      const activate = pressed && event.button === 0 && !event.isDragging && containsPointer(card, event);
      pressed = false;
      if (activate)
        props.workspace.drafts.select(props.draft.directory, props.draft.id).catch(report);
    });
    _$setProp5(_el$2, "flexDirection", "row");
    _$setProp5(_el$2, "gap", 1);
    _$setProp5(_el$2, "height", 1);
    _$insert4(_el$2, _$createComponent6(TerminalIcon, {
      name: "square-pen",
      get color() {
        return colors.yellow;
      },
      width: 2
    }), null);
    _$insert4(_el$2, _$createComponent6(ProjectMark, {
      get name() {
        return path3.basename(props.draft.directory);
      }
    }), null);
    _$insert4(_el$2, _$createComponent6(SingleLine, {
      get text() {
        return path3.basename(props.draft.directory);
      },
      get color() {
        return colors.muted;
      },
      flexGrow: 1
    }), null);
    _$insert4(_el$2, _$createComponent6(Show2, {
      get when() {
        return hovered();
      },
      get children() {
        return _$createComponent6(Button, {
          get id() {
            return `t3-discard-${props.draft.id}`;
          },
          label: "",
          icon: "x",
          width: 2,
          run: () => void props.workspace.drafts.discard(props.draft.id).catch(report)
        });
      }
    }), null);
    _$insert4(_el$, _$createComponent6(SingleLine, {
      get text() {
        return props.draft.text.split(`
`).find((line) => line.trim()) || "New thread";
      },
      get color() {
        return colors.secondary;
      }
    }), null);
    _$effect5((_p$) => {
      var _v$ = `t3-draft-${props.draft.id}`, _v$2 = active() ? colors.surface : hovered() ? colors.hover : undefined;
      _v$ !== _p$.e && (_p$.e = _$setProp5(_el$, "id", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = _$setProp5(_el$, "backgroundColor", _v$2, _p$.t));
      return _p$;
    }, {
      e: undefined,
      t: undefined
    });
    return _el$;
  })();
}

// src/sidebar.tsx
var SIDEBAR_WIDTH = 30;
var SETTLED_INITIAL = 10;
var SETTLED_PAGE = 25;
var shortcutLabel = (shortcut) => shortcut?.split("+").map((key) => ({
  ctrl: "\u2303",
  shift: "\u21E7",
  alt: "\u2325",
  option: "\u2325",
  meta: "\u2318",
  super: "\u2318",
  cmd: "\u2318"
})[key.toLowerCase()] ?? key.toUpperCase()).join("");
function ShelfHeader(props) {
  return (() => {
    var _el$ = _$createElement6("box");
    _$setProp6(_el$, "flexShrink", 0);
    _$setProp6(_el$, "height", 1);
    _$setProp6(_el$, "marginTop", 1);
    _$setProp6(_el$, "paddingLeft", 1);
    _$setProp6(_el$, "paddingRight", 1);
    _$insert5(_el$, _$createComponent7(Button, {
      get id() {
        return props.id;
      },
      get label() {
        return _$memo6(() => !!props.expanded)() ? props.title : `${props.title} (${props.count})`;
      },
      width: "100%",
      get color() {
        return _$memo6(() => !!props.snoozed)() ? colors.blue : colors.muted;
      },
      get separator() {
        return _$memo6(() => !!props.snoozed)() ? colors.snoozedBorder : colors.border;
      },
      get trailing() {
        return props.expanded ? "chevron-up" : "chevron-down";
      },
      get run() {
        return props.toggle;
      }
    }));
    _$effect6((_$p) => _$setProp6(_el$, "marginBottom", props.expanded ? 1 : 0, _$p));
    return _el$;
  })();
}
function Sidebar(props) {
  const workspace = props.workspace;
  const [now, setNow] = createSignal6(Date.now());
  const timer = setInterval(() => setNow(Date.now()), 60000);
  onCleanup3(() => clearInterval(timer));
  const [viewport, setViewport] = createSignal6(0);
  const [settledCount, setSettledCount] = createSignal6(SETTLED_INITIAL);
  createEffect3(on(workspace.scope, () => setSettledCount(SETTLED_INITIAL), {
    defer: true
  }));
  const threads = workspace.activeSessions;
  const drafts = createMemo2(() => workspace.drafts.sidebarEntries().filter((draft) => !workspace.scope() || workspace.scope() === draft.directory).sort((a, b) => b.created - a.created));
  const shelf = (sessions, expanded) => expanded ? sessions : sessions.filter((session) => session.id === workspace.active());
  const snoozedRows = createMemo2(() => shelf(workspace.snoozed(), workspace.preferences.showSnoozed));
  const settledRows = createMemo2(() => {
    const all = workspace.settled();
    if (!workspace.preferences.showSettled)
      return shelf(all, false);
    const visible = all.slice(0, settledCount());
    const open = all.slice(settledCount()).find((session) => session.id === workspace.active());
    return open ? [...visible, open] : visible;
  });
  const hiddenSettled = () => workspace.preferences.showSettled ? workspace.settled().length - settledRows().length : 0;
  const scopeName = () => workspace.scope() ? path4.basename(workspace.scope()) : undefined;
  const empty = () => !threads().length && !drafts().length && !workspace.snoozed().length && !workspace.settled().length;
  const dispatch = (command2) => () => workspace.context.keymap.dispatch(command2);
  const undoShortcut = () => shortcutLabel(workspace.context.keymap.shortcuts?.("t3.undo")[0]);
  return (() => {
    var _el$2 = _$createElement6("box"), _el$3 = _$createElement6("box"), _el$4 = _$createElement6("text"), _el$5 = _$createElement6("b"), _el$7 = _$createElement6("box"), _el$8 = _$createElement6("box"), _el$9 = _$createElement6("scrollbox"), _el$0 = _$createElement6("box"), _el$13 = _$createElement6("box"), _el$15 = _$createElement6("box");
    _$insertNode4(_el$2, _el$3);
    _$insertNode4(_el$2, _el$7);
    _$insertNode4(_el$2, _el$9);
    _$insertNode4(_el$2, _el$15);
    _$setProp6(_el$2, "id", "t3-sidebar");
    _$setProp6(_el$2, "position", "absolute");
    _$setProp6(_el$2, "left", 0);
    _$setProp6(_el$2, "top", 0);
    _$setProp6(_el$2, "bottom", 0);
    _$setProp6(_el$2, "zIndex", 20);
    _$setProp6(_el$2, "border", ["right"]);
    _$insertNode4(_el$3, _el$4);
    _$setProp6(_el$3, "height", 3);
    _$setProp6(_el$3, "flexShrink", 0);
    _$setProp6(_el$3, "paddingTop", 1);
    _$setProp6(_el$3, "paddingLeft", 1);
    _$setProp6(_el$3, "paddingRight", 1);
    _$setProp6(_el$3, "flexDirection", "row");
    _$setProp6(_el$3, "gap", 1);
    _$insert5(_el$3, _$createComponent7(Button, {
      id: "t3-sidebar-toggle",
      label: "",
      icon: "panel-left-close",
      width: 3,
      get run() {
        return dispatch("t3.sidebar");
      }
    }), _el$4);
    _$insertNode4(_el$4, _el$5);
    _$setProp6(_el$4, "selectable", false);
    _$insertNode4(_el$5, _$createTextNode2(`OpenCode`));
    _$insertNode4(_el$7, _el$8);
    _$setProp6(_el$7, "height", 2);
    _$setProp6(_el$7, "flexShrink", 0);
    _$setProp6(_el$7, "paddingLeft", 1);
    _$setProp6(_el$7, "paddingRight", 1);
    _$setProp6(_el$7, "flexDirection", "row");
    _$setProp6(_el$7, "justifyContent", "space-between");
    _$insert5(_el$7, _$createComponent7(Button, {
      id: "t3-search",
      label: "Search",
      icon: "search",
      width: 11,
      get color() {
        return colors.secondary;
      },
      get run() {
        return dispatch("t3.search");
      }
    }), _el$8);
    _$setProp6(_el$8, "flexDirection", "row");
    _$setProp6(_el$8, "flexShrink", 0);
    _$insert5(_el$8, _$createComponent7(Show3, {
      get when() {
        return workspace.scope();
      },
      get fallback() {
        return _$createComponent7(Button, {
          id: "t3-projects",
          label: "",
          icon: "folder",
          width: 3,
          get run() {
            return dispatch("t3.scope");
          }
        });
      },
      children: (scope) => _$createComponent7(Button, {
        id: "t3-projects",
        label: "",
        get mark() {
          return path4.basename(scope());
        },
        compact: true,
        width: 3,
        get run() {
          return dispatch("t3.scope");
        }
      })
    }), null);
    _$insert5(_el$8, _$createComponent7(Button, {
      id: "t3-new-project",
      label: "",
      icon: "folder-plus",
      width: 3,
      run: () => void workspace.addProject()
    }), null);
    _$insert5(_el$8, _$createComponent7(Button, {
      id: "t3-new-thread",
      label: "",
      icon: "square-pen",
      width: 3,
      get color() {
        return colors.text;
      },
      run: (event) => void workspace.chooseNewThread(!!event?.modifiers.shift)
    }), null);
    _$insertNode4(_el$9, _el$0);
    _$setProp6(_el$9, "flexGrow", 1);
    _$setProp6(_el$9, "paddingLeft", 1);
    _$setProp6(_el$9, "paddingRight", 1);
    _$setProp6(_el$9, "horizontalScrollbarOptions", {
      visible: false
    });
    _$setProp6(_el$9, "verticalScrollbarOptions", {
      visible: false
    });
    _$setProp6(_el$9, "onSizeChange", function() {
      setViewport(this.height);
    });
    _$insertNode4(_el$0, _el$13);
    _$setProp6(_el$0, "flexShrink", 0);
    _$insert5(_el$0, _$createComponent7(Show3, {
      get when() {
        return workspace.loadError();
      },
      get children() {
        var _el$1 = _$createElement6("text");
        _$insertNode4(_el$1, _$createTextNode2(`Could not load threads. /refresh`));
        _$setProp6(_el$1, "wrapMode", "word");
        _$setProp6(_el$1, "paddingLeft", 1);
        _$effect6((_$p) => _$setProp6(_el$1, "fg", colors.pink, _$p));
        return _el$1;
      }
    }), _el$13);
    _$insert5(_el$0, _$createComponent7(For, {
      get each() {
        return drafts();
      },
      children: (draft) => _$createComponent7(DraftCard, {
        workspace,
        draft
      })
    }), _el$13);
    _$insert5(_el$0, _$createComponent7(Show3, {
      get when() {
        return drafts().length;
      },
      get children() {
        var _el$11 = _$createElement6("box");
        _$setProp6(_el$11, "id", "t3-draft-divider");
        _$setProp6(_el$11, "height", 1);
        _$setProp6(_el$11, "flexShrink", 0);
        _$setProp6(_el$11, "marginLeft", 1);
        _$setProp6(_el$11, "marginRight", 1);
        _$setProp6(_el$11, "border", ["bottom"]);
        _$effect6((_$p) => _$setProp6(_el$11, "borderColor", colors.border, _$p));
        return _el$11;
      }
    }), _el$13);
    _$insert5(_el$0, _$createComponent7(For, {
      get each() {
        return threads();
      },
      children: (session) => _$createComponent7(ThreadCard, {
        workspace,
        session,
        get now() {
          return now();
        }
      })
    }), _el$13);
    _$insert5(_el$0, _$createComponent7(Show3, {
      get when() {
        return empty();
      },
      get children() {
        var _el$12 = _$createElement6("text");
        _$setProp6(_el$12, "paddingLeft", 1);
        _$setProp6(_el$12, "paddingTop", 1);
        _$insert5(_el$12, (() => {
          var _c$ = _$memo6(() => !!scopeName());
          return () => _c$() ? `No threads in ${scopeName()} yet` : "No threads yet";
        })());
        _$effect6((_$p) => _$setProp6(_el$12, "fg", colors.muted, _$p));
        return _el$12;
      }
    }), _el$13);
    _$setProp6(_el$13, "flexGrow", 1);
    _$setProp6(_el$13, "minHeight", 0);
    _$insert5(_el$0, _$createComponent7(Show3, {
      get when() {
        return workspace.snoozed().length;
      },
      get children() {
        return [_$createComponent7(ShelfHeader, {
          id: "t3-snoozed-shelf",
          title: "Snoozed",
          get count() {
            return workspace.snoozed().length;
          },
          snoozed: true,
          get expanded() {
            return workspace.preferences.showSnoozed;
          },
          toggle: () => void workspace.persist((draft) => {
            draft.showSnoozed = !draft.showSnoozed;
          })
        }), _$createComponent7(For, {
          get each() {
            return snoozedRows();
          },
          children: (session) => _$createComponent7(CompactThreadRow, {
            workspace,
            session,
            get now() {
              return now();
            },
            kind: "snoozed"
          })
        })];
      }
    }), null);
    _$insert5(_el$0, _$createComponent7(Show3, {
      get when() {
        return !empty();
      },
      get children() {
        return [_$createComponent7(ShelfHeader, {
          id: "t3-settled-shelf",
          title: "Settled",
          get count() {
            return workspace.settled().length;
          },
          get expanded() {
            return workspace.preferences.showSettled;
          },
          toggle: () => void workspace.persist((draft) => {
            draft.showSettled = !draft.showSettled;
          })
        }), _$createComponent7(For, {
          get each() {
            return settledRows();
          },
          children: (session) => _$createComponent7(CompactThreadRow, {
            workspace,
            session,
            get now() {
              return now();
            },
            kind: "settled"
          })
        }), _$createComponent7(Show3, {
          get when() {
            return hiddenSettled() > 0;
          },
          get children() {
            var _el$14 = _$createElement6("box");
            _$setProp6(_el$14, "height", 1);
            _$setProp6(_el$14, "flexShrink", 0);
            _$setProp6(_el$14, "paddingLeft", 1);
            _$insert5(_el$14, _$createComponent7(Button, {
              id: "t3-settled-more",
              get label() {
                return `Show ${Math.min(hiddenSettled(), SETTLED_PAGE)} more`;
              },
              icon: "plus",
              iconWidth: 2,
              compact: true,
              run: () => setSettledCount((count) => count + SETTLED_PAGE)
            }));
            return _el$14;
          }
        })];
      }
    }), null);
    _$insert5(_el$2, _$createComponent7(Show3, {
      get when() {
        return workspace.undo.notice();
      },
      children: (notice) => (() => {
        var _el$16 = _$createElement6("box"), _el$17 = _$createElement6("text");
        _$insertNode4(_el$16, _el$17);
        _$setProp6(_el$16, "height", 2);
        _$setProp6(_el$16, "flexShrink", 0);
        _$setProp6(_el$16, "paddingTop", 1);
        _$setProp6(_el$16, "paddingLeft", 2);
        _$setProp6(_el$16, "paddingRight", 1);
        _$setProp6(_el$16, "flexDirection", "row");
        _$setProp6(_el$16, "gap", 1);
        _$setProp6(_el$17, "selectable", false);
        _$setProp6(_el$17, "flexGrow", 1);
        _$insert5(_el$17, () => notice().label);
        _$insert5(_el$16, _$createComponent7(Button, {
          id: "t3-undo",
          compact: true,
          get label() {
            return _$memo6(() => !!undoShortcut())() ? `${undoShortcut()} undo` : "Undo";
          },
          get color() {
            return colors.blue;
          },
          get run() {
            return workspace.undo.undo;
          }
        }), null);
        _$effect6((_$p) => _$setProp6(_el$17, "fg", colors.secondary, _$p));
        return _el$16;
      })()
    }), _el$15);
    _$setProp6(_el$15, "height", 3);
    _$setProp6(_el$15, "flexShrink", 0);
    _$setProp6(_el$15, "paddingTop", 1);
    _$setProp6(_el$15, "paddingBottom", 1);
    _$setProp6(_el$15, "paddingLeft", 1);
    _$setProp6(_el$15, "paddingRight", 1);
    _$setProp6(_el$15, "flexDirection", "row");
    _$setProp6(_el$15, "gap", 1);
    _$insert5(_el$15, _$createComponent7(Button, {
      id: "t3-settings",
      label: "",
      icon: "settings",
      width: 3,
      get run() {
        return dispatch("opencode.settings");
      }
    }), null);
    _$insert5(_el$15, _$createComponent7(Button, {
      id: "t3-pull-requests",
      label: "",
      icon: "git-pull-request",
      width: 3,
      get run() {
        return dispatch("t3.prs");
      }
    }), null);
    _$insert5(_el$15, _$createComponent7(Button, {
      id: "t3-stats",
      label: "",
      icon: "chart-no-axes-column",
      width: 3,
      get run() {
        return dispatch("stats.open");
      }
    }), null);
    _$effect6((_p$) => {
      var _v$ = props.width, _v$2 = colors.sidebar, _v$3 = colors.border, _v$4 = colors.text, _v$5 = viewport();
      _v$ !== _p$.e && (_p$.e = _$setProp6(_el$2, "width", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = _$setProp6(_el$2, "backgroundColor", _v$2, _p$.t));
      _v$3 !== _p$.a && (_p$.a = _$setProp6(_el$2, "borderColor", _v$3, _p$.a));
      _v$4 !== _p$.o && (_p$.o = _$setProp6(_el$4, "fg", _v$4, _p$.o));
      _v$5 !== _p$.i && (_p$.i = _$setProp6(_el$0, "minHeight", _v$5, _p$.i));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined,
      o: undefined,
      i: undefined
    });
    return _el$2;
  })();
}

// src/picker.tsx
import { memo as _$memo7 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { effect as _$effect7 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { insert as _$insert6 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createTextNode as _$createTextNode3 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { insertNode as _$insertNode5 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { use as _$use4 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { setProp as _$setProp7 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createElement as _$createElement7 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createComponent as _$createComponent8 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { For as For2, Show as Show4, createMemo as createMemo3, createSignal as createSignal7, onCleanup as onCleanup4, onMount } from "opentui:runtime-module:solid-js";

// src/picker-rank.ts
function rankOptions(options, query) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length)
    return options;
  return options.flatMap((option, index) => {
    const title = option.title.toLocaleLowerCase();
    const text = `${title} ${(option.description ?? "").toLocaleLowerCase()}`;
    if (!terms.every((term) => text.includes(term)))
      return [];
    const score = terms.reduce((sum, term) => sum + (title.startsWith(term) ? 0 : title.includes(term) ? 1 : 2), 0);
    return [{
      option,
      score,
      index
    }];
  }).sort((a, b) => a.score - b.score || a.index - b.index).map((entry) => entry.option);
}

// src/picker.tsx
function pick(context, title, options, presentation2 = {}) {
  return new Promise((resolve) => {
    let chosen;
    context.ui.dialog.show(() => _$createComponent8(Picker, {
      context,
      title,
      options,
      presentation: presentation2,
      select: (value) => {
        chosen = value;
        context.ui.dialog.clear();
      }
    }), () => resolve(chosen));
    context.ui.dialog.set({
      size: "medium",
      centered: true
    });
  });
}
function Picker(props) {
  let input;
  let panel;
  const initial = Math.max(0, props.options.findIndex((option) => option.value === props.presentation.current));
  const [query, setQuery] = createSignal7("");
  const [selected, setSelected] = createSignal7(initial);
  const [height, setHeight] = createSignal7(props.context.renderer.height);
  const filtered = createMemo3(() => rankOptions(props.options, query()));
  const limit = () => Math.max(3, Math.min(12, height() - 14));
  const [start, setStart] = createSignal7(Math.max(0, initial - limit() + 1));
  const rows = () => filtered().slice(start(), start() + limit());
  const move = (index) => {
    const next = Math.max(0, Math.min(filtered().length - 1, index));
    setSelected(next);
    if (next < start())
      setStart(next);
    else if (next >= start() + limit())
      setStart(next - limit() + 1);
  };
  onMount(() => {
    const resize = () => setHeight(props.context.renderer.height);
    props.context.renderer.on("resize", resize);
    onCleanup4(() => props.context.renderer.off("resize", resize));
    let restore;
    queueMicrotask(() => {
      const shell = panel?.parent;
      if (shell) {
        const saved = {
          paddingTop: shell.paddingTop,
          paddingBottom: shell.paddingBottom,
          backgroundColor: shell.backgroundColor
        };
        shell.paddingTop = 0;
        shell.paddingBottom = 0;
        shell.backgroundColor = colors.composer;
        restore = () => {
          if (!shell.isDestroyed)
            Object.assign(shell, saved);
        };
      }
      input?.focus();
    });
    onCleanup4(() => restore?.());
  });
  const select = () => {
    const option = filtered()[selected()];
    if (option)
      props.select(option.value);
  };
  const label = () => props.presentation.section ?? props.title;
  return (() => {
    var _el$ = _$createElement7("box"), _el$2 = _$createElement7("box"), _el$3 = _$createElement7("input"), _el$4 = _$createElement7("text"), _el$6 = _$createElement7("box"), _el$7 = _$createElement7("box"), _el$8 = _$createElement7("text");
    _$insertNode5(_el$, _el$2);
    _$insertNode5(_el$, _el$6);
    _$insertNode5(_el$, _el$7);
    _$use4((node) => {
      panel = node;
    }, _el$);
    _$setProp7(_el$, "id", "t3-picker");
    _$setProp7(_el$, "paddingTop", 1);
    _$setProp7(_el$, "paddingBottom", 1);
    _$setProp7(_el$, "onMouseScroll", (event) => {
      if (event.scroll?.direction === "down")
        move(selected() + 1);
      else if (event.scroll?.direction === "up")
        move(selected() - 1);
    });
    _$insertNode5(_el$2, _el$3);
    _$insertNode5(_el$2, _el$4);
    _$setProp7(_el$2, "height", 1);
    _$setProp7(_el$2, "paddingLeft", 2);
    _$setProp7(_el$2, "paddingRight", 2);
    _$setProp7(_el$2, "flexDirection", "row");
    _$setProp7(_el$2, "gap", 1);
    _$insert6(_el$2, _$createComponent8(TerminalIcon, {
      name: "search",
      get color() {
        return colors.muted;
      },
      width: 2
    }), _el$3);
    _$use4((node) => {
      input = node;
    }, _el$3);
    _$setProp7(_el$3, "flexGrow", 1);
    _$setProp7(_el$3, "onInput", (value) => {
      setQuery(value);
      setSelected(0);
      setStart(0);
    });
    _$setProp7(_el$3, "onKeyDown", (event) => {
      const step = {
        pageup: -limit(),
        pagedown: limit(),
        up: -1,
        down: 1
      }[event.name];
      const stop = () => {
        event.preventDefault();
        event.stopPropagation();
      };
      if (props.presentation.numbered && event.ctrl && /^[1-9]$/.test(event.name)) {
        stop();
        const option = filtered()[Number(event.name) - 1];
        if (option)
          props.select(option.value);
      } else if (step !== undefined) {
        stop();
        move(selected() + step);
      } else if (event.name === "return") {
        stop();
        select();
      } else if (event.name === "escape") {
        stop();
        props.context.ui.dialog.clear();
      }
    });
    _$insertNode5(_el$4, _$createTextNode3(`esc`));
    _$setProp7(_el$4, "selectable", false);
    _$setProp7(_el$4, "flexShrink", 0);
    _$setProp7(_el$6, "height", 1);
    _$setProp7(_el$6, "marginLeft", 2);
    _$setProp7(_el$6, "marginRight", 2);
    _$setProp7(_el$6, "border", ["bottom"]);
    _$insertNode5(_el$7, _el$8);
    _$setProp7(_el$7, "height", 1);
    _$setProp7(_el$7, "marginTop", 1);
    _$setProp7(_el$7, "paddingLeft", 2);
    _$setProp7(_el$7, "paddingRight", 2);
    _$setProp7(_el$7, "flexDirection", "row");
    _$setProp7(_el$8, "selectable", false);
    _$setProp7(_el$8, "flexGrow", 1);
    _$insert6(_el$8, label);
    _$insert6(_el$7, _$createComponent8(Show4, {
      get when() {
        return filtered().length > limit();
      },
      get children() {
        var _el$9 = _$createElement7("text"), _el$0 = _$createTextNode3(` of `);
        _$insertNode5(_el$9, _el$0);
        _$setProp7(_el$9, "selectable", false);
        _$insert6(_el$9, () => selected() + 1, _el$0);
        _$insert6(_el$9, () => filtered().length, null);
        _$effect7((_$p) => _$setProp7(_el$9, "fg", colors.faint, _$p));
        return _el$9;
      }
    }), null);
    _$insert6(_el$, _$createComponent8(For2, {
      get each() {
        return rows();
      },
      children: (option, index) => _$createComponent8(PickerRow, {
        option,
        get selected() {
          return selected() === start() + index();
        },
        hover: () => setSelected(start() + index()),
        select: () => props.select(option.value)
      })
    }), null);
    _$insert6(_el$, _$createComponent8(Show4, {
      get when() {
        return !filtered().length;
      },
      get children() {
        var _el$1 = _$createElement7("box"), _el$10 = _$createElement7("text");
        _$insertNode5(_el$1, _el$10);
        _$setProp7(_el$1, "height", 3);
        _$setProp7(_el$1, "paddingLeft", 2);
        _$setProp7(_el$1, "paddingTop", 1);
        _$insertNode5(_el$10, _$createTextNode3(`No matches`));
        _$effect7((_$p) => _$setProp7(_el$10, "fg", colors.faint, _$p));
        return _el$1;
      }
    }), null);
    _$effect7((_p$) => {
      var _v$ = colors.composer, _v$2 = `Search ${(props.presentation.section ?? props.title).toLocaleLowerCase().replace(/\u2026$/, "")}\u2026`, _v$3 = colors.text, _v$4 = colors.composer, _v$5 = colors.composer, _v$6 = colors.faint, _v$7 = colors.faint, _v$8 = colors.composerBorder, _v$9 = colors.muted;
      _v$ !== _p$.e && (_p$.e = _$setProp7(_el$, "backgroundColor", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = _$setProp7(_el$3, "placeholder", _v$2, _p$.t));
      _v$3 !== _p$.a && (_p$.a = _$setProp7(_el$3, "textColor", _v$3, _p$.a));
      _v$4 !== _p$.o && (_p$.o = _$setProp7(_el$3, "backgroundColor", _v$4, _p$.o));
      _v$5 !== _p$.i && (_p$.i = _$setProp7(_el$3, "focusedBackgroundColor", _v$5, _p$.i));
      _v$6 !== _p$.n && (_p$.n = _$setProp7(_el$3, "placeholderColor", _v$6, _p$.n));
      _v$7 !== _p$.s && (_p$.s = _$setProp7(_el$4, "fg", _v$7, _p$.s));
      _v$8 !== _p$.h && (_p$.h = _$setProp7(_el$6, "borderColor", _v$8, _p$.h));
      _v$9 !== _p$.r && (_p$.r = _$setProp7(_el$8, "fg", _v$9, _p$.r));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined,
      o: undefined,
      i: undefined,
      n: undefined,
      s: undefined,
      h: undefined,
      r: undefined
    });
    return _el$;
  })();
}
function PickerRow(props) {
  let row;
  let pressed = false;
  return (() => {
    var _el$12 = _$createElement7("box"), _el$13 = _$createElement7("text"), _el$14 = _$createElement7("box");
    _$insertNode5(_el$12, _el$13);
    _$insertNode5(_el$12, _el$14);
    _$use4((node) => {
      row = node;
    }, _el$12);
    _$setProp7(_el$12, "height", 1);
    _$setProp7(_el$12, "flexDirection", "row");
    _$setProp7(_el$12, "paddingRight", 2);
    _$setProp7(_el$12, "onMouseDown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      pressed = event.button === 0;
    });
    _$setProp7(_el$12, "onMouseOut", (event) => {
      if (!containsPointer(row, event))
        pressed = false;
    });
    _$setProp7(_el$12, "onMouseUp", (event) => {
      event.stopPropagation();
      const activate = pressed && event.button === 0 && !event.isDragging && containsPointer(row, event);
      pressed = false;
      if (activate)
        props.select();
    });
    _$setProp7(_el$13, "selectable", false);
    _$setProp7(_el$13, "width", 2);
    _$setProp7(_el$13, "flexShrink", 0);
    _$insert6(_el$13, () => props.selected ? "\u258C" : " ");
    _$setProp7(_el$14, "flexDirection", "row");
    _$setProp7(_el$14, "gap", 1);
    _$setProp7(_el$14, "flexGrow", 1);
    _$setProp7(_el$14, "minWidth", 0);
    _$insert6(_el$14, _$createComponent8(Show4, {
      get when() {
        return props.option.project;
      },
      get fallback() {
        return _$createComponent8(Show4, {
          get when() {
            return props.option.icon;
          },
          children: (icon) => _$createComponent8(TerminalIcon, {
            get name() {
              return icon();
            },
            get color() {
              return props.option.iconColor ?? (props.selected ? colors.text : colors.muted);
            },
            width: 2
          })
        });
      },
      get children() {
        return _$createComponent8(ProjectMark, {
          get name() {
            return props.option.project;
          }
        });
      }
    }), null);
    _$insert6(_el$14, _$createComponent8(SingleLine, {
      get text() {
        return props.option.title;
      },
      get color() {
        return _$memo7(() => !!props.selected)() ? colors.text : colors.secondary;
      },
      flexGrow: 1
    }), null);
    _$insert6(_el$14, _$createComponent8(Show4, {
      get when() {
        return props.option.description;
      },
      get children() {
        var _el$15 = _$createElement7("box");
        _$setProp7(_el$15, "flexShrink", 1);
        _$setProp7(_el$15, "minWidth", 6);
        _$insert6(_el$15, _$createComponent8(SingleLine, {
          get text() {
            return props.option.description;
          },
          get color() {
            return colors.faint;
          },
          tail: true,
          align: "right",
          width: "100%"
        }));
        _$effect7((_$p) => _$setProp7(_el$15, "width", Math.min(Bun.stringWidth(props.option.description), 36), _$p));
        return _el$15;
      }
    }), null);
    _$effect7((_p$) => {
      var _v$0 = props.selected ? colors.surface : undefined, _v$1 = props.hover, _v$10 = colors.indigo;
      _v$0 !== _p$.e && (_p$.e = _$setProp7(_el$12, "backgroundColor", _v$0, _p$.e));
      _v$1 !== _p$.t && (_p$.t = _$setProp7(_el$12, "onMouseOver", _v$1, _p$.t));
      _v$10 !== _p$.a && (_p$.a = _$setProp7(_el$13, "fg", _v$10, _p$.a));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined
    });
    return _el$12;
  })();
}

// src/thread-state.tsx
function createThreadState(context) {
  const [state, save] = context.storage.store("thread-state", {
    initial: {
      pinned: {},
      snoozed: {},
      woke: {}
    }
  });
  const [lifecycle, updateLifecycle] = context.storage.store("thread-lifecycle", {
    initial: {
      snoozedAt: {},
      anchors: {}
    }
  });
  const [seen, updateSeen] = context.storage.store("thread-seen", {
    initial: {
      visited: {},
      unread: {},
      branches: {}
    }
  });
  const chooseSnooze = async () => {
    const options = snoozePresets(new Date);
    const choice = await pick(context, "Snooze thread", options.map((option) => ({
      title: option.title,
      value: String(option.time),
      icon: "clock",
      description: wakeDescription(option.time, new Date)
    })).concat([{
      title: "Custom\u2026",
      value: "custom",
      icon: "alarm-clock",
      description: "30m, 2h, 3d or a date"
    }]));
    if (!choice)
      return;
    if (choice !== "custom")
      return Number(choice);
    const input = await context.ui.dialog.prompt({
      title: "Wake thread at\u2026",
      placeholder: "30m, 2h, or 2026-10-01 09:00"
    });
    if (!input)
      return;
    const time = parseWakeTime(input, Date.now());
    if (!time)
      throw new Error("Choose a future time, or a duration such as 30m or 2h.");
    return time;
  };
  const snooze = async (sessionID, until) => {
    await updateLifecycle((draft) => {
      draft.snoozedAt[sessionID] = Date.now();
    });
    await save((draft) => {
      draft.snoozed[sessionID] = until;
      delete draft.woke[sessionID];
    });
  };
  const clear = (sessionID) => save((draft) => {
    delete draft.snoozed[sessionID];
    delete draft.woke[sessionID];
  });
  const acknowledge = (sessionID) => {
    if (state.woke[sessionID])
      return save((draft) => {
        delete draft.woke[sessionID];
      });
  };
  const raiseAttention = async (sessionID, created) => {
    if (!state.snoozed[sessionID] || created <= (lifecycle.snoozedAt[sessionID] ?? 0))
      return;
    await save((draft) => {
      delete draft.snoozed[sessionID];
      draft.woke[sessionID] = true;
    });
  };
  const wake = async () => {
    const due = Object.entries(state.snoozed).filter(([, until]) => until <= Date.now()).map(([id]) => id);
    if (due.length)
      await save((draft) => {
        for (const id of due) {
          delete draft.snoozed[id];
          draft.woke[id] = true;
        }
      });
    return due;
  };
  const togglePin = (sessionID) => save((draft) => {
    if (draft.pinned[sessionID])
      delete draft.pinned[sessionID];
    else
      draft.pinned[sessionID] = true;
  });
  const reenter = (sessionID) => updateLifecycle((draft) => {
    draft.anchors[sessionID] = Date.now();
  });
  const snapshot = (id) => ({
    pinned: state.pinned[id],
    snoozed: state.snoozed[id],
    woke: state.woke[id],
    snoozedAt: lifecycle.snoozedAt[id],
    anchor: lifecycle.anchors[id]
  });
  const restore = async (id, value) => {
    await save((draft) => {
      for (const key of ["pinned", "snoozed", "woke"]) {
        if (value[key] === undefined)
          delete draft[key][id];
        else
          draft[key][id] = value[key];
      }
    });
    await updateLifecycle((draft) => {
      if (value.snoozedAt === undefined)
        delete draft.snoozedAt[id];
      else
        draft.snoozedAt[id] = value.snoozedAt;
      if (value.anchor === undefined)
        delete draft.anchors[id];
      else
        draft.anchors[id] = value.anchor;
    });
  };
  const unpin = (id) => save((draft) => {
    delete draft.pinned[id];
  });
  const visit = (ids, at = Date.now()) => {
    const due = ids.filter((id) => id && ((seen.visited[id] ?? 0) < at || seen.unread[id]));
    if (due.length)
      return updateSeen((draft) => {
        for (const id of due) {
          draft.visited[id] = Math.max(draft.visited[id] ?? 0, at);
          delete draft.unread[id];
        }
      });
  };
  const markUnread = (id) => updateSeen((draft) => {
    draft.unread[id] = true;
  });
  const recordBranch = (id, branch) => {
    if (branch && seen.branches[id] !== branch)
      return updateSeen((draft) => {
        draft.branches[id] = branch;
      });
  };
  return {
    state,
    lifecycle,
    seen,
    chooseSnooze,
    snooze,
    clear,
    acknowledge,
    wake,
    raiseAttention,
    reenter,
    togglePin,
    unpin,
    snapshot,
    restore,
    visit,
    markUnread,
    recordBranch
  };
}

// src/workspace.tsx
import { createEffect as createEffect4, createMemo as createMemo5, createSignal as createSignal11, on as on2, onCleanup as onCleanup7 } from "opentui:runtime-module:solid-js";
import path7 from "path";

// src/drafts.tsx
import { createMemo as createMemo4, createSignal as createSignal8, onCleanup as onCleanup5, untrack } from "opentui:runtime-module:solid-js";
function createDrafts(context) {
  const [state, save] = context.storage.store("thread-drafts", {
    initial: {
      drafts: {}
    }
  });
  const [selected, setSelected] = createSignal8();
  const viewing = () => context.ui.router.current().type === "home" ? selected() : undefined;
  const snapshot = createMemo4((previous) => {
    const id = viewing();
    if (previous?.id === id)
      return previous;
    const draft = untrack(() => state.drafts[id ?? ""]);
    return {
      id,
      draft: draft?.text.trim() ? {
        ...draft
      } : undefined
    };
  }, {});
  const sidebarEntries = createMemo4(() => Object.values(state.drafts).flatMap((draft) => {
    if (draft.id === viewing())
      return snapshot().draft ? [snapshot().draft] : [];
    return draft.text.trim() ? [draft] : [];
  }));
  let editor;
  let editorDirectory;
  let destination;
  let timer;
  const report = (error) => context.ui.toast.show({
    variant: "error",
    message: String(error)
  });
  const flush = async () => {
    clearTimeout(timer);
    const id = selected();
    if (!editor || editor.isDestroyed || !id || editorDirectory !== state.drafts[id]?.directory)
      return;
    const text = editor.plainText;
    await save((draft) => {
      if (draft.drafts[id])
        draft.drafts[id].text = text;
    });
  };
  const canLeave = () => {
    if (!editor || editor.isDestroyed || !editor.extmarks.getAll().length)
      return true;
    context.ui.toast.show({
      variant: "info",
      message: "This draft has native attachments. Send it or remove its attachments before opening another draft."
    });
    return false;
  };
  const select = async (directory, id) => {
    if (!canLeave())
      return false;
    await flush();
    const empty = Object.values(state.drafts).find((draft) => draft.directory === directory && !draft.text.trim());
    const next = id ?? empty?.id ?? crypto.randomUUID();
    if (!state.drafts[next])
      await save((draft) => {
        draft.drafts[next] = {
          id: next,
          directory,
          text: "",
          created: Date.now()
        };
      });
    editor = undefined;
    destination = directory;
    setSelected(next);
    context.keymap.dispatch("session.new");
    context.keymap.dispatch("session.cd", directory);
    return true;
  };
  const attach = (input, directory) => {
    editor = input;
    editorDirectory = directory;
    const id = selected();
    if (id && state.drafts[id]?.directory === directory && input.plainText !== state.drafts[id].text)
      input.setText(state.drafts[id].text);
    input.focus();
    return () => {
      flush().catch(report);
      if (editor === input)
        editor = undefined;
    };
  };
  const changed = () => {
    clearTimeout(timer);
    timer = setTimeout(() => void flush().catch(report), 150);
  };
  const initialize = async (input, directory) => {
    if (destination && destination !== directory)
      return;
    destination = undefined;
    if (state.drafts[selected() ?? ""]?.directory === directory)
      return;
    const empty = Object.values(state.drafts).find((draft) => draft.directory === directory && !draft.text.trim());
    const id = empty?.id ?? crypto.randomUUID();
    await save((draft) => {
      draft.drafts[id] = {
        id,
        directory,
        text: input.plainText,
        created: empty?.created ?? Date.now()
      };
    });
    setSelected(id);
  };
  const discard = async (id) => {
    const draft = state.drafts[id];
    if (!draft)
      return;
    const open = selected() === id && editor && !editor.isDestroyed;
    if (open)
      clearTimeout(timer);
    const next = open ? crypto.randomUUID() : undefined;
    await save((value) => {
      delete value.drafts[id];
      if (next)
        value.drafts[next] = {
          id: next,
          directory: draft.directory,
          text: "",
          created: Date.now()
        };
    });
    if (next) {
      setSelected(next);
      editor.setText("");
    }
  };
  onCleanup5(() => clearTimeout(timer));
  return {
    state,
    selected,
    sidebarEntries,
    select,
    attach,
    changed,
    initialize,
    flush,
    canLeave,
    discard
  };
}

// src/thread-undo.tsx
import { createSignal as createSignal9, onCleanup as onCleanup6 } from "opentui:runtime-module:solid-js";
function createThreadUndo(report) {
  const [notice, setNotice] = createSignal9();
  let timer;
  const clear = () => {
    clearTimeout(timer);
    setNotice(undefined);
  };
  const invalidate = (id, created = Infinity) => {
    const pending = notice();
    if (pending?.id === id && created > pending.created)
      clear();
  };
  const offer = (label, id, restore) => {
    clear();
    setNotice({
      label,
      id,
      created: Date.now(),
      restore
    });
    timer = setTimeout(clear, 5000);
  };
  const undo = async () => {
    const pending = notice();
    clear();
    try {
      await pending?.restore();
    } catch (error) {
      report(error);
    }
  };
  onCleanup6(clear);
  return {
    notice,
    offer,
    invalidate,
    undo
  };
}

// src/projects.tsx
import path5 from "path";
import { homedir as homedir2 } from "os";
import { mkdir, readdir, stat } from "fs/promises";

// src/git-host.ts
async function runCommand(cwd, args, timeout = 15000) {
  const child = Bun.spawn(args, {
    cwd,
    env: process.env,
    stdout: "pipe",
    stderr: "pipe",
    stdin: "ignore"
  });
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    child.kill();
  }, timeout);
  try {
    const [stdout, stderr, code] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited]);
    if (timedOut)
      throw new Error(`${args[0]} timed out.`);
    if (code !== 0)
      throw new Error(stderr.trim() || `${args[0]} exited with ${code}.`);
    return stdout.trim();
  } finally {
    clearTimeout(timer);
  }
}
function parseRemote(remote, configuredGitLabHosts = []) {
  const scp = /^(?:[^@]+@)?([^/:]+):(.+)$/.exec(remote);
  let host, repository;
  if (scp && !remote.includes("://")) {
    host = scp[1];
    repository = scp[2];
  } else {
    let url;
    try {
      url = new URL(remote);
    } catch {
      return;
    }
    host = url.hostname;
    repository = url.pathname.replace(/^\//, "");
  }
  repository = repository.replace(/\.git\/?$/, "").replace(/\/$/, "");
  if (!repository.includes("/") || repository.includes(".."))
    return;
  const kind = host === "github.com" ? "github" : host === "gitlab.com" || configuredGitLabHosts.includes(host) ? "gitlab" : undefined;
  if (kind)
    return {
      kind,
      host,
      repository,
      cloneUrl: remote
    };
}
function parseRequestUrl(input) {
  let url;
  try {
    url = new URL(input);
  } catch {
    return;
  }
  if (url.protocol !== "https:" || url.username || url.password)
    return;
  const match = /^\/(.+?)\/(pull|\-\/merge_requests)\/([1-9]\d*)\/?$/.exec(url.pathname);
  if (!match)
    return;
  const kind = match[2] === "pull" ? "github" : "gitlab";
  if (kind === "github" && url.hostname !== "github.com")
    return;
  return {
    host: url.hostname,
    repository: match[1],
    number: Number(match[3]),
    kind
  };
}
function normalizeGitHub(value) {
  if (!Number.isInteger(value.number) || !value.url || !value.headRefName)
    throw new Error("GitHub returned an invalid pull request.");
  const checks = value.statusCheckRollup ?? [];
  const failed = checks.some((check) => ["FAILURE", "ERROR", "TIMED_OUT", "CANCELLED", "ACTION_REQUIRED"].includes(check.conclusion ?? check.state ?? ""));
  const pending = checks.some((check) => check.status && check.status !== "COMPLETED" || check.state === "PENDING");
  return {
    number: value.number,
    title: value.title,
    url: value.url,
    state: value.state.toLowerCase(),
    branch: value.headRefName,
    draft: value.isDraft,
    checks: failed ? "failed" : pending ? "pending" : checks.length ? "passed" : undefined
  };
}
function normalizeGitLab(value) {
  if (!Number.isInteger(value.iid) || !value.web_url || !value.source_branch)
    throw new Error("GitLab returned an invalid merge request.");
  const pipeline = value.head_pipeline?.status;
  return {
    number: value.iid,
    title: value.title,
    url: value.web_url,
    state: value.state === "opened" ? "open" : value.state,
    branch: value.source_branch,
    draft: value.draft ?? value.work_in_progress ?? false,
    checks: pipeline === "failed" || pipeline === "canceled" ? "failed" : pipeline === "running" || pipeline === "pending" ? "pending" : pipeline === "success" ? "passed" : undefined
  };
}
var fields = "number,title,url,state,headRefName,isDraft,statusCheckRollup";
async function listRequests(cwd, host, branch) {
  if (host.kind === "github") {
    const values2 = JSON.parse(await runCommand(cwd, ["gh", "pr", "list", "--repo", `${host.host}/${host.repository}`, "--state", "open", "--limit", "50", "--json", fields, ...branch ? ["--head", branch] : []]));
    return values2.map(normalizeGitHub);
  }
  const endpoint = `projects/${encodeURIComponent(host.repository)}/merge_requests?state=opened&per_page=50${branch ? `&source_branch=${encodeURIComponent(branch)}` : ""}`;
  const values = JSON.parse(await runCommand(cwd, ["glab", "api", "--hostname", host.host, endpoint]));
  return values.map(normalizeGitLab);
}
async function readRequest(cwd, host, url) {
  const request = parseRequestUrl(url);
  if (!request || request.kind !== host.kind || request.host !== host.host)
    throw new Error("Choose a request on this repository's configured Git host.");
  if (host.kind === "github")
    return normalizeGitHub(JSON.parse(await runCommand(cwd, ["gh", "pr", "view", url, "--repo", `${host.host}/${host.repository}`, "--json", fields])));
  return normalizeGitLab(JSON.parse(await runCommand(cwd, ["glab", "api", "--hostname", host.host, `projects/${encodeURIComponent(request.repository)}/merge_requests/${request.number}`])));
}

// src/project-picker.ts
import { homedir } from "os";
var tildePath = (directory) => directory === homedir() || directory.startsWith(homedir() + "/") ? "~" + directory.slice(homedir().length) : directory;
function projectPickerOptions(projects, current) {
  return [...projects.filter((project) => project.directory === current), ...projects.filter((project) => project.directory !== current)].map((project) => ({
    title: project.name,
    value: project.directory,
    description: tildePath(project.directory),
    project: project.name
  }));
}

// src/projects.tsx
function createProjectActions(context, current, register, open) {
  const resolve = (input) => path5.resolve(current(), input.trim().replace(/^~(?=\/|$)/, homedir2()));
  const chooseFolder = async () => {
    let directory = current();
    while (true) {
      const entries = (await readdir(directory, {
        withFileTypes: true
      })).filter((entry) => entry.isDirectory() && !entry.name.startsWith(".")).sort((a, b) => a.name.localeCompare(b.name));
      const chosen = await pick(context, "Add local project", [{
        title: `Use ${path5.basename(directory) || directory}`,
        value: "use",
        description: tildePath(directory),
        icon: "check"
      }, {
        title: "Enter a path\u2026",
        value: "path",
        description: "Existing or new folder",
        icon: "square-pen"
      }, ...directory !== path5.dirname(directory) ? [{
        title: "..",
        value: path5.dirname(directory),
        description: tildePath(path5.dirname(directory)),
        icon: "arrow-left"
      }] : [], ...entries.map((entry) => ({
        title: entry.name,
        value: path5.join(directory, entry.name),
        icon: "folder"
      }))]);
      if (!chosen)
        return;
      if (chosen === "use")
        return directory;
      if (chosen === "path") {
        const input = await context.ui.dialog.prompt({
          title: "Project directory",
          placeholder: "/path/to/project"
        });
        if (!input?.trim())
          return;
        const target = resolve(input);
        let exists = false;
        try {
          exists = (await stat(target)).isDirectory();
        } catch (error) {
          if (error.code !== "ENOENT")
            throw error;
        }
        if (!exists) {
          if (!await context.ui.dialog.confirm({
            title: "Create project directory?",
            message: target,
            label: {
              confirm: "Create"
            }
          }))
            return;
          await mkdir(target, {
            recursive: true
          });
        }
        return target;
      }
      directory = chosen;
    }
  };
  const add = async () => {
    try {
      const source = await context.ui.dialog.select({
        title: "Add project",
        options: [{
          title: "Local folder",
          value: "local",
          description: "Choose a folder or create one"
        }, {
          title: "Git URL",
          value: "url",
          description: "Clone a repository"
        }, {
          title: "GitHub repository",
          value: "github",
          description: "Use your authenticated gh account"
        }, {
          title: "GitLab repository",
          value: "gitlab",
          description: "Use your authenticated glab account"
        }]
      });
      if (!source)
        return;
      let target;
      if (source === "local")
        target = await chooseFolder();
      else {
        let repository;
        let url;
        if (source === "url") {
          url = (await context.ui.dialog.prompt({
            title: "Clone Git repository",
            placeholder: "https://host/owner/repository.git"
          }))?.trim();
          if (!url)
            return;
          if (!/^(https?:\/\/|ssh:\/\/|git@)[^\s]+$/.test(url))
            throw new Error("Enter an HTTPS or SSH Git repository URL.");
        } else {
          try {
            const items = source === "github" ? JSON.parse(await runCommand(current(), ["gh", "repo", "list", "--limit", "100", "--json", "nameWithOwner,url"])) : JSON.parse(await runCommand(current(), ["glab", "api", "projects?membership=true&per_page=100"])).map((item) => ({
              nameWithOwner: item.path_with_namespace,
              url: item.web_url
            }));
            repository = await pick(context, source === "github" ? "GitHub repositories" : "GitLab repositories", items.map((item) => ({
              title: item.nameWithOwner,
              value: item.nameWithOwner,
              icon: "git-branch"
            })));
            if (!repository)
              return;
            url = items.find((item) => item.nameWithOwner === repository).url;
          } catch (error) {
            throw new Error(`${error instanceof Error ? error.message : String(error)}
Run ${source === "github" ? "gh auth login" : "glab auth login"} to configure access.`);
          }
        }
        const name = path5.basename(url.replace(/\.git$/, ""));
        const destination = await context.ui.dialog.prompt({
          title: "Clone destination",
          value: path5.join(path5.dirname(current()), name)
        });
        if (!destination?.trim())
          return;
        target = resolve(destination);
        context.ui.toast.show({
          variant: "info",
          message: `Cloning ${repository ?? url}\u2026`,
          duration: 60000
        });
        await runCommand(current(), source === "url" ? ["git", "clone", "--", url, target] : [source === "github" ? "gh" : "glab", "repo", "clone", url, target], 120000);
        context.ui.toast.show({
          variant: "success",
          message: "Repository cloned."
        });
      }
      if (!target)
        return;
      await register(target);
      await open(target);
    } catch (error) {
      context.ui.toast.show({
        variant: "error",
        message: error instanceof Error ? error.message : String(error),
        duration: 7000
      });
    }
  };
  return {
    add
  };
}

// src/source-control.tsx
import { createSignal as createSignal10 } from "opentui:runtime-module:solid-js";
import path6 from "path";
import { tmpdir } from "os";
import { rm } from "fs/promises";

// src/open-url.ts
function openUrlCommand(url) {
  return process.platform === "darwin" ? ["open", url] : process.platform === "win32" ? ["cmd", "/c", "start", "", url] : ["xdg-open", url];
}

// src/source-control.tsx
function createSourceControl(context, directory, active, newThread, canLeave) {
  const [links, saveLinks] = context.storage.store("thread-pr-links", {
    initial: {
      urls: {}
    }
  });
  const [settings, saveSettings] = context.storage.store("git-hosts", {
    initial: {
      gitlab: []
    }
  });
  const [repositories, setRepositories] = createSignal10({});
  const [requests, setRequests] = createSignal10({});
  const pending = new Map;
  const checked = new Map;
  const report = (error) => context.ui.toast.show({
    variant: "error",
    message: error instanceof Error ? error.message : String(error),
    duration: 7000
  });
  const refresh = (cwd, force = false) => {
    if (pending.has(cwd))
      return pending.get(cwd);
    if (!force && Date.now() - (checked.get(cwd) ?? 0) < 60000)
      return Promise.resolve();
    const operation = (async () => {
      let branch;
      try {
        branch = await runCommand(cwd, ["git", "branch", "--show-current"]);
      } catch {
        setRepositories((values) => {
          const next = {
            ...values
          };
          delete next[cwd];
          return next;
        });
        return;
      }
      let remote = "";
      try {
        remote = await runCommand(cwd, ["git", "remote", "get-url", "origin"]);
      } catch {}
      const host = parseRemote(remote, settings.gitlab);
      let request;
      let error;
      if (host && branch) {
        try {
          request = (await listRequests(cwd, host, branch))[0];
          const urls = new Set(Object.values(links.urls).filter((url) => parseRequestUrl(url)?.host === host.host));
          const results = await Promise.allSettled([...urls].map((url) => readRequest(cwd, host, url)));
          for (const result of results)
            if (result.status === "fulfilled")
              setRequests((values) => ({
                ...values,
                [result.value.url]: result.value
              }));
        } catch (cause) {
          error = cause instanceof Error ? cause.message : String(cause);
        }
      }
      setRepositories((values) => ({
        ...values,
        [cwd]: {
          branch,
          host,
          request,
          error
        }
      }));
      if (request)
        setRequests((values) => ({
          ...values,
          [request.url]: request
        }));
    })().finally(() => {
      pending.delete(cwd);
      checked.set(cwd, Date.now());
    });
    pending.set(cwd, operation);
    return operation;
  };
  const get = (session) => links.urls[session.id] ? requests()[links.urls[session.id]] : active() === session.id ? repositories()[session.location.directory]?.request : undefined;
  const openUrl = async (url) => {
    const request = parseRequestUrl(url);
    if (!request)
      throw new Error("Invalid pull request URL.");
    await runCommand(directory(), openUrlCommand(url));
  };
  const link = async (sessionID, cwd, url) => {
    await refresh(cwd);
    const host = repositories()[cwd]?.host;
    if (!host)
      throw new Error("Configure a GitHub or GitLab origin for this project first.");
    const input = url ?? await context.ui.dialog.prompt({
      title: host.kind === "gitlab" ? "Link merge request" : "Link pull request",
      placeholder: "Full request URL"
    });
    if (!input)
      return;
    const request = await readRequest(cwd, host, input.trim());
    setRequests((values) => ({
      ...values,
      [request.url]: request
    }));
    await saveLinks((draft) => {
      draft.urls[sessionID] = request.url;
    });
  };
  const checkout = async (cwd, host, request) => {
    if (!canLeave())
      return;
    if (parseRequestUrl(request.url)?.repository !== host.repository)
      throw new Error("Open this request's project before preparing its checkout.");
    const mode = await context.ui.dialog.select({
      title: `New thread from ${host.kind === "gitlab" ? "MR" : "PR"} #${request.number}`,
      options: [{
        title: "New worktree",
        value: "worktree",
        description: "Keep the current checkout and prepare a separate workspace"
      }, {
        title: "Local checkout",
        value: "local",
        description: "Switch this project's branch"
      }]
    });
    if (!mode)
      return;
    let target = cwd;
    if (mode === "local") {
      if (await runCommand(cwd, ["git", "status", "--porcelain"]))
        throw new Error("Commit or stash local changes before checking out this request.");
      if (!await context.ui.dialog.confirm({
        title: "Switch local checkout?",
        message: `${cwd}
${request.title}
Branch: ${request.branch}`,
        label: {
          confirm: "Checkout"
        }
      }))
        return;
      await runCommand(cwd, host.kind === "github" ? ["gh", "pr", "checkout", request.url] : ["glab", "mr", "checkout", request.url], 60000);
    } else {
      const destination = await context.ui.dialog.prompt({
        title: "New worktree directory",
        value: path6.join(path6.dirname(cwd), `${path6.basename(cwd)}-${host.kind === "gitlab" ? "mr" : "pr"}-${request.number}`)
      });
      if (!destination)
        return;
      target = path6.resolve(cwd, destination);
      const reference = host.kind === "github" ? `refs/pull/${request.number}/head` : `refs/merge-requests/${request.number}/head`;
      const parsed = parseRequestUrl(request.url);
      await runCommand(cwd, ["git", "fetch", `https://${host.host}/${parsed.repository}.git`, reference], 60000);
      await runCommand(cwd, ["git", "worktree", "add", "-b", `review/${host.kind}-${request.number}-${Date.now().toString(36)}`, target, "FETCH_HEAD"], 60000);
    }
    if (await newThread(target))
      context.ui.toast.show({
        variant: "success",
        message: `Checkout ready. The new draft uses ${request.branch}.`
      });
  };
  const createRequest = async (cwd, host, branch, sessionID) => {
    if (!branch)
      throw new Error("Checkout a branch before creating a request.");
    if (await runCommand(cwd, ["git", "status", "--porcelain"]))
      throw new Error("Commit your changes before creating a request.");
    const title = await context.ui.dialog.prompt({
      title: host.kind === "gitlab" ? "Merge request title" : "Pull request title"
    });
    if (!title?.trim())
      return;
    const body = await context.ui.dialog.prompt({
      title: "Request description",
      placeholder: "Describe the change"
    });
    if (body === undefined)
      return;
    const base = await context.ui.dialog.prompt({
      title: "Target branch",
      placeholder: "main"
    });
    if (!base?.trim())
      return;
    if (base.trim() === branch)
      throw new Error("Choose a target branch different from the current branch.");
    if (!await context.ui.dialog.confirm({
      title: "Push branch and create request?",
      message: `${host.host}/${host.repository}
${branch} \u2192 ${base.trim()}
${title.trim()}`,
      label: {
        confirm: "Push and create"
      }
    }))
      return;
    await runCommand(cwd, ["git", "push", "--set-upstream", "origin", branch], 60000);
    const file = path6.join(tmpdir(), `opencode-pr-${crypto.randomUUID()}.md`);
    try {
      await Bun.write(file, body);
      const result = host.kind === "github" ? await runCommand(cwd, ["gh", "pr", "create", "--repo", `${host.host}/${host.repository}`, "--head", branch, "--base", base.trim(), "--title", title.trim(), "--body-file", file], 60000) : await runCommand(cwd, ["glab", "mr", "create", "--repo", `${host.host}/${host.repository}`, "--source-branch", branch, "--target-branch", base.trim(), "--title", title.trim(), "--description", body, "--yes"], 60000);
      const url = result.match(/https:\/\/\S+\/(?:pull|\-\/merge_requests)\/\d+/)?.[0];
      if (url && sessionID)
        await link(sessionID, cwd, url);
      await refresh(cwd, true);
      context.ui.toast.show({
        variant: "success",
        message: "Request created."
      });
    } finally {
      await rm(file, {
        force: true
      });
    }
  };
  const requestMenu = async (cwd, host, request, sessionID) => {
    const choice = await context.ui.dialog.select({
      title: `${host.kind === "gitlab" ? "MR" : "PR"} #${request.number} \xB7 ${request.state}`,
      options: [{
        title: "Open in browser",
        value: "open",
        description: request.title
      }, {
        title: "New thread from checkout\u2026",
        value: "thread"
      }, ...sessionID ? [{
        title: links.urls[sessionID] === request.url ? "Unlink from thread" : "Link to thread",
        value: "link"
      }] : []]
    });
    if (choice === "open")
      await openUrl(request.url);
    if (choice === "thread")
      await checkout(cwd, host, request);
    if (choice === "link" && sessionID) {
      if (links.urls[sessionID] === request.url)
        await saveLinks((draft) => {
          delete draft.urls[sessionID];
        });
      else
        await link(sessionID, cwd, request.url);
    }
  };
  const browse = async (cwd = directory(), sessionID = active()) => {
    try {
      await refresh(cwd, true);
      const repo = repositories()[cwd];
      if (!repo?.host) {
        const action = await context.ui.dialog.select({
          title: "Source control",
          options: [{
            title: "Native workspaces",
            value: "workspaces",
            description: "Open OpenCode's workspace menu"
          }, {
            title: "Configure GitLab host",
            value: "host",
            description: "Enable your self-hosted GitLab origin"
          }]
        });
        if (action === "workspaces")
          context.keymap.dispatch("session.move");
        if (action === "host") {
          const input = await context.ui.dialog.prompt({
            title: "GitLab hostname",
            placeholder: "gitlab.example.com"
          });
          if (input && /^[a-z0-9.-]+$/i.test(input)) {
            await saveSettings((draft) => {
              if (!draft.gitlab.includes(input))
                draft.gitlab.push(input);
            });
            await refresh(cwd, true);
          }
        }
        return;
      }
      if (repo.error)
        throw new Error(`${repo.error}
Check ${repo.host.kind === "github" ? "gh auth login" : "glab auth login"}.`);
      const items = await listRequests(cwd, repo.host);
      const selected = await pick(context, repo.host.kind === "gitlab" ? "Merge requests" : "Pull requests", [...items.map((item) => ({
        title: `#${item.number} ${item.title}`,
        value: item.url,
        description: item.branch,
        icon: requestPresentation(item).icon,
        iconColor: requestPresentation(item).color
      })), ...sessionID ? [{
        title: "Link existing request\u2026",
        value: "link",
        description: "Paste a URL",
        icon: "git-pull-request"
      }] : [], ...!repo.request ? [{
        title: "Create request\u2026",
        value: "create",
        description: `Push ${repo.branch || "branch"}`,
        icon: "plus"
      }] : []]);
      if (selected === "link" && sessionID)
        await link(sessionID, cwd);
      else if (selected === "create")
        await createRequest(cwd, repo.host, repo.branch, sessionID);
      else if (selected) {
        const item = items.find((item2) => item2.url === selected);
        if (item)
          await requestMenu(cwd, repo.host, item, sessionID);
      }
    } catch (error) {
      report(error);
    }
  };
  const openRequest = async (session) => {
    try {
      const repo = repositories()[session.location.directory];
      const request = get(session);
      if (repo?.host && request)
        await requestMenu(session.location.directory, repo.host, request, session.id);
    } catch (error) {
      report(error);
    }
  };
  return {
    repositories,
    get,
    refresh,
    browse,
    link,
    openRequest,
    settings
  };
}

// src/workspace.tsx
function createWorkspace(context) {
  const [preferences, save] = context.storage.store("workspace", {
    initial: {
      settled: {},
      projects: [],
      showSettled: false,
      showSnoozed: false
    }
  });
  const threads = createThreadState(context);
  const working = createWorkingState(context);
  const [history, setHistory] = createSignal11([]);
  const [knownDirectories, setKnownDirectories] = createSignal11([]);
  const [scope, setScope] = createSignal11();
  const [loadError, setLoadError] = createSignal11();
  const [busy, setBusy] = createSignal11(false);
  const [failed, setFailed] = createSignal11(new Set);
  const [completed, setCompleted] = createSignal11(new Map);
  const [diffs, setDiffs] = context.storage.memory("thread-diffs", {
    initial: {
      stats: {}
    }
  });
  let disposed = false;
  const report = (error) => context.ui.toast.show({
    variant: "error",
    message: error instanceof Error ? error.message : String(error)
  });
  const undo = createThreadUndo(report);
  const drafts = createDrafts(context);
  const mutations = new Set;
  const persist = (mutation) => save(mutation).catch(report);
  const active = createMemo5(() => {
    const route = context.ui.router.current();
    return route.type === "session" ? route.sessionID : undefined;
  });
  const identities = new Map;
  const stable = (session) => {
    const json = JSON.stringify(session);
    const previous = identities.get(session.id);
    if (previous?.json === json)
      return previous.value;
    identities.set(session.id, {
      json,
      value: session
    });
    return session;
  };
  const sessions = createMemo5(() => {
    const all = new Map(history().map((session) => [session.id, session]));
    for (const session of context.data.session.list())
      all.set(session.id, session);
    return [...all.values()].map(stable).filter((session) => !session.parentID && !session.time.archived).sort((a, b) => Math.max(b.time.created, threads.lifecycle.anchors[b.id] ?? 0) - Math.max(a.time.created, threads.lifecycle.anchors[a.id] ?? 0) || a.id.localeCompare(b.id));
  });
  const directory = createMemo5(() => {
    const id = active();
    return sessions().find((session) => session.id === id)?.location.directory ?? context.location?.directory ?? context.data.location.default().directory;
  });
  const projects = createMemo5(() => {
    const directories = new Set([directory(), ...knownDirectories(), ...preferences.projects]);
    for (const session of sessions())
      directories.add(session.location.directory);
    return [...directories].sort((a, b) => a.localeCompare(b)).map((directory2) => ({
      directory: directory2,
      name: path7.basename(directory2) || directory2,
      sessions: sessions().filter((session) => session.location.directory === directory2 && !preferences.settled[session.id] && !threads.state.snoozed[session.id])
    }));
  });
  const visibleSessions = createMemo5(() => sessions().filter((session) => !scope() || session.location.directory === scope()));
  const activeSessions = createMemo5(() => orderActive(visibleSessions().filter((session) => !preferences.settled[session.id] && !threads.state.snoozed[session.id]), threads.state.pinned, threads.lifecycle.anchors));
  const snoozed = createMemo5(() => visibleSessions().filter((session) => threads.state.snoozed[session.id]).sort((a, b) => threads.state.snoozed[a.id] - threads.state.snoozed[b.id]));
  const settled = createMemo5(() => visibleSessions().filter((session) => preferences.settled[session.id] && !threads.state.snoozed[session.id]).sort((a, b) => preferences.settled[b.id] - preferences.settled[a.id]));
  const refresh = async () => {
    try {
      const woke = await threads.wake();
      if (woke.length)
        await persist((draft) => {
          for (const id of woke)
            delete draft.settled[id];
        });
      const knownProjects = await context.client.project.list();
      if (!disposed)
        setKnownDirectories(knownProjects.flatMap((project) => [project.canonical, ...project.sandboxes]));
      const pages = await Promise.all(knownProjects.map(async (project) => {
        const collected2 = [];
        let cursor;
        do {
          const page = await context.client.session.list({
            project: project.id,
            directory: project.canonical,
            limit: 100,
            cursor
          });
          collected2.push(...page.data);
          cursor = page.cursor.next ?? undefined;
        } while (cursor && !disposed);
        return collected2;
      }));
      const collected = pages.flat();
      if (!disposed) {
        setHistory(collected);
        setLoadError(undefined);
        const locations = new Map(collected.map((session) => [session.location.directory, session.location]));
        Promise.allSettled([...locations.values()].map((location) => context.data.location.vcs.sync(location)));
      }
    } catch (error) {
      if (!disposed)
        setLoadError(error instanceof Error ? error.message : String(error));
    }
  };
  const open = async (sessionID) => {
    try {
      await drafts.flush();
      await threads.acknowledge(sessionID);
      await visit([sessionID]);
      await context.data.session.sync(sessionID);
      context.ui.router.navigate({
        type: "session",
        sessionID
      });
    } catch (error) {
      report(error);
    }
  };
  const newThread = async (target = directory()) => {
    if (busy())
      return false;
    setBusy(true);
    try {
      return await drafts.select(target);
    } catch (error) {
      report(error);
      return false;
    } finally {
      setBusy(false);
    }
  };
  const chooseNewThread = async (local = false) => {
    if (local || projects().length <= 1) {
      await newThread();
      return;
    }
    const selected = await pick(context, "New thread in\u2026", projectPickerOptions(projects(), directory()), {
      section: "Projects",
      numbered: true,
      current: directory()
    });
    if (selected)
      await newThread(selected);
  };
  const chooseProject = async () => {
    const selected = await pick(context, "Choose draft project", projectPickerOptions(projects(), directory()), {
      section: "Projects",
      numbered: true,
      current: directory()
    });
    if (selected)
      await newThread(selected);
  };
  const registerProject = async (target) => {
    await save((draft) => {
      if (!draft.projects.includes(target))
        draft.projects.push(target);
    });
    await refresh();
  };
  const openProject = async (target) => {
    const latest = sessions().filter((session) => session.location.directory === target && !preferences.settled[session.id] && !threads.state.snoozed[session.id]).sort((a, b) => b.time.updated - a.time.updated)[0];
    if (latest)
      await open(latest.id);
    else
      await newThread(target);
  };
  const projectActions = createProjectActions(context, directory, registerProject, openProject);
  const sourceControl = createSourceControl(context, directory, active, newThread, drafts.canLeave);
  createEffect4(() => {
    sourceControl.refresh(directory());
  });
  const byId = createMemo5(() => new Map(sessions().map((session) => [session.id, session])));
  const latestAssistant = (sessionID) => {
    const latest = context.data.session.message.list(sessionID).findLast((message) => message.type === "assistant");
    return latest?.type === "assistant" ? latest : undefined;
  };
  const completedAt = (sessionID) => completed().get(sessionID) ?? latestAssistant(sessionID)?.time.completed ?? byId().get(sessionID)?.time.idle;
  const unread = (sessionID) => {
    if (threads.seen.unread[sessionID])
      return true;
    const finished = completedAt(sessionID);
    const visited = Math.max(threads.seen.visited[sessionID] ?? 0, byId().get(sessionID)?.time.viewed ?? 0);
    return finished !== undefined && visited > 0 && finished > visited;
  };
  const visit = (ids) => Promise.all(ids.filter((id) => !!id).map((id) => threads.visit([id], Math.max(Date.now(), (completedAt(id) ?? 0) + 1)))).catch(report);
  const status = (sessionID) => {
    if (context.data.session.permission.list(sessionID)?.length)
      return "Approval";
    if (context.data.session.form.list(sessionID)?.length)
      return "Input";
    if (context.data.session.status(sessionID) === "running")
      return "Working";
    const saved = byId().get(sessionID);
    if (failed().has(sessionID) || !completed().has(sessionID) && (saved?.outcome === "failed" || latestAssistant(sessionID)?.error))
      return "Failed";
    if (threads.state.woke[sessionID])
      return "Woke";
    return unread(sessionID) ? "Done" : "Idle";
  };
  const activityAt = (session) => context.data.session.message.list(session.id).findLast((message) => message.type === "user")?.time.created ?? session.time.updated;
  const liveBranch = (session) => context.data.location.vcs.info?.(session.location)?.branch.current;
  const branch = (session) => threads.seen.branches[session.id] ?? (active() === session.id || sessions().every((other) => other.id === session.id || other.location.directory !== session.location.directory) ? liveBranch(session) : undefined);
  const diffQueue = [];
  const diffPending = new Set;
  let diffRunning = 0;
  const pumpDiffs = () => {
    while (diffRunning < 2 && diffQueue.length) {
      const session = diffQueue.shift();
      const key = session.time.idle ?? session.time.updated;
      diffRunning++;
      context.client.session.diff({
        sessionID: session.id
      }).then((files) => setDiffs((draft) => {
        draft.stats[session.id] = {
          key,
          additions: files.reduce((sum, file) => sum + file.additions, 0),
          deletions: files.reduce((sum, file) => sum + file.deletions, 0)
        };
      })).catch(() => setDiffs((draft) => {
        draft.stats[session.id] = {
          key,
          additions: 0,
          deletions: 0
        };
      })).finally(() => {
        diffRunning--;
        diffPending.delete(session.id);
        if (!disposed)
          pumpDiffs();
      });
    }
  };
  const diffStat = (session) => {
    const cached = diffs.stats[session.id];
    const key = session.time.idle ?? session.time.updated;
    if (cached?.key !== key && context.data.session.status(session.id) !== "running" && !diffPending.has(session.id) && typeof context.client.session.diff === "function") {
      diffPending.add(session.id);
      diffQueue.push(session);
      queueMicrotask(pumpDiffs);
    }
    return cached && (cached.additions || cached.deletions) ? cached : undefined;
  };
  const parkedNavigation = (id) => ({
    viewed: active() === id,
    next: nextAfterPark(activeSessions(), id),
    directory: sessions().find((session) => session.id === id)?.location.directory
  });
  const navigateAfterPark = async (id, plan) => {
    if (!plan.viewed || active() !== id)
      return;
    if (plan.next && !preferences.settled[plan.next] && !threads.state.snoozed[plan.next])
      await open(plan.next);
    else if (plan.directory)
      await newThread(plan.directory);
  };
  const hasQueuedWork = (id) => context.data.session.pending.list(id).length > 0;
  const toggleSettle = async (sessionID = active()) => {
    if (!sessionID)
      return;
    if (mutations.has(sessionID))
      return;
    const restoring = !!preferences.settled[sessionID];
    if (!restoring && (["Working", "Approval", "Input"].includes(status(sessionID)) || hasQueuedWork(sessionID))) {
      context.ui.toast.show({
        variant: "info",
        message: "Finish the running work or answer its request before settling."
      });
      return;
    }
    mutations.add(sessionID);
    undo.invalidate(sessionID);
    const plan = parkedNavigation(sessionID);
    const before = threads.snapshot(sessionID);
    const settledAt = preferences.settled[sessionID];
    try {
      await threads.clear(sessionID);
      if (restoring)
        await threads.reenter(sessionID);
      else
        await threads.unpin(sessionID);
      await save((draft) => {
        if (restoring)
          delete draft.settled[sessionID];
        else
          draft.settled[sessionID] = Date.now();
      });
      if (!restoring) {
        undo.offer("Settled 1 thread", sessionID, async () => {
          await threads.restore(sessionID, before);
          await save((draft) => {
            if (settledAt === undefined)
              delete draft.settled[sessionID];
            else
              draft.settled[sessionID] = settledAt;
          });
        });
        await navigateAfterPark(sessionID, plan);
      }
    } catch (error) {
      await threads.restore(sessionID, before).catch(report);
      report(error);
    } finally {
      mutations.delete(sessionID);
    }
  };
  const snooze = async (sessionID) => {
    if (mutations.has(sessionID))
      return;
    if (["Approval", "Input"].includes(status(sessionID)) || hasQueuedWork(sessionID)) {
      context.ui.toast.show({
        variant: "info",
        message: "Answer the pending request before snoozing."
      });
      return;
    }
    mutations.add(sessionID);
    let before;
    try {
      const until = await threads.chooseSnooze();
      if (!until)
        return;
      if (["Approval", "Input"].includes(status(sessionID)) || hasQueuedWork(sessionID))
        throw new Error("This thread now needs your response and cannot be snoozed.");
      undo.invalidate(sessionID);
      const plan = parkedNavigation(sessionID);
      before = threads.snapshot(sessionID);
      const undoState = before;
      const settledAt = preferences.settled[sessionID];
      await threads.snooze(sessionID, until);
      await save((draft) => {
        delete draft.settled[sessionID];
      });
      undo.offer("Snoozed 1 thread", sessionID, async () => {
        await threads.restore(sessionID, undoState);
        await save((draft) => {
          if (settledAt === undefined)
            delete draft.settled[sessionID];
          else
            draft.settled[sessionID] = settledAt;
        });
      });
      await navigateAfterPark(sessionID, plan);
    } catch (error) {
      if (before)
        await threads.restore(sessionID, before).catch(report);
      report(error);
    } finally {
      mutations.delete(sessionID);
    }
  };
  const wake = async (sessionID) => {
    try {
      undo.invalidate(sessionID);
      await threads.clear(sessionID);
      await persist((draft) => {
        delete draft.settled[sessionID];
      });
    } catch (error) {
      report(error);
    }
  };
  const togglePin = async (sessionID) => {
    try {
      undo.invalidate(sessionID);
      const wasPinned = !!threads.state.pinned[sessionID];
      await threads.togglePin(sessionID);
      if (wasPinned)
        undo.offer("Unpinned 1 thread", sessionID, async () => {
          if (!threads.state.pinned[sessionID])
            await threads.togglePin(sessionID);
        });
      if (threads.state.pinned[sessionID] && preferences.settled[sessionID]) {
        await threads.reenter(sessionID);
        await save((draft) => {
          delete draft.settled[sessionID];
        });
      }
    } catch (error) {
      report(error);
    }
  };
  const markUnread = (sessionID) => threads.markUnread(sessionID).catch(report);
  const toggleScope = (directory2) => setScope(scope() === directory2 ? undefined : directory2);
  const remove = async (sessionID) => {
    const session = byId().get(sessionID);
    if (!session || mutations.has(sessionID))
      return;
    if (!await context.ui.dialog.confirm({
      title: "Delete thread?",
      message: `${session.title || "New thread"}
This permanently removes the conversation.`,
      label: {
        confirm: "Delete"
      }
    }))
      return;
    mutations.add(sessionID);
    try {
      const plan = parkedNavigation(sessionID);
      undo.invalidate(sessionID);
      await context.client.session.remove({
        sessionID
      });
      setHistory((current) => current.filter((item) => item.id !== sessionID));
      await navigateAfterPark(sessionID, plan);
      refresh();
    } catch (error) {
      report(error);
    } finally {
      mutations.delete(sessionID);
    }
  };
  const rename = async (sessionID = active()) => {
    if (!sessionID)
      return;
    try {
      if (active() !== sessionID)
        await open(sessionID);
      setTimeout(() => context.keymap.dispatch("session.rename"), 0);
    } catch (error) {
      report(error);
    }
  };
  {
    refresh();
    const timer = setInterval(() => void refresh(), 15000);
    const stops = [context.data.on("session.created", () => void refresh()), context.data.on("session.deleted", () => void refresh()), context.data.on("session.renamed", () => void refresh()), context.data.on("session.execution.failed", (event) => {
      setFailed((current) => new Set([...current, event.data.sessionID]));
      setCompleted((current) => {
        const next = new Map(current);
        next.delete(event.data.sessionID);
        return next;
      });
      if (active() === event.data.sessionID)
        visit([event.data.sessionID]);
      undo.invalidate(event.data.sessionID, event.created);
      threads.raiseAttention(event.data.sessionID, event.created).catch(report);
    }), context.data.on("session.execution.succeeded", (event) => {
      setCompleted((current) => new Map(current).set(event.data.sessionID, event.created));
      setFailed((current) => {
        const next = new Set(current);
        next.delete(event.data.sessionID);
        return next;
      });
      if (active() === event.data.sessionID)
        visit([event.data.sessionID]);
      undo.invalidate(event.data.sessionID, event.created);
      threads.raiseAttention(event.data.sessionID, event.created).catch(report);
    }), context.data.on("permission.asked", (event) => {
      undo.invalidate(event.data.sessionID, event.created);
      threads.raiseAttention(event.data.sessionID, event.created).catch(report);
    }), context.data.on("form.created", (event) => {
      if (event.data.form.sessionID) {
        undo.invalidate(event.data.form.sessionID, event.created);
        threads.raiseAttention(event.data.form.sessionID, event.created).catch(report);
      }
    }), context.data.on("session.execution.started", (event) => {
      setFailed((current) => {
        const next = new Set(current);
        next.delete(event.data.sessionID);
        return next;
      });
      setCompleted((current) => {
        const next = new Map(current);
        next.delete(event.data.sessionID);
        return next;
      });
      const started = byId().get(event.data.sessionID);
      if (started)
        threads.recordBranch(started.id, liveBranch(started))?.catch(report);
      undo.invalidate(event.data.sessionID, event.created);
      if (preferences.settled[event.data.sessionID])
        threads.reenter(event.data.sessionID).then(() => save((draft) => {
          delete draft.settled[event.data.sessionID];
        })).catch(report);
    })];
    onCleanup7(() => {
      disposed = true;
      clearInterval(timer);
      stops.forEach((stop) => stop());
    });
  }
  createEffect4(on2(active, (id, previous) => {
    visit([id, previous]);
  }));
  createEffect4(() => {
    const session = byId().get(active() ?? "");
    if (session)
      threads.recordBranch(session.id, liveBranch(session))?.catch(report);
  });
  const repositoryTimer = setInterval(() => void sourceControl.refresh(directory()), 60000);
  const stopRepository = context.data.on("session.execution.succeeded", () => void sourceControl.refresh(directory(), true));
  const attentionTimer = setInterval(() => {
    for (const session of sessions())
      if (threads.state.snoozed[session.id] && ["Approval", "Input"].includes(status(session.id)))
        threads.raiseAttention(session.id, Date.now()).catch(report);
  }, 1000);
  onCleanup7(() => {
    clearInterval(repositoryTimer);
    clearInterval(attentionTimer);
    stopRepository();
  });
  return {
    context,
    preferences,
    persist,
    active,
    sessions,
    activeSessions,
    visibleSessions,
    scope,
    setScope,
    toggleScope,
    projects,
    settled,
    directory,
    status,
    unread,
    activityAt,
    branch,
    diffStat,
    open,
    newThread,
    chooseNewThread,
    chooseProject,
    openProject,
    addProject: projectActions.add,
    toggleSettle,
    snooze,
    snoozed,
    wake,
    togglePin,
    markUnread,
    remove,
    threads,
    working,
    rename,
    busy,
    loadError,
    refresh,
    undo,
    drafts,
    sourceControl
  };
}

// src/native-layout.tsx
import { createEffect as createEffect5, onCleanup as onCleanup8, onMount as onMount2 } from "opentui:runtime-module:solid-js";
function mountWorkspaceLayout(node, sidebarWidth, contentWidth) {
  let host;
  let content;
  onMount2(() => {
    queueMicrotask(() => {
      host = node()?.parent ?? undefined;
      if (!host)
        return;
      host.paddingLeft = sidebarWidth();
      host.paddingTop = 3;
      content = host.getChildren().find((child) => child.visible && child !== node());
      if (content) {
        content.maxWidth = contentWidth();
        content.alignSelf = "center";
        content.width = "100%";
      }
    });
  });
  createEffect5(() => {
    const width = sidebarWidth();
    const maximum = contentWidth();
    if (host)
      host.paddingLeft = width;
    if (content)
      content.maxWidth = maximum;
  });
  onCleanup8(() => {
    if (host && !host.isDestroyed) {
      host.paddingLeft = 0;
      host.paddingTop = 0;
    }
  });
}
function mountHomeComposer(node) {
  const changed = [];
  const hasEditor = (value) => value.id.startsWith("textarea-") || value.id === "t3-composer" || value.getChildren().some(hasEditor);
  onMount2(() => {
    queueMicrotask(() => {
      const footer = node()?.parent;
      const home = footer?.parent?.getChildren().find((child) => child !== footer && child.visible);
      if (!home)
        return;
      const children = home.getChildren();
      const composer = children.find(hasEditor);
      if (!composer)
        return;
      for (const child of children) {
        changed.push({
          node: child,
          visible: child.visible
        });
        if (child === composer) {
          child.visible = true;
          child.maxWidth = 100;
          child.height = "auto";
          child.flexShrink = 0;
        } else if (child === children[0]) {
          child.height = 0;
          child.flexGrow = 1;
        } else if (child !== children[0])
          child.visible = false;
      }
    });
  });
  onCleanup8(() => {
    for (const value of changed)
      if (!value.node.isDestroyed) {
        value.node.visible = value.visible;
      }
  });
}

// src/composer.tsx
import { insert as _$insert9 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createComponent as _$createComponent10 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { memo as _$memo9 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { effect as _$effect10 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { use as _$use5 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { setProp as _$setProp10 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createElement as _$createElement10 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { Show as Show6, createEffect as createEffect7, createSignal as createSignal13, onCleanup as onCleanup10, onMount as onMount4, untrack as untrack2 } from "opentui:runtime-module:solid-js";
import path8 from "path";

// src/composer-surface.tsx
import { effect as _$effect8 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { insert as _$insert7 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { setProp as _$setProp8 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createElement as _$createElement8 } from "opentui:runtime-module:%40opentui%2Fsolid";
function ComposerSurface(props) {
  return (() => {
    var _el$ = _$createElement8("box");
    _$setProp8(_el$, "width", "100%");
    _$setProp8(_el$, "flexShrink", 0);
    _$setProp8(_el$, "paddingLeft", 2);
    _$setProp8(_el$, "paddingRight", 2);
    _$insert7(_el$, () => props.children);
    _$effect8((_p$) => {
      var _v$ = props.color ?? colors.composer, _v$2 = props.paddingTop ?? 1, _v$3 = props.paddingBottom ?? 1;
      _v$ !== _p$.e && (_p$.e = _$setProp8(_el$, "backgroundColor", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = _$setProp8(_el$, "paddingTop", _v$2, _p$.t));
      _v$3 !== _p$.a && (_p$.a = _$setProp8(_el$, "paddingBottom", _v$3, _p$.a));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined
    });
    return _el$;
  })();
}

// src/composer-controls.tsx
import { insert as _$insert8 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { memo as _$memo8 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { effect as _$effect9 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createTextNode as _$createTextNode4 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { insertNode as _$insertNode6 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { setProp as _$setProp9 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createElement as _$createElement9 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { createComponent as _$createComponent9 } from "opentui:runtime-module:%40opentui%2Fsolid";
import { Show as Show5 } from "opentui:runtime-module:solid-js";
function ComposerControls(props) {
  const narrow = () => props.width < 66;
  const permissionLabel = () => props.permission === "autoaccept" ? "Auto accept" : "Ask";
  const modelWidth = () => Math.min(Bun.stringWidth(props.model) + 3 + (props.modelIcon ? 3 : 0), Math.max(1, props.width - (props.resting ? 0 : 8) - Bun.stringWidth(props.agent) - 6 - (narrow() ? 0 : Bun.stringWidth(props.variant) + Bun.stringWidth(permissionLabel()) + 12)));
  const dispatch = (command2) => () => {
    props.expand();
    props.context.keymap.dispatch(command2);
  };
  const options = () => [_$createComponent9(Button, {
    id: "t3-variant",
    compact: true,
    get color() {
      return colors.secondary;
    },
    get label() {
      return props.variant;
    },
    trailing: "chevron-down",
    get run() {
      return dispatch("variant.list");
    }
  }), (() => {
    var _el$ = _$createElement9("text");
    _$insertNode6(_el$, _$createTextNode4(`\u2502`));
    _$setProp9(_el$, "selectable", false);
    _$setProp9(_el$, "height", 1);
    _$effect9((_$p) => _$setProp9(_el$, "fg", colors.border, _$p));
    return _el$;
  })(), _$createComponent9(Button, {
    id: "t3-permissions",
    compact: true,
    get color() {
      return colors.secondary;
    },
    get label() {
      return permissionLabel();
    },
    get icon() {
      return props.permission === "autoaccept" ? "lock-keyhole-open" : "lock-keyhole";
    },
    iconWidth: 2,
    trailing: "chevron-down",
    get run() {
      return dispatch("opencode.settings");
    }
  })];
  return (() => {
    var _el$3 = _$createElement9("box"), _el$4 = _$createElement9("box"), _el$7 = _$createElement9("text");
    _$insertNode6(_el$3, _el$4);
    _$setProp9(_el$3, "gap", 1);
    _$setProp9(_el$3, "flexShrink", 0);
    _$insertNode6(_el$4, _el$7);
    _$setProp9(_el$4, "height", 1);
    _$setProp9(_el$4, "flexDirection", "row");
    _$setProp9(_el$4, "gap", 1);
    _$insert8(_el$4, _$createComponent9(Button, {
      id: "t3-model",
      compact: true,
      get label() {
        return props.model;
      },
      get icon() {
        return props.modelIcon;
      },
      iconWidth: 2,
      trailing: "chevron-down",
      get width() {
        return modelWidth();
      },
      get color() {
        return colors.text;
      },
      get run() {
        return dispatch("model.list");
      }
    }), _el$7);
    _$insert8(_el$4, _$createComponent9(Show5, {
      get when() {
        return !narrow();
      },
      get children() {
        return [(() => {
          var _el$5 = _$createElement9("text");
          _$insertNode6(_el$5, _$createTextNode4(`\u2502`));
          _$setProp9(_el$5, "selectable", false);
          _$setProp9(_el$5, "height", 1);
          _$effect9((_$p) => _$setProp9(_el$5, "fg", colors.border, _$p));
          return _el$5;
        })(), _$memo8(() => options())];
      }
    }), _el$7);
    _$insertNode6(_el$7, _$createTextNode4(`\u2502`));
    _$setProp9(_el$7, "selectable", false);
    _$setProp9(_el$7, "height", 1);
    _$insert8(_el$4, _$createComponent9(Button, {
      id: "t3-agent",
      compact: true,
      get color() {
        return colors.text;
      },
      get label() {
        return props.agent;
      },
      trailing: "chevron-down",
      get run() {
        return dispatch("agent.list");
      }
    }), null);
    _$insert8(_el$3, _$createComponent9(Show5, {
      get when() {
        return _$memo8(() => !!narrow())() && !props.resting;
      },
      get children() {
        var _el$9 = _$createElement9("box");
        _$setProp9(_el$9, "height", 1);
        _$setProp9(_el$9, "flexDirection", "row");
        _$setProp9(_el$9, "gap", 1);
        _$insert8(_el$9, options);
        return _el$9;
      }
    }), null);
    _$effect9((_$p) => _$setProp9(_el$7, "fg", colors.border, _$p));
    return _el$3;
  })();
}

// src/composer-resting.tsx
import { createEffect as createEffect6, createSignal as createSignal12, onCleanup as onCleanup9, onMount as onMount3 } from "opentui:runtime-module:solid-js";
var inside = (node, x, y) => !!node && x >= node.x && x < node.x + node.width && y >= node.y && y < node.y + node.height;
function createComposerResting(context, sessionID, card, editor) {
  const [resting, setResting] = createSignal12(false);
  const expand = () => setResting(false);
  createEffect6(() => {
    const id = sessionID();
    if (!id || context.data.session.permission.list(id)?.length || context.data.session.form.list(id)?.length)
      expand();
  });
  createEffect6(() => {
    const input = editor();
    if (!input)
      return;
    input.editBuffer.on("content-changed", expand);
    input.on("focused", expand);
    onCleanup9(() => {
      input.editBuffer.off("content-changed", expand);
      input.off("focused", expand);
    });
  });
  onMount3(() => {
    const root = context.renderer.root;
    const previous = root.onMouseScroll;
    const handleScroll = (event) => {
      previous?.call(root, event);
      if (!sessionID() || event.modifiers.ctrl || event.modifiers.shift)
        return;
      const input = editor(), surface = card();
      if (!input || !surface || input.plainText.includes(`
`))
        return;
      let timeline;
      let target = event.target;
      while (target && target.id !== "session-pane") {
        if (!timeline && target.id.startsWith("scrollbox-") && target.visible && target.x >= surface.x && target.y < surface.y && target.width >= surface.width && inside(target, event.x, event.y))
          timeline = target;
        target = target.parent;
      }
      if (!target || !timeline || timeline.scrollHeight <= timeline.viewport.height)
        return;
      if (event.scroll?.direction === "up")
        setResting(true);
      else if (event.scroll?.direction === "down" && timeline.scrollTop + timeline.viewport.height >= timeline.scrollHeight)
        expand();
    };
    root.onMouseScroll = handleScroll;
    onCleanup9(() => {
      if (root.onMouseScroll === handleScroll)
        root.onMouseScroll = previous;
    });
  });
  return {
    resting,
    expand
  };
}

// src/native-completion.tsx
import { Yoga } from "opentui:runtime-module:%40opentui%2Fcore";
var {
  Edge,
  Unit
} = Yoga;
var children = (node) => node.getChildren().flatMap((child) => [child, ...children(child)]);
var text = (node) => node.textNode?.toChunks().map((chunk) => chunk.text).join("") ?? "";
var textsOf = (row) => children(row).filter((node) => node.id.startsWith("text-"));
var emptyText = {
  textNode: undefined
};
var styleable = (row) => {
  const texts = textsOf(row);
  return texts.length >= 2 && text(texts[0]).trimStart().startsWith("/");
};
var displayedText = (node) => node.chunks.map((chunk) => chunk.text).join("");
var dimension = (value) => value.unit === Unit.Point ? value.value : value.unit === Unit.Percent ? `${value.value}%` : "auto";
var padding = (value) => value.unit === Unit.Percent ? `${value.value}%` : value.unit === Unit.Point ? value.value : 0;
var saveBox = (box) => {
  const layout = box.getLayoutNode();
  return {
    width: dimension(layout.getWidth()),
    height: dimension(layout.getHeight()),
    backgroundColor: box.backgroundColor,
    paddingLeft: padding(layout.getPadding(Edge.Left)),
    paddingRight: padding(layout.getPadding(Edge.Right)),
    paddingTop: padding(layout.getPadding(Edge.Top)),
    paddingBottom: padding(layout.getPadding(Edge.Bottom))
  };
};
function mountCompletionMenu(prompt, composer) {
  const list = children(prompt).find((node) => node.id.startsWith("scrollbox-") && node.getChildren().some((row) => text(textsOf(row)[0] ?? emptyText).trimStart().startsWith("/")));
  const popup = list?.parent;
  if (!list || !popup)
    return;
  const before = popup.onLifecyclePass;
  const saved = {
    ...saveBox(popup),
    border: popup.border,
    left: popup.left,
    top: popup.top,
    bottom: popup.bottom
  };
  const savedList = saveBox(list);
  const rows = new Map;
  let selected;
  popup.border = false;
  popup.backgroundColor = colors.composer;
  popup.paddingLeft = popup.paddingRight = popup.paddingTop = popup.paddingBottom = 1;
  list.height = "100%";
  list.backgroundColor = colors.composer;
  popup.onLifecyclePass = function() {
    before?.call(this);
    for (const row of rows.keys())
      if (row.isDestroyed)
        rows.delete(row);
    const left = composer.x + 2 - (popup.parent?.x ?? 0);
    const width = Math.max(1, composer.width - 4);
    const visibleRows = list.getChildren().filter((row) => row.visible);
    const rowHeight = (row) => rows.has(row) || styleable(row) ? 2 : Math.max(1, row.height);
    const height = Math.max(2, Math.min(16, visibleRows.reduce((sum, row) => sum + rowHeight(row), 0) + 2, composer.y - 4));
    const top = composer.y - height - (popup.parent?.y ?? 0);
    if (popup.left !== left)
      popup.left = left;
    popup.width = width;
    popup.height = height;
    list.height = height - 2;
    if (popup.bottom !== "auto")
      popup.bottom = "auto";
    if (popup.top !== top)
      popup.top = top;
    const options = list.getChildren();
    const active = options.find((row) => row.backgroundColor?.a);
    if (active && active !== selected) {
      selected = active;
      const itemTop = options.slice(0, options.indexOf(active)).filter((row) => row.visible).reduce((sum, row) => sum + rowHeight(row), 0);
      const itemHeight = rowHeight(active);
      if (itemTop < list.scrollTop)
        list.scrollTop = itemTop;
      else if (itemTop + itemHeight > list.scrollTop + list.viewport.height)
        list.scrollTop = itemTop + itemHeight - list.viewport.height;
    }
    for (const node of list.getChildren()) {
      if (rows.has(node))
        continue;
      const row = node;
      if (!styleable(row))
        continue;
      const texts = textsOf(row);
      const labels = [texts[0], texts.at(-1)];
      const savedRow = saveBox(row);
      const savedLabels = labels.map((label) => ({
        content: text(label),
        fg: label.fg,
        wrapMode: label.wrapMode,
        width: dimension(label.getLayoutNode().getWidth())
      }));
      const original = row.onLifecyclePass;
      rows.set(row, () => {
        row.onLifecyclePass = original;
        if (!original)
          row.ctx.unregisterLifecyclePass(row);
        Object.assign(row, savedRow);
        labels.forEach((label, index) => {
          if (!label.isDestroyed)
            Object.assign(label, savedLabels[index]);
        });
      });
      row.height = 2;
      row.paddingLeft = row.paddingRight = 1;
      row.paddingBottom = 1;
      row.onLifecyclePass = function() {
        original?.call(this);
        if (row.backgroundColor?.a)
          row.backgroundColor = colors.surface;
        const name = text(labels[0]).trimEnd();
        if (displayedText(labels[0]) !== name)
          labels[0].content = name;
        labels[0].width = Bun.stringWidth(name) + 1;
        labels[0].fg = colors.text;
        const description = fitLabel(text(labels[1]).trimStart(), Math.max(1, composer.width - Bun.stringWidth(name) - 9));
        if (displayedText(labels[1]) !== description)
          labels[1].content = description;
        labels[1].fg = colors.secondary;
        labels[1].wrapMode = "none";
      };
      row.ctx.registerLifecyclePass(row);
    }
  };
  popup.ctx.registerLifecyclePass(popup);
  return () => {
    if (!popup.isDestroyed) {
      popup.onLifecyclePass = before;
      if (!before)
        popup.ctx.unregisterLifecyclePass(popup);
      Object.assign(popup, saved);
    }
    if (!list.isDestroyed)
      Object.assign(list, savedList);
    for (const [row, restore] of rows)
      if (!row.isDestroyed)
        restore();
  };
}

// src/composer.tsx
function Composer(props) {
  let card;
  let editorHost;
  let input;
  let originalParent;
  let nativeBody;
  let nativeBottom;
  const [labels, setLabels] = createSignal13([]);
  const [cardWidth, setCardWidth] = createSignal13(80);
  const [permission, setPermission] = createSignal13("prompt");
  const [nativeEditor, setNativeEditor] = createSignal13();
  const [hasDraft, setHasDraft] = createSignal13(false);
  const {
    resting,
    expand
  } = createComposerResting(props.context, () => props.sessionID, () => card, nativeEditor);
  const running = () => !!props.sessionID && props.context.data.session.status(props.sessionID) === "running";
  const location = () => props.sessionID ? props.context.data.session.get(props.sessionID)?.location : props.context.location;
  const model = () => labels()[1] || "Select model";
  const variant = () => labels()[3] || "Default";
  const modelIcon = () => {
    const providers = new Set(props.context.data.location.model.list(location())?.filter((value) => value.name === model()).map((value) => value.providerID));
    return providers.size === 1 ? providerIcon([...providers][0]) : undefined;
  };
  const descendants = (node) => node.getChildren().flatMap((child) => [child, ...descendants(child)]);
  createEffect7(() => {
    const editor = nativeEditor();
    const drafts = props.workspace?.drafts;
    const directory = location()?.directory;
    if (!editor || !drafts || props.sessionID || !directory)
      return;
    drafts.selected();
    untrack2(() => void drafts.initialize(editor, directory).catch((error) => props.context.ui.toast.show({
      variant: "error",
      message: String(error)
    })));
    const original = editor.onContentChange;
    const detach = untrack2(() => drafts.attach(editor, directory));
    editor.onContentChange = (event) => {
      original?.(event);
      drafts.changed();
    };
    onCleanup10(() => {
      detach();
      if (!editor.isDestroyed)
        editor.onContentChange = original;
    });
  });
  createEffect7(() => {
    const editor = nativeEditor();
    if (!editor)
      return;
    editor.minHeight = resting() ? 1 : 4;
    editor.maxHeight = resting() ? 1 : 10;
    editor.wrapMode = resting() ? "none" : "word";
    const placeholder = props.mode === "shell" ? "Run a command\u2026" : "Ask anything, @tag files or / for commands";
    editor.placeholder = resting() ? fitLabel(placeholder, Math.max(1, cardWidth() - 12)) : placeholder;
  });
  onMount4(() => {
    let timer;
    let restoreCompletion;
    queueMicrotask(() => {
      const prompt = card?.parent?.parent;
      if (prompt)
        prompt.backgroundColor = colors.background;
      if (card?.parent)
        card.parent.backgroundColor = colors.background;
      const native = prompt?.getChildren().filter((child) => child.visible) ?? [];
      const body = native[0];
      const bottom = native[1];
      if (!body || !editorHost)
        return;
      const nodes = descendants(body);
      input = nodes.find((node) => node.id.startsWith("textarea-"));
      if (!input)
        return;
      originalParent = input.parent ?? undefined;
      originalParent?.remove(input);
      editorHost.add(input);
      input.width = "100%";
      input.backgroundColor = colors.composer;
      input.focusedBackgroundColor = colors.composer;
      setNativeEditor(input);
      if (prompt?.parent && card)
        restoreCompletion = mountCompletionMenu(prompt.parent, card);
      nativeBody = body;
      nativeBottom = bottom;
      body.visible = false;
      if (bottom)
        bottom.visible = false;
      const update = () => {
        setHasDraft(!!input?.plainText.trim());
        if (!restoreCompletion && prompt?.parent && card)
          restoreCompletion = mountCompletionMenu(prompt.parent, card);
        const textNodes = descendants(body).filter((node) => node.id.startsWith("text-"));
        const raw = textNodes.map((node) => node.textNode.toChunks().map((chunk) => chunk.text).join("").trim());
        setPermission(raw.includes("auto") ? "autoaccept" : "prompt");
        const values = raw.filter((text2) => text2 && text2 !== "\xB7" && text2 !== "auto");
        setLabels((current) => JSON.stringify(current) === JSON.stringify(values) ? current : values);
      };
      update();
      timer = setInterval(update, 250);
      input.focus();
    });
    onCleanup10(() => {
      clearInterval(timer);
      restoreCompletion?.();
      if (nativeBody && !nativeBody.isDestroyed)
        nativeBody.visible = true;
      if (nativeBottom && !nativeBottom.isDestroyed)
        nativeBottom.visible = true;
      if (input && !input.isDestroyed && originalParent && !originalParent.isDestroyed) {
        input.parent?.remove(input);
        originalParent.add(input);
      }
    });
  });
  return (() => {
    var _el$ = _$createElement10("box");
    _$use5((node) => {
      card = node;
    }, _el$);
    _$setProp10(_el$, "id", "t3-composer");
    _$setProp10(_el$, "onSizeChange", function() {
      setCardWidth(this.width);
    });
    _$setProp10(_el$, "width", "100%");
    _$setProp10(_el$, "flexShrink", 0);
    _$setProp10(_el$, "gap", 0);
    _$setProp10(_el$, "onMouseDown", (event) => {
      if (event.button === 0)
        expand();
    });
    _$insert9(_el$, _$createComponent10(ComposerSurface, {
      get children() {
        return [(() => {
          var _el$2 = _$createElement10("box");
          _$use5((node) => {
            editorHost = node;
          }, _el$2);
          _$setProp10(_el$2, "flexShrink", 0);
          _$effect10((_p$) => {
            var _v$ = resting() ? 1 : 4, _v$2 = resting() ? 8 : 0;
            _v$ !== _p$.e && (_p$.e = _$setProp10(_el$2, "minHeight", _v$, _p$.e));
            _v$2 !== _p$.t && (_p$.t = _$setProp10(_el$2, "paddingRight", _v$2, _p$.t));
            return _p$;
          }, {
            e: undefined,
            t: undefined
          });
          return _el$2;
        })(), _$createComponent10(Show6, {
          get when() {
            return !resting();
          },
          get children() {
            var _el$3 = _$createElement10("box");
            _$setProp10(_el$3, "paddingRight", 8);
            _$setProp10(_el$3, "flexShrink", 0);
            _$insert9(_el$3, _$createComponent10(ComposerControls, {
              get context() {
                return props.context;
              },
              get model() {
                return model();
              },
              get modelIcon() {
                return modelIcon();
              },
              get variant() {
                return variant();
              },
              get permission() {
                return permission();
              },
              get agent() {
                return labels()[0] || "Agent";
              },
              get width() {
                return cardWidth() - 4;
              },
              resting: false,
              expand
            }));
            return _el$3;
          }
        }), (() => {
          var _el$4 = _$createElement10("box");
          _$setProp10(_el$4, "position", "absolute");
          _$setProp10(_el$4, "right", 2);
          _$setProp10(_el$4, "bottom", 1);
          _$setProp10(_el$4, "height", 1);
          _$setProp10(_el$4, "flexDirection", "row");
          _$setProp10(_el$4, "gap", 1);
          _$setProp10(_el$4, "zIndex", 1);
          _$insert9(_el$4, _$createComponent10(Button, {
            id: "t3-attach",
            label: "",
            icon: "paperclip",
            width: 3,
            run: () => {
              expand();
              input?.focus();
              input?.insertText("@");
            }
          }), null);
          _$insert9(_el$4, _$createComponent10(Button, {
            id: "t3-send",
            label: "",
            get icon() {
              return running() ? "square" : "arrow-up";
            },
            width: 3,
            get color() {
              return _$memo9(() => !!running())() ? colors.pink : colors.text;
            },
            get background() {
              return colors.surface;
            },
            get disabled() {
              return _$memo9(() => !!!running())() && !hasDraft();
            },
            run: () => props.context.keymap.dispatch(running() ? "session.interrupt" : "prompt.submit")
          }), null);
          return _el$4;
        })()];
      }
    }), null);
    _$insert9(_el$, _$createComponent10(Show6, {
      get when() {
        return resting();
      },
      get children() {
        var _el$5 = _$createElement10("box");
        _$setProp10(_el$5, "alignSelf", "center");
        _$setProp10(_el$5, "flexShrink", 0);
        _$insert9(_el$5, _$createComponent10(ComposerSurface, {
          get color() {
            return colors.surface;
          },
          paddingTop: 0,
          paddingBottom: 0,
          get children() {
            return _$createComponent10(ComposerControls, {
              get context() {
                return props.context;
              },
              get model() {
                return model();
              },
              get modelIcon() {
                return modelIcon();
              },
              get variant() {
                return variant();
              },
              get permission() {
                return permission();
              },
              get agent() {
                return labels()[0] || "Agent";
              },
              get width() {
                return cardWidth() - 8;
              },
              resting: true,
              expand
            });
          }
        }));
        _$effect10((_$p) => _$setProp10(_el$5, "width", Math.max(0, cardWidth() - 4), _$p));
        return _el$5;
      }
    }), null);
    _$insert9(_el$, _$createComponent10(Show6, {
      get when() {
        return !props.sessionID;
      },
      get children() {
        var _el$6 = _$createElement10("box");
        _$setProp10(_el$6, "paddingLeft", 2);
        _$setProp10(_el$6, "paddingRight", 2);
        _$setProp10(_el$6, "paddingTop", 1);
        _$setProp10(_el$6, "paddingBottom", 1);
        _$setProp10(_el$6, "flexDirection", "row");
        _$setProp10(_el$6, "justifyContent", "space-between");
        _$setProp10(_el$6, "gap", 1);
        _$insert9(_el$6, _$createComponent10(Button, {
          id: "t3-composer-project",
          get label() {
            return path8.basename(location()?.directory ?? "Project");
          },
          icon: "folder",
          iconWidth: 2,
          trailing: "chevron-down",
          get width() {
            return Math.min(22, Math.max(12, cardWidth() - 20));
          },
          run: () => props.context.keymap.dispatch("t3.projects")
        }));
        return _el$6;
      }
    }), null);
    return _el$;
  })();
}

// src/index.tsx
function WorkspaceShell(props) {
  const workspace = props.workspace;
  let anchor;
  const [width, setWidth] = createSignal14(workspace.context.renderer.width);
  const [showSidebar, setShowSidebar] = createSignal14(width() >= 72);
  const sidebarWidth = () => showSidebar() && width() >= 72 ? SIDEBAR_WIDTH : 0;
  const contentWidth = () => Math.min(90, width() - sidebarWidth() - 4);
  mountWorkspaceLayout(() => anchor, sidebarWidth, contentWidth);
  onMount5(() => {
    const resize = () => setWidth(workspace.context.renderer.width);
    workspace.context.renderer.on("resize", resize);
    onCleanup11(() => workspace.context.renderer.off("resize", resize));
    if (process.env.T3_TERMINAL_INSPECT)
      setTimeout(() => {
        const tree = (node) => ({
          id: node.id,
          type: node.constructor.name,
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
          visible: node.visible,
          border: node.border,
          background: node.backgroundColor?.toString(),
          text: node.textNode?.toChunks().map((chunk) => chunk.text).join(""),
          children: node.getChildren().map(tree)
        });
        Bun.write(process.env.T3_TERMINAL_INSPECT, JSON.stringify(tree(workspace.context.renderer.root), null, 2));
        Bun.write(process.env.T3_TERMINAL_INSPECT + ".commands", JSON.stringify(workspace.context.keymap.commands().map((command2) => ({
          id: command2.id,
          title: command2.title
        })), null, 2));
        Bun.write(process.env.T3_TERMINAL_INSPECT + ".terminal", JSON.stringify({
          capabilities: workspace.context.renderer.capabilities,
          resolution: workspace.context.renderer.resolution
        }, null, 2));
      }, Number(process.env.T3_TERMINAL_INSPECT_DELAY ?? 1500));
  });
  workspace.context.keymap.layer(() => ({
    mode: "global",
    commands: [{
      id: "t3.sidebar",
      title: "Toggle project sidebar",
      group: "Workspace",
      bind: "ctrl+b",
      palette: true,
      slash: {
        name: "workspace"
      },
      run: () => {
        setShowSidebar((value) => !value);
      }
    }, {
      id: "t3.new",
      title: "New thread in\u2026",
      group: "Workspace",
      bind: "ctrl+n",
      palette: true,
      slash: {
        name: "new-thread"
      },
      run: () => workspace.chooseNewThread()
    }, {
      id: "t3.new-local",
      title: "New thread in current project",
      group: "Workspace",
      bind: "ctrl+shift+n",
      palette: true,
      run: () => workspace.chooseNewThread(true)
    }, {
      id: "t3.project",
      title: "Add project",
      group: "Workspace",
      palette: true,
      slash: {
        name: "project"
      },
      run: workspace.addProject
    }, {
      id: "t3.scope",
      title: "Filter threads by project",
      group: "Workspace",
      palette: true,
      run: async () => {
        const selected = await pick(workspace.context, "Filter threads by project", [{
          title: "All projects",
          value: "all",
          icon: "folder"
        }, ...projectPickerOptions(workspace.projects(), workspace.directory())], {
          section: "Projects",
          numbered: true,
          current: workspace.scope() ?? "all"
        });
        if (selected)
          workspace.setScope(selected === "all" ? undefined : selected);
      }
    }, {
      id: "t3.projects",
      title: "Choose draft project",
      group: "Workspace",
      bind: "ctrl+shift+p",
      palette: true,
      slash: {
        name: "projects"
      },
      run: workspace.chooseProject
    }, {
      id: "t3.prs",
      title: "Pull / merge requests",
      group: "Workspace",
      palette: true,
      slash: {
        name: "prs"
      },
      run: () => workspace.sourceControl.browse()
    }, {
      id: "t3.snooze",
      title: "Snooze thread",
      group: "Workspace",
      palette: true,
      slash: {
        name: "snooze"
      },
      enabled: !!workspace.active(),
      run: async () => {
        if (workspace.active())
          await workspace.snooze(workspace.active());
      }
    }, {
      id: "t3.undo",
      title: "Undo thread action",
      group: "Workspace",
      bind: "ctrl+shift+z",
      palette: true,
      enabled: !!workspace.undo.notice(),
      run: workspace.undo.undo
    }, {
      id: "t3.settle",
      title: workspace.preferences.settled[workspace.active() ?? ""] ? "Un-settle thread" : "Settle thread",
      group: "Workspace",
      bind: "ctrl+shift+s",
      palette: true,
      slash: {
        name: "settle"
      },
      enabled: !!workspace.active(),
      run: () => workspace.toggleSettle()
    }, {
      id: "t3.rename",
      title: "Rename thread",
      group: "Workspace",
      palette: true,
      slash: {
        name: "rename-thread"
      },
      enabled: !!workspace.active(),
      run: workspace.rename
    }, {
      id: "t3.refresh",
      title: "Refresh workspace",
      group: "Workspace",
      palette: true,
      slash: {
        name: "refresh"
      },
      run: workspace.refresh
    }, {
      id: "t3.activity",
      title: "Thread activity",
      group: "Workspace",
      palette: true,
      run: async () => {
        const selected = await pick(workspace.context, "Thread activity", workspace.sessions().filter((session) => workspace.status(session.id) !== "Idle").map((session) => ({
          title: session.title || "New thread",
          value: session.id,
          project: path9.basename(session.location.directory),
          description: workspace.status(session.id).toLowerCase()
        })));
        if (selected)
          await workspace.open(selected);
      }
    }, {
      id: "t3.search",
      title: "Find thread",
      group: "Workspace",
      bind: "ctrl+k",
      palette: true,
      slash: {
        name: "threads"
      },
      run: async () => {
        const selected = await pick(workspace.context, "Threads", workspace.visibleSessions().map((session) => ({
          title: session.title || "New thread",
          value: session.id,
          project: path9.basename(session.location.directory),
          description: `${path9.basename(session.location.directory)} \xB7 ${(workspace.threads.state.snoozed[session.id] ? "Snoozed" : workspace.preferences.settled[session.id] ? "Settled" : workspace.status(session.id)).toLowerCase()}`
        })));
        if (selected)
          await workspace.open(selected);
      }
    }]
  }));
  const title = () => workspace.sessions().find((session) => session.id === workspace.active())?.title || "New thread";
  return [(() => {
    var _el$ = _$createElement11("box");
    _$use6((node) => {
      anchor = node;
    }, _el$);
    _$setProp11(_el$, "position", "absolute");
    _$setProp11(_el$, "left", 0);
    _$setProp11(_el$, "top", 0);
    _$setProp11(_el$, "width", 0);
    _$setProp11(_el$, "height", 0);
    return _el$;
  })(), _$createComponent11(Show7, {
    get when() {
      return sidebarWidth() || showSidebar();
    },
    get children() {
      return _$createComponent11(Sidebar, {
        workspace,
        get width() {
          return sidebarWidth() || Math.min(SIDEBAR_WIDTH, width());
        }
      });
    }
  }), (() => {
    var _el$2 = _$createElement11("box"), _el$3 = _$createElement11("text");
    _$insertNode7(_el$2, _el$3);
    _$setProp11(_el$2, "position", "absolute");
    _$setProp11(_el$2, "right", 0);
    _$setProp11(_el$2, "top", 0);
    _$setProp11(_el$2, "height", 3);
    _$setProp11(_el$2, "border", ["bottom"]);
    _$setProp11(_el$2, "paddingLeft", 2);
    _$setProp11(_el$2, "paddingRight", 2);
    _$setProp11(_el$2, "paddingTop", 1);
    _$setProp11(_el$2, "flexDirection", "row");
    _$setProp11(_el$2, "gap", 1);
    _$insert10(_el$2, _$createComponent11(Show7, {
      get when() {
        return !sidebarWidth();
      },
      get children() {
        return _$createComponent11(Button, {
          id: "t3-sidebar-open",
          label: "",
          icon: "panel-left-open",
          width: 3,
          run: () => setShowSidebar((value) => !value)
        });
      }
    }), _el$3);
    _$insert10(_el$2, _$createComponent11(SingleLine, {
      get text() {
        return path9.basename(workspace.directory());
      },
      get color() {
        return colors.muted;
      },
      get width() {
        return Math.min(12, Bun.stringWidth(path9.basename(workspace.directory())));
      }
    }), _el$3);
    _$insertNode7(_el$3, _$createTextNode5(`/`));
    _$setProp11(_el$3, "selectable", false);
    _$setProp11(_el$3, "width", 1);
    _$setProp11(_el$3, "flexShrink", 0);
    _$insert10(_el$2, _$createComponent11(SingleLine, {
      get text() {
        return title();
      },
      get color() {
        return colors.text;
      },
      bold: true,
      flexGrow: 1
    }), null);
    _$effect11((_p$) => {
      var _v$ = sidebarWidth(), _v$2 = colors.border, _v$3 = colors.muted;
      _v$ !== _p$.e && (_p$.e = _$setProp11(_el$2, "left", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = _$setProp11(_el$2, "borderColor", _v$2, _p$.t));
      _v$3 !== _p$.a && (_p$.a = _$setProp11(_el$3, "fg", _v$3, _p$.a));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined
    });
    return _el$2;
  })()];
}
var src_default = Plugin.define({
  id: "local.t3-terminal",
  setup(context) {
    useTheme(context);
    const [workspace, setWorkspace] = createSignal14();
    context.ui.slot({
      append: "app",
      render: () => {
        const state = untrack3(() => createWorkspace(context));
        setWorkspace(state);
        return _$createComponent11(WorkspaceShell, {
          workspace: state
        });
      }
    });
    context.ui.slot({
      replace: "home.footer",
      render: () => {
        let footer;
        mountHomeComposer(() => footer);
        return (() => {
          var _el$5 = _$createElement11("box");
          _$use6((node) => {
            footer = node;
          }, _el$5);
          _$setProp11(_el$5, "height", 1);
          return _el$5;
        })();
      }
    });
    context.ui.slot({
      replace: "prompt.footer",
      render: (props) => _$createComponent11(Composer, _$mergeProps2({
        context,
        get workspace() {
          return workspace();
        }
      }, props))
    });
  }
});
export {
  src_default as default
};
