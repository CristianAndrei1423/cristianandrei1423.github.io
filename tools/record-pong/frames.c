// Records the framebuffer at 60 Hz, using the same timing ratio as main.c (CPU step 1.4 ms, frame 16.6 ms).
#include "chip8.h"
int main(int argc, char **argv) {
    Chip8 c; init_chip8(&c); load_chip8(&c, argv[1]);
    int nframes = atoi(argv[2]);
    double acc = 0;
    srand(1);
    for (int f = 0; f < nframes; f++) {
        for (acc += 16.6 / 1.4; acc >= 1; acc--) { fetch_chip8(&c); decode_execute_chip8(&c); }
        if (c.delay_timer) c.delay_timer--;
        if (c.sound_timer) c.sound_timer--;
        for (int i = 0; i < 64 * 32; i += 8) {
            unsigned b = 0;
            for (int k = 0; k < 8; k++) b = (b << 1) | (c.video[i + k] != 0);
            printf("%02x", b);
        }
        putchar('\n');
    }
}
