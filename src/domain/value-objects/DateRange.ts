
export class DateRange {
  private readonly startDate: Date;
  private readonly endDate: Date;

  private constructor(startDate: Date, endDate: Date) {
    this.startDate = startDate;
    this.endDate = endDate;
  }

  public static create(startDate: Date, endDate: Date): DateRange {
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }
    return new DateRange(startDate, endDate);
  }

  public static thisWeek(): DateRange {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return new DateRange(startOfWeek, endOfWeek);
  }

  public static thisMonth(): DateRange {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return new DateRange(startOfMonth, endOfMonth);
  }

  public static allTime(): DateRange {
    const start = new Date(2020, 0, 1); // January 1, 2020
    const end = new Date();
    return new DateRange(start, end);
  }

  public getStartDate(): Date {
    return this.startDate;
  }

  public getEndDate(): Date {
    return this.endDate;
  }

  public contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  public getDaysCount(): number {
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
