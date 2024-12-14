export function extractIntegers(input: string): number[] {
    // Use the regex to match integers (both positive and negative)
    const regex = /-?\d+/g;
    // Match all occurrences and return as an array of numbers
    return (input.match(regex) || []).map(Number);
}