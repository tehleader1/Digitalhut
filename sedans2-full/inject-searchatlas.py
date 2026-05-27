from pathlib import Path

p = Path("index.html")

if not p.exists():
    p = Path("dist/index.html")

text = p.read_text()

pixel = """
PASTE_YOUR_FULL_SEARCHATLAS_SCRIPT_HERE
"""

if pixel not in text:
    text = text.replace(
        "<head>",
        "<head>\n" + pixel
    )

p.write_text(text)

print("SEARCHATLAS PIXEL INSTALLED")
