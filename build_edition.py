"""Rebuild the static reading edition from its supplied editorial sources."""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
EDITION = ROOT / "edition"


def pandoc(markdown: str, target="html5") -> str:
    result = subprocess.run(
        ["pandoc", "-f", "markdown", "-t", target, "--wrap=none"],
        input=markdown, text=True, check=True, capture_output=True,
    )
    return result.stdout


def wrap_tables(markup):
    return re.sub(r"(<table[^>]*>.*?</table>)", r'<div class="table-scroll">\1</div>', markup, flags=re.DOTALL)


def main():
    analysis = pandoc((EDITION / "analysis.md").read_text())
    analysis = wrap_tables(analysis.replace("<p>", '<p class="abstract">', 1))
    callout = (EDITION / "includes/stretto-callout.html").read_text()
    analysis = analysis.replace('<h2 id="cadence-and-keyboard-writing">', callout + '\n<h2 id="cadence-and-keyboard-writing">')
    appendix = (EDITION / "process.md").read_text()
    figure = (EDITION / "includes/performance-figure.html").read_text()
    appendix = wrap_tables(pandoc(appendix.replace("<!-- PERFORMANCE FIGURE -->", figure)))
    appendix = appendix.replace('<h2 id="process-and-evaluation">Process and evaluation</h2>', '<h2 id="process-and-evaluation" class="appendix-start"><span class="appendix-tag">Appendix</span>Process and evaluation</h2>')
    template = (ROOT / "template.html").read_text()
    (ROOT / "index.html").write_text(template.replace("{{ANALYSIS}}", analysis).replace("{{APPENDIX}}", appendix))
    print("Rebuilt the reading edition from the supplied sources.")


if __name__ == "__main__":
    main()
