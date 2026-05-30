export function checkImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new window.Image();

    img.onload = () => {
      resolve(true);
    };

    img.onerror = () => {
      resolve(false);
    };

    img.src = url;
  });
}
