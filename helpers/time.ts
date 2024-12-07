export function formatTime(durationNs: bigint): string {
  let value: number;
  let unit: string;

  if (durationNs < 1_000n) {
    value = Number(durationNs);
    unit = "ns";
  } else if (durationNs < 1_000_000n) {
    value = Number(durationNs) / 1_000;
    unit = "µs";
  } else if (durationNs < 1_000_000_000n) {
    value = Number(durationNs) / 1_000_000;
    unit = "ms";
  } else {
    value = Number(durationNs) / 1_000_000_000;
    unit = "s";
  }
  return `${value.toFixed(3)} ${unit}`;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
