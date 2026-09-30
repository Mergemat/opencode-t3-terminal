import xterm from "@xterm/headless";
const file = process.argv[2]!;
const cols = Number(process.argv[3] ?? 140);
const terminal = new xterm.Terminal({ cols, rows: 40, allowProposedApi: true });
const ansi = await Bun.file(file).text();
await new Promise<void>(resolve => terminal.write(ansi, resolve));
const buffer = terminal.buffer.active;
const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const color = (value: number) => '#' + value.toString(16).padStart(6, '0');
let html = '';
const lines: string[] = [];
for (let y = 0; y < terminal.rows; y++) {
  const line = buffer.getLine(y)!;
  lines.push(line.translateToString(true));
  let row = '';
  for (let x = 0; x < cols; x++) {
    const cell = line.getCell(x)!;
    if (cell.getWidth() === 0) continue;
    const fg = cell.isFgRGB() ? color(cell.getFgColor()) : '#e4f0fb';
    const bg = cell.isBgRGB() ? color(cell.getBgColor()) : '#101219';
    row += `<span style="color:${fg};background:${bg};font-weight:${cell.isBold() ? 700 : 400};width:${cell.getWidth()}ch">${escape(cell.getChars() || ' ')}</span>`;
  }
  html += '<div class="row">' + row + '</div>';
}
await Bun.write(file + '.txt', lines.join('\n'));
await Bun.write(file + '.html', `<!doctype html><html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#101219}main{font:13px/20px 'SF Mono',Menlo,monospace;width:max-content;padding:0}.row{height:20px;white-space:pre;display:flex}.row span{display:inline-block;flex-shrink:0}</style><main>${html}</main></html>`);
console.log(lines.join('\n'));
terminal.dispose();
