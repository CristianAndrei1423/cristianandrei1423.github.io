# record-pong

Regenerates `pong-data.js`, the Pong animation on the site. The frames come
from the real emulator core of [Chip-8-Emulator](https://github.com/CristianAndrei1423/Chip-8-Emulator).

`frames.c` runs the core headlessly and prints the framebuffer at 60 Hz,
using the same CPU-to-frame timing as the emulator's `main.c`.

```bash
cp ../../../ChipEmulator/chip8.{c,h} .
gcc frames.c chip8.c -o frames
./frames "../../../ChipEmulator/Games/Pong [Paul Vervalin, 1990].ch8" 1200 > pong.frames
python3 encode.py pong.frames 100 960     # skip the idle start, keep 16 s
mv pong-data.js ../../
rm chip8.c chip8.h frames pong.frames
```
