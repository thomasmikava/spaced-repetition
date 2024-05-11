export const withNoEventAction = (action: () => void) => (e: React.FormEvent) => {
  e.preventDefault();
  return action();
};
