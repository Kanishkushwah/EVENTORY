export function getStreamBuffer(doc) {
     return new Promise((resolve, reject) => {
         const chunks = [];
 
         doc.on("data", (chunk) => chunks.push(chunk));
         doc.on("end", () => resolve(Buffer.concat(chunks)));
         doc.on("error", reject);
     });
 }