import { texts } from './texts';

const AFTERNOON_START = 12;
const EVENING_START = 18;

export function greetingFor(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour < AFTERNOON_START) {
    return texts.home.greetingMorning;
  }
  return hour < EVENING_START ? texts.home.greetingAfternoon : texts.home.greetingEvening;
}
