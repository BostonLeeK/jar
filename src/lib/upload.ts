export function uploadForm(url: string, body: FormData, onProgress?: (percent: number) => void) {
  return new Promise<Response>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "text";
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) {
        return;
      }
      onProgress(Math.max(1, Math.min(90, Math.round((event.loaded / event.total) * 90))));
    };
    xhr.onload = () => {
      onProgress?.(100);
      resolve(
        new Response(xhr.responseText, {
          status: xhr.status,
          headers: { "Content-Type": xhr.getResponseHeader("Content-Type") || "application/json" },
        }),
      );
    };
    xhr.onerror = () => reject(new Error("network"));
    xhr.send(body);
  });
}
