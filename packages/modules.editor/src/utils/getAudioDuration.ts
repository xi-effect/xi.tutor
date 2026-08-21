export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => URL.revokeObjectURL(objectUrl);

    audio.addEventListener('loadedmetadata', () => {
      const dur = audio.duration;
      cleanup();
      resolve(isFinite(dur) && dur > 0 ? dur : 0);
    });

    audio.addEventListener('error', () => {
      cleanup();
      resolve(0);
    });

    audio.src = objectUrl;
  });
}
