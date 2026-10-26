export type Theme = "light" | "dark" | "midnight";
// A new preference key discards the discontinued red/cream palettes on first visit.
export const THEME_STORAGE_KEY = "hp-theme-v2";
export const DEFAULT_THEME: Theme = "midnight";
export function isTheme(value: unknown): value is Theme { return value === "light" || value === "dark" || value === "midnight"; }
export const THEME_INIT_SCRIPT = '(function(){var t;try{t=localStorage.getItem("hp-theme-v2")}catch(e){}document.documentElement.dataset.theme=["light","dark","midnight"].indexOf(t)>=0?t:"midnight";var m;try{m=localStorage.getItem("hp-motion")}catch(e){}document.documentElement.dataset.motion=m==="on"||m==="off"?m:"auto"})()';
