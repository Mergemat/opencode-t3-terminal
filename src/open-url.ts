/** Opens a URL with the platform's default handler. */
export function openUrlCommand(url: string) {
  return process.platform === "darwin" ? ["open", url] : process.platform === "win32" ? ["cmd", "/c", "start", "", url] : ["xdg-open", url];
}
