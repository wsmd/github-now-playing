export function runNextUpdateTick() {
  return new Promise(resolve => {
    process.nextTick(resolve);
    jest.runOnlyPendingTimers();
  });
}
