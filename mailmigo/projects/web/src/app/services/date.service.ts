import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor () { }

  // (x)x:xx AM/PM. see https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
  public timestampToFormattedTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    let hours = date.getHours();
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if(hours === 0 && suffix === "PM") hours = 12;
    const minutes = date.getMinutes();
    
    // ex. minutes = 8. we want 08
    const minutesFormatted = String(minutes).padStart(2, '0');
    
    return `${hours}:${minutesFormatted} ${suffix}`;
  };

  // MMM DD, YYYY
  public timestampToFormattedDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const days = date.getDate();
    const months = date.toLocaleString('default', { month: 'short' });
    let monthsString = months.toString();
    monthsString = monthsString.slice(0, 3);
    const year = date.getFullYear();

    return `${monthsString} ${days}, ${year}`;
  };

  // MMM DD, YYYY, (x)x:xx AM/PM
  public timestampToFormattedDateTime = (timestamp: number): string => {
    return `${this.timestampToFormattedDate(timestamp)}, ${this.timestampToFormattedTime(timestamp)}`;
  };
  
  public areTimestampsSameDay(timestamp1: number, timestamp2: number): boolean {
    const date1 = new Date(timestamp1 * 1000);
    const date2 = new Date(timestamp2 * 1000);

    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }
}
