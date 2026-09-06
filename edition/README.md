# Editorial sources

This directory supplies the webpage's editorial inputs and the complete TeX source for the analytical paper.

## Webpage

Install Python, uv and Pandoc. From the repository root, run:

```sh
uv run --no-project python build_edition.py
```

The builder reads `analysis.md`, `process.md`, the two HTML fragments in `includes/`, and `../template.html`. It writes `../index.html`. With the supplied inputs and Pandoc 3.8.3, this reproduces the published HTML byte for byte. Browser scripts, styles, recordings and notation assets have separate build steps described in the repository README.

`analysis.md` contains the reference cell and eight annotated-example containers, including their Listen controls. `process.md` contains the composition and production appendix. `../assets/excerpts/` supplies the engravings and note identities; `../assets/figures.json` supplies the analytical brackets and explanations.

## Printable paper

Install XeLaTeX and latexmk with the Libertinus fonts and TeX Live's `inconsolata` and `placeins` packages. The paper was built with TeX Live 2025. From this directory, run:

```sh
latexmk -xelatex -interaction=nonstopmode -halt-on-error -outdir=../rebuilt/paper fuga-inversa-analysis.tex
```

The PDF appears at `../rebuilt/paper/fuga-inversa-analysis.pdf`. The TeX reads its annotated vector figures from `annotated/`, the LICC reference from `../assets/score/`, and the performance plot from `../assets/figures/`. These supplied PDF figures already contain their fonts.

Body text uses Libertinus. Code and file paths use `Inconsolatazi4-Regular.otf`, with `Inconsolatazi4-Bold.otf` configured for bold text. The mono font uses `Scale=MatchLowercase`, `Ligatures=TeXOff` and `StylisticSet=3`; the last two settings preserve literal code punctuation and upright quotes. Both font files come from the [Inconsolata package](https://ctan.org/pkg/inconsolata), version 1.121 in the tested installation.

The webpage Markdown and the printable TeX are separate editorial inputs. Editing one does not update the other. PDF metadata and changes in the TeX or font installation can change the resulting file bytes.

## Notation and annotations

The score remains the authority for musical content. The strict excerpt generator, `../reproducibility/web-research/generate_excerpts.py`, reads the final LilyPond source and compares each compiled excerpt with the corresponding full-score MIDI range. A notation change requires new excerpts and updated note-linked annotations before exporting the print figures.

`export-annotated.js` is the browser export expression for those figures. It reads the mounted edition's `window.fugueEdition`, removes transient selections and makes the SVG text styling explicit. Its result maps figure names to SVG strings. `rsvg-convert -f pdf` converts the saved SVGs to their corresponding PDF figures.
