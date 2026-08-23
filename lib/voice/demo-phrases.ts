// Sample utterances used by the simulated recognizer so the experience is
// demonstrable without a microphone. Kept in English because the mock parser
// is English-based; a real STT backend would return the user's language.

export const ASSISTANT_PHRASES = [
  'I want to buy 2 bottles of milk and 5 apples',
  'Add a dozen eggs and one loaf of bread',
  'Get 3 packs of chips and 6 oranges',
  'I need 2 litres of orange juice and butter',
  'Add strawberries and dark chocolate',
]

export const SEARCH_PHRASES = [
  'Find organic apples',
  'Find toothpaste under $5',
  'Show me Dove toothpaste',
  'Find 1 litre milk under $2',
  'Search for cold brew coffee',
]

export function randomPhrase(list: string[], exclude?: string): string {
  const pool = exclude ? list.filter((p) => p !== exclude) : list
  return pool[Math.floor(Math.random() * pool.length)] ?? list[0]
}
