export function formatDate(dateString) {
     const date = new Date(dateString);
     return date.toLocaleDateString("en-IN", {
         weekday: "short",
         day: "numeric",
         month: "short",
         year: "numeric"
     });
 }
 
 export function formatTime(timeString) {
     return new Date(`1970-01-01T${timeString}:00`).toLocaleTimeString("en-IN", {
         hour: "2-digit",
         minute: "2-digit"
     });
 }